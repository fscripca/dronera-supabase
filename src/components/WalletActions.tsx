import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  ExternalLink,
  Copy,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react';
import CyberButton from './CyberButton';
import HudPanel from './HudPanel';

interface WalletActionsProps {
  walletAddress: string;
  isCorrectNetwork: boolean;
}

const WalletActions: React.FC<WalletActionsProps> = ({ 
  walletAddress,
  isCorrectNetwork
}) => {
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Send form state
  const [sendForm, setSendForm] = useState({
    recipient: '',
    amount: '',
    token: 'ETH',
    gasOption: 'standard'
  });
  
  // Swap form state
  const [swapForm, setSwapForm] = useState({
    fromToken: 'ETH',
    toToken: 'DRONE',
    amount: '',
    slippage: '0.5'
  });
  
  // Error states
  const [sendError, setSendError] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);
  
  // Loading states
  const [isSending, setIsSending] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReceiveClick = () => {
    setShowReceiveModal(true);
  };

  const handleSendClick = () => {
    if (!isCorrectNetwork) {
      return;
    }
    setShowSendModal(true);
  };

  const handleSwapClick = () => {
    if (!isCorrectNetwork) {
      return;
    }
    setShowSwapModal(true);
  };

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.ethereum) {
      setSendError('MetaMask not detected');
      return;
    }
    
    // Validate form
    if (!sendForm.recipient || !sendForm.amount || parseFloat(sendForm.amount) <= 0) {
      setSendError('Please fill in all fields with valid values');
      return;
    }
    
    setIsSending(true);
    setSendError(null);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      // Convert amount to wei
      const provider = new ethers.BrowserProvider(window.ethereum);
      const amountWei = ethers.parseEther(sendForm.amount);
      
      // Create transaction
      const tx = {
        from: accounts[0],
        to: sendForm.recipient,
        value: amountWei,
        // Gas settings would be added here based on sendForm.gasOption
      };
      
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [tx],
      });
      
      // Close modal after successful transaction
      setShowSendModal(false);
      
      // Reset form
      setSendForm({
        recipient: '',
        amount: '',
        token: 'ETH',
        gasOption: 'standard'
      });
      
      // Show success notification (you would implement this)
      console.log('Transaction sent:', txHash);
      
    } catch (error: any) {
      console.error('Send transaction error:', error);
      
      if (error.code === 4001) {
        // User rejected transaction
        setSendError('Transaction rejected by user');
      } else {
        setSendError(error.message || 'Failed to send transaction');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSwapSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.ethereum) {
      setSwapError('MetaMask not detected');
      return;
    }
    
    // Validate form
    if (!swapForm.amount || parseFloat(swapForm.amount) <= 0) {
      setSwapError('Please enter a valid amount');
      return;
    }
    
    setIsSwapping(true);
    setSwapError(null);
    
    try {
      // In a real implementation, this would connect to a DEX like Uniswap
      // For now, we'll just simulate a delay and show a message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Since this is a demo, we'll just show an error that swaps aren't available yet
      throw new Error('Token swaps are not yet available on the Base network for DRONE tokens');
      
    } catch (error: any) {
      console.error('Swap error:', error);
      setSwapError(error.message || 'Failed to execute swap');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="space-y-3">
      <CyberButton className="w-full justify-start" onClick={handleReceiveClick}>
        <ArrowDownLeft className="w-4 h-4 mr-2" />
        Receive Tokens
      </CyberButton>
      
      <CyberButton className="w-full justify-start" disabled={!isCorrectNetwork} onClick={handleSendClick}>
        <ArrowUpRight className="w-4 h-4 mr-2" />
        Send Tokens
      </CyberButton>
      
      <CyberButton className="w-full justify-start" disabled={!isCorrectNetwork} onClick={handleSwapClick}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Swap Tokens
      </CyberButton>
      
      <div className="pt-3 mt-3 border-t border-gray-800">
        <a 
          href="https://bridge.base.org/deposit"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-sm text-plasma hover:underline"
        >
          <span>Bridge ETH to Base</span>
          <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Receive Tokens</h2>
              <button
                onClick={() => setShowReceiveModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Wallet Address
                </label>
                <div className="flex items-center">
                  <div className="bg-[#0d0d14] p-2 rounded flex-1 font-mono text-sm truncate">
                    {walletAddress}
                  </div>
                  <button
                    onClick={() => copyToClipboard(walletAddress)}
                    className="ml-2 p-2 bg-[#0d0d14] rounded hover:bg-[#161620] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400 hover:text-plasma" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this address to receive ETH or DRONE tokens
                </p>
              </div>
              
              <div className="bg-[#0d0d14] p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                  <h3 className="font-medium">Important</h3>
                </div>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Only send Base network tokens to this address</li>
                  <li>• Verify the address before sending any tokens</li>
                  <li>• Transactions cannot be reversed once confirmed</li>
                </ul>
              </div>
              
              <div className="flex justify-end">
                <CyberButton onClick={() => setShowReceiveModal(false)}>
                  Close
                </CyberButton>
              </div>
            </div>
          </HudPanel>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Send Tokens</h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {sendError && (
              <div className="mb-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-300">{sendError}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSendSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recipient Address
                </label>
                <input
                  type="text"
                  value={sendForm.recipient}
                  onChange={(e) => setSendForm({...sendForm, recipient: e.target.value})}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="0x..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Token
                  </label>
                  <select
                    value={sendForm.token}
                    onChange={(e) => setSendForm({...sendForm, token: e.target.value})}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  >
                    <option value="ETH">ETH</option>
                    <option value="DRONE">DRONE</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={sendForm.amount}
                    onChange={(e) => setSendForm({...sendForm, amount: e.target.value})}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="0.0"
                    step="0.000001"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gas Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className={`p-2 rounded text-center text-sm ${
                      sendForm.gasOption === 'slow' 
                        ? 'bg-plasma text-black' 
                        : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                    }`}
                    onClick={() => setSendForm({...sendForm, gasOption: 'slow'})}
                  >
                    Slow
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded text-center text-sm ${
                      sendForm.gasOption === 'standard' 
                        ? 'bg-plasma text-black' 
                        : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                    }`}
                    onClick={() => setSendForm({...sendForm, gasOption: 'standard'})}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded text-center text-sm ${
                      sendForm.gasOption === 'fast' 
                        ? 'bg-plasma text-black' 
                        : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                    }`}
                    onClick={() => setSendForm({...sendForm, gasOption: 'fast'})}
                  >
                    Fast
                  </button>
                </div>
              </div>
              
              <div className="bg-[#0d0d14] p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                  <h3 className="font-medium">Important</h3>
                </div>
                <p className="text-sm text-gray-300">
                  Double-check the recipient address before sending. Blockchain transactions cannot be reversed once confirmed.
                </p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <CyberButton
                  type="button"
                  variant="red"
                  onClick={() => setShowSendModal(false)}
                >
                  Cancel
                </CyberButton>
                <CyberButton
                  type="submit"
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Send Tokens
                    </>
                  )}
                </CyberButton>
              </div>
            </form>
          </HudPanel>
        </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Swap Tokens</h2>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {swapError && (
              <div className="mb-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-300">{swapError}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSwapSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  From
                </label>
                <div className="flex space-x-2">
                  <select
                    value={swapForm.fromToken}
                    onChange={(e) => setSwapForm({...swapForm, fromToken: e.target.value})}
                    className="w-1/3 bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  >
                    <option value="ETH">ETH</option>
                    <option value="DRONE">DRONE</option>
                  </select>
                  <input
                    type="number"
                    value={swapForm.amount}
                    onChange={(e) => setSwapForm({...swapForm, amount: e.target.value})}
                    className="w-2/3 bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="0.0"
                    step="0.000001"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="button"
                  className="p-2 bg-[#0d0d14] rounded-full"
                  onClick={() => setSwapForm({
                    ...swapForm,
                    fromToken: swapForm.toToken,
                    toToken: swapForm.fromToken
                  })}
                >
                  <RefreshCw className="w-5 h-5 text-plasma" />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  To (Estimated)
                </label>
                <div className="flex space-x-2">
                  <select
                    value={swapForm.toToken}
                    onChange={(e) => setSwapForm({...swapForm, toToken: e.target.value})}
                    className="w-1/3 bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  >
                    <option value="DRONE">DRONE</option>
                    <option value="ETH">ETH</option>
                  </select>
                  <div className="w-2/3 bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md">
                    {swapForm.amount && parseFloat(swapForm.amount) > 0 
                      ? swapForm.fromToken === 'ETH' && swapForm.toToken === 'DRONE'
                        ? (parseFloat(swapForm.amount) * 1000).toFixed(2)
                        : swapForm.fromToken === 'DRONE' && swapForm.toToken === 'ETH'
                          ? (parseFloat(swapForm.amount) / 1000).toFixed(6)
                          : swapForm.amount
                      : '0.0'
                    }
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slippage Tolerance
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    className={`p-2 rounded text-center text-sm ${
                      swapForm.slippage === '0.1' 
                        ? 'bg-plasma text-black' 
                        : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                    }`}
                    onClick={() => setSwapForm({...swapForm, slippage: '0.1'})}
                  >
                    0.1%
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded text-center text-sm ${
                      swapForm.slippage === '0.5' 
                        ? 'bg-plasma text-black' 
                        : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                    }`}
                    onClick={() => setSwapForm({...swapForm, slippage: '0.5'})}
                  >
                    0.5%
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded text-center text-sm ${
                      swapForm.slippage === '1.0' 
                        ? 'bg-plasma text-black' 
                        : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                    }`}
                    onClick={() => setSwapForm({...swapForm, slippage: '1.0'})}
                  >
                    1.0%
                  </button>
                  <button
                    type="button"
                    className={`p-2 rounded text-center text-sm ${
                      swapForm.slippage === '2.0' 
                        ? 'bg-plasma text-black' 
                        : 'bg-[#0d0d14] text-white hover:bg-[#161620]'
                    }`}
                    onClick={() => setSwapForm({...swapForm, slippage: '2.0'})}
                  >
                    2.0%
                  </button>
                </div>
              </div>
              
              <div className="bg-[#0d0d14] p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Rate</span>
                  <span className="text-sm">
                    {swapForm.fromToken === 'ETH' && swapForm.toToken === 'DRONE'
                      ? '1 ETH = 1,000 DRONE'
                      : '1 DRONE = 0.001 ETH'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Network Fee</span>
                  <span className="text-sm">~0.0001 ETH</span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <CyberButton
                  type="button"
                  variant="red"
                  onClick={() => setShowSwapModal(false)}
                >
                  Cancel
                </CyberButton>
                <CyberButton
                  type="submit"
                  disabled={isSwapping}
                >
                  {isSwapping ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Swapping...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Swap Tokens
                    </>
                  )}
                </CyberButton>
              </div>
            </form>
          </HudPanel>
        </div>
      )}
    </div>
  );
};

export default WalletActions;