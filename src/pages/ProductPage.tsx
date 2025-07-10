import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Rocket, Zap, Box, ArrowRight, Clock, Info, ChevronRight, FileText } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

// Using the DroneModel interface from MarketplacePage
interface DroneModel {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: 'reconnaissance' | 'combat' | 'logistics';
  specs: {
    speed: string;
    range: string;
    payload: string;
    endurance: string;
  };
  features: string[];
  availabilityDate: string;
  preorderBonus: string;
}

// Import droneModels data
import { droneModels } from './MarketplacePage';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<DroneModel | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'documents'>('overview');

  useEffect(() => {
    const foundModel = droneModels.find(m => m.id === id);
    if (!foundModel) {
      navigate('/marketplace');
      return;
    }
    setModel(foundModel);
  }, [id, navigate]);

  if (!model) return null;

  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="relative">
            <HudPanel className="aspect-video">
              <img
                src={model.image}
                alt={model.name}
                className="w-full h-full object-cover rounded"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <p className="mono text-xs text-plasma mb-1">CATEGORY: {model.category.toUpperCase()}</p>
                <h1 className="text-4xl font-bold">{model.name}</h1>
              </div>
            </HudPanel>
          </div>

          <div>
            <HudPanel className="p-8 h-full">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <p className="text-gray-400 mb-2">Starting from</p>
                  <p className="text-4xl font-bold text-plasma">€{model.price.toLocaleString()}</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">Overview</h2>
                  <p className="text-gray-300">{model.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-400">Availability</p>
                    <p className="font-bold text-plasma">{model.availabilityDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Category</p>
                    <p className="font-bold text-plasma capitalize">{model.category}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <CyberButton className="w-full">
                    <span>Pre-order Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </CyberButton>
                  <p className="text-sm text-gray-400 text-center">
                    Pre-orders require investor verification
                  </p>
                </div>
              </div>
            </HudPanel>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4 bg-[#0d0d14] p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center space-x-2 py-3 px-6 rounded ${
                activeTab === 'overview' 
                  ? 'bg-[#161620] text-plasma border-l-2 border-plasma' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Info className="w-5 h-5" />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('specs')}
              className={`flex items-center space-x-2 py-3 px-6 rounded ${
                activeTab === 'specs' 
                  ? 'bg-[#161620] text-plasma border-l-2 border-plasma' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>Specifications</span>
            </button>
            
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center space-x-2 py-3 px-6 rounded ${
                activeTab === 'documents' 
                  ? 'bg-[#161620] text-plasma border-l-2 border-plasma' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Documents</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === 'overview' && (
            <>
              <HudPanel className="p-6 lg:col-span-2">
                <h2 className="text-xl font-bold mb-4">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {model.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-[#0d0d14] p-2 rounded mr-3 flex-shrink-0">
                        <Shield className="w-4 h-4 text-plasma" />
                      </div>
                      <p className="text-gray-300">{feature}</p>
                    </div>
                  ))}
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <h2 className="text-xl font-bold mb-4">Pre-order Bonus</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-plasma mr-2 mt-1" />
                    <p className="text-gray-300">{model.preorderBonus}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-sm text-gray-400">Estimated Delivery</p>
                    <p className="font-bold text-plasma">{model.availabilityDate}</p>
                  </div>
                </div>
              </HudPanel>
            </>
          )}

          {activeTab === 'specs' && (
            <>
              <HudPanel className="p-6 lg:col-span-2">
                <h2 className="text-xl font-bold mb-6">Technical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-plasma mb-4">Performance</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-400">Maximum Speed</p>
                        <p className="font-bold">{model.specs.speed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Operational Range</p>
                        <p className="font-bold">{model.specs.range}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Maximum Payload</p>
                        <p className="font-bold">{model.specs.payload}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Endurance</p>
                        <p className="font-bold">{model.specs.endurance}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-plasma mb-4">Systems</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-plasma mr-2" />
                        <span>H-L.E.V. Propulsion System</span>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-plasma mr-2" />
                        <span>Q-OS Operating System</span>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-plasma mr-2" />
                        <span>Swarm AI Integration</span>
                      </div>
                      <div className="flex items-center">
                        <ChevronRight className="w-4 h-4 text-plasma mr-2" />
                        <span>Quantum-Resistant Security</span>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <h2 className="text-xl font-bold mb-4">Certifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-plasma mr-2" />
                    <span>EU Defense Standards</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-plasma mr-2" />
                    <span>NATO Compatibility</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-plasma mr-2" />
                    <span>Quantum Security</span>
                  </div>
                </div>
              </HudPanel>
            </>
          )}

          {activeTab === 'documents' && (
            <>
              <HudPanel className="p-6 lg:col-span-2">
                <h2 className="text-xl font-bold mb-6">Technical Documentation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start p-4 bg-[#0d0d14] rounded-lg">
                      <FileText className="w-8 h-8 text-plasma mr-4" />
                      <div>
                        <h3 className="font-bold mb-1">Technical Specifications</h3>
                        <p className="text-sm text-gray-400 mb-2">Complete technical documentation</p>
                        <CyberButton className="text-xs py-1 px-3">Download PDF</CyberButton>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-[#0d0d14] rounded-lg">
                      <FileText className="w-8 h-8 text-plasma mr-4" />
                      <div>
                        <h3 className="font-bold mb-1">Operation Manual</h3>
                        <p className="text-sm text-gray-400 mb-2">Detailed operating procedures</p>
                        <CyberButton className="text-xs py-1 px-3">Download PDF</CyberButton>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start p-4 bg-[#0d0d14] rounded-lg">
                      <FileText className="w-8 h-8 text-plasma mr-4" />
                      <div>
                        <h3 className="font-bold mb-1">Compliance Certificate</h3>
                        <p className="text-sm text-gray-400 mb-2">Regulatory compliance details</p>
                        <CyberButton className="text-xs py-1 px-3">Download PDF</CyberButton>
                      </div>
                    </div>
                    <div className="flex items-start p-4 bg-[#0d0d14] rounded-lg">
                      <FileText className="w-8 h-8 text-plasma mr-4" />
                      <div>
                        <h3 className="font-bold mb-1">Warranty Information</h3>
                        <p className="text-sm text-gray-400 mb-2">Warranty terms and conditions</p>
                        <CyberButton className="text-xs py-1 px-3">Download PDF</CyberButton>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <h2 className="text-xl font-bold mb-4">Legal Documents</h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-plasma mr-2 mt-1" />
                    <div>
                      <p className="font-bold">Purchase Agreement</p>
                      <p className="text-sm text-gray-400">Standard terms of sale</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-plasma mr-2 mt-1" />
                    <div>
                      <p className="font-bold">Export License</p>
                      <p className="text-sm text-gray-400">Required documentation</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="w-5 h-5 text-plasma mr-2 mt-1" />
                    <div>
                      <p className="font-bold">End-User Certificate</p>
                      <p className="text-sm text-gray-400">Usage declaration</p>
                    </div>
                  </div>
                </div>
              </HudPanel>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;