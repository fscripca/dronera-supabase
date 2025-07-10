import React from 'react';
import { useState, useEffect } from 'react';
import { PieChart, BarChart, Wallet, FileText, Shield, Info, ArrowRight, Target, Rocket } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import TokenMetrics from '../components/TokenMetrics';
import { supabase } from '../lib/supabase';

const TokenPage: React.FC = () => {
  const [tokenMetricsData, setTokenMetricsData] = useState<any>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const fetchTokenMetrics = async () => {
    setIsLoadingMetrics(true);
    setMetricsError(null);
    try {
      const { data, error } = await supabase.rpc('get_token_metrics');
      if (error) {
        console.error('RPC Error:', error);
        // If the function doesn't exist, use fallback data
        if (error.message?.includes('function get_token_metrics() does not exist')) {
          setTokenMetricsData({
            total_supply: 100000000,
            total_distributed: 15000,
            holders_count: 3
          });
        } else {
          throw error;
        }
      } else {
        setTokenMetricsData(data);
      }
    } catch (error: any) {
      console.error('Error fetching token metrics:', error.message);
      // Use fallback data instead of showing error
      setTokenMetricsData({
        total_supply: 100000000,
        total_distributed: 15000,
        holders_count: 3
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchTokenMetrics();
  }, []);

  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            DRONE DRN <span className="text-plasma">Token</span>
          </h1>
          <p className="text-xl text-gray-300">
            A tokenized security asset backed by 50% of DRONERA's future net benefits, 
            audited quarterly, governed via DAO and issued under EU-compliant frameworks.
          </p>
        </div>

        {/* Token Metrics */}
        <div className="mb-20">
          {isLoadingMetrics ? (
            <HudPanel className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plasma mx-auto mb-4"></div>
              <p className="text-gray-400">Loading token metrics...</p>
            </HudPanel>
          ) : metricsError ? (
            <HudPanel className="p-6 text-center">
              <p className="text-red-400">{metricsError}</p>
            </HudPanel>
          ) : (
            <TokenMetrics
              raisedAmount={tokenMetricsData?.total_distributed || 15000}
              targetAmount={tokenMetricsData?.total_supply || 100000000}
              expectedIRR="18–23%"
              holders={tokenMetricsData?.holders_count || 3}
            />
          )}
        </div>

        {/* Token Economics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <PieChart className="text-plasma mr-3 w-7 h-7" />
              Tokenomics
            </h2>
            <HudPanel className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-plasma mb-4">Token Allocation</h3>
                <div className="h-[300px] w-full bg-[#0d0d14] rounded-lg p-4 flex items-center justify-center">
                  {/* Placeholder for Pie Chart */}
                  <div className="relative w-48 h-48 rounded-full border-8 border-plasma">
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-transparent border-t-ion" style={{ transform: 'rotate(45deg)' }}></div>
                    <div className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-transparent border-r-gray-700" style={{ transform: 'rotate(120deg)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-plasma text-2xl font-bold">100M</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="w-4 h-4 bg-plasma rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-300">Private Sale</p>
                    <p className="text-plasma font-bold">90 %</p>
                  </div>
                   
                  <div className="text-center">
                    <div className="w-4 h-4 bg-red-700 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-300">Reserve</p>
                    <p className="text-gray-300 font-bold">10 %</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-plasma mb-4">Key Facts</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 text-plasma mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">ERC3643 Security Token Standard</p>
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 text-plasma mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">50% of all DRONERA net benefits distributed to token holders</p>
                  </li>
                 
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 text-plasma mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-300">Compliance verification for all investors</p>
                  </li>
                </ul>
              </div>
            </HudPanel>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <BarChart className="text-plasma mr-3 w-7 h-7" />
              Distribution Timeline
            </h2>
            <HudPanel className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-plasma mb-4">Token Release Schedule</h3>
                <div className="h-[300px] w-full bg-[#0d0d14] rounded-lg p-4 flex items-center justify-center">
                  {/* Placeholder for Timeline Chart */}
                  <div className="w-full h-full relative border-b border-gray-700">
                    <div className="absolute bottom-0 left-[10%] w-16 h-[60%] bg-plasma bg-opacity-30 rounded-t-sm">
                      <div className="absolute bottom-0 w-full h-[40%] bg-plasma rounded-t-sm"></div>
                      <div className="absolute -top-8 w-full text-center text-xs text-gray-400">Q3 2025</div>
                    </div>
                    <div className="absolute bottom-0 left-[30%] w-16 h-[70%] bg-plasma bg-opacity-30 rounded-t-sm">
                      <div className="absolute bottom-0 w-full h-[50%] bg-plasma rounded-t-sm"></div>
                      <div className="absolute -top-8 w-full text-center text-xs text-gray-400">Q4 2025</div>
                    </div>
                    <div className="absolute bottom-0 left-[50%] w-16 h-[50%] bg-plasma bg-opacity-30 rounded-t-sm">
                      <div className="absolute bottom-0 w-full h-[60%] bg-plasma rounded-t-sm"></div>
                      <div className="absolute -top-8 w-full text-center text-xs text-gray-400">Q1 2026</div>
                    </div>
                    <div className="absolute bottom-0 left-[70%] w-16 h-[90%] bg-plasma bg-opacity-30 rounded-t-sm">
                      <div className="absolute bottom-0 w-full h-[70%] bg-plasma rounded-t-sm"></div>
                      <div className="absolute -top-8 w-full text-center text-xs text-gray-400">Q2 2026</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-plasma mb-4">Legal Framework</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-[#0d0d14] p-3 rounded-lg mr-3 flex-shrink-0">
                      <FileText className="w-6 h-6 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">ESMA Compliant</h4>
                      <p className="text-sm text-gray-400">Fully compliant with European Securities and Markets Authority regulations.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-[#0d0d14] p-3 rounded-lg mr-3 flex-shrink-0">
                      <Wallet className="w-6 h-6 text-plasma" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Utility Token Offering</h4>
                      <p className="text-sm text-gray-400">Regulation (EU) 2023/1114 of the European Parliament and of the Council of 31 May 2023 on markets in crypto-assets, and amending Regulations (EU) No 1093/2010 and (EU) No 1095/2010 and Directives 2013/36/EU and (EU) 2019/1937 .</p>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>
          </div>
        </div>

        {/* Private Sale Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center justify-center">
            <Rocket className="text-plasma mr-3 w-7 h-7" />
            Private Sale Milestones
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Phase 1 (Minimum Viable Product)</h3>
                <p className="text-plasma mono text-lg font-bold mt-2">€1,000,000</p>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Swarm OS prototype, Quantum AI Core</p>
                </div>
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Hardware prototype</p>
                </div>
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Team expansion and laboratory setup</p>
                  </div>
                 <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Starting project patenting procedures</p>
                  </div>
                  </div>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Phase 2</h3>
                <p className="text-plasma mono text-lg font-bold mt-2">€4,000,000</p>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Full development of the Quantum AI core</p>
                </div>
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Decentralized coordination layer and blockchain audit infrastructure</p>
                </div>
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Implementation of technologies on lightweight drones with fast reaction engines.</p>
                </div>
              </div>
            </HudPanel>

            <HudPanel className="p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0d0d14] text-plasma border border-plasma mb-3">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Stage 3</h3>
                <p className="text-plasma mono text-lg font-bold mt-2">€95,000,000</p>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>In-depth research and development in vacuum propulsion systems.</p>
                </div>
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Integration with Swarm OS and global licensing of the Dronera modular platform for the commercial and defense sectors.</p>
                </div>
                <div className="flex items-start">
                  <Target className="w-4 h-4 text-plasma mr-2 mt-1 flex-shrink-0" />
                  <p>Global licensing of the Dronera modular platform for the commercial and defense sectors</p>
                </div>
              </div>
            </HudPanel>
          </div>
        </section>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center flex items-center justify-center">
            <Info className="text-plasma mr-3 w-7 h-7" />
            Frequently Asked Questions
          </h2>
          
          <HudPanel className="p-6 mb-4">
            <h3 className="text-xl font-bold text-plasma mb-2">What jurisdiction is DRONE token issued under?</h3>
            <p className="text-gray-300">DRONE token is issued under the EU regulatory framework, specifically complying with regulations in Luxembourg and Estonia for digital securities.</p>
          </HudPanel>
          
          <HudPanel className="p-6 mb-4">
            <h3 className="text-xl font-bold text-plasma mb-2">How are profits distributed to token holders?</h3>
            <p className="text-gray-300">50% of all DRONERA net profits are automatically distributed to token holders on a quarterly basis, following financial audits and DAO governance vote approval.</p>
          </HudPanel>
          
          <HudPanel className="p-6 mb-4">
            <h3 className="text-xl font-bold text-plasma mb-2">Are there lock-up periods for investors?</h3>
            <p className="text-gray-300">Yes, tokens purchased in the private sale have a 6-month cliff and then a 24-month vesting period with quarterly unlocks to ensure stability and long-term alignment.</p>
          </HudPanel>
          
          <HudPanel className="p-6 mb-8">
            <h3 className="text-xl font-bold text-plasma mb-2">How do I claim my profit distributions?</h3>
            <p className="text-gray-300">Profit distributions are automatically sent to the wallet address holding the DRONE tokens at the time of the distribution snapshot. No manual claiming is required.</p>
          </HudPanel>
          
          <div className="text-center">
            <CyberButton to="/investor-portal" className="mx-auto">
              <span>Access Investor Portal</span>
              <ArrowRight className="w-5 h-5" />
            </CyberButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPage;