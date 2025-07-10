import React, { useState } from 'react';
import { FileText, Download, ChevronRight, FileCheck, ArrowRight, Mail, Bell, Building, Cpu, Scale, Briefcase } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

const InvestorPortalPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Investor <span className="text-plasma">Portal</span>
          </h1>
          <p className="text-xl text-gray-300">
            Access essential documents and complete your investment in DRONERA's aerospace defense technology.
          </p>
        </div>
        
        {/* Documents Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <FileText className="text-plasma mr-3 w-7 h-7" />
            Investment Documents
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pitch Deck */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <FileText className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Investor Pitch Deck</h3>
                    <p className="text-sm text-gray-400 mb-3">Comprehensive overview of DRONERA's technology, market opportunity, and financial projections.</p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex space-x-3">
                      <CyberButton className="text-xs py-1 px-3">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton className="text-xs py-1 px-3">
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
            
            {/* White Paper */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <FileText className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Technical White Paper</h3>
                    <p className="text-sm text-gray-400 mb-3">Detailed analysis of H-L.E.V. propulsion technology, Q-OS, and Swarm AI innovations.</p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex space-x-3">
                      <CyberButton className="text-xs py-1 px-3">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton className="text-xs py-1 px-3">
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
            
            {/* Joint Venture Agreement */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <FileCheck className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Joint Venture Agreement</h3>
                    <p className="text-sm text-gray-400 mb-3">Joint Venture Agreement between DRONERA and Contributor</p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex space-x-3">
                      <CyberButton className="text-xs py-1 px-3" to="/dashboard">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton className="text-xs py-1 px-3">
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
            
            {/* Financial Projections */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <FileText className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">Financial Projections</h3>
                    <p className="text-sm text-gray-400 mb-3">5-year financial model with revenue forecasts, cost structure, and profit distribution.</p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex space-x-3">
                      <CyberButton className="text-xs py-1 px-3">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton className="text-xs py-1 px-3">
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
            
            {/* SAFE Agreement */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <FileCheck className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">SAFE Agreement</h3>
                    <p className="text-sm text-gray-400 mb-3">Simple Agreement for Future Equity with conversion to DRONE token terms.</p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex space-x-3">
                      <CyberButton className="text-xs py-1 px-3">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton className="text-xs py-1 px-3">
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
            
            {/* Security Token Offering */}
            <HudPanel className="p-6">
              <div className="flex items-start h-full">
                <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                  <FileText className="w-8 h-8 text-plasma" />
                </div>
                <div className="flex flex-col h-full">
                  <div>
                    <h3 className="text-lg font-bold mb-1">STO Documentation</h3>
                    <p className="text-sm text-gray-400 mb-3">Security Token Offering legal framework and compliance documentation.</p>
                  </div>
                  <div className="mt-auto">
                    <div className="flex space-x-3">
                      <CyberButton className="text-xs py-1 px-3">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>View</span>
                      </CyberButton>
                      <CyberButton className="text-xs py-1 px-3">
                        <Download className="w-3 h-3 mr-1" />
                        <span>Download</span>
                      </CyberButton>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
          </div>
        </section>

        {/* Use of Proceeds Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Briefcase className="text-plasma mr-3 w-7 h-7" />
            Use of Proceeds
          </h2>
          
          <HudPanel className="p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold mb-6">Fund Allocation</h3>
                <p className="text-gray-300 mb-8">
                  DRONERA is strategically allocating the €100 million fundraise to accelerate its growth
                  from TRL 6-7 to full commercial production at scale, enabling rapid market deployment
                  of its revolutionary aerospace defense technologies.
                </p>
                
                {/* Fund Distribution */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-plasma mr-2" />
                        <span className="font-medium">Drone Factory Infrastructure</span>
                      </div>
                      <span className="font-bold text-plasma">40%</span>
                    </div>
                    <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                      <div className="bg-plasma h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Cpu className="w-5 h-5 text-plasma mr-2" />
                        <span className="font-medium">IP Licensing, Testing Grounds</span>
                      </div>
                      <span className="font-bold text-plasma">25%</span>
                    </div>
                    <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                      <div className="bg-plasma h-full rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Scale className="w-5 h-5 text-plasma mr-2" />
                        <span className="font-medium">TRL 5-8 Development</span>
                      </div>
                      <span className="font-bold text-plasma">20%</span>
                    </div>
                    <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                      <div className="bg-plasma h-full rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-plasma mr-2" />
                        <span className="font-medium">Legal, Compliance, Operations</span>
                      </div>
                      <span className="font-bold text-plasma">15%</span>
                    </div>
                    <div className="w-full bg-[#0d0d14] h-3 rounded-full">
                      <div className="bg-plasma h-full rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="relative aspect-square">
                  <HudPanel className="h-full">
                    <div className="absolute inset-0 overflow-hidden">
                      <img 
                        src="https://media-hosting.imagekit.io/8ac87ba66e6a4a55/screenshot_1746819005299.png?Expires=1841427006&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=1ZLIsXOCGWbT7vwcNcqb3Wzva7ahgdSuCNwq9mHgXUBo~h0t6FikxWF~YOoA2dnLvA~PMRUva9HdHvFBfuRzCCWT9Z4le0NsQaFHdQZi3IZgxZjaA8TcVl0zYfG6l4vjTxngPRDO2xOOiijMHcDSqxAmwxngvsmE23PQOH5cezGI8QochL9fAn2NzMdG3sImy~-56hAfmaJ8kUZ-lecDr6tQD5E-hj0U76ZoSLdjodOR7oqAKbxWpyxKY8CCljVJ9n4eqy4BgCSQvoSea0BRW~~XWxHqshSzTk2NUVN~RkZCwvKcMm1K0VU2e9Sj2-wN6fozEwEddeAW0wSB5kahGw__"
                        alt="1st Drone Factory Design" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="mono text-xs text-plasma mb-1"> FACILITY MODEL | 470 KM TO UKRAINE</p>
                      <p className="font-bold">Vaslui Drone Factory Concept (AI LOGO) </p>
                    </div>
                  </HudPanel>
                </div>
              </div>
            </div>
          </HudPanel>
        </section>
        
        {/* Live Feed Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <FileCheck className="text-plasma mr-3 w-7 h-7" />
            Project Status Updates
          </h2>
          
          <HudPanel className="p-8">
            <div className="space-y-8">
              <div className="relative pl-8 border-l border-plasma">
                <div className="absolute left-[-8px] top-0 w-4 h-4 bg-[#0a0a0f] border-2 border-plasma rounded-full"></div>
                <div className="mb-1">
                  <span className="mono text-xs text-plasma">JUNE 15, 2025</span>
                </div>
                <h3 className="text-lg font-bold mb-2">EUDIS Application Accepted</h3>
                <p className="text-gray-300">
                  DRONERA's application to the European Defense Industrial Scheme (EUDIS) has been formally accepted. 
                  This qualifies the company for €4.8M in matching R&D funds, contingent upon the successful capital raise.
                </p>
              </div>
              
              <div className="relative pl-8 border-l border-plasma">
                <div className="absolute left-[-8px] top-0 w-4 h-4 bg-[#0a0a0f] border-2 border-plasma rounded-full"></div>
                <div className="mb-1">
                  <span className="mono text-xs text-plasma">MAY 30, 2025</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Successful Flight Test #22 Completed</h3>
                <p className="text-gray-300">
                  H-L.E.V. propulsion system prototype achieved Mach 18.7 in stratospheric conditions, 
                  setting a new European speed record for autonomous flight systems.
                </p>
              </div>
              
              <div className="relative pl-8 border-l border-plasma">
                <div className="absolute left-[-8px] top-0 w-4 h-4 bg-[#0a0a0f] border-2 border-plasma rounded-full"></div>
                <div className="mb-1">
                  <span className="mono text-xs text-plasma">MAY 12, 2025</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Warsaw Facility Site Inspection</h3>
                <p className="text-gray-300">
                  Completed preliminary site inspection of 40,000m² industrial zone in Warsaw's 
                  aerospace corridor. Environmental assessment and security evaluation in progress.
                </p>
              </div>
              
              <div className="relative pl-8 border-l border-plasma">
                <div className="absolute left-[-8px] top-0 w-4 h-4 bg-[#0a0a0f] border-2 border-plasma rounded-full"></div>
                <div className="mb-1">
                  <span className="mono text-xs text-plasma">APRIL 28, 2025</span>
                </div>
                <h3 className="text-lg font-bold mb-2">European Defence Fund Grant Approved</h3>
                <p className="text-gray-300">
                  €3.5M grant approved for Q-OS security research under the EU's Strategic Autonomy initiative. 
                  Funds to be allocated upon completion of the €100M funding round.
                </p>
              </div>
            </div>
          </HudPanel>
        </section>
        
        {/* Investment Process */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <FileCheck className="text-plasma mr-3 w-7 h-7" />
            Investment Process
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Review Documentation</h3>
              </div>
              <p className="text-gray-300 text-center mb-6">
                Download and review the investment memorandum, technical white paper, and financial projections.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Investment overview</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Technical documentation</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Financial projections</span>
                </li>
              </ul>
            </HudPanel>
            
            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Complete KYC/AML</h3>
              </div>
              <p className="text-gray-300 text-center mb-6">
                Complete identity verification and compliance checks to qualify for DRONE token investment.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Identity confirmation</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Investment eligibility checks</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Compliance documentation</span>
                </li>
              </ul>
            </HudPanel>
            
            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Sign & Invest</h3>
              </div>
              <p className="text-gray-300 text-center mb-6">
                Digitally sign the investment agreement and complete your contribution to secure DRONE tokens.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Digital signature process</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Fund transfer instructions</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-plasma mr-2 flex-shrink-0" />
                  <span className="text-sm">Token allocation confirmation</span>
                </li>
              </ul>
            </HudPanel>
          </div>
        </section>

        {/* Newsletter Subscription Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Bell className="text-plasma mr-3 w-7 h-7" />
            Stay Updated
          </h2>
          
          <HudPanel className="p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <Mail className="w-16 h-16 text-plasma mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
                <p className="text-gray-300">
                  Get exclusive updates on DRONERA's progress, investment opportunities, and aerospace technology breakthroughs delivered directly to your inbox.
                </p>
              </div>

              {!subscribed ? (
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-grow">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-4 py-3 rounded-md focus:ring-plasma focus:border-plasma"
                        required
                      />
                    </div>
                    <CyberButton type="submit" className="md:w-auto">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>Subscribe</span>
                    </CyberButton>
                  </div>
                  <p className="text-sm text-gray-400">
                    By subscribing, you agree to receive updates about DRONERA's progress and investment opportunities. 
                    You can unsubscribe at any time.
                  </p>
                </form>
              ) : (
                <div className="bg-[#0d0d14] p-6 rounded-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-plasma rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-[#0a0a0f]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-plasma mb-2">Successfully Subscribed!</h3>
                  <p className="text-gray-300">
                    Thank you for subscribing to our newsletter. You'll receive the latest updates on DRONERA's progress and investment opportunities.
                  </p>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center">
                  <Bell className="w-4 h-4 text-plasma mr-2" />
                  <span>Weekly Progress Updates</span>
                </div>
                <div className="flex items-center justify-center">
                  <FileText className="w-4 h-4 text-plasma mr-2" />
                  <span>Exclusive Investment Insights</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-plasma mr-2" />
                  <span>Early Access to Opportunities</span>
                </div>
              </div>
            </div>
          </HudPanel>
        </section>
        
        {/* CTA Section */}
        <div className="text-center">
          <p className="text-xl text-gray-300 mb-6">
            Ready to begin your investment process?
          </p>
          <CyberButton to="/dashboard" className="mx-auto">
            <span>Request Investor Access</span>
            <ArrowRight className="w-5 h-5" />
          </CyberButton>
        </div>
      </div>
    </div>
  );
};

export default InvestorPortalPage;