import React, { useState, useEffect, useRef } from 'react';
import { Zap, Box, Network, ArrowRight } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

const TechnologyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      sectionRefs.forEach((ref, index) => {
        if (ref.current) {
          const sectionTop = ref.current.offsetTop - 150;
          const sectionBottom = sectionTop + ref.current.offsetHeight;
          
          if (scrollY >= sectionTop && scrollY < sectionBottom) {
            setActiveSection(index);
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToSection = (index: number) => {
    sectionRefs[index]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Technology <span className="text-plasma">Showcase</span>
          </h1>
          <p className="text-xl text-gray-300">
            Explore the revolutionary technologies powering DRONERA's quantum-secure UAVs
            with Mach 20+ performance capabilities.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-16">
          <div className="flex space-x-4 bg-[#0d0d14] p-1 rounded-lg">
            <button
              className={`flex items-center space-x-2 py-3 px-6 rounded ${
                activeSection === 0 
                  ? 'bg-[#161620] text-plasma border-l-2 border-plasma' 
                  : 'text-gray-400 hover:text-white'
              } transition-colors`}
              onClick={() => scrollToSection(0)}
            >
              <Zap className="w-5 h-5" />
              <span>H-L.E.V. Propulsion</span>
            </button>
            
            <button
              className={`flex items-center space-x-2 py-3 px-6 rounded ${
                activeSection === 1 
                  ? 'bg-[#161620] text-plasma border-l-2 border-plasma' 
                  : 'text-gray-400 hover:text-white'
              } transition-colors`}
              onClick={() => scrollToSection(1)}
            >
              <Box className="w-5 h-5" />
              <span>Q-OS</span>
            </button>
            
            <button
              className={`flex items-center space-x-2 py-3 px-6 rounded ${
                activeSection === 2 
                  ? 'bg-[#161620] text-plasma border-l-2 border-plasma' 
                  : 'text-gray-400 hover:text-white'
              } transition-colors`}
              onClick={() => scrollToSection(2)}
            >
              <Network className="w-5 h-5" />
              <span>Swarm AI</span>
            </button>
          </div>
        </div>
        
        {/* H-L.E.V. Propulsion Section */}
        <section ref={sectionRefs[0]} className="mb-32 scroll-mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Zap className="text-plasma mr-3 w-7 h-7" />
                H-L.E.V. Propulsion
              </h2>
              <p className="text-gray-300 mb-6">
                High-efficiency, low-emission vectored propulsion systems enabling Mach 20+ speeds and
                unprecedented maneuverability in both orbital and atmospheric flight conditions.
              </p>
              
              <HudPanel className="p-6 mb-6">
                <h3 className="text-xl font-bold text-plasma mb-2">Key Technologies</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Zap className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Plasma Pulse Chambers</h4>
                      <p className="text-sm text-gray-400">Ionized propellant acceleration via electromagnetic fields generating 40% more thrust than conventional systems.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Zap className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Aerospike Configuration</h4>
                      <p className="text-sm text-gray-400">Altitude-compensating nozzle design enabling efficient operation from sea level to exospheric conditions.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Zap className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Nano-Composite Heat Shield</h4>
                      <p className="text-sm text-gray-400">Ceramic-carbon matrix withstanding 4000°C during hypersonic atmospheric reentry.</p>
                    </div>
                  </li>
                </ul>
              </HudPanel>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 text-plasma">
                  <div className="w-4 h-4 rounded-full border-2 border-plasma flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-plasma"></div>
                  </div>
                  <span className="mono text-sm">TRL Level: 7</span>
                </div>
                
                <div className="flex items-center space-x-2 text-plasma">
                  <div className="w-4 h-4 rounded-full border-2 border-plasma flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-plasma"></div>
                  </div>
                  <span className="mono text-sm">Patents: 8</span>
                </div>
                
                <div className="flex items-center space-x-2 text-plasma">
                  <div className="w-4 h-4 rounded-full border-2 border-plasma flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-plasma"></div>
                  </div>
                  <span className="mono text-sm">Test Flights: 22</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <HudPanel className="aspect-square">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/60130/pexels-photo-60130.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="H-L.E.V. Propulsion System"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="mono text-xs text-plasma mb-1">INTERACTIVE DISPLAY</p>
                  <p className="font-bold">Hover to explore energy cycle</p>
                </div>
              </HudPanel>
            </div>
          </div>
        </section>
        
        {/* Q-OS Section */}
        <section ref={sectionRefs[1]} className="mb-32 scroll-mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 relative">
              <HudPanel className="aspect-square" glowColor="red">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Q-OS Quantum Operating System"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="mono text-xs text-ion mb-1">INTERACTIVE DISPLAY</p>
                  <p className="font-bold">Tap to reveal federated architecture</p>
                </div>
              </HudPanel>
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Box className="text-ion mr-3 w-7 h-7" />
                Q-OS Platform
              </h2>
              <p className="text-gray-300 mb-6">
                Quantum-resistant operating system implementing post-quantum cryptography and
                federated architecture that ensures continued operations even under severe jamming conditions.
              </p>
              
              <HudPanel className="p-6 mb-6" glowColor="red">
                <h3 className="text-xl font-bold text-ion mb-2">Key Technologies</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Box className="w-4 h-4 text-ion" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Lattice-Based Cryptography</h4>
                      <p className="text-sm text-gray-400">NIST-approved quantum-resistant algorithms ensuring secure communications in the post-quantum era.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Box className="w-4 h-4 text-ion" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Multi-domain Fault Tolerance</h4>
                      <p className="text-sm text-gray-400">Redundant system architecture with hot-swappable virtual machines across 12 isolated security domains.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Box className="w-4 h-4 text-ion" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Zero-Trust Security Model</h4>
                      <p className="text-sm text-gray-400">Continuous verification and least-privilege access control for all system components and communications.</p>
                    </div>
                  </li>
                </ul>
              </HudPanel>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 text-ion">
                  <div className="w-4 h-4 rounded-full border-2 border-ion flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-ion"></div>
                  </div>
                  <span className="mono text-sm">TRL Level: 6</span>
                </div>
                
                <div className="flex items-center space-x-2 text-ion">
                  <div className="w-4 h-4 rounded-full border-2 border-ion flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-ion"></div>
                  </div>
                  <span className="mono text-sm">Patents: 12</span>
                </div>
                
                <div className="flex items-center space-x-2 text-ion">
                  <div className="w-4 h-4 rounded-full border-2 border-ion flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-ion"></div>
                  </div>
                  <span className="mono text-sm">Security Audits: 5</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Swarm AI Section */}
        <section ref={sectionRefs[2]} className="mb-20 scroll-mt-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Network className="text-plasma mr-3 w-7 h-7" />
                Swarm AI Technology
              </h2>
              <p className="text-gray-300 mb-6">
                Advanced distributed intelligence system enabling autonomous coordination of drone
                swarms with resilient command mesh and real-time strategic adaptation.
              </p>
              
              <HudPanel className="p-6 mb-6">
                <h3 className="text-xl font-bold text-plasma mb-2">Key Technologies</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Network className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Distributed Decision Matrix</h4>
                      <p className="text-sm text-gray-400">Multi-agent reinforcement learning enabling emergent behaviors and mission-adaptive formations.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Network className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Mesh Network Resilience</h4>
                      <p className="text-sm text-gray-400">Self-healing communications web that maintains operational integrity even with 70% node loss.</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                      <Network className="w-4 h-4 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Tactical Edge Computing</h4>
                      <p className="text-sm text-gray-400">On-board neural processing allowing for mission continuity in GPS-denied, EMCON environments.</p>
                    </div>
                  </li>
                </ul>
              </HudPanel>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2 text-plasma">
                  <div className="w-4 h-4 rounded-full border-2 border-plasma flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-plasma"></div>
                  </div>
                  <span className="mono text-sm">TRL Level: 5</span>
                </div>
                
                <div className="flex items-center space-x-2 text-plasma">
                  <div className="w-4 h-4 rounded-full border-2 border-plasma flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-plasma"></div>
                  </div>
                  <span className="mono text-sm">Patents: 7</span>
                </div>
                
                <div className="flex items-center space-x-2 text-plasma">
                  <div className="w-4 h-4 rounded-full border-2 border-plasma flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-plasma"></div>
                  </div>
                  <span className="mono text-sm">Field Tests: 18</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <HudPanel className="aspect-square">
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src="https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Swarm AI Technology"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="mono text-xs text-plasma mb-1">INTERACTIVE DISPLAY</p>
                  <p className="font-bold">View autonomous command mesh</p>
                </div>
              </HudPanel>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <div className="text-center">
          <CyberButton to="/token" className="mx-auto">
            <span>Explore Investment Opportunities</span>
            <ArrowRight className="w-5 h-5" />
          </CyberButton>
        </div>
      </div>
    </div>
  );
};

export default TechnologyPage;