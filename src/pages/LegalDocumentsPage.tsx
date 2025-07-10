import React from 'react';
import { FileText, Download, Shield, Scale, Building, ArrowRight } from 'lucide-react';
import HudPanel from '../components/HudPanel';
import CyberButton from '../components/CyberButton';

const LegalDocumentsPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Legal <span className="text-plasma">Documents</span>
          </h1>
          <p className="text-xl text-gray-300">
            Access and download essential legal documentation for DRONERA's security token offering
          </p>
        </div>

        <div className="space-y-8">
          {/* Investment Documents */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Scale className="text-plasma mr-3 w-7 h-7" />
              Investment Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HudPanel className="p-6">
                <div className="flex items-start h-full">
                  <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                    <FileText className="w-8 h-8 text-plasma" />
                  </div>
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Security Token Purchase Agreement</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Legal agreement governing the purchase and ownership of DRONE tokens.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex space-x-3">
                        <CyberButton className="text-xs py-1 px-3">
                          <FileText className="w-3 h-3 mr-1" />
                          <span>View</span>
                        </CyberButton>
                        <CyberButton className="text-xs py-1 px-3">
                          <Download className="w-3 h-3 mr-1" />
                          <span>Download</span>
                        </CyberButton>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-start h-full">
                  <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                    <FileText className="w-8 h-8 text-plasma" />
                  </div>
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Token Holder Rights</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Detailed explanation of rights, privileges, and obligations of DRONE token holders.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex space-x-3">
                        <CyberButton className="text-xs py-1 px-3">
                          <FileText className="w-3 h-3 mr-1" />
                          <span>View</span>
                        </CyberButton>
                        <CyberButton className="text-xs py-1 px-3">
                          <Download className="w-3 h-3 mr-1" />
                          <span>Download</span>
                        </CyberButton>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>
            </div>
          </section>

          {/* Regulatory Documents */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Building className="text-plasma mr-3 w-7 h-7" />
              Regulatory Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HudPanel className="p-6">
                <div className="flex items-start h-full">
                  <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                    <FileText className="w-8 h-8 text-plasma" />
                  </div>
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-bold mb-1">ESMA Registration</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        European Securities and Markets Authority registration documentation.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex space-x-3">
                        <CyberButton className="text-xs py-1 px-3">
                          <FileText className="w-3 h-3 mr-1" />
                          <span>View</span>
                        </CyberButton>
                        <CyberButton className="text-xs py-1 px-3">
                          <Download className="w-3 h-3 mr-1" />
                          <span>Download</span>
                        </CyberButton>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-start h-full">
                  <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                    <FileText className="w-8 h-8 text-plasma" />
                  </div>
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Regulatory Compliance Framework</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Overview of compliance measures and regulatory adherence.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex space-x-3">
                        <CyberButton className="text-xs py-1 px-3">
                          <FileText className="w-3 h-3 mr-1" />
                          <span>View</span>
                        </CyberButton>
                        <CyberButton className="text-xs py-1 px-3">
                          <Download className="w-3 h-3 mr-1" />
                          <span>Download</span>
                        </CyberButton>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>
            </div>
          </section>

          {/* Corporate Documents */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Shield className="text-plasma mr-3 w-7 h-7" />
              Corporate Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HudPanel className="p-6">
                <div className="flex items-start h-full">
                  <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                    <FileText className="w-8 h-8 text-plasma" />
                  </div>
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Company Registration</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Official registration documents of DRONERA Technologies S.A.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex space-x-3">
                        <CyberButton className="text-xs py-1 px-3">
                          <FileText className="w-3 h-3 mr-1" />
                          <span>View</span>
                        </CyberButton>
                        <CyberButton className="text-xs py-1 px-3">
                          <Download className="w-3 h-3 mr-1" />
                          <span>Download</span>
                        </CyberButton>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>

              <HudPanel className="p-6">
                <div className="flex items-start h-full">
                  <div className="mr-4 bg-[#0d0d14] p-3 rounded-lg flex-shrink-0">
                    <FileText className="w-8 h-8 text-plasma" />
                  </div>
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-lg font-bold mb-1">Board Resolutions</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Key corporate decisions and governance documentation.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex space-x-3">
                        <CyberButton className="text-xs py-1 px-3">
                          <FileText className="w-3 h-3 mr-1" />
                          <span>View</span>
                        </CyberButton>
                        <CyberButton className="text-xs py-1 px-3">
                          <Download className="w-3 h-3 mr-1" />
                          <span>Download</span>
                        </CyberButton>
                      </div>
                    </div>
                  </div>
                </div>
              </HudPanel>
            </div>
          </section>

          {/* Document Access */}
          <HudPanel className="p-8 mt-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Need Additional Documents?</h2>
              <p className="text-gray-300 mb-6">
                Contact our legal team for access to additional documentation or specific requests.
              </p>
              <CyberButton className="mx-auto">
                <span>Contact Legal Team</span>
                <ArrowRight className="w-5 h-5" />
              </CyberButton>
            </div>
          </HudPanel>

          <div className="text-center text-sm text-gray-400">
            <p>Last updated: March 15, 2025</p>
            <p>DRONERA Technologies S.A. - All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentsPage;