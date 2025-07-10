/*
  # Create Contract Integration Tables

  1. New Tables
    - `contract_agreements` - Stores signed legal agreements
    - `contract_templates` - Stores contract templates
    - `contract_signatures` - Records user signatures on contracts
    - `contract_versions` - Tracks contract version history

  2. Security
    - Enable RLS on all tables
    - Add policies for users to view their own contracts
    - Add policies for service role to manage all contracts

  3. Functions
    - Create contract agreement
    - Sign contract
    - Get user contracts
*/

-- Create contract_templates table
CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  content text NOT NULL,
  version text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  template_type text NOT NULL CHECK (template_type IN ('investment', 'kyc', 'terms', 'privacy', 'joint_venture')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create contract_agreements table
CREATE TABLE IF NOT EXISTS contract_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES contract_templates(id),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  version text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'terminated')),
  agreement_type text NOT NULL CHECK (agreement_type IN ('investment', 'kyc', 'terms', 'privacy', 'joint_venture')),
  effective_date timestamptz,
  expiry_date timestamptz,
  is_signed boolean NOT NULL DEFAULT false,
  signed_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create contract_signatures table
CREATE TABLE IF NOT EXISTS contract_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES contract_agreements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signature_type text NOT NULL DEFAULT 'electronic' CHECK (signature_type IN ('electronic', 'digital', 'handwritten')),
  signature_data text NOT NULL,
  ip_address text,
  user_agent text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  is_valid boolean NOT NULL DEFAULT true,
  verification_method text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create contract_versions table
CREATE TABLE IF NOT EXISTS contract_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES contract_templates(id) ON DELETE CASCADE,
  version text NOT NULL,
  content text NOT NULL,
  changes_summary text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_current boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on all tables
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_versions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contract_templates_status ON contract_templates(status);
CREATE INDEX IF NOT EXISTS idx_contract_templates_template_type ON contract_templates(template_type);

CREATE INDEX IF NOT EXISTS idx_contract_agreements_user_id ON contract_agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_agreements_template_id ON contract_agreements(template_id);
CREATE INDEX IF NOT EXISTS idx_contract_agreements_status ON contract_agreements(status);
CREATE INDEX IF NOT EXISTS idx_contract_agreements_agreement_type ON contract_agreements(agreement_type);

CREATE INDEX IF NOT EXISTS idx_contract_signatures_agreement_id ON contract_signatures(agreement_id);
CREATE INDEX IF NOT EXISTS idx_contract_signatures_user_id ON contract_signatures(user_id);

CREATE INDEX IF NOT EXISTS idx_contract_versions_template_id ON contract_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_contract_versions_is_current ON contract_versions(is_current);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_contract_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_contract_templates_updated_at ON contract_templates;
CREATE TRIGGER update_contract_templates_updated_at
  BEFORE UPDATE ON contract_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_updated_at_column();

DROP TRIGGER IF EXISTS update_contract_agreements_updated_at ON contract_agreements;
CREATE TRIGGER update_contract_agreements_updated_at
  BEFORE UPDATE ON contract_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_updated_at_column();

-- RLS Policies for contract_templates
CREATE POLICY "Authenticated users can view active contract templates"
  ON contract_templates
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Service role can manage all contract templates"
  ON contract_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contract_agreements
CREATE POLICY "Users can view their own contract agreements"
  ON contract_agreements
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all contract agreements"
  ON contract_agreements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contract_signatures
CREATE POLICY "Users can view their own contract signatures"
  ON contract_signatures
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own contract signatures"
  ON contract_signatures
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all contract signatures"
  ON contract_signatures
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contract_versions
CREATE POLICY "Authenticated users can view contract versions"
  ON contract_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM contract_templates t
      WHERE t.id = template_id AND t.status = 'active'
    )
  );

CREATE POLICY "Service role can manage all contract versions"
  ON contract_versions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to create a contract agreement
CREATE OR REPLACE FUNCTION create_contract_agreement(
  p_user_id uuid,
  p_template_id uuid,
  p_title text,
  p_agreement_type text,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  template_record contract_templates%ROWTYPE;
  agreement_id uuid;
BEGIN
  -- Get template
  SELECT * INTO template_record
  FROM contract_templates
  WHERE id = p_template_id AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active contract template not found';
  END IF;
  
  -- Create agreement
  INSERT INTO contract_agreements (
    template_id,
    user_id,
    title,
    content,
    version,
    agreement_type,
    effective_date,
    metadata
  ) VALUES (
    p_template_id,
    p_user_id,
    p_title,
    template_record.content,
    template_record.version,
    p_agreement_type,
    now(),
    p_metadata
  ) RETURNING id INTO agreement_id;
  
  RETURN agreement_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Function to sign a contract
CREATE OR REPLACE FUNCTION sign_contract(
  p_agreement_id uuid,
  p_user_id uuid,
  p_signature_data text,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  agreement_record contract_agreements%ROWTYPE;
BEGIN
  -- Get agreement
  SELECT * INTO agreement_record
  FROM contract_agreements
  WHERE id = p_agreement_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract agreement not found';
  END IF;
  
  -- Check if user is the owner of the agreement
  IF agreement_record.user_id != p_user_id THEN
    RAISE EXCEPTION 'User is not authorized to sign this agreement';
  END IF;
  
  -- Check if agreement is already signed
  IF agreement_record.is_signed THEN
    RAISE EXCEPTION 'Agreement is already signed';
  END IF;
  
  -- Create signature record
  INSERT INTO contract_signatures (
    agreement_id,
    user_id,
    signature_data,
    ip_address,
    user_agent
  ) VALUES (
    p_agreement_id,
    p_user_id,
    p_signature_data,
    p_ip_address,
    p_user_agent
  );
  
  -- Update agreement
  UPDATE contract_agreements
  SET 
    is_signed = true,
    signed_date = now(),
    status = 'active',
    updated_at = now()
  WHERE id = p_agreement_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$;

-- Function to get user contracts
CREATE OR REPLACE FUNCTION get_user_contracts(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'agreements', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', ca.id,
        'title', ca.title,
        'agreement_type', ca.agreement_type,
        'status', ca.status,
        'is_signed', ca.is_signed,
        'signed_date', ca.signed_date,
        'effective_date', ca.effective_date,
        'expiry_date', ca.expiry_date,
        'version', ca.version,
        'created_at', ca.created_at,
        'signature', (
          SELECT jsonb_build_object(
            'id', cs.id,
            'signature_type', cs.signature_type,
            'signed_at', cs.signed_at,
            'is_valid', cs.is_valid
          )
          FROM contract_signatures cs
          WHERE cs.agreement_id = ca.id AND cs.user_id = p_user_id
          LIMIT 1
        )
      ))
      FROM contract_agreements ca
      WHERE ca.user_id = p_user_id
      ORDER BY ca.created_at DESC
    )
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_contract_agreement TO service_role;
GRANT EXECUTE ON FUNCTION sign_contract TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_contracts TO authenticated;

-- Insert default contract template for Joint Venture Agreement
INSERT INTO contract_templates (
  name,
  description,
  content,
  version,
  status,
  template_type,
  created_at
) VALUES (
  'DRONERA Joint Venture Agreement',
  'Standard joint venture agreement for DRONERA token holders',
  'JOINT VENTURE AGREEMENT

THIS JOINT VENTURE AGREEMENT (the "Agreement") is made and entered into as of [DATE], by and between:

DRONERA TECHNOLOGIES S.A., a company organized and existing under the laws of Luxembourg, with its registered office at 1 Boulevard Royal, L-2449 Luxembourg, represented by [NAME], in his/her capacity as [TITLE] (hereinafter referred to as "DRONERA"),

and

[INVESTOR NAME], with address at [INVESTOR ADDRESS], (hereinafter referred to as "INVESTOR"),

(DRONERA and INVESTOR are hereinafter collectively referred to as the "Parties" and individually as a "Party").

WHEREAS:

A. DRONERA is a technology company specializing in the development of advanced aerospace defense systems, including hypersonic unmanned aerial vehicles (UAVs) with proprietary H-L.E.V. propulsion systems, quantum-resistant operating systems (Q-OS), and Swarm AI technology;

B. INVESTOR wishes to participate in the DRONERA ecosystem through the acquisition of DRONE tokens;

C. The Parties wish to establish a joint venture for the purpose of implementing the Project.

NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, the Parties agree as follows:

1. ESTABLISHMENT OF JOINT VENTURE

1.1. The Parties hereby establish a joint venture (the "Joint Venture") for the purpose of implementing the Project.

1.2. The Joint Venture shall be established through the DRONE token, which represents a profit participation right.

2. PURPOSE AND SCOPE

2.1. The purpose of the Joint Venture is to research, develop, test, manufacture, and commercialize H-L.E.V. propulsion systems for hypersonic flight capabilities.

2.2. The scope of the Joint Venture shall include, but not be limited to:
   a) Research and development of advanced propulsion technologies;
   b) Design and engineering of propulsion systems;
   c) Testing and validation of prototypes;
   d) Manufacturing of propulsion systems;
   e) Marketing and commercialization of the developed technologies;
   f) Protection and management of intellectual property rights.

3. TOKEN ACQUISITION

3.1. INVESTOR shall acquire DRONE tokens according to the terms specified in the Token Purchase Agreement.

3.2. The DRONE token represents a profit participation right, entitling the holder to a share of 50% of DRONERA\'s net profits.

4. PROFIT SHARING

4.1. 50% of DRONERA\'s net profits shall be distributed to DRONE token holders in proportion to their token holdings.

4.2. Profit distributions shall occur quarterly, following financial audits and DAO governance vote approval.

4.3. Profit distributions shall be made in EUR or stablecoin equivalent.

5. GOVERNANCE

5.1. DRONE token holders shall have governance rights through a Decentralized Autonomous Organization (DAO) framework.

5.2. Token holders shall have voting rights on:
   a) Profit distribution methods;
   b) Major capital expenditures;
   c) Strategic partnerships and acquisitions.

6. INTELLECTUAL PROPERTY

6.1. All intellectual property developed by DRONERA shall remain the exclusive property of DRONERA.

6.2. INVESTOR shall have no claim to any intellectual property rights developed by DRONERA.

7. TERM AND TERMINATION

7.1. This Agreement shall come into force on the date of its signing and shall remain in effect for as long as INVESTOR holds DRONE tokens.

7.2. This Agreement may be terminated:
   a) By mutual written agreement of the Parties;
   b) Upon INVESTOR no longer holding any DRONE tokens;
   c) By either Party in case of a material breach by the other Party that remains uncured for 60 (sixty) days after written notice.

8. GOVERNING LAW & JURISDICTION

8.1. This Agreement shall be governed by the laws of Romania.

8.2. Any disagreement regarding the purchase of tokens, execution of the contract, use of the DRONERA platform, etc. will be resolved amicably, for the mediation of all disputes.

8.3. If, despite all efforts, disputes cannot be resolved, these shall be resolved by the Court of Vaslui, unless resolved through arbitration.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first above written.

DRONERA TECHNOLOGIES S.A.
By: ____________________
Name: __________________
Title: ___________________

INVESTOR
By: ____________________
Name: __________________',
  '1.0',
  'active',
  'joint_venture',
  now()
) ON CONFLICT DO NOTHING;