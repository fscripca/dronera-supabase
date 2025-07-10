import React, { useState } from 'react';
import { HelpCircle, Plus, Minus } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

interface FAQItem {
  question: string;
  answer: string | string[];
  category: string;
}

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

 const faqItems: FAQItem[] = [
  {
    category: "General",
    question: "1. What is the DRN token?",
    answer: [
      "• DRN is a utility token with a fixed supply of 100 million.",
      "• It grants holders a right to 50% of Dronera's net profits.",
      "• Tokens are identity-bound (ERC-3643) and comply with EU MiCA.",
      "• Not classified as a security; tokens are backed by IP and ecosystem growth."
    ]
  },
  {
    category: "Investment",
    question: "2. How much capital is DRONERA raising and in what phases?",
    answer: [
      "• Total: €100M in 3 tokenized phases:",
      "  – Phase 1: €1M @ €0.05/DRN",
      "  – Phase 2: €4M @ €0.125/DRN",
      "  – Phase 3: €95M @ €2.85/DRN"
    ]
  },
  {
    category: "Tokenomics",
    question: "3. What is the token allocation?",
    answer: [
      "• Total Supply: 100M DRN",
      "• Public Sale: 85.33M (85.33%)",
      "• Team & Reserve: 14.67M (14.67%)"
    ]
  },
  {
    category: "Returns",
    question: "4. What kind of returns (ROI/IRR) can be expected?",
    answer: [
      "Phase | Investment | Token Price | Exit Est. | ROI | IRR",
      "------|------------|-------------|-----------|-----|------",
      "P1    | €1M        | €0.05       | €5–€10    | 100x–200x | >95%",
      "P2    | €4M        | €0.125      | €5–€10    | 40x–80x   | ~85%",
      "P3    | €95M       | €2.85       | €5–€10    | 1.75x–3.5x| 25–35%"
    ]
  },
  {
    category: "Profit Distribution",
    question: "5. How are profits distributed to investors?",
    answer: [
      "• 50% of net profits are distributed annually to DRN holders.",
      "• Distributions occur automatically via smart contracts in fiat or stablecoin."
    ]
  },
  {
    category: "Buyback & Scarcity",
    question: "6. What is the token buyback mechanism?",
    answer: [
      "• Quarterly buybacks using up to 50% of net profits.",
      "• Tokens repurchased are burned or locked to reduce supply.",
      "• Buybacks are on-chain and performance-tied; governance will transition to a DAO."
    ]
  },
  {
    category: "Buyback & Scarcity",
    question: "7. How does scarcity benefit token holders?",
    answer: [
      "• Scarcity increases demand by reducing supply.",
      "• Burn events create deflationary pressure, supporting token price growth."
    ]
  },
  {
    category: "Vesting",
    question: "8. What is the vesting schedule and tradability?",
    answer: [
      "• Phase 1 tokens: 12-month lock-up + 24-month linear vesting.",
      "• All tokens comply with ERC-3643 and are tradable post-vesting."
    ]
  },
  {
    category: "Protection",
    question: "9. What protections are in place for early investors?",
    answer: [
      "• Fixed 100M supply = no dilution.",
      "• Pre-emptive rights to participate in future rounds at original price."
    ]
  },
  {
    category: "Assets",
    question: "10. What is the asset backing of DRN?",
    answer: [
      "• IP assets: Swarm OS, Quantum PCB, UAVs.",
      "• Estimated value (Year 3): €6.5M–€16M+"
    ]
  },
  {
    category: "Risks",
    question: "11. What are the major risks and how are they mitigated?",
    answer: [
      "• Tech Risk: Phased roadmap using proven standards (ROS2, PX4, Jetson).",
      "• Market Risk: Targeting UAV/defense demand with jurisdiction-specific licensing.",
      "• Liquidity Risk: Lock-up + buyback strategy.",
      "• Legal Risk: Utility-token structure and MiCA-aligned.",
      "• Funding Risk: Grants are optional upside; not critical for operation."
    ]
  },
  {
    category: "Failure",
    question: "12. What happens in case of project failure?",
    answer: [
      "• DRN retains value via IP-backing.",
      "• Tokens remain usable in spin-off DAO models or licensing options."
    ]
  },
  {
    category: "Governance",
    question: "13. What level of investor control exists?",
    answer: [
      "• Governance via future DAO voting.",
      "• Profit share voting and anti-dilution enforcement."
    ]
  },
  {
    category: "Exit",
    question: "14. What are the exit scenarios?",
    answer: [
      "• M&A with defense/aerospace primes.",
      "• Decentralized DAO-based token economy.",
      "• Forecasted exit value: €300M–€1B"
    ]
  },
  {
    category: "Investment Process",
    question: "15. How can I invest and what currencies are accepted?",
    answer: [
      "• DRN tokens can be purchased in EUR, USDT, USDC, and major cryptocurrencies.",
      "• Smart contracts ensure transparent processing and compliance."
    ]
  }
];

  const categories = Array.from(new Set(faqItems.map(item => item.category)));

  // Filter FAQs based on search term
  const filteredFAQs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof item.answer === 'string' 
      ? item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      : item.answer.some(line => line.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Group FAQs by category
  const faqCategories = Array.from(new Set(filteredFAQs.map(item => item.category)));

  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="text-plasma">Questions</span>
          </h1>
          <p className="text-xl text-gray-300">
            Find answers to common questions about DRONERA's technology and investment platform
          </p>
        </div>

        <div className="space-y-8">
          {/* FAQ Search */}
          <HudPanel className="p-6">
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              />
            </div>
          </HudPanel>

          {/* FAQ Categories */}
          {faqCategories.length === 0 ? (
            <HudPanel className="p-8">
              <div className="text-center">
                <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No results found</h3>
                <p className="text-gray-400">
                  We couldn't find any FAQs matching your search. Please try different keywords or contact support.
                </p>
              </div>
            </HudPanel>
          ) : (
            faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <HelpCircle className="text-plasma mr-3 w-7 h-7" />
                  {category} Questions
                </h2>

                <div className="space-y-4">
                  {filteredFAQs
                    .filter(item => item.category === category)
                    .map((item, index) => {
                      const itemIndex = categoryIndex * 100 + index;
                      const isOpen = openItems.includes(itemIndex);

                      return (
                        <HudPanel
                          key={index}
                          className={`transition-all duration-300 ${
                            isOpen ? 'bg-opacity-100' : 'bg-opacity-70'
                          }`}
                        >
                          <button
                            className="w-full text-left p-6 focus:outline-none"
                            onClick={() => toggleItem(itemIndex)}
                          >
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-bold pr-8">{item.question}</h3>
                              {isOpen ? (
                                <Minus className="w-5 h-5 text-plasma flex-shrink-0" />
                              ) : (
                                <Plus className="w-5 h-5 text-plasma flex-shrink-0" />
                              )}
                            </div>

                            <div
                              className={`mt-4 text-gray-300 overflow-hidden transition-all duration-300 ${
                                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                              }`}
                            >
                              {Array.isArray(item.answer) ? (
                                item.answer.map((line, i) => (
                                  <p key={i} className="text-base leading-relaxed mb-2">{line}</p>
                                ))
                              ) : (
                                <p className="text-base leading-relaxed">{item.answer}</p>
                              )}
                            </div>
                          </button>
                        </HudPanel>
                      );
                    })}
                </div>
              </div>
            ))
          )}

          {/* Still Need Help */}
          <HudPanel className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Our support team is available 24/7 to assist you with any questions about our platform or investment process.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="mailto:support@dronera.com" className="cyber-button">
                Email Support
              </a>
              <a href="#" className="cyber-button">
                Live Chat
              </a>
            </div>
          </HudPanel>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;