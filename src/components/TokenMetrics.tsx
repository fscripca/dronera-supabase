import React from 'react';
import { Percent, TrendingUp, CircleDollarSign, Shield } from 'lucide-react';
import HudPanel from './HudPanel';

interface TokenMetricsProps {
  raisedAmount: number;
  targetAmount: number;
  expectedIRR: string;
  holders: number;
}

const TokenMetrics: React.FC<TokenMetricsProps> = ({
  raisedAmount,
  targetAmount,
  expectedIRR,
  holders
}) => {
  // Defensive checks to ensure props are valid numbers
  const safeRaisedAmount = typeof raisedAmount === 'number' && !isNaN(raisedAmount) ? raisedAmount : 0;
  const safeTargetAmount = typeof targetAmount === 'number' && !isNaN(targetAmount) ? targetAmount : 1;
  const safeHolders = typeof holders === 'number' && !isNaN(holders) ? holders : 0;
  const safeExpectedIRR = typeof expectedIRR === 'string' ? expectedIRR : '0%';

  const progressPercentage = (safeRaisedAmount / safeTargetAmount) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
      <HudPanel className="p-2" glowColor="none">
        <div className="flex flex-col items-center text-center">
          <CircleDollarSign className="w-6 h-6 text-plasma mb-1" />
          <h3 className="mono text-gray-400 text-xs uppercase tracking-wider mb-0.5">Funding Progress</h3>
          <div className="w-full bg-gray-800 h-1.5 rounded-full mb-1 mt-1">
            <div 
              className="bg-plasma h-full rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-lg font-bold">
            <span className="text-plasma">{safeRaisedAmount.toLocaleString()}</span>
            <span className="text-gray-500"> / {safeTargetAmount.toLocaleString()} €</span>
          </p>
          <p className="text-gray-400 text-xs">{progressPercentage.toFixed(1)}% Complete</p>
        </div>
      </HudPanel>

      <HudPanel className="p-2" glowColor="none">
        <div className="flex flex-col items-center text-center">
          <Shield className="w-6 h-6 text-plasma mb-1" />
          <h3 className="mono text-gray-400 text-xs uppercase tracking-wider mb-0.5">Token Holders</h3>
          <p className="text-lg font-bold text-plasma">{safeHolders}</p>
          <p className="text-gray-400 text-xs">Institutional Investors</p>
        </div>
      </HudPanel>

      <HudPanel className="p-2" glowColor="none">
        <div className="flex flex-col items-center text-center">
          <Percent className="w-6 h-6 text-plasma mb-1" />
          <h3 className="mono text-gray-400 text-xs uppercase tracking-wider mb-0.5">Profit Share</h3>
          <p className="text-lg font-bold text-plasma">50%</p>
          <p className="text-gray-400 text-xs">To Token Holders</p>
        </div>
      </HudPanel>

      <HudPanel className="p-2" glowColor="none">
        <div className="flex flex-col items-center text-center">
          <TrendingUp className="w-6 h-6 text-plasma mb-1" />
          <h3 className="mono text-gray-400 text-xs uppercase tracking-wider mb-0.5">Expected IRR</h3>
          <p className="text-lg font-bold text-plasma">{safeExpectedIRR}</p>
          <p className="text-gray-400 text-xs">Annual Return Rate</p>
        </div>
      </HudPanel>
    </div>
  );
};

export default TokenMetrics;