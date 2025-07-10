import React from 'react';
import { Shield, FileCheck, Scale, AlertCircle, Building, Lock } from 'lucide-react';
import HudPanel from '../components/HudPanel';

const CompliancePage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Regulatory <span className="text-plasma">Compliance</span>
          </h1>
          <p className="text-xl text-gray-300">
            Our commitment to maintaining the highest standards of regulatory compliance and security
          </p>
        </div>

        <div className="space-y-8">
          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <Shield className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Regulatory Framework</h2>
                <p className="text-gray-300">
                  DRONERA operates under comprehensive EU regulatory frameworks, ensuring full compliance
                  with securities laws and investor protection requirements.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div className="space-y-4">
                <h3 className="font-bold text-plasma">Primary Regulations</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Scale className="w-4 h-4 text-plasma mr-2 mt-1" />
                    <span>MiCA Regulations (2023/1114)</span>
                  </li>
                  <li className="flex items-start">
                    <Scale className="w-4 h-4 text-plasma mr-2 mt-1" />
                    <span>ESMA Guidance on templates for explanations and opinions and the standardised test for crypto-assets pursuant to Article 97(1) of Regulation (EU) 2023/1114 / JC 2024 28
December 10, 2024</span>
                  </li>
                  <li className="flex items-start">
                    <Scale className="w-4 h-4 text-plasma mr-2 mt-1" />
                    <span>EU Digital Finance Package</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-plasma">Jurisdictional Coverage</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Building className="w-4 h-4 text-plasma mr-2 mt-1" />
                    <span>European Union Member States</span>
                  </li>
                  <li className="flex items-start">
                    <Building className="w-4 h-4 text-plasma mr-2 mt-1" />
                    <span>Switzerland (via bilateral agreements)</span>
                  </li>
                  <li className="flex items-start">
                    <Building className="w-4 h-4 text-plasma mr-2 mt-1" />
                    <span>UK (under FCA recognition)</span>
                  </li>
                </ul>
              </div>
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <FileCheck className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Identity Verification Procedures</h2>
                <p className="text-gray-300">
                  Our robust identity verification and Anti-Money Laundering (AML) procedures ensure
                  thorough verification of all investors.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0d0d14] p-4 rounded-lg">
                  <h3 className="font-bold text-plasma mb-2">Identity Verification</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Government-issued ID</li>
                    <li>• Biometric verification</li>
                    <li>• Document authenticity checks</li>
                  </ul>
                </div>

                <div className="bg-[#0d0d14] p-4 rounded-lg">
                  <h3 className="font-bold text-plasma mb-2">Address Verification</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Proof of residence</li>
                    <li>• Utility bills</li>
                    <li>• Bank statements</li>
                  </ul>
                </div>

                <div className="bg-[#0d0d14] p-4 rounded-lg">
                  <h3 className="font-bold text-plasma mb-2">Financial Checks</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Source of funds</li>
                    <li>• Investment capacity</li>
                    <li>• Risk assessment</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#0d0d14] p-4 rounded-lg">
                <h3 className="font-bold text-plasma mb-2">Ongoing Monitoring</h3>
                <p className="text-sm">
                  We maintain continuous surveillance of transactions and account activity to detect and
                  prevent suspicious behavior, ensuring compliance with EU AML directives.
                </p>
              </div>
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <Lock className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Security Measures</h2>
                <p className="text-gray-300">
                  State-of-the-art security protocols protect investor data and assets.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-plasma mb-3">Data Protection</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>End-to-end encryption for all data transmission</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Regular security audits and penetration testing</span>
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>GDPR-compliant data handling procedures</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-plasma mb-3">Asset Security</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Lock className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Multi-signature wallet architecture</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Cold storage for majority of assets</span>
                    </li>
                    <li className="flex items-start">
                      <Lock className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Regular smart contract audits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <AlertCircle className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Risk Management</h2>
                <p className="text-gray-300">
                  Comprehensive risk assessment and management procedures to protect investor interests.
                </p>
              </div>
            </div>

            <div className="space-y-6 text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0d0d14] p-4 rounded-lg">
                  <h3 className="font-bold text-plasma mb-3">Operational Risk</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Regular internal audits</li>
                    <li>• Business continuity planning</li>
                    <li>• Insurance coverage</li>
                    <li>• Third-party risk assessment</li>
                  </ul>
                </div>

                <div className="bg-[#0d0d14] p-4 rounded-lg">
                  <h3 className="font-bold text-plasma mb-3">Investment Risk</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Portfolio diversification requirements</li>
                    <li>• Regular valuation updates</li>
                    <li>• Liquidity management</li>
                    <li>• Stress testing scenarios</li>
                  </ul>
                </div>
              </div>
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <Scale className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Reporting & Transparency</h2>
                <p className="text-gray-300">
                  Regular reporting ensures full transparency and compliance with regulatory requirements.
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-plasma mb-2">Regular Reports</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <FileCheck className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Quarterly financial statements</span>
                    </li>
                    <li className="flex items-start">
                      <FileCheck className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Annual compliance reports</span>
                    </li>
                    <li className="flex items-start">
                      <FileCheck className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Monthly performance updates</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-plasma mb-2">Audit Trail</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <FileCheck className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Transaction history</span>
                    </li>
                    <li className="flex items-start">
                      <FileCheck className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Voting records</span>
                    </li>
                    <li className="flex items-start">
                      <FileCheck className="w-4 h-4 text-plasma mr-2 mt-1" />
                      <span>Distribution logs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </HudPanel>

          <div className="text-center text-sm text-gray-400">
            <p>Last updated: June 25, 2025</p>
            <p>DRONERA S.R.L. - All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;