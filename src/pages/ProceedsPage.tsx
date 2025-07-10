import React from 'react';
import { Building, Cpu, Scale, Briefcase, ArrowRight } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

const ProceedsPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Use of <span className="text-plasma">Proceeds</span>
          </h1>
          <p className="text-xl text-gray-300">
            Your capital builds Europe's next sovereign aerospace giant.
          </p>
        </div>

        {/* Main Breakdown Chart */}
        <div className="mb-20">
          <HudPanel className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-6">Fund Allocation</h2>
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
        </div>
        
        {/* Detailed Allocation Sections */}
        <div className="space-y-16">
          {/* Factory Infrastructure */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Building className="text-plasma mr-3 w-7 h-7" />
              Drone Factory Infrastructure (40%)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <HudPanel className="p-6">
                <h3 className="text-xl font-bold text-plasma mb-4">Facility Development</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Building className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Production Facility</h4>
                      <p className="text-sm text-gray-400">25,000m² manufacturing complex with clean room facilities for advanced electronics and propulsion system production.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Building className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">R&D Laboratory Complex</h4>
                      <p className="text-sm text-gray-400">8,000m² research center with advanced propulsion test chambers, electromagnetic shielding, and simulation equipment.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Building className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Secure Data Center</h4>
                      <p className="text-sm text-gray-400">EMP-hardened server facility with quantum-resistant security protocols for software development and Swarm AI training.</p>
                    </div>
                  </li>
                </ul>
              </HudPanel>
              
              <div className="grid grid-cols-1 gap-4">
                <HudPanel className="p-6">
                  <h3 className="text-xl font-bold text-plasma mb-2">Location Selection</h3>
                  <p className="text-gray-300 mb-4">
                    Strategic facility locations being evaluated in Bucharest (Romania) and Warsaw (Poland) 
                    for optimal access to aerospace engineering talent and EU defense corridors.
                  </p>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-3 h-3 bg-plasma rounded-full"></div>
                    <span>Site evaluation complete (3 finalists)</span>
                  </div>
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="w-3 h-3 bg-plasma rounded-full"></div>
                    <span>Land acquisition negotiations in progress</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 border border-plasma rounded-full"></div>
                    <span>Final site selection pending capital raise</span>
                  </div>
                </HudPanel>
                
                <HudPanel className="p-6">
                  <h3 className="text-xl font-bold text-plasma mb-2">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="mono text-sm">Q4 2025</span>
                      <span>Site acquisition</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="mono text-sm">Q1-Q2 2026</span>
                      <span>Construction phase</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="mono text-sm">Q3 2026</span>
                      <span>Equipment installation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="mono text-sm">Q4 2026</span>
                      <span>Operational facility</span>
                    </div>
                  </div>
                </HudPanel>
              </div>
            </div>
          </section>
          
          {/* TRL Development */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Scale className="text-plasma mr-3 w-7 h-7" />
              TRL 5-8 Development (20%)
            </h2>
            
            <HudPanel className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-plasma mb-4">Technology Readiness Progression</h3>
                  <p className="text-gray-300 mb-6">
                    DRONERA's core technologies are currently at TRL 5-7, with the capital raise enabling 
                    accelerated progression to TRL 8-9 (production readiness) within 18-24 months.
                  </p>
                  
                  <div className="space-y-8">
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="font-medium">H-L.E.V. Propulsion System</span>
                        <span className="mono text-plasma">TRL 7</span>
                      </div>
                      <div className="relative h-3 bg-[#0d0d14] rounded-full mb-1">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-600 to-plasma rounded-full" style={{ width: '70%' }}></div>
                        <div className="absolute h-full w-full flex justify-between px-2">
                          <span className="text-[10px] text-gray-500">TRL 1</span>
                          <span className="text-[10px] text-gray-500">TRL 9</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">System prototype demonstration in operational environment</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="font-medium">Q-OS Platform</span>
                        <span className="mono text-plasma">TRL 6</span>
                      </div>
                      <div className="relative h-3 bg-[#0d0d14] rounded-full mb-1">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-600 to-plasma rounded-full" style={{ width: '60%' }}></div>
                        <div className="absolute h-full w-full flex justify-between px-2">
                          <span className="text-[10px] text-gray-500">TRL 1</span>
                          <span className="text-[10px] text-gray-500">TRL 9</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Technology demonstrated in relevant environment</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-3">
                        <span className="font-medium">Swarm AI Technology</span>
                        <span className="mono text-plasma">TRL 5</span>
                      </div>
                      <div className="relative h-3 bg-[#0d0d14] rounded-full mb-1">
                        <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-600 to-plasma rounded-full" style={{ width: '50%' }}></div>
                        <div className="absolute h-full w-full flex justify-between px-2">
                          <span className="text-[10px] text-gray-500">TRL 1</span>
                          <span className="text-[10px] text-gray-500">TRL 9</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Technology validated in relevant environment</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-plasma mb-4">Investment Impact</h3>
                  <div className="space-y-4">
                    <div className="bg-[#0d0d14] p-4 rounded-lg">
                      <h4 className="font-bold mb-2">Accelerated Timeline</h4>
                      <p className="text-sm text-gray-400">
                        Capital reduces time-to-market by 2.5 years compared to organic growth funding.
                      </p>
                    </div>
                    
                    <div className="bg-[#0d0d14] p-4 rounded-lg">
                      <h4 className="font-bold mb-2">Scale Optimization</h4>
                      <p className="text-sm text-gray-400">
                        Enables economies of scale through bulk procurement of specialized components and materials.
                      </p>
                    </div>
                    
                    <div className="bg-[#0d0d14] p-4 rounded-lg">
                      <h4 className="font-bold mb-2">Talent Acquisition</h4>
                      <p className="text-sm text-gray-400">
                        Funding for recruitment of 75+ specialized aerospace and quantum computing engineers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
          </section>
        </div>
        
        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-xl text-gray-300 mb-6">
            Ready to be part of Europe's aerospace defense revolution?
          </p>
          <CyberButton to="/token" className="mx-auto">
            <span>View Investment Opportunities</span>
            <ArrowRight className="w-5 h-5" />
          </CyberButton>
        </div>
      </div>
    </div>
  );
};

export default ProceedsPage;