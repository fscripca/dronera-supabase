import React from 'react';
import { Shield, Database, Eye, Lock, Bell } from 'lucide-react';
import HudPanel from '../components/HudPanel';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-left mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-plasma to-blue-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
<p className="text-xl text-gray-300">GDPR Compliance Policy & Data Protection for the Dronera project</p>
<p>Dronera GDPR Compliance Policy</p> 
<p>Effective Date: 25.06.2025</p> 
<p>Controller: Dronera S.R.L.</p> 
<p>Jurisdiction: EU / EEA / GDPR-compliant jurisdictions</p> 
        </div>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Shield className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">1. Overview</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>Dronera S.R.L. is committed to ensuring full compliance with the General Data Protection Regulation (GDPR - EU 2016/679) in all its operations, including investor onboarding, token transactions, research collaborations, and online activities.</p>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Database className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">2. Personal Data Collected</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>We may collect and process the following categories of personal data:</p>
            <p>- Investor Data: Full name, email, address, nationality, proof of funds</p>
            <p>- User Activity Data: Wallet address (pseudonymous), IP address, cookies, session logs</p>
            <p>- Partner and Supplier Data: Names, emails, positions, contractual information</p>
            <p>- Employee/Applicant Data: CVs, IDs, work history, references</p>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Eye className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">3. Purpose of Data Processing</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>Your personal data is processed for the following purposes:</p>
            <p>- To onboard investors and issue DRN tokens</p>
            <p>- To meet legal obligations (AML, tax, financial regulation)</p>
            <p>- To fulfill smart contract obligations (profit distribution, vesting)</p>
            <p>- To manage research partnerships and vendor contracts</p>
            <p>- To optimize platform security and functionality</p>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Lock className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">4. Legal Basis for Processing</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>We rely on one or more of the following lawful bases:</p>
            <p>- Consent (e.g., for marketing communications)</p>
            <p>- Contract (e.g., token purchase agreements)</p>
            <p>- Legal obligation (e.g., compliance with AML/finance laws)</p>
            <p>- Legitimate interest (e.g., platform security, analytics)</p>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Eye className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">5. Data Sharing and International Transfers</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>Data may be shared with:</p>
            <p>- Trusted third-party KYC providers</p>
            <p>- Legal, financial, or compliance advisors</p>
            <p>- Government authorities (where required)</p>
            <p>International transfers are protected by EU Standard Contractual Clauses or occur only to jurisdictions with adequate protection levels as defined by the European Commission.</p>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Database className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">6. Data Retention Periods</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-2 px-4 font-mono text-sm">Data Type</th>
                    <th className="text-left py-2 px-4 font-mono text-sm">Retention Period</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm">
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-4 bg-black/20">KYC/AML Records</td>
                    <td className="py-2 px-4 bg-black/20">5 years</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-4 bg-black/20">Transaction Logs</td>
                    <td className="py-2 px-4 bg-black/20">7 years</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-2 px-4 bg-black/20">Marketing Consent Data</td>
                    <td className="py-2 px-4 bg-black/20">Until consent revoked</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 bg-black/20">Employee/Applicant Records</td>
                    <td className="py-2 px-4 bg-black/20">Up to 3 years post-exit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Bell className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">7. Data Subject Rights</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>You have the right to:</p>
            <p>- Access your data</p>
            <p>- Correct or update your data</p>
            <p>- Request deletion (under certain conditions)</p>
            <p>- Restrict or object to processing</p>
            <p>- Withdraw consent at any time</p>
            <p>- Request data portability</p>
            <p>- File a complaint with the Romanian DPA (ANSPDCP)</p>
            <p>Requests may be submitted via: privacy@dronera.eu</p>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Lock className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">8. Security Measures</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>Dronera implements the following data protection safeguards:</p>
            <p>- Encryption of sensitive files (at rest and in transit)</p>
            <p>- Role-based access control for staff</p>
            <p>- Secure smart contract systems with QRNG entropy</p>
            <p>- Cold-storage of investor KYC data</p>
            <p>- Data minimization across all systems</p>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Shield className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">9. Automated Processing</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>Some aspects of our smart contract-based token platform may involve automated operations (e.g., vesting, profit split), but no decisions with legal or financial significance are made without human review.</p>
          </div>
        </HudPanel>

        <HudPanel className="p-8">
          <div className="flex items-start mb-6">
            <Bell className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">10. Contact Information</h2>
            </div>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>Dronera S.R.L. – Data Protection Officer</p>
            <p>Address: [Vaslui, str. Ștefan cel Mare, nr. 320 a Corp C1, jud. Vaslui, Romania]</p>
            <p>Email: gdpr@dronera.eu</p>
          </div>
        </HudPanel>
      </div>
    </div>
  );
};

export default PrivacyPage;