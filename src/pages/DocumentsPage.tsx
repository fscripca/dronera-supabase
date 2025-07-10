import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle, 
  Clock,
  Menu,
  ExternalLink,
  Star,
  AlertCircle,
  X,
  Users,
  Shield
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { contractService } from '../lib/contractService';

interface Document {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: string;
  visibility: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  starred?: boolean;
}

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starredDocuments, setStarredDocuments] = useState<string[]>([]);
  const [downloadingDocuments, setDownloadingDocuments] = useState<string[]>([]);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Contract document state
  const [contracts, setContracts] = useState<any[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
    loadContracts();
    
    // Load starred documents from local storage
    const savedStarred = localStorage.getItem('starredDocuments');
    if (savedStarred) {
      setStarredDocuments(JSON.parse(savedStarred));
    }
  }, [user]);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, searchTerm, filterCategory, sortBy, sortOrder, starredDocuments]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch documents from Supabase
      const { data, error } = await supabase
        .from('admin_documents')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      
      if (data) {
        // Add starred property based on local storage
        const docsWithStarred = data.map(doc => ({
          ...doc,
          starred: starredDocuments.includes(doc.id)
        }));
        
        setDocuments(docsWithStarred);
      } else {
        // Fallback to mock data
        const mockDocuments: Document[] = [
          {
            id: 'doc-001',
            title: 'Security Token Purchase Agreement',
            description: 'Legal agreement governing the purchase and ownership of DRONE tokens.',
            category: 'Legal',
            file_path: '/documents/security-token-purchase-agreement.pdf',
            file_size: 2500000,
            file_type: 'application/pdf',
            status: 'Active',
            visibility: 'all',
            created_at: '2025-01-15T10:30:00Z',
            updated_at: '2025-01-15T10:30:00Z',
            created_by: 'admin@dronera.eu',
            starred: starredDocuments.includes('doc-001')
          },
          {
            id: 'doc-002',
            title: 'Token Holder Rights',
            description: 'Detailed explanation of rights, privileges, and obligations of DRONE token holders.',
            category: 'Legal',
            file_path: '/documents/token-holder-rights.pdf',
            file_size: 1800000,
            file_type: 'application/pdf',
            status: 'Active',
            visibility: 'all',
            created_at: '2025-01-15T11:45:00Z',
            updated_at: '2025-01-15T11:45:00Z',
            created_by: 'admin@dronera.eu',
            starred: starredDocuments.includes('doc-002')
          },
          {
            id: 'doc-003',
            title: 'Q1 2025 Financial Report',
            description: 'Quarterly financial report for Q1 2025.',
            category: 'Financial',
            file_path: '/documents/q1-2025-financial-report.pdf',
            file_size: 3200000,
            file_type: 'application/pdf',
            status: 'Active',
            visibility: 'all',
            created_at: '2025-04-15T14:00:00Z',
            updated_at: '2025-04-15T14:00:00Z',
            created_by: 'admin@dronera.eu',
            starred: starredDocuments.includes('doc-003')
          },
          {
            id: 'doc-004',
            title: 'H-L.E.V. Propulsion Technical Whitepaper',
            description: 'Technical whitepaper on H-L.E.V. propulsion technology.',
            category: 'Reports',
            file_path: '/documents/hlev-whitepaper.pdf',
            file_size: 5700000,
            file_type: 'application/pdf',
            status: 'Active',
            visibility: 'all',
            created_at: '2025-02-10T09:15:00Z',
            updated_at: '2025-02-10T09:15:00Z',
            created_by: 'admin@dronera.eu',
            starred: starredDocuments.includes('doc-004')
          },
          {
            id: 'doc-005',
            title: 'Joint Venture Agreement - EARI',
            description: 'Joint Venture Agreement between DRONERA and European Aerospace Research Institute.',
            category: 'Legal',
            file_path: '/documents/jv-agreement-eari.pdf',
            file_size: 4100000,
            file_type: 'application/pdf',
            status: 'Active',
            visibility: 'accredited',
            created_at: '2025-01-12T11:30:00Z',
            updated_at: '2025-01-12T11:30:00Z',
            created_by: 'admin@dronera.eu',
            starred: starredDocuments.includes('doc-005')
          },
          {
            id: 'doc-006',
            title: 'Q-OS Security Architecture',
            description: 'Detailed documentation on Q-OS security architecture.',
            category: 'Reports',
            file_path: '/documents/qos-security-architecture.pdf',
            file_size: 3800000,
            file_type: 'application/pdf',
            status: 'Active',
            visibility: 'institutional',
            created_at: '2025-02-20T16:45:00Z',
            updated_at: '2025-02-20T16:45:00Z',
            created_by: 'admin@dronera.eu',
            starred: starredDocuments.includes('doc-006')
          },
          {
            id: 'doc-007',
            title: 'Investor Onboarding Guide',
            description: 'Guide for new investors on the DRONERA platform.',
            category: 'Other',
            file_path: '/documents/investor-onboarding-guide.pdf',
            file_size: 1200000,
            file_type: 'application/pdf',
            status: 'Active',
            visibility: 'all',
            created_at: '2025-01-05T08:30:00Z',
            updated_at: '2025-01-05T08:30:00Z',
            created_by: 'admin@dronera.eu',
            starred: starredDocuments.includes('doc-007')
          },
          {
            id: 'doc-008',
            title: 'Profit Distribution Schedule 2025',
            description: 'Schedule of profit distributions for 2025.',
            category: 'Financial',
            file_path: '/documents/profit-distribution-schedule-2025.xlsx',
            file_size: 900000,
            file_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            status: 'Active',
            visibility: 'all',
            created_at: '2025-01-20T13:15:00Z',
            updated_at: '2025-01-20T13:15:00Z',
            created_by: 'admin@dronera.eu',
            starred: starredDocuments.includes('doc-008')
          }
        ];
        
        setDocuments(mockDocuments);
      }
      
      // Log document access
      await supabase.from('document_access_logs').insert({
        document_id: null, // No specific document, just logging page access
        user_id: user.id,
        ip_address: 'unknown',
        user_agent: navigator.userAgent
      });
      
    } catch (error) {
      console.error('Failed to load documents:', error);
      setError('Failed to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user contracts
  const loadContracts = async () => {
    if (!user) return;
    
    setIsLoadingContracts(true);
    setContractError(null);
    
    try {
      const result = await contractService.getUserContracts(user.id);
      
      if (result && result.success && result.data) {
        setContracts(result.data);
      } else {
        console.log('No contracts found or empty response');
        setContracts([]);
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
      setContractError('Failed to load contracts. Please try again.');
    } finally {
      setIsLoadingContracts(false);
    }
  };

  // Download contract document
  const downloadContract = async (contractId: string) => {
    if (!user) return;
    
    try {
      const result = await contractService.downloadContractDocument(contractId, user.id);
      
      if (result && result.signedUrl) {
        // Open the document in a new tab
        window.open(result.signedUrl, '_blank');
      } else {
        throw new Error('Failed to generate download URL');
      }
    } catch (error) {
      console.error('Error downloading contract document:', error);
      setDownloadError('Failed to download contract document. Please try again.');
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = [...documents];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });
    
    setFilteredDocuments(filtered);
  };

  const toggleStar = (id: string) => {
    let newStarred: string[];
    
    if (starredDocuments.includes(id)) {
      newStarred = starredDocuments.filter(docId => docId !== id);
    } else {
      newStarred = [...starredDocuments, id];
    }
    
    setStarredDocuments(newStarred);
    localStorage.setItem('starredDocuments', JSON.stringify(newStarred));
    
    // Update documents with new starred status
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, starred: !doc.starred } : doc
      )
    );
  };

  const viewDocument = async (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
    
    // Log document access
    if (user) {
      try {
        await supabase.from('document_access_logs').insert({
          document_id: document.id,
          user_id: user.id,
          ip_address: 'unknown',
          user_agent: navigator.userAgent
        });
      } catch (error) {
        console.error('Failed to log document access:', error);
      }
    }
    
    // Open document in new tab
    try {
      // Get the document URL from storage
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(document.file_path.replace(/^\/documents\//, ''), 60);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        return;
      }
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening document:', error);
    }
  };

  const downloadDocument = async (document: Document) => {
    // Add this document to downloading state
    setDownloadingDocuments(prev => [...prev, document.id]);
    setDownloadError(null);
    
    try {
      // Log document access
      if (user) {
        try {
          await supabase.from('document_access_logs').insert({
            document_id: document.id,
            user_id: user.id,
            ip_address: 'unknown',
            user_agent: navigator.userAgent
          });
        } catch (error) {
          console.error('Failed to log document access:', error);
        }
      }
      
      // Extract the file path and get the file name
      const filePath = document.file_path;
      const fileName = filePath.split('/').pop() || `${document.title}.pdf`;
      
      // Properly construct the storage path by removing leading slash and 'documents/' prefix
      let storagePath = filePath;
      if (storagePath.startsWith('/')) {
        storagePath = storagePath.substring(1);
      }
      if (storagePath.startsWith('documents/')) {
        storagePath = storagePath.substring('documents/'.length);
      }
      
      console.log('Attempting to download from storage path:', storagePath);
      
      // Download the file from Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .download(storagePath);
      
      if (error) {
        console.error('Storage download error:', error);
        throw new Error(`Failed to download file: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data received from storage');
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(`Failed to download document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Try alternative download method
      try {
        // Create a signed URL and download from that
        const { data, error: signedUrlError } = await supabase.storage
          .from('documents')
          .createSignedUrl(document.file_path.replace(/^\/documents\//, ''), 60);
        
        if (signedUrlError) {
          console.error('Signed URL error:', signedUrlError);
          throw signedUrlError;
        }
        
        if (data?.signedUrl) {
          // Create an anchor and trigger download
          const a = document.createElement('a');
          a.href = data.signedUrl;
          a.download = document.file_path.split('/').pop() || document.title;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          throw new Error('No signed URL generated');
        }
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        setDownloadError(`Download failed. Please try again later.`);
      }
    } finally {
      // Remove this document from downloading state
      setDownloadingDocuments(prev => prev.filter(id => id !== document.id));
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string): JSX.Element => {
    if (fileType.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-400" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="w-8 h-8 text-blue-400" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileText className="w-8 h-8 text-green-400" />;
    } else {
      return <FileText className="w-8 h-8 text-gray-400" />;
    }
  };

  const getFileExtension = (filePath: string): string => {
    return filePath.split('.').pop()?.toUpperCase() || '';
  };

  // Get unique categories from documents
  const categories = Array.from(new Set(documents.map(doc => doc.category)));

  return (
    <div className="min-h-screen bg-stealth flex">
      {/* Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-6 bg-[#0a0a0f] border-b border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-plasma" />
            <span className="font-bold text-white">Documents</span>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Documents</h1>
                <p className="text-gray-400">Access and manage your investment documents</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Document Categories */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <HudPanel className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-900 bg-opacity-30 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-bold mb-1">Legal Documents</h3>
                  <p className="text-sm text-gray-400">
                    {documents.filter(doc => doc.category === 'Legal').length} documents
                  </p>
                </div>
              </HudPanel>
              
              <HudPanel className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-900 bg-opacity-30 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-bold mb-1">Financial Reports</h3>
                  <p className="text-sm text-gray-400">
                    {documents.filter(doc => doc.category === 'Financial').length} documents
                  </p>
                </div>
              </HudPanel>
              
              <HudPanel className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-900 bg-opacity-30 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-bold mb-1">Technical Papers</h3>
                  <p className="text-sm text-gray-400">
                    {documents.filter(doc => doc.category === 'Reports').length} documents
                  </p>
                </div>
              </HudPanel>
              
              <HudPanel className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-yellow-900 bg-opacity-30 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="font-bold mb-1">Other Documents</h3>
                  <p className="text-sm text-gray-400">
                    {documents.filter(doc => doc.category === 'Other').length} documents
                  </p>
                </div>
              </HudPanel>
            </div>

            {/* Search and Filters */}
            <HudPanel className="p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white pl-10 pr-4 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Sort by</label>
                    <div className="flex items-center">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                      >
                        <option value="date">Date</option>
                        <option value="title">Title</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="ml-2 p-2 bg-[#0d0d14] rounded hover:bg-[#161620] transition-colors"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </HudPanel>

            {/* Documents List */}
            <HudPanel className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Documents</h2>
                <div className="text-sm text-gray-400">
                  Showing {filteredDocuments.length} of {documents.length} documents
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plasma mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No documents found</p>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((document) => (
                    <div key={document.id} className="bg-[#0d0d14] rounded-lg overflow-hidden">
                      <div className="p-4 flex items-start">
                        <div className="mr-4">
                          {getFileTypeIcon(document.file_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-bold truncate pr-2">{document.title}</h3>
                            <button
                              onClick={() => toggleStar(document.id)}
                              className={`flex-shrink-0 ${document.starred ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
                            >
                              <Star className="w-5 h-5" fill={document.starred ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="text-xs px-2 py-1 rounded bg-[#161620] text-gray-300">
                              {document.category}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {formatFileSize(document.file_size)}
                            </span>
                          </div>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{formatDate(document.created_at)}</span>
                          </div>
                          {document.visibility !== 'all' && (
                            <div className="flex items-center mt-1 text-xs text-yellow-400">
                              <Shield className="w-3 h-3 mr-1" />
                              <span>{document.visibility === 'accredited' ? 'Accredited Investors' : 'Institutional Investors'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-gray-800 p-3 flex justify-between">
                        <CyberButton
                          className="text-xs py-1 px-3 flex-1 mr-2"
                          onClick={() => viewDocument(document)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </CyberButton>
                        <CyberButton
                          className="text-xs py-1 px-3 flex-1"
                          onClick={() => downloadDocument(document)}
                          disabled={downloadingDocuments.includes(document.id)}
                        >
                          {downloadingDocuments.includes(document.id) ? (
                            <>
                              <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </>
                          )}
                        </CyberButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </HudPanel>

            {/* Contracts Section */}
            <HudPanel className="p-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Legal Contracts</h2>
                <div className="text-sm text-gray-400">
                  {isLoadingContracts ? 'Loading...' : `${contracts.length} contracts found`}
                </div>
              </div>
              
              {contractError && (
                <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                      <p className="text-sm text-red-300">{contractError}</p>
                    </div>
                    <button
                      onClick={() => setContractError(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {isLoadingContracts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plasma mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading contracts...</p>
                </div>
              ) : contracts.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No contracts found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="bg-[#0d0d14] rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start">
                          <div className="mr-4">
                            <FileText className="w-8 h-8 text-plasma" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold truncate">{contract.title}</h3>
                            <div className="flex items-center mt-1">
                              <span className="text-xs px-2 py-1 rounded bg-[#161620] text-gray-300">
                                {contract.agreement_type}
                              </span>
                              <span className="text-xs text-gray-400 ml-2">
                                {contract.is_signed ? 'Signed' : 'Unsigned'}
                              </span>
                            </div>
                            <div className="flex items-center mt-2 text-xs text-gray-400">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{formatDate(contract.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-800 p-3 flex justify-between">
                        <CyberButton
                          className="text-xs py-1 px-3 flex-1 mr-2"
                          onClick={() => downloadContract(contract.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </CyberButton>
                        <CyberButton
                          className="text-xs py-1 px-3 flex-1"
                          onClick={() => downloadContract(contract.id)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </CyberButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </HudPanel>

            {/* Download Error Message */}
            {downloadError && (
              <div className="mt-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{downloadError}</p>
                  </div>
                  <button
                    onClick={() => setDownloadError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document View Modal */}
      {selectedDocument && showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">{selectedDocument.title}</h2>
                <div className="ml-4 px-2 py-1 bg-[#0d0d14] rounded text-xs">
                  {getFileExtension(selectedDocument.file_path)}
                </div>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-blue-400 mr-2" />
                <div>
                  <p className="font-medium text-blue-300">Document Preview</p>
                  <p className="text-sm text-blue-200">
                    This is a preview of the document. Download for full access.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Document Information */}
              <div>
                <h3 className="text-xl font-bold mb-4">Document Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Category</label>
                    <p className="font-medium">{selectedDocument.category}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Published Date</label>
                    <p className="font-medium">{formatDate(selectedDocument.created_at)}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">File Size</label>
                    <p className="font-medium">{formatFileSize(selectedDocument.file_size)}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="capitalize">{selectedDocument.status}</span>
                    </div>
                  </div>
                  
                  {selectedDocument.visibility !== 'all' && (
                    <div>
                      <label className="text-sm text-gray-400">Access Level</label>
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-yellow-400" />
                        <span>{selectedDocument.visibility === 'accredited' ? 'Accredited Investors' : 'Institutional Investors'}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <CyberButton
                    onClick={() => downloadDocument(selectedDocument)}
                    className="w-full"
                    disabled={downloadingDocuments.includes(selectedDocument.id)}
                  >
                    {downloadingDocuments.includes(selectedDocument.id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Document
                      </>
                    )}
                  </CyberButton>
                </div>
              </div>

              {/* Document Preview */}
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold mb-4">Preview</h3>
                <div className="bg-white rounded-lg h-96 overflow-hidden">
                  {/* This would be a real document preview in a production app */}
                  <div className="flex items-center justify-center h-full bg-[#f5f5f5]">
                    <div className="text-center">
                      {getFileTypeIcon(selectedDocument.file_type)}
                      <p className="text-gray-600 font-medium mt-4">{selectedDocument.title}</p>
                      <p className="text-gray-500 text-sm mt-2">Preview not available</p>
                      <p className="text-gray-500 text-sm">Please download the document to view its contents</p>
                    </div>
                  </div>
                </div>
                
                {selectedDocument.description && (
                  <div className="mt-4 p-4 bg-[#0d0d14] rounded-lg">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-300 text-sm">{selectedDocument.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-800 flex justify-end">
              <CyberButton
                onClick={() => setShowDocumentModal(false)}
                className="px-6"
              >
                Close
              </CyberButton>
            </div>
          </HudPanel>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;