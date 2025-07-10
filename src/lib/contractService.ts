import { supabase } from './supabase';

/**
 * Service for managing contract documents and agreements
 */
export class ContractService {
  private static instance: ContractService;

  private constructor() {}

  public static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService();
    }
    return ContractService.instance;
  }

  /**
   * Get all contracts for a user
   * @param userId The user ID
   * @returns Promise with the user's contracts
   */
  public async getUserContracts(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-manager', {
        body: {},
        method: 'GET',
        path: 'list',
        query: { userId }
      });

      if (error) {
        console.error('Error fetching user contracts:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user contracts:', error);
      throw error;
    }
  }

  /**
   * Upload a contract document
   * @param contractId The contract ID
   * @param file The file to upload
   * @param metadata Optional metadata
   * @returns Promise with the upload result
   */
  public async uploadContractDocument(contractId: string, file: File, metadata?: any): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contractId', contractId);
      formData.append('fileName', file.name);
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      const { data, error } = await supabase.functions.invoke('contract-manager', {
        body: formData,
        method: 'POST',
        path: 'upload'
      });

      if (error) {
        console.error('Error uploading contract document:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to upload contract document:', error);
      throw error;
    }
  }

  /**
   * Download a contract document
   * @param contractId The contract ID
   * @param userId The user ID
   * @returns Promise with the download URL
   */
  public async downloadContractDocument(contractId: string, userId: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-manager', {
        body: {},
        method: 'GET',
        path: 'download',
        query: { contractId, userId }
      });

      if (error) {
        console.error('Error downloading contract document:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to download contract document:', error);
      throw error;
    }
  }

  /**
   * Sign a contract
   * @param contractId The contract ID
   * @param userId The user ID
   * @param signatureData The signature data
   * @returns Promise with the signing result
   */
  public async signContract(contractId: string, userId: string, signatureData: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-api', {
        body: {
          agreementId: contractId,
          userId,
          signatureData,
          ipAddress: 'client',
          userAgent: navigator.userAgent
        },
        method: 'POST',
        path: 'sign'
      });

      if (error) {
        console.error('Error signing contract:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to sign contract:', error);
      throw error;
    }
  }

  /**
   * Create a new contract agreement
   * @param userId The user ID
   * @param templateId The template ID
   * @param title The contract title
   * @param agreementType The agreement type
   * @param metadata Optional metadata
   * @returns Promise with the created contract
   */
  public async createContractAgreement(
    userId: string,
    templateId: string,
    title: string,
    agreementType: string,
    metadata?: any
  ): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('contract-api', {
        body: {
          userId,
          templateId,
          title,
          agreementType,
          metadata
        },
        method: 'POST',
        path: 'create'
      });

      if (error) {
        console.error('Error creating contract agreement:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to create contract agreement:', error);
      throw error;
    }
  }
}

export const contractService = ContractService.getInstance();