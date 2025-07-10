-- Create smart_contracts table
CREATE TABLE IF NOT EXISTS smart_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  chain_id integer NOT NULL,
  contract_type text NOT NULL,
  version text NOT NULL,
  abi jsonb NOT NULL,
  bytecode text,
  source_code text,
  compiler_version text,
  constructor_arguments text,
  verification_status text NOT NULL DEFAULT 'unverified',
  owner_address text,
  implementation_address text, -- For proxy contracts
  is_proxy boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(address, chain_id)
);

-- Create contract_interactions table
CREATE TABLE IF NOT EXISTS contract_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES smart_contracts(id) ON DELETE CASCADE,
  transaction_hash text NOT NULL,
  block_number bigint NOT NULL,
  function_name text NOT NULL,
  function_signature text,
  parameters jsonb,
  from_address text NOT NULL,
  value numeric DEFAULT 0,
  gas_used bigint,
  gas_price numeric,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create contract_events table
CREATE TABLE IF NOT EXISTS contract_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES smart_contracts(id) ON DELETE CASCADE,
  transaction_hash text NOT NULL,
  block_number bigint NOT NULL,
  log_index integer NOT NULL,
  event_name text NOT NULL,
  event_signature text,
  parameters jsonb,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(transaction_hash, log_index)
);

-- Create contract_deployments table
CREATE TABLE IF NOT EXISTS contract_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES smart_contracts(id) ON DELETE CASCADE,
  transaction_hash text NOT NULL,
  block_number bigint NOT NULL,
  deployer_address text NOT NULL,
  deployment_cost numeric,
  constructor_arguments jsonb,
  deployment_environment text NOT NULL DEFAULT 'production',
  deployment_status text NOT NULL DEFAULT 'success',
  error_message text,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(transaction_hash)
);

-- Enable RLS on all tables
ALTER TABLE smart_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_deployments ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_smart_contracts_updated_at
  BEFORE UPDATE ON smart_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_smart_contracts_address ON smart_contracts(address);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_chain_id ON smart_contracts(chain_id);
CREATE INDEX IF NOT EXISTS idx_smart_contracts_contract_type ON smart_contracts(contract_type);

CREATE INDEX IF NOT EXISTS idx_contract_interactions_contract_id ON contract_interactions(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_interactions_transaction_hash ON contract_interactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_contract_interactions_function_name ON contract_interactions(function_name);
CREATE INDEX IF NOT EXISTS idx_contract_interactions_timestamp ON contract_interactions(timestamp);

CREATE INDEX IF NOT EXISTS idx_contract_events_contract_id ON contract_events(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_events_transaction_hash ON contract_events(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_contract_events_event_name ON contract_events(event_name);
CREATE INDEX IF NOT EXISTS idx_contract_events_timestamp ON contract_events(timestamp);

CREATE INDEX IF NOT EXISTS idx_contract_deployments_contract_id ON contract_deployments(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_deployments_transaction_hash ON contract_deployments(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_contract_deployments_timestamp ON contract_deployments(timestamp);

-- RLS Policies for smart_contracts
CREATE POLICY "Anyone can view smart contracts"
  ON smart_contracts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage smart contracts"
  ON smart_contracts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contract_interactions
CREATE POLICY "Anyone can view contract interactions"
  ON contract_interactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage contract interactions"
  ON contract_interactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contract_events
CREATE POLICY "Anyone can view contract events"
  ON contract_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage contract events"
  ON contract_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for contract_deployments
CREATE POLICY "Anyone can view contract deployments"
  ON contract_deployments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage contract deployments"
  ON contract_deployments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert DRONE token contract data
INSERT INTO smart_contracts (
  name,
  address,
  chain_id,
  contract_type,
  version,
  abi,
  owner_address,
  metadata
) VALUES (
  'DRONE Token',
  '0x1234567890123456789012345678901234567890', -- Placeholder address
  8453, -- Base chain ID
  'ERC3643',
  '1.0.0',
  '{
    "abi": [
      {
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ]
  }'::jsonb,
  '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4', -- owner_address (placeholder)
  '{
    "description": "DRONE is a security token representing profit sharing rights in DRONERA",
    "website": "https://dronera.com",
    "logo": "https://dronera.com/logo.png",
    "whitepaper": "https://dronera.com/whitepaper.pdf",
    "tokenomics": {
      "initialSupply": 100000000,
      "maxSupply": 100000000,
      "decimals": 18
    }
  }'::jsonb
) ON CONFLICT (address, chain_id) DO NOTHING;