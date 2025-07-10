import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  Save, 
  X, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  RefreshCw
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  title: string;
  description: string;
  category: 'Financial' | 'Legal' | 'Reports' | 'Other';
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'Active' | 'Inactive';
  visibility: 'all' | 'accredited' | 'institutional';
  created_at: string;
  updated_at: string;
  created_by: string;
}

const AdminDocumentsPage: React.FC = () => {
  const { adminUser, logAdminAction } = useAdminAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'Financial' | 'Legal' | 'Reports' | 'Other'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  
  // Form state for new/edit document
  const [documentForm, setDocumentForm] = useState({
    title: '',
    description: '',
    category: 'Financial' as 'Financial' | 'Legal' | 'Reports' | 'Other',
    file_path: '',
    file_size: 0,
    file_type: '',
    status: 'Active' as 'Active' | 'Inactive',
    visibility: 'all' as 'all' | 'accredited' | 'institutional'
  });
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, filterCategory, filterStatus]);

  const loadDocuments = async () => {
    setIsLoading(true);
    setSaveError(null);
    
    try {
      console.log('Loading documents via Edge Function...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('admin-document-manager', {
        body: { action: 'get' },
        headers: {
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      console.log('Function response:', response);

      if (response.error) {
        console.error('Function invocation error:', response.error);
        throw new Error(`Function error: ${response.error.message || 'Edge function unavailable'}`);
      }

      if (!response.data) {
        console.error('No response data received from function');
        throw new Error('No data received from server');
      }

      if (!response.data.success && response.data.error) {
        console.error('Application error:', response.data.error);
        throw new Error(response.data.error);
      }

      const documentsData = response.data.data;

      if (documentsData && Array.isArray(documentsData)) {
        console.log(`Loaded ${documentsData.length} documents from Edge Function`);
        setDocuments(documentsData);
      } else {
        console.log('No documents found from Edge Function');
        setDocuments([]);
      }
      
      if (logAdminAction) {
        await logAdminAction('VIEW_DOCUMENTS', 'Viewed admin documents');
      }
      
    } catch (error: any) {
      console.error('Failed to load documents:', error);
      setDocuments([]);
      setSaveError(`Failed to load documents: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }
    
    setFilteredDocuments(filtered);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Update form with file details
      setDocumentForm(prev => ({
        ...prev,
        file_size: file.size,
        file_type: file.type
      }));
    }
  };

  const handleCreateDocument = () => {
    setSelectedDocument(null);
    setDocumentForm({
      title: '',
      description: '',
      category: 'Financial',
      file_path: '',
      file_size: 0,
      file_type: '',
      status: 'Active',
      visibility: 'all'
    });
    setSelectedFile(null);
    setSaveError(null);
    setShowDocumentModal(true);
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setDocumentForm({
      title: document.title,
      description: document.description || '',
      category: document.category,
      file_path: document.file_path,
      file_size: document.file_size,
      file_type: document.file_type,
      status: document.status,
      visibility: document.visibility
    });
    setSelectedFile(null);
    setSaveError(null);
    setShowDocumentModal(true);
  };

  const confirmDeleteDocument = (id: string) => {
    setDocumentToDelete(id);
    setSaveError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      
      console.log('Deleting document via Edge Function:', documentToDelete);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('admin-document-manager', {
        body: { 
          action: 'delete',
          id: documentToDelete
        },
        headers: {
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('Delete response:', response);
      
      if (response.error) {
        console.error('Delete function error:', response.error);
        throw new Error(`Function error: ${response.error.message || 'Edge function unavailable'}`);
      }

      if (!response.data?.success && response.data?.error) {
        console.error('Delete application error:', response.data.error);
        throw new Error(response.data.error);
      }
      
      // Update local state
      setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== documentToDelete));
      
      console.log('Document deleted successfully');
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('DELETE_DOCUMENT', `Deleted document ID: ${documentToDelete}`);
      }
      
      setShowDeleteModal(false);
      setDocumentToDelete(null);
      
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      setSaveError(`Failed to delete document: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      console.log('Saving document via Edge Function...');
      
      // Validate form
      if (!documentForm.title.trim()) {
        throw new Error('Document title is required');
      }
      
      // In a real app, this would upload the file to storage
      // For now, we'll just simulate a file path
      let filePath = documentForm.file_path;
      if (selectedFile) {
        // Simulate file upload
        filePath = `/documents/${selectedFile.name}`;
      }
      
      const documentData = {
        ...documentForm,
        file_path: filePath,
        created_by: adminUser?.email || 'admin@dronera.eu'
      };
      
      console.log('Document data:', documentData);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (selectedDocument) {
        // Update existing document
        console.log('Updating existing document via Edge Function:', selectedDocument.id);
        
        const response = await supabase.functions.invoke('admin-document-manager', {
          body: { 
            action: 'update',
            document: {
              ...documentData,
              id: selectedDocument.id,
              updated_at: new Date().toISOString()
            }
          },
          headers: {
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Update response:', response);
        
        if (response.error) {
          console.error('Update function error:', response.error);
          throw new Error(`Function error: ${response.error.message || 'Edge function unavailable'}`);
        }

        if (!response.data?.success && response.data?.error) {
          console.error('Update application error:', response.data.error);
          throw new Error(response.data.error);
        }
        
        // Update local state
        setDocuments(prevDocuments => 
          prevDocuments.map(doc => 
            doc.id === selectedDocument.id 
              ? { ...doc, ...documentData, updated_at: new Date().toISOString() } 
              : doc
          )
        );
        
        console.log('Document updated successfully');
        
        // Log admin action using the context method
        if (logAdminAction) {
          await logAdminAction('UPDATE_DOCUMENT', `Updated document: ${documentForm.title}`);
        }
      } else {
        // Create new document
        console.log('Creating new document via Edge Function');
        
        const response = await supabase.functions.invoke('admin-document-manager', {
          body: { 
            action: 'create',
            document: {
              ...documentData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          },
          headers: {
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          }
        });
        
        console.log('Create response:', response);
        
        if (response.error) {
          console.error('Create function error:', response.error);
          throw new Error(`Function error: ${response.error.message || 'Edge function unavailable'}`);
        }

        if (!response.data?.success && response.data?.error) {
          console.error('Create application error:', response.data.error);
          throw new Error(response.data.error);
        }
        
        // Update local state with the new document
        let newDoc;
        if (response.data?.data) {
          newDoc = response.data.data;
        } else {
          // Fallback: create a local document object
          newDoc = {
            id: crypto.randomUUID(),
            ...documentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        
        setDocuments(prevDocuments => [newDoc, ...prevDocuments]);
        console.log('New document added to state');
        
        // Log admin action using the context method
        if (logAdminAction) {
          await logAdminAction('CREATE_DOCUMENT', `Created new document: ${documentForm.title}`);
        }
      }
      
      setSaveSuccess(true);
      console.log('Document saved successfully');
      
      // Close modal after success
      setTimeout(() => {
        setShowDocumentModal(false);
        setSaveSuccess(false);
      }, 1500);
      
    } catch (error: any) {
      console.error('Failed to save document:', error);
      setSaveError(error.message || 'Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Financial': return 'bg-green-900 text-green-300';
      case 'Legal': return 'bg-blue-900 text-blue-300';
      case 'Reports': return 'bg-purple-900 text-purple-300';
      case 'Other': return 'bg-gray-900 text-gray-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Active': return 'bg-green-900 text-green-300';
      case 'Inactive': return 'bg-red-900 text-red-300';
      default: return 'bg-gray-900 text-gray-300';
    }
  };

  const getVisibilityLabel = (visibility: string): string => {
    switch (visibility) {
      case 'all': return 'All Investors';
      case 'accredited': return 'Accredited Investors';
      case 'institutional': return 'Institutional Investors';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-400">Manage documents for investor access</p>
        </div>
        <div className="flex items-center space-x-4">
          <CyberButton onClick={loadDocuments} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </CyberButton>
          <CyberButton onClick={handleCreateDocument}>
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </CyberButton>
        </div>
      </div>

      {/* Error Display */}
      {saveError && (
        <HudPanel className="p-4">
          <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-300">{saveError}</p>
              </div>
              <button
                onClick={() => setSaveError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </HudPanel>
      )}

      {/* Filters and Search */}
      <HudPanel className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
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
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              >
                <option value="all">All Categories</option>
                <option value="Financial">Financial</option>
                <option value="Legal">Legal</option>
                <option value="Reports">Reports</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm text-gray-400 block mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end items-end">
            <div className="text-sm text-gray-400">
              Showing {filteredDocuments.length} of {documents.length} documents
            </div>
          </div>
        </div>
      </HudPanel>

      {/* Documents List */}
      <HudPanel className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-plasma mx-auto mb-4"></div>
            <p className="text-gray-400">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No documents found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                ? 'Try adjusting your search filters' 
                : 'Add your first document to get started'
              }
            </p>
            {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? (
              <CyberButton onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterStatus('all');
              }}>
                Clear Filters
              </CyberButton>
            ) : (
              <CyberButton onClick={handleCreateDocument}>
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </CyberButton>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Visibility</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Size</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="border-b border-gray-800 hover:bg-[#0d0d14]">
                    <td className="py-3 px-4">
                      <div className="font-medium">{document.title}</div>
                      <div className="text-sm text-gray-400 truncate max-w-xs">{document.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(document.category)}`}>
                        {document.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(document.status)}`}>
                        {document.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{getVisibilityLabel(document.visibility)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{formatFileSize(document.file_size)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{formatDate(document.created_at)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDocument(document)}
                          className="p-1 text-blue-400 hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDeleteDocument(document.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-green-400 hover:text-green-300"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-plasma hover:text-white"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HudPanel>

      {/* Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedDocument ? 'Edit Document' : 'Add New Document'}</h2>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="mb-6 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <p className="text-sm text-green-300">Document saved successfully</p>
                </div>
              </div>
            )}
            
            {saveError && (
              <div className="mb-6 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-300">{saveError}</p>
                  </div>
                  <button
                    onClick={() => setSaveError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveDocument}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Enter document title"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    placeholder="Enter document description"
                  />
                </div>
                
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={documentForm.category}
                    onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value as any })}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    required
                  >
                    <option value="Financial">Financial</option>
                    <option value="Legal">Legal</option>
                    <option value="Reports">Reports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={documentForm.status}
                    onChange={(e) => setDocumentForm({ ...documentForm, status: e.target.value as any })}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="visibility" className="block text-sm font-medium text-gray-300 mb-2">
                    Visibility *
                  </label>
                  <select
                    id="visibility"
                    value={documentForm.visibility}
                    onChange={(e) => setDocumentForm({ ...documentForm, visibility: e.target.value as any })}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    required
                  >
                    <option value="all">All Investors</option>
                    <option value="accredited">Accredited Investors</option>
                    <option value="institutional">Institutional Investors</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-2">
                    Document File {!selectedDocument && '*'}
                  </label>
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    required={!selectedDocument}
                  />
                  {selectedDocument && !selectedFile && (
                    <p className="text-xs text-gray-400 mt-1">
                      Current file: {selectedDocument.file_path.split('/').pop()} ({formatFileSize(selectedDocument.file_size)})
                    </p>
                  )}
                  {selectedFile && (
                    <p className="text-xs text-gray-400 mt-1">
                      Selected file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
                <CyberButton
                  type="button"
                  variant="red"
                  onClick={() => setShowDocumentModal(false)}
                >
                  Cancel
                </CyberButton>
                <CyberButton
                  type="submit"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : selectedDocument ? 'Update Document' : 'Save Document'}
                </CyberButton>
              </div>
            </form>
          </HudPanel>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-md w-full p-6">
            <div className="text-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Delete Document?</h2>
              <p className="text-gray-300">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
            </div>
            
            {saveError && (
              <div className="mb-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-300">{saveError}</p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-4">
              <CyberButton
                variant="red"
                className="flex-1"
                onClick={handleDeleteDocument}
                disabled={isSaving}
              >
                {isSaving ? 'Deleting...' : 'Delete Document'}
              </CyberButton>
              <CyberButton
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSaveError(null);
                }}
              >
                Cancel
              </CyberButton>
            </div>
          </HudPanel>
        </div>
      )}
    </div>
  );
};

export default AdminDocumentsPage;