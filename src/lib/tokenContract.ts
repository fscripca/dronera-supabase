import { ethers } from 'ethers';
import { supabase } from './supabase';

// DRONE Token ABI (minimal for basic operations)
const DRONE_TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

// Token contract configuration
const TOKEN_CONFIG = {
  address: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
  chainId: parseInt(import.meta.env.VITE_TOKEN_CHAIN_ID || '8453', 10),
  abi: DRONE_TOKEN_ABI
};

// Base Network Configuration
export const BASE_NETWORK = {
  chainId: '0x2105', // 8453 in hex
  chainName: 'Base',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
};

// Token contract class
export class TokenContract {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;
  private isInitialized = false;

  // Initialize the contract
  async initialize(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        console.error('Ethereum provider not found');
        return false;
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if connected to the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(TOKEN_CONFIG.chainId)) {
        console.warn('Not connected to Base network');
        return false;
      }

      // Get signer
      this.signer = await this.provider.getSigner();
      
      // Create contract instance
      this.contract = new ethers.Contract(
        TOKEN_CONFIG.address,
        TOKEN_CONFIG.abi,
        this.signer
      );

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize token contract:', error);
      return false;
    }
  }

  // Get token balance for an address
  async getBalance(address: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const balance = await this.contract.balanceOf(address);
      return ethers.formatUnits(balance, 18); // Assuming 18 decimals
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return '0';
    }
  }

  // Get token metadata
  async getMetadata(): Promise<{ name: string; symbol: string; decimals: number }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [name, symbol, decimals] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals()
      ]);

      return { name, symbol, decimals };
    } catch (error) {
      console.error('Failed to get token metadata:', error);
      return { name: 'DRONE Token', symbol: 'DRONE', decimals: 18 };
    }
  }

  // Transfer tokens
  async transfer(to: string, amount: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.contract || !this.signer) {
        throw new Error('Contract or signer not initialized');
      }

      // Convert amount to wei
      const amountWei = ethers.parseUnits(amount, 18); // Assuming 18 decimals

      // Send transaction
      const tx = await this.contract.transfer(to, amountWei);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Record transaction in database
      await this.recordTransaction(tx.hash, to, amount, 'transfer');

      return { success: true, txHash: tx.hash };
    } catch (error) {
      console.error('Failed to transfer tokens:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Record transaction in database
  private async recordTransaction(
    txHash: string, 
    to: string, 
    amount: string,
    type: 'transfer' | 'mint' | 'burn'
  ): Promise<void> {
    try {
      if (!this.signer) {
        throw new Error('Signer not initialized');
      }

      const from = await this.signer.getAddress();
      
      // Get transaction details
      const tx = await this.provider?.getTransaction(txHash);
      if (!tx) {
        throw new Error('Transaction not found');
      }

      // Get receipt for gas used
      const receipt = await this.provider?.getTransactionReceipt(txHash);
      
      // Record in database
      await supabase.rpc('record_token_transaction', {
        p_contract_id: TOKEN_CONFIG.address,
        p_transaction_hash: txHash,
        p_block_number: tx.blockNumber || 0,
        p_from_address: from,
        p_to_address: to,
        p_amount: parseFloat(amount),
        p_transaction_type: type,
        p_timestamp: new Date().toISOString(),
        p_gas_used: receipt?.gasUsed ? parseInt(receipt.gasUsed.toString()) : null,
        p_gas_price: tx.gasPrice ? parseFloat(ethers.formatUnits(tx.gasPrice, 'gwei')) : null,
        p_metadata: {}
      });
    } catch (error) {
      console.error('Failed to record transaction:', error);
    }
  }

  // Get user token data from database
  async getUserTokenData(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_user_token_balance', {
        p_user_id: userId,
        p_contract_id: TOKEN_CONFIG.address
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user token data:', error);
      return null;
    }
  }

  // Switch to Base network
  async switchToBaseNetwork(): Promise<boolean> {
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      try {
        // Try to switch to Base network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BASE_NETWORK.chainId }],
        });
        return true;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            // Add the Base network to MetaMask
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [BASE_NETWORK],
            });
            return true;
          } catch (addError) {
            console.error('Failed to add Base network:', addError);
            return false;
          }
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Failed to switch to Base network:', error);
      return false;
    }
  }
}

// Export singleton instance
export const tokenContract = new TokenContract();