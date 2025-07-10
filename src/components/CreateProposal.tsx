import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, 
  X, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Info
} from 'lucide-react';
import HudPanel from './HudPanel';
import CyberButton from './CyberButton';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProposalFormData } from '../types/governance';

interface CreateProposalProps {
  isOpen: boolean;
  onClose: () => void;
  onProposalCreated: () => void;
}

const CreateProposal: React.FC<CreateProposalProps> = ({ 
  isOpen, 
  onClose,
  onProposalCreated
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    description: '',
    category: 'treasury',
    status: 'pending',
    startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
    endDate: new Date(Date.now() + 604800000).toISOString().slice(0, 16), // 1 week from now
    quorum: 1000000,
    proposedChanges: '',
    implementationTimeline: '',
    expectedImpact: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProposalFormData, string>>>({});

  // Check authentication status on component mount and when user changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsUserAuthenticated(!!session);
    };
    
    checkAuth();
  }, [user]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        category: 'treasury',
        status: 'pending',
        startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
        endDate: new Date(Date.now() + 604800000).toISOString().slice(0, 16), // 1 week from now
        quorum: 1000000,
        proposedChanges: '',
        implementationTimeline: '',
        expectedImpact: ''
      });
      setErrors({});
      setError(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user makes changes
    if (errors[name as keyof ProposalFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProposalFormData, string>> = {};
    
    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.quorum || formData.quorum <= 0) newErrors.quorum = 'Quorum must be greater than zero';
    
    // Date validation
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    
    if (endDate <= startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Check if user is authenticated
    if (!user || !isUserAuthenticated) {
      setError('You must be logged in to create a proposal');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      // Get current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!session) {
        throw new Error('No active session found. Please log in again.');
      }
      
      // Format dates for database
      const formattedData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        start_date: new Date(formData.startDate).toISOString(),
        end_date: new Date(formData.endDate).toISOString(),
        votes_for: 0,
        votes_against: 0,
        votes_abstain: 0,
        quorum: formData.quorum,
        category: formData.category,
        created_by: user.email || session.user.email || 'unknown',
        proposed_changes: formData.proposedChanges,
        implementation_timeline: formData.implementationTimeline,
        expected_impact: formData.expectedImpact
      };
      
      // Insert into database with explicit session
      const { data, error } = await supabase
        .from('governance_proposals')
        .insert(formattedData)
        .select();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Error creating proposal: ${error.message}`);
      }
      
      // Success!
      setSaveSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'treasury',
        status: 'pending',
        startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        endDate: new Date(Date.now() + 604800000).toISOString().slice(0, 16),
        quorum: 1000000,
        proposedChanges: '',
        implementationTimeline: '',
        expectedImpact: ''
      });
      
      // Notify parent component
      onProposalCreated();
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setSaveSuccess(false);
      }, 1500);
      
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      setError(error.message || 'Failed to create proposal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <HudPanel className="max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#0a0a0f] z-10 pb-4">
          <h2 className="text-2xl font-bold">Create New Proposal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Authentication Warning */}
        {!isUserAuthenticated && (
          <div className="mb-6 bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-300">You must be logged in to create a proposal</p>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {saveSuccess && (
          <div className="mb-6 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-sm text-green-300">Proposal created successfully</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-6 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6 pb-24"> {/* Add padding at bottom for fixed footer */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                Proposal Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full bg-[#0d0d14] border ${errors.title ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma`}
                placeholder="Enter a clear, concise title"
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && (
                <p id="title-error" className="mt-1 text-sm text-red-400">{errors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`w-full bg-[#0d0d14] border ${errors.description ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma`}
                placeholder="Provide a detailed description of the proposal"
                aria-invalid={errors.description ? 'true' : 'false'}
                aria-describedby={errors.description ? 'description-error' : undefined}
              />
              {errors.description && (
                <p id="description-error" className="mt-1 text-sm text-red-400">{errors.description}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  required
                >
                  <option value="treasury">Treasury</option>
                  <option value="technical">Technical</option>
                  <option value="governance">Governance</option>
                  <option value="community">Community</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full bg-[#0d0d14] border ${errors.startDate ? 'border-red-500' : 'border-gray-700'} text-white pl-10 pr-3 py-2 rounded-md focus:ring-plasma focus:border-plasma`}
                    required
                    aria-invalid={errors.startDate ? 'true' : 'false'}
                    aria-describedby={errors.startDate ? 'startDate-error' : undefined}
                  />
                </div>
                {errors.startDate && (
                  <p id="startDate-error" className="mt-1 text-sm text-red-400">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                  End Date <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={`w-full bg-[#0d0d14] border ${errors.endDate ? 'border-red-500' : 'border-gray-700'} text-white pl-10 pr-3 py-2 rounded-md focus:ring-plasma focus:border-plasma`}
                    required
                    aria-invalid={errors.endDate ? 'true' : 'false'}
                    aria-describedby={errors.endDate ? 'endDate-error' : undefined}
                  />
                </div>
                {errors.endDate && (
                  <p id="endDate-error" className="mt-1 text-sm text-red-400">{errors.endDate}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="quorum" className="block text-sm font-medium text-gray-300 mb-2">
                  Quorum Required <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="quorum"
                  name="quorum"
                  value={formData.quorum}
                  onChange={handleChange}
                  min="1"
                  className={`w-full bg-[#0d0d14] border ${errors.quorum ? 'border-red-500' : 'border-gray-700'} text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma`}
                  required
                  aria-invalid={errors.quorum ? 'true' : 'false'}
                  aria-describedby={errors.quorum ? 'quorum-error' : undefined}
                />
                {errors.quorum ? (
                  <p id="quorum-error" className="mt-1 text-sm text-red-400">{errors.quorum}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Minimum number of votes required for validity</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="proposedChanges" className="block text-sm font-medium text-gray-300 mb-2">
                Proposed Changes
              </label>
              <textarea
                id="proposedChanges"
                name="proposedChanges"
                value={formData.proposedChanges}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                placeholder="Describe specific changes being proposed"
              />
            </div>
            
            <div>
              <label htmlFor="implementationTimeline" className="block text-sm font-medium text-gray-300 mb-2">
                Implementation Timeline
              </label>
              <textarea
                id="implementationTimeline"
                name="implementationTimeline"
                value={formData.implementationTimeline}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                placeholder="Outline the timeline for implementing this proposal if passed"
              />
            </div>
            
            <div>
              <label htmlFor="expectedImpact" className="block text-sm font-medium text-gray-300 mb-2">
                Expected Impact
              </label>
              <textarea
                id="expectedImpact"
                name="expectedImpact"
                value={formData.expectedImpact}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                placeholder="Describe the expected impact of this proposal on the project"
              />
            </div>
            
            <div className="bg-[#0d0d14] p-4 rounded-lg flex items-start">
              <Info className="w-5 h-5 text-plasma mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-medium mb-1">Important Information</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Proposals cannot be deleted once voting has started</li>
                  <li>Ensure all information is accurate before publishing</li>
                  <li>Token holders will be notified when a new proposal is active</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="fixed bottom-8 left-8 right-8 max-w-4xl mx-auto flex justify-end space-x-4 pt-4 border-t border-gray-800 bg-[#0a0a0f] z-10">
            <CyberButton
              type="button"
              variant="red"
              onClick={onClose}
            >
              Cancel
            </CyberButton>
            <CyberButton
              type="submit"
              disabled={isLoading || !isUserAuthenticated}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Creating...' : 'Create Proposal'}
            </CyberButton>
          </div>
        </form>
      </HudPanel>
    </div>
  );
};

export default CreateProposal;