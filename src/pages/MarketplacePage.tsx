import React, { useState } from 'react';
import { Shield, Rocket, Zap, Box, ArrowRight, Clock, Info, X, Filter } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

export interface DroneModel {
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

export const droneModels: DroneModel[] = [
  // Reconnaissance Category
  {
    id: "raptor-x",
    name: "Raptor-X",
    category: "reconnaissance",
    image: "https://images.pexels.com/photos/2050718/pexels-photo-2050718.jpeg",
    price: 2500000,
    description: "High-altitude reconnaissance drone with Mach 15+ capability and advanced stealth features.",
    specs: {
      speed: "Mach 15+",
      range: "12,000 km",
      payload: "500 kg",
      endurance: "48 hours"
    },
    features: [
      "Q-OS Quantum-resistant operating system",
      "H-L.E.V. propulsion system",
      "Advanced stealth coating",
      "Multi-spectrum sensor suite"
    ],
    availabilityDate: "Q4 2025",
    preorderBonus: "Priority delivery and extended warranty"
  },
  {
    id: "shadow-scout",
    name: "Shadow Scout",
    category: "reconnaissance",
    image: "https://images.pexels.com/photos/8132919/pexels-photo-8132919.jpeg",
    price: 1800000,
    description: "Stealth reconnaissance platform with advanced sensor capabilities.",
    specs: {
      speed: "Mach 12+",
      range: "8,000 km",
      payload: "300 kg",
      endurance: "36 hours"
    },
    features: [
      "Advanced sensor suite",
      "Stealth technology",
      "All-weather capability",
      "Real-time data processing"
    ],
    availabilityDate: "Q3 2025",
    preorderBonus: "Extended warranty and training package"
  },
  {
    id: "falcon-eye",
    name: "Falcon Eye",
    category: "reconnaissance",
    image: "https://images.pexels.com/photos/8132923/pexels-photo-8132923.jpeg",
    price: 2200000,
    description: "Long-range surveillance drone with advanced imaging systems.",
    specs: {
      speed: "Mach 14+",
      range: "10,000 km",
      payload: "400 kg",
      endurance: "42 hours"
    },
    features: [
      "Multi-spectral imaging",
      "Quantum encryption",
      "Autonomous navigation",
      "Advanced data link"
    ],
    availabilityDate: "Q4 2025",
    preorderBonus: "Premium support package"
  },

  // Combat Category
  {
    id: "phantom-s",
    name: "Phantom-S",
    category: "combat",
    image: "https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg",
    price: 3500000,
    description: "Strategic combat platform with enhanced Swarm AI capabilities.",
    specs: {
      speed: "Mach 18+",
      range: "15,000 km",
      payload: "750 kg",
      endurance: "72 hours"
    },
    features: [
      "Advanced Swarm AI integration",
      "Enhanced quantum encryption",
      "Modular payload system",
      "All-weather operations capability"
    ],
    availabilityDate: "Q1 2026",
    preorderBonus: "Exclusive training program and maintenance package"
  },
  {
    id: "thunder-strike",
    name: "Thunder Strike",
    category: "combat",
    image: "https://images.pexels.com/photos/8132929/pexels-photo-8132929.jpeg",
    price: 3200000,
    description: "Tactical combat drone with advanced weapons integration.",
    specs: {
      speed: "Mach 16+",
      range: "12,000 km",
      payload: "800 kg",
      endurance: "60 hours"
    },
    features: [
      "Advanced weapons systems",
      "Electronic warfare suite",
      "Tactical AI",
      "Secure communications"
    ],
    availabilityDate: "Q1 2026",
    preorderBonus: "Weapons integration package"
  },
  {
    id: "storm-hunter",
    name: "Storm Hunter",
    category: "combat",
    image: "https://images.pexels.com/photos/8132933/pexels-photo-8132933.jpeg",
    price: 2800000,
    description: "All-weather combat drone with enhanced maneuverability.",
    specs: {
      speed: "Mach 15+",
      range: "11,000 km",
      payload: "600 kg",
      endurance: "48 hours"
    },
    features: [
      "Advanced targeting system",
      "ECM capabilities",
      "Stealth technology",
      "Multi-role platform"
    ],
    availabilityDate: "Q4 2025",
    preorderBonus: "Combat training simulator"
  },

  // Logistics Category
  {
    id: "guardian-elite",
    name: "Guardian Elite",
    category: "logistics",
    image: "https://images.pexels.com/photos/8132907/pexels-photo-8132907.jpeg",
    price: 4500000,
    description: "Next-generation logistics platform with maximum payload capacity.",
    specs: {
      speed: "Mach 20+",
      range: "18,000 km",
      payload: "1,000 kg",
      endurance: "96 hours"
    },
    features: [
      "Advanced cargo management",
      "Autonomous mission planning",
      "Multi-domain operations",
      "Real-time logistics tracking"
    ],
    availabilityDate: "Q2 2026",
    preorderBonus: "Lifetime software updates and priority support"
  },
  {
    id: "cargo-master",
    name: "Cargo Master",
    category: "logistics",
    image: "https://images.pexels.com/photos/8132937/pexels-photo-8132937.jpeg",
    price: 3800000,
    description: "High-capacity logistics drone for strategic transport.",
    specs: {
      speed: "Mach 16+",
      range: "14,000 km",
      payload: "1,200 kg",
      endurance: "84 hours"
    },
    features: [
      "Modular cargo system",
      "Automated loading",
      "Supply chain integration",
      "All-weather capability"
    ],
    availabilityDate: "Q1 2026",
    preorderBonus: "Logistics management software"
  },
  {
    id: "swift-transport",
    name: "Swift Transport",
    category: "logistics",
    image: "https://images.pexels.com/photos/8132941/pexels-photo-8132941.jpeg",
    price: 3200000,
    description: "Rapid deployment logistics platform for critical missions.",
    specs: {
      speed: "Mach 14+",
      range: "10,000 km",
      payload: "900 kg",
      endurance: "72 hours"
    },
    features: [
      "Quick-load system",
      "Real-time tracking",
      "Emergency response ready",
      "Versatile cargo configurations"
    ],
    availabilityDate: "Q4 2025",
    preorderBonus: "Operations training package"
  }
];

const MarketplacePage: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<DroneModel | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredModels = selectedCategory === 'all' 
    ? droneModels 
    : droneModels.filter(model => model.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Models', icon: Box },
    { id: 'reconnaissance', name: 'Reconnaissance', icon: Shield },
    { id: 'combat', name: 'Combat', icon: Zap },
    { id: 'logistics', name: 'Logistics', icon: Rocket }
  ];

  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Pre-order Our <span className="text-plasma">Next Generation</span>
          </h1>
          <p className="text-xl text-gray-300">
            Secure your position at the forefront of aerospace defense technology
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="flex space-x-4 bg-[#0d0d14] p-1 rounded-lg">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 py-3 px-6 rounded transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-[#161620] text-plasma border-l-2 border-plasma' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredModels.map((model) => (
            <HudPanel key={model.id} className="p-6">
              <div className="aspect-video mb-6 relative overflow-hidden rounded">
                <img 
                  src={model.image}
                  alt={model.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <p className="mono text-xs text-plasma mb-1">COMING {model.availabilityDate}</p>
                  <p className="font-bold text-lg">{model.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-300">{model.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Speed</p>
                    <p className="font-bold text-plasma">{model.specs.speed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Range</p>
                    <p className="font-bold text-plasma">{model.specs.range}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="flex justify-between items-baseline mb-4">
                    <p className="text-sm text-gray-400">Starting from</p>
                    <p className="text-xl font-bold text-plasma">
                      €{model.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <CyberButton
                      to={`/product/${model.id}`}
                      className="w-full"
                    >
                      <span>View Details</span>
                      <Info className="w-4 h-4" />
                    </CyberButton>
                    <CyberButton
                      className="w-full"
                      onClick={() => setSelectedModel(model)}
                    >
                      <span>Pre-order</span>
                      <ArrowRight className="w-4 h-4" />
                    </CyberButton>
                  </div>
                </div>
              </div>
            </HudPanel>
          ))}
        </div>

        {/* Pre-order Benefits */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center justify-center">
            <Rocket className="text-plasma mr-3 w-7 h-7" />
            Pre-order Benefits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HudPanel className="p-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="w-12 h-12 text-plasma mb-4" />
                <h3 className="text-xl font-bold mb-2">Priority Delivery</h3>
                <p className="text-gray-300">
                  Secure your position in the production queue and receive priority delivery status.
                </p>
              </div>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex flex-col items-center text-center">
                <Shield className="w-12 h-12 text-plasma mb-4" />
                <h3 className="text-xl font-bold mb-2">Extended Warranty</h3>
                <p className="text-gray-300">
                  Exclusive extended warranty coverage for pre-order customers.
                </p>
              </div>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="flex flex-col items-center text-center">
                <Zap className="w-12 h-12 text-plasma mb-4" />
                <h3 className="text-xl font-bold mb-2">Premium Support</h3>
                <p className="text-gray-300">
                  Direct access to our technical support team and priority service.
                </p>
              </div>
            </HudPanel>
          </div>
        </section>

        {/* Pre-order Modal */}
        {selectedModel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <HudPanel className="max-w-2xl w-full p-8 relative">
              <button
                onClick={() => setSelectedModel(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <img
                    src={selectedModel.image}
                    alt={selectedModel.name}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                  <h3 className="text-2xl font-bold mb-2">{selectedModel.name}</h3>
                  <p className="text-gray-300 mb-4">{selectedModel.description}</p>
                  <div className="space-y-2">
                    {selectedModel.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <Shield className="w-4 h-4 text-plasma mr-2" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-plasma mb-4">Pre-order Details</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-2xl font-bold">€{selectedModel.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Estimated Delivery</p>
                      <p className="font-bold">{selectedModel.availabilityDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Pre-order Bonus</p>
                      <p className="font-bold text-plasma">{selectedModel.preorderBonus}</p>
                    </div>
                    <div className="pt-4">
                      <CyberButton className="w-full" to="/investor-portal">
                        <span>Complete Pre-order</span>
                        <ArrowRight className="w-4 h-4" />
                      </CyberButton>
                      <p className="text-xs text-gray-400 mt-2">
                        Pre-orders require investor verification and compliance checks
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
          </div>
        )}

        {/* FAQ Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8 flex items-center justify-center">
            <Info className="text-plasma mr-3 w-7 h-7" />
            Pre-order FAQ
          </h2>

          <div className="max-w-3xl mx-auto">
            <HudPanel className="p-6 mb-4">
              <h3 className="text-xl font-bold text-plasma mb-2">What are the payment terms?</h3>
              <p className="text-gray-300">
                Pre-orders require a 20% deposit, with the remaining balance due 30 days before delivery.
                All payments are processed through secure, regulated channels.
              </p>
            </HudPanel>

            <HudPanel className="p-6 mb-4">
              <h3 className="text-xl font-bold text-plasma mb-2">Are pre-orders refundable?</h3>
              <p className="text-gray-300">
                Pre-order deposits are fully refundable within the first 30 days. After this period,
                refunds are subject to our cancellation policy detailed in the purchase agreement.
              </p>
            </HudPanel>

            <HudPanel className="p-6 mb-4">
              <h3 className="text-xl font-bold text-plasma mb-2">What documentation is required?</h3>
              <p className="text-gray-300">
                All pre-orders require completed KYC verification, end-user certificates, and applicable
                regulatory approvals. Our compliance team will guide you through the process.
              </p>
            </HudPanel>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MarketplacePage;