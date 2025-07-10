import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Building,
  RefreshCw,
  X
} from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { supabase } from '../lib/supabase';

interface JVAgreementState {
  content: string;
  lastModified: string;
  modifiedBy: string;
  version: number;
  status: 'draft' | 'published';
}

const AdminJVAgreementPage: React.FC = () => {
  const { adminUser, logAdminAction } = useAdminAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [agreement, setAgreement] = useState<JVAgreementState>({
    content: `JOINT VENTURE AGREEMENT

THIS JOINT VENTURE AGREEMENT (the "Agreement") is made and entered into as of [DATE], by and between:

DRONERA TECHNOLOGIES S.A., a company organized and existing under the laws of Luxembourg, with its registered office at 1 Boulevard Royal, L-2449 Luxembourg, represented by [NAME], in his/her capacity as [TITLE] (hereinafter referred to as "DRONERA"),

and

EUROPEAN AEROSPACE RESEARCH INSTITUTE, a research institution organized and existing under the laws of the European Union, with its registered office at Rue de la Science 23, 1040 Brussels, Belgium, represented by [NAME], in his/her capacity as [TITLE] (hereinafter referred to as "EARI"),

(DRONERA and EARI are hereinafter collectively referred to as the "Parties" and individually as a "Party").

WHEREAS:

A. DRONERA is a technology company specializing in the development of advanced aerospace defense systems, including hypersonic unmanned aerial vehicles (UAVs) with proprietary H-L.E.V. propulsion systems, quantum-resistant operating systems (Q-OS), and Swarm AI technology;

B. EARI is a leading European research institution with expertise in aerospace engineering, materials science, and advanced propulsion systems;

C. The Parties wish to collaborate on the research, development, and commercialization of H-L.E.V. Propulsion technology for hypersonic flight capabilities (the "Project");

D. The Parties wish to establish a joint venture for the purpose of implementing the Project.

NOW, THEREFORE, in consideration of the mutual covenants and agreements hereinafter set forth, the Parties agree as follows:

1. ESTABLISHMENT OF JOINT VENTURE

1.1. The Parties hereby establish a joint venture (the "Joint Venture") for the purpose of implementing the Project.

1.2. The Joint Venture shall be established as a separate legal entity in the form of a limited liability company under the laws of Luxembourg, with the name "DRONERA-EARI Propulsion Systems S.à r.l." (the "JV Company").

1.3. The registered office of the JV Company shall be at 1 Boulevard Royal, L-2449 Luxembourg.

2. PURPOSE AND SCOPE

2.1. The purpose of the Joint Venture is to research, develop, test, manufacture, and commercialize H-L.E.V. propulsion systems for hypersonic flight capabilities.

2.2. The scope of the Joint Venture shall include, but not be limited to:
   a) Research and development of advanced propulsion technologies;
   b) Design and engineering of propulsion systems;
   c) Testing and validation of prototypes;
   d) Manufacturing of propulsion systems;
   e) Marketing and commercialization of the developed technologies;
   f) Protection and management of intellectual property rights.

3. CAPITAL CONTRIBUTIONS

3.1. The initial capital of the JV Company shall be EUR 2,500,000 (two million five hundred thousand euros).

3.2. The Parties shall contribute to the capital of the JV Company as follows:
   a) DRONERA: EUR 1,500,000 (one million five hundred thousand euros), representing 60% of the total capital;
   b) EARI: EUR 1,000,000 (one million euros), representing 40% of the total capital.

3.3. The capital contributions shall be made in cash within 30 (thirty) days from the date of registration of the JV Company.

3.4. In addition to the cash contributions, the Parties shall make the following in-kind contributions:
   a) DRONERA shall grant the JV Company a non-exclusive license to use its patents, know-how, and technical documentation related to H-L.E.V. propulsion systems;
   b) EARI shall provide access to its research facilities, testing equipment, and technical expertise.

4. OWNERSHIP AND PROFIT SHARING

4.1. The ownership of the JV Company shall be as follows:
   a) DRONERA: 60% (sixty percent);
   b) EARI: 40% (forty percent).

4.2. The profits of the JV Company shall be distributed to the Parties in proportion to their ownership interests, subject to the decision of the Board of Directors to reinvest profits for the development of the Joint Venture.

5. GOVERNANCE

5.1. The JV Company shall be managed by a Board of Directors consisting of 5 (five) members.

5.2. DRONERA shall have the right to appoint 3 (three) directors, and EARI shall have the right to appoint 2 (two) directors.

5.3. The Chairman of the Board shall be appointed by DRONERA from among its appointees.

5.4. The Board of Directors shall meet at least quarterly and shall be responsible for the strategic direction and oversight of the JV Company.

5.5. Decisions of the Board of Directors shall be made by simple majority vote, except for the following matters which shall require the unanimous approval of all directors:
   a) Amendment of the articles of association of the JV Company;
   b) Increase or decrease of the share capital;
   c) Merger, division, or dissolution of the JV Company;
   d) Sale or transfer of all or substantially all of the assets of the JV Company;
   e) Approval of annual budgets and business plans;
   f) Appointment or dismissal of the CEO and CFO;
   g) Entry into agreements with a value exceeding EUR 500,000;
   h) Intellectual property licensing or transfer.

5.6. The day-to-day operations of the JV Company shall be managed by a Chief Executive Officer (CEO) appointed by the Board of Directors.

6. INTELLECTUAL PROPERTY

6.1. All intellectual property owned by each Party prior to the establishment of the Joint Venture ("Background IP") shall remain the exclusive property of that Party.

6.2. Each Party grants to the JV Company a non-exclusive, royalty-free license to use its Background IP solely for the purposes of the Joint Venture.

6.3. All intellectual property developed by the JV Company or jointly by the Parties in the course of the Joint Venture ("Foreground IP") shall be owned by the JV Company.

6.4. Upon termination of the Joint Venture, the Parties shall have a non-exclusive, perpetual license to use the Foreground IP in proportion to their ownership interests in the JV Company at the time of termination.

7. CONFIDENTIALITY

7.1. Each Party shall maintain in strict confidence all confidential information disclosed by the other Party or developed in the course of the Joint Venture.

7.2. The confidentiality obligations shall survive the termination of this Agreement for a period of 5 (five) years.

8. TERM AND TERMINATION

8.1. This Agreement shall come into force on the date of its signing and shall remain in effect for an initial period of 10 (ten) years.

8.2. This Agreement may be terminated:
   a) By mutual written agreement of the Parties;
   b) By either Party in case of a material breach by the other Party that remains uncured for 60 (sixty) days after written notice;
   c) By either Party in case of bankruptcy, insolvency, or dissolution of the other Party.

8.3. In case of termination, the Parties shall cooperate in good faith to wind up the affairs of the JV Company in an orderly manner.

9. DISPUTE RESOLUTION

9.1. Any dispute arising out of or in connection with this Agreement shall be resolved amicably through negotiations between the Parties.

9.2. If the dispute cannot be resolved through negotiations within 60 (sixty) days, it shall be finally settled under the Rules of Arbitration of the International Chamber of Commerce by three arbitrators appointed in accordance with the said Rules.

9.3. The seat of arbitration shall be Luxembourg.

9.4. The language of the arbitration shall be English.

10. MISCELLANEOUS

10.1. This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior agreements and understandings.

10.2. This Agreement may be amended only by a written instrument signed by both Parties.

10.3. This Agreement shall be governed by and construed in accordance with the laws of Luxembourg.

10.4. Neither Party may assign its rights or obligations under this Agreement without the prior written consent of the other Party.

10.5. All notices under this Agreement shall be in writing and shall be delivered by hand, registered mail, or email to the addresses specified by the Parties.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first above written.

DRONERA TECHNOLOGIES S.A.
By: ____________________
Name: __________________
Title: ___________________

EUROPEAN AEROSPACE RESEARCH INSTITUTE
By: ____________________
Name: __________________
Title: ___________________`,
    lastModified: new Date().toISOString(),
    modifiedBy: adminUser?.email || 'admin@dronera.eu',
    version: 1,
    status: 'published'
  });

  useEffect(() => {
    loadAgreement();
  }, []);

  const loadAgreement = async () => {
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use the default state
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('VIEW_JV_AGREEMENT', 'Viewed JV Agreement document');
      }
      
    } catch (error) {
      console.error('Failed to load JV Agreement:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // In a real implementation, this would save to Supabase
      // For now, just update the local state
      setAgreement({
        ...agreement,
        lastModified: new Date().toISOString(),
        modifiedBy: adminUser?.email || 'admin@dronera.eu',
        version: agreement.version + 1
      });
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('UPDATE_JV_AGREEMENT', `Updated JV Agreement document (v${agreement.version + 1})`);
      }
      
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to save JV Agreement:', error);
      setSaveError('Failed to save document. Please try again.');
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSaveError(null);
      }, 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      // In a real implementation, this would delete from Supabase
      // For now, just reset the local state
      setAgreement({
        content: '',
        lastModified: new Date().toISOString(),
        modifiedBy: adminUser?.email || 'admin@dronera.eu',
        version: 0,
        status: 'draft'
      });
      
      // Log admin action using the context method
      if (logAdminAction) {
        await logAdminAction('DELETE_JV_AGREEMENT', 'Deleted JV Agreement document');
      }
      
      setShowDeleteConfirm(false);
      
    } catch (error) {
      console.error('Failed to delete JV Agreement:', error);
      setSaveError('Failed to delete document. Please try again.');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([agreement.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DRONERA_JV_Agreement_v${agreement.version}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Joint Venture Agreement</h1>
          <p className="text-gray-400">Manage the official JV Agreement document</p>
        </div>
        <div className="flex items-center space-x-4">
          {!isEditing ? (
            <>
              <CyberButton onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Document
              </CyberButton>
              <CyberButton onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </CyberButton>
              <CyberButton 
                variant="red" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </CyberButton>
            </>
          ) : (
            <>
              <CyberButton onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </CyberButton>
              <CyberButton 
                variant="red" 
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </CyberButton>
            </>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
            <p className="text-sm text-green-300">Document saved successfully</p>
          </div>
        </div>
      )}
      
      {saveError && (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
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

      {/* Document Metadata */}
      <HudPanel className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#0d0d14] rounded-lg">
              <FileText className="w-6 h-6 text-plasma" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Document Version</p>
              <p className="font-bold">{agreement.version}.0</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#0d0d14] rounded-lg">
              <Calendar className="w-6 h-6 text-plasma" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Modified</p>
              <p className="font-bold">{formatDate(agreement.lastModified)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#0d0d14] rounded-lg">
              <User className="w-6 h-6 text-plasma" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Modified By</p>
              <p className="font-bold">{agreement.modifiedBy}</p>
            </div>
          </div>
        </div>
      </HudPanel>

      {/* Document Content */}
      <HudPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <FileText className="text-plasma mr-3 w-6 h-6" />
            Document Content
          </h2>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-900 text-green-300 text-xs rounded-full">
              {agreement.status.toUpperCase()}
            </div>
            {!isEditing && (
              <button
                onClick={handleDownload}
                className="text-plasma hover:text-white"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={agreement.content}
            onChange={(e) => setAgreement({ ...agreement, content: e.target.value })}
            className="w-full h-[600px] bg-[#0d0d14] border border-gray-700 text-white p-4 rounded-md font-mono text-sm focus:ring-plasma focus:border-plasma"
          />
        ) : (
          <div className="bg-white text-black p-6 rounded-md shadow-lg max-h-[600px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm">{agreement.content}</pre>
          </div>
        )}
      </HudPanel>

      {/* Document History */}
      <HudPanel className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Building className="text-plasma mr-3 w-6 h-6" />
          Document History
        </h2>
        
        <div className="space-y-4">
          <div className="bg-[#0d0d14] p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className="text-sm font-medium">Version {agreement.version}.0</span>
                <span className="ml-3 px-2 py-0.5 bg-green-900 text-green-300 text-xs rounded-full">Current</span>
              </div>
              <span className="text-sm text-gray-400">{formatDate(agreement.lastModified)}</span>
            </div>
            <p className="text-sm text-gray-400">Modified by {agreement.modifiedBy}</p>
          </div>
          
          {agreement.version > 1 && (
            <div className="bg-[#0d0d14] p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Version {agreement.version - 1}.0</span>
                <span className="text-sm text-gray-400">
                  {new Date(new Date(agreement.lastModified).getTime() - 86400000).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-400">Modified by {agreement.modifiedBy}</p>
            </div>
          )}
        </div>
      </HudPanel>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <HudPanel className="max-w-md w-full p-6">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Delete Document?</h2>
              <p className="text-gray-300">
                Are you sure you want to delete this JV Agreement document? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <CyberButton
                variant="red"
                className="flex-1"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Document
              </CyberButton>
              <CyberButton
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
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

export default AdminJVAgreementPage;