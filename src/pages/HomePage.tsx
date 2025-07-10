import React from 'react';
import { useState } from 'react';
import { ArrowRight, FileText, Play, ShieldCheck, Zap, Target, Globe, Award, CheckCircle, AlertCircle } from 'lucide-react';
import CyberButton from '../components/CyberButton';
import HudPanel from '../components/HudPanel';
import TokenMetrics from '../components/TokenMetrics';
import PaymentModal from '../components/PaymentModal';

const HomePage: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('75000');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setShowPaymentModal(false);
    
    // Reset form after successful payment
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 5000);
    return "https://buy.stripe.com/7sY14n1ujgXh1M3bkteME00";
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 bg-[#0d0d14] border border-plasma rounded-full mb-6">
                  <div className="w-2 h-2 bg-plasma rounded-full mr-2 animate-pulse"></div>
                  <span className="text-plasma text-sm font-medium mono">LIVE: €15,000 RAISED</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Power the Future of Hypersonic
                  <span className="block text-plasma glow-blue mt-2"> Defense</span>
                </h1>
                
                <div className="space-y-4 mb-8">
                  <p className="text-xl md:text-2xl text-gray-300">
                    Unlock Investment Opportunities in Top UAV Technology
                  </p>
                  <p className="text-lg text-gray-400">
                    Researching vacuum-based propulsion systems and quantum-secure UAVs.
                    Explore the world of UAV technology and investments with us.
                  </p>
                </div>

                {/* CTA Buttons - Moved here */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
                  <CyberButton onClick={() => setShowPaymentModal(true)} className="w-full sm:w-auto">
                    <span>Test Crypto Payment (€75,000)</span>
                  </CyberButton>
                  
                  <CyberButton to="/technology" className="w-full sm:w-auto">
                    <Zap className="w-5 h-5" />
                    <span>Explore Technology</span>
                  </CyberButton>
                </div>
                
                {paymentSuccess && (
                  <div className="mb-8 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      <p className="text-sm text-green-300">Payment successful! Your tokens have been allocated.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Visual Elements */}
              <div className="relative">
                {/* Main Visual Panel */}
                <HudPanel className="relative h-[500px] overflow-hidden mb-6">
                  <div className="absolute inset-0">
                    <img
                      src="/images/Jet.png"
                      alt="Advanced Drone Technology"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Overlay Content */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono text-xs text-plasma">HYPERSONIC UAV PROTOTYPE</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-plasma rounded-full animate-pulse"></div>
                        <span className="mono text-xs text-plasma">ACTIVE</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-1">Next-Gen Defense Platform</h3>
                    <p className="text-sm text-gray-300">Quantum-secure, AI-powered, hypersonic capability</p>
                  </div>
                </HudPanel>

                {/* Feature Highlights */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0d0d14] p-4 rounded-lg border border-gray-800">
                    <div className="flex items-center mb-2">
                      <Target className="w-5 h-5 text-plasma mr-2" />
                      <span className="font-bold text-sm">TRL 7</span>
                    </div>
                    <p className="text-xs text-gray-400">Technology Readiness Level</p>
                  </div>
                  
                  <div className="bg-[#0d0d14] p-4 rounded-lg border border-gray-800">
                    <div className="flex items-center mb-2">
                      <Globe className="w-5 h-5 text-plasma mr-2" />
                      <span className="font-bold text-sm">EU Compliant</span>
                    </div>
                    <p className="text-xs text-gray-400">ESMA Regulated</p>
                  </div>
                </div>

                {/* Floating Achievement Badge */}
                <div className="absolute top-4 right-4 bg-[#0a0a0f] bg-opacity-90 backdrop-blur-sm p-3 rounded-lg border border-plasma">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-plasma mr-2" />
                    <div>
                      <div className="text-sm font-bold text-plasma">€3.5M Grant</div>
                      <div className="text-xs text-gray-400">EU Defence Fund</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Token Metrics Section */}
      <section className="pt-0 pb-4 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-1">
            DRONE Token <span className="text-plasma">Metrics</span>
          </h2>
          <p className="text-gray-400 text-center mb-2 max-w-3xl mx-auto">
            DRONE is a tokenized security asset backed by 50% of DRONERA's future net profits,
            audited quarterly and governed via DAO.
          </p>
          
          <TokenMetrics />
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-4 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HudPanel className="p-8">
              <h3 className="text-xl font-bold text-plasma mb-4 flex items-center">
                <ShieldCheck className="w-6 h-6 mr-2" />
                Swarm AI Technology
              </h3>
              <p className="text-gray-300 mb-4">
                Advanced distributed intelligence system enabling autonomous coordination of drone
                swarms with resilient command mesh and real-time strategic adaptation.
              </p>
              <p className="text-gray-300 mb-4">
                <h3 className="text-xl font-bold text-plasma mb-4 flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-2" />
                  Q-OS Platform
                </h3>
                Quantum-resistant operating system implementing post-quantum cryptography and
                federated architecture that ensures continued operations even under severe jamming conditions.
              </p>
              <a href="/technology" className="inline-flex items-center text-plasma hover:underline">
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </HudPanel>
            
            <HudPanel className="p-8" glowColor="plasma">
              <h3 className="text-xl font-bold text-plasma mb-4 flex items-center">
                <ShieldCheck className="w-6 h-6 mr-2" />
                Jet propulsion
              </h3>
              <p className="text-gray-300 mb-4">
                Quantum-resistant operating system implementing post-quantum cryptography and
                federated architecture that ensures continued operations even under severe jamming conditions.
              </p>
              <a href="/technology" className="inline-flex items-center text-plasma hover:underline">
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </HudPanel>
            
            <HudPanel className="p-8">
              <h3 className="text-xl font-bold text-plasma mb-4 flex items-center">
                <ShieldCheck className="w-6 h-6 mr-2" />
                H-L.E.V. Propulsion
              </h3>
              <p className="text-gray-300 mb-4">
                High-efficiency, low-emission vectored propulsion systems enabling hypersonic speeds and
                unprecedented maneuverability in both orbital and atmospheric flight conditions.
              </p>
              <a href="/technology" className="inline-flex items-center text-plasma hover:underline">
                Learn more <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </HudPanel>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-10 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] to-[#161632] opacity-70"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-2xl mx-auto text-center py-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Europe's Next Sovereign
              <span className="block text-plasma glow-blue mt-2">Aerospace Giant</span>
            </h2>
            <p className="text-xl text-gray-300 mb-4">
              Your investment builds the future of defense technology while earning security-backed returns through DRONE token.
            </p>
            <CyberButton to="/token" className="mx-auto">
              <span>Explore Token Economics</span>
              <ArrowRight className="w-5 h-5" />
            </CyberButton>
          </div>
        </div>
      </section>
      
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={parseInt(investmentAmount) || 75000}
        onPaymentSuccess={handlePaymentSuccess}
        paymentMethod={paymentMethod}
      />
    </div>
  );
};

export default HomePage;