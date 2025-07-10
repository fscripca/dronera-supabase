import React from 'react';
import { Users, Award, FileCheck, Building, Linkedin, Mail, ExternalLink, ArrowRight } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

const TeamPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Team & <span className="text-plasma">Governance</span>
          </h1>
          <p className="text-xl text-gray-300">
            Meet the visionaries behind DRONERA's revolutionary aerospace technology.
          </p>
        </div>
        
        {/* Leadership Team */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Users className="text-plasma mr-3 w-7 h-7" />
            Leadership Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* CEO */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img 
                  src="https://media-hosting.imagekit.io/5ddf00ea8c50401e/screenshot_1746814316957.png?Expires=1841422318&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=uct-2WExVH~qpZZW~Jvvkx2eWcG48PJ2hi90Sp1myl~LjZWks0UHSYm9o-w-g9qS~ul8j1BtcSh2HpJCydnumNN88ntHgUcYtYzFdbF1FpmdJSY3oGYQRUDN2-6ReGqCpqwRSbuwrUJPjHps4mTe3fINr2lHcbcGlLkM1JFXduyOSNrwehyRUxAwkw3SPoaPbGb30F71tBsDDUjARDg6oQw4p46OZ4RqZb6PBa-SLG~TkjoVAtRX4kBmerTtlWiucyC~Wsjpfvqa6WMyKPWiYHzTUfaVEHuMv-DdwHA7WWkzYNgEEhh1FkGVOTpEMaBXBDuQDJMLgBqw4J-0ppL17g__" 
                  alt="Ciprian Filip" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1"> Our Next CEO</h3>
              <p className="text-plasma mono text-sm mb-3">CEO & FOUNDER</p>
              <p className="text-gray-300 text-sm mb-4">
                Former IBM-er with 20+ years experience in technology, including blockchain and AI. 
                Degree in Business & Finance from Spiru Haret University.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">Blockchain Innovator of the Year Award 2023</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">2 Patents in Hypersonic Propulsion</span>
                </div>
              </div>
            </HudPanel>
            
            {/* CTO */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img 
                  src="https://media-hosting.imagekit.io/b33cd27448db4c50/screenshot_1746798895746.png?Expires=1841406896&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=xGk4KJ9agnNpTP91Ux4cjD3JDWQuoB3Purump0c9dy~9kyjd8LRD2tgcRct99TdBow96xEe87hDdqdm5O-E996f16ljGjQtNdKotpRaZ0PzxxCQ0YctIXSqMP2EtShmeDx1NGXRnDoRwtmr5F1jc2J3JQh3KFN1J3YXx-qCb41jJUojMYhnXRDW1l~2ok6E3~C78tE9ggOpZuzcfQIJnsjU1VmVJVGXLq6u-jCQNJm7oUiPuug9p05fCp0lPNp-KbnXBNAa0pu0sAL6hiRb2iEyN6O7eCV0WiTiYX6g2RX4KazFT17tgXrnQJ9uDt6wvzq8e9ObvZE2ayi9JoAf5dQ__" 
                  alt="Dr. Arun Kumar" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Dr. Arun Kumar</h3>
              <p className="text-plasma mono text-sm mb-3">Research Scientist, Advanced Propulsion Systems</p>
              <p className="text-gray-300 text-sm mb-4">
                Formerly lead quantum encryption researcher at CERN with specialization in post-quantum cryptography 
                and secure multi-party computation systems.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">IEEE Cybersecurity Innovation Prize</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">23 Published Research Papers</span>
                </div>
              </div>
            </HudPanel>
            
            {/* COO */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img 
                  src="https://media-hosting.imagekit.io/f4c1d72bb10c49f9/screenshot_1746798943484.png?Expires=1841406944&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=OEhP6UWoz5QXkkGEAO-zmUTT4SflwMsH4gdHnNZafE0Jemc~5yZJgL2U5NAijVGtb8nqBsRlNli1JrGzQ5wtZqHFmbT82LQoXeEyoVrFYWn~62PrjiMps-S2HZ0UvANnBiBcVoD3PHmo~Tl6u-WVWmFujVEy6tNIgbFiT8hY6P-i1xWe61CZtfUXoWKVqZWo1wKUSXeyBmlKXLstlTe1cPunuc8bMMhGtfpu5Qo32bKTkwWAl-qVDIVdKFr5i2E4HvxycoqlM7783j3kpwibvKvQuBdZar4hvqE692lK9bcdfkYJ-c1lCqf9JdBZvT0AApRwObSa8fy7SCZd387gjg__" 
                  alt="Maj. Adrian Novak" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Dr. Ajith Kumar </h3>
              <p className="text-plasma mono text-sm mb-3">Research Scientist, Hypersonic Energy HLEV </p>
              <p className="text-gray-300 text-sm mb-4">
                Former military operations specialist with 20+ years experience in NATO special operations and 
                defense logistics management across multiple theaters.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">NATO Excellence in Operations Medal</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">Defense Ministry Innovation Award</span>
                </div>
              </div>
            </HudPanel>
            
            {/* Chief Scientist */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img 
                  src="https://media-hosting.imagekit.io/c7c7fd916ecf4dda/screenshot_1746815118995.png?Expires=1841423120&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Bg2o12ER~iqtefp1XgsWsigSEx3wNDwghPhLYPjAAqrk8zUFtHdeamwqVzzoFJQs3esIECKygrHjz-tqb8QYfXo~zisVM5gV3bHOnFDQLewir9uOR54L1eS0TCOOGpRt14isgQ2ANVcT9l0aLjibXG~e1cwhy4bW6vL45xtomUiRWvNhLtem1UHqotSghFLtcob0phQn4tAn8BL1b5QKuZgrA2n7otX9fTTjQ8HFdDtEmCRC8fUCkYF2~OZXyWwhJx80WhBG6KZbwi52Pk3YF34kDqxwcc5-iCAgAT9YEKEtd5ZKASDuD4qQrJV5Qf9tUtNVgM6JBgqWuVkwiiILDw__" 
                  alt="Prof. Marcus Weber" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Dr. Xavi Marti</h3>
              <p className="text-plasma mono text-sm mb-3">CHIEF SCIENTIST</p>
              <p className="text-gray-300 text-sm mb-4">
                Leading researcher in plasma physics and former head of Advanced Materials Lab at Max Planck Institute. 
                Pioneer in nano-structured thermal shielding.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">European Physics Society Medal</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">42 Patents in Advanced Materials</span>
                </div>
              </div>
            </HudPanel>
            
            {/* CFO */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img 
                  src="https://images.pexels.com/photos/3789888/pexels-photo-3789888.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Sophia Laurent" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Florin Scripcă</h3>
              <p className="text-plasma mono text-sm mb-3">Co-Founder & CFO</p>
              <p className="text-gray-300 text-sm mb-4">
                Former prosecutor and army lieutenant with expertise in defense sector and technolgy. 
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">Financial Times Deal Maker of the Year</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">MBA, London Business School</span>
                </div>
              </div>
            </HudPanel>
            
            {/* Blockchain Architect */}
            <HudPanel className="p-6">
              <div className="aspect-square mb-6 relative overflow-hidden rounded">
                <img 
                  src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                  alt="Dr. Julian Reese" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                    <a href="#" className="bg-[#0a0a0f80] p-2 rounded hover:bg-plasma hover:text-[#0a0a0f] transition-colors">
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-1">Ciprian N. Filip</h3>
              <p className="text-plasma mono text-sm mb-3">Co-Founder & Advisor</p>
              <p className="text-gray-300 text-sm mb-4">
                Former IBM-er with 20+ years experience in technology, including blockchain and AI. Degree in Business & Finance from Spiru Haret University.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">Web3 Security Innovation Award</span>
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 text-plasma mr-2" />
                  <span className="text-xs">PhD in Distributed Systems, ETH Zurich</span>
                </div>
              </div>
            </HudPanel>
          </div>
        </section>
        
        {/* Advisory Board */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Users className="text-plasma mr-3 w-7 h-7" />
            Advisory Board
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HudPanel className="p-6">
              <h3 className="text-xl font-bold mb-1">Gen. Heinrich Müller (Ret.)</h3>
              <p className="text-plasma mono text-sm mb-3">DEFENSE STRATEGY ADVISOR</p>
              <p className="text-gray-300 text-sm">
                Former NATO Supreme Allied Commander with extensive experience in European defense strategy
                and international security cooperation frameworks.
              </p>
            </HudPanel>
            
            <HudPanel className="p-6">
              <h3 className="text-xl font-bold mb-1">Dr. Isabella Rossi</h3>
              <p className="text-plasma mono text-sm mb-3">REGULATORY AFFAIRS ADVISOR</p>
              <p className="text-gray-300 text-sm">
                EU Securities and Markets Authority former commissioner with expertise in security token
                regulations and cross-border compliance frameworks.
              </p>
            </HudPanel>
            
            <HudPanel className="p-6">
              <h3 className="text-xl font-bold mb-1">Prof. Hans Gruber</h3>
              <p className="text-plasma mono text-sm mb-3">SCIENTIFIC ADVISOR</p>
              <p className="text-gray-300 text-sm">
                Director of European Hypersonics Research Consortium and advisor to multiple EU defense
                ministries on next-generation aerospace technologies.
              </p>
            </HudPanel>
          </div>
        </section>
        
        {/* Governance Structure */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <FileCheck className="text-plasma mr-3 w-7 h-7" />
            Governance Structure
          </h2>
          
          <HudPanel className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-plasma mb-4">Corporate Governance</h3>
                <p className="text-gray-300 mb-6">
                  DRONERA employs a hybrid governance model combining traditional corporate oversight with
                  tokenized DAO mechanisms to ensure both operational efficiency and investor representation.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold mb-2">Board of Directors</h4>
                    <p className="text-sm text-gray-400">
                      7-member board with 4 independent directors, ensuring proper oversight and strategic guidance.
                      Quarterly meetings with transparent minutes provided to all token holders.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Executive Committee</h4>
                    <p className="text-sm text-gray-400">
                      Core leadership team responsible for day-to-day operations and execution of
                      the strategic roadmap approved by the board and token holders.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Compliance Framework</h4>
                    <p className="text-sm text-gray-400">
                      Adherence to ESMA regulations for security tokens, with quarterly audits and
                      transparent reporting to all investors and regulatory bodies.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-plasma mb-4">DAO Governance</h3>
                <p className="text-gray-300 mb-6">
                  DRONE token holders participate in key company decisions through a Decentralized Autonomous
                  Organization framework, creating a truly participatory investment structure.
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold mb-2">Token Holder Voting</h4>
                    <p className="text-sm text-gray-400">
                      All DRONE token holders receive voting rights proportional to their holdings on:
                      <br />- Profit distribution methods
                      <br />- Major capital expenditures
                      <br />- Strategic partnerships and acquisitions
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Transparent Operations</h4>
                    <p className="text-sm text-gray-400">
                      Quarterly financial reporting with blockchain-verified authenticity, ensuring
                      all investors have accurate and timely information for decision-making.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-2">Technology Roadmap Input</h4>
                    <p className="text-sm text-gray-400">
                      Token holders participate in annual strategic planning sessions to provide
                      market feedback and help prioritize technological development paths.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </HudPanel>
        </section>
        
        {/* Partners & Affiliations */}
        <section>
          <h2 className="text-2xl font-bold mb-8 flex items-center">
            <Building className="text-plasma mr-3 w-7 h-7" />
            Partners & Affiliations
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <HudPanel className="p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <FileCheck className="w-12 h-12 text-plasma" />
              </div>
              <h3 className="font-bold text-center">European Defence Agency</h3>
              <a href="#" className="text-xs text-plasma flex items-center mt-2 hover:underline">
                <span>View Partnership</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </HudPanel>
            
            <HudPanel className="p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <FileCheck className="w-12 h-12 text-plasma" />
              </div>
              <h3 className="font-bold text-center">Digishares</h3>
              <a href="#" className="text-xs text-plasma flex items-center mt-2 hover:underline">
                <span>View Partnership</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </HudPanel>
            
            <HudPanel className="p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <FileCheck className="w-12 h-12 text-plasma" />
              </div>
              <h3 className="font-bold text-center">Aerospace Research Consortium</h3>
              <a href="#" className="text-xs text-plasma flex items-center mt-2 hover:underline">
                <span>View Partnership</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </HudPanel>
            
            <HudPanel className="p-6 flex flex-col items-center justify-center">
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <FileCheck className="w-12 h-12 text-plasma" />
              </div>
              <h3 className="font-bold text-center">European Defence Fund</h3>
              <a href="#" className="text-xs text-plasma flex items-center mt-2 hover:underline">
                <span>View Partnership</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </HudPanel>
          </div>
        </section>
        
        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-xl text-gray-300 mb-6">
            Join our team of visionaries building the future of aerospace defense
          </p>
          <CyberButton to="/token" className="mx-auto">
            <span>Explore Investment Opportunities</span>
            <ArrowRight className="w-5 h-5" />
          </CyberButton>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;