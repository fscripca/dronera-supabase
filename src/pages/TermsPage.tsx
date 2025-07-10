import React from 'react';
import { Shield, FileText, Scale } from 'lucide-react';
import HudPanel from '../components/HudPanel';

const TermsPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Terms & Conditions
          </h1>
          <p className="text-xl text-gray-300">
            Please read these terms carefully before using the DRONERA platform
          </p>
        </div>

        <div className="space-y-8">
          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <Shield className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">1. Definitions</h2>
              
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
               <p>
<span className="text-plasma"> Company :</span>  Dronera S.R.L., a private limited company registered in Romania.
               </p> 
              <p>
            <span className="text-plasma">You : </span>    natural or legal person(s) who use the Dronera Ecosystem (DE) and consequently the Website. Likewise, those legal entities that carry out and/or have carried out an Token buying process through the Dronera Ecosystem. For the avoidance of doubt, if you act directly or on behalf of a company, you will be referred to in these T&Cs as You.
              </p>
              <p>
             <span className="text-plasma"> Token :</span>    DRONE (DRN), unit of digital value, an ERC-3643 compliant security token representing a profit participation right.
              </p>
              <p>
          <span className="text-plasma"> Token Buyer(s) :</span>       natural or legal person(s) who purchase or are interested in purchasing Tokens.
              </p>
               <p>
         <span className="text-plasma"> Participant :</span>        Any individual or legal entity acquiring DRN tokens through a whitelisted process.
               </p> 
               <p>
<span className="text-plasma"> Dronera Ecosystem (DE) :</span>  including Swarm OS, hardware/software products, and token. The DE runs on a decentralized network and works autonomously, to which you will have access through the Website and where, you will have a Dronera Platform that will allow you to buy DRONERA Token. For clarification purposes, this Dronera Platform will allow you to buy tokens, manage your tokens, voting, etc.
               </p> 
               <p>
<span className="text-plasma"> Joint Venture Agreement :</span>  The binding legal agreement associated with DRN token ownership.
               </p> 
               <p>
<span className="text-plasma"> KYC/AML :</span>  Know Your Customer and Anti-Money Laundering processes : process that will be used by Dronera in order to verify the identity of the beneficial owners, legal representatives, etc. The goal of KYC is to prevent money laundering and other financial crimes.
               </p> 
               <p>
<span className="text-plasma"> Smart contract/s :</span>  self-executing contract coded directly as lines of code, which is automatically executed when predetermined conditions are met, allowing the execution of the Tokens.
               </p> 
               <p>
<span className="text-plasma"> Dronera Platform :</span>  is the page created by Dronera that contains direct access to the DE.
               </p> 
               <p>
<span className="text-plasma"> Wallet :</span>  digital mechanism used by the Token Buyer(s) to store and manage funds and tokens. This wallet is an application or platform provided by a third party that allows access to funds and tokens, without Dronera having direct access to them at any time as it is a non-custodial wallet solution, in which full control of the assets and private keys remain exclusively in the hands of the owner.
               </p> 
                           
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <Scale className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">2.	Legal Compliance</h2>
                <p className="text-gray-300">
                
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
               <p>
               All DRN tokens are issued in compliance with Regulation (EU) 2023/1114 of the European Parliament and of the Council of 31 May 2023 on markets in crypto-assets, and amending Regulations (EU) No 1093/2010 and (EU) No 1095/2010 and Directives 2013/36/EU and (EU) 2019/1937 , under the ERC-3643 standard.
              </p>
              <p>
               Participants must undergo mandatory identity verification. Tokens can only be transferred to whitelisted wallets.
              </p>
              <p>
               DRN tokens are non-fungible outside the platform until legal liquidity is enabled (e.g., tZERO, INX).
              </p>
              <p>
                Participants must not reside in jurisdictions where participation in security token offerings is restricted.
              </p>
            
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">3.	Nature of the Token</h2>
                <p className="text-gray-300">
               
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <p>
                 The DRN Token does not represent equity in the Company but a contractual right to receive 50% of Dronera’s net profits in proportion to the participation rate.
              </p>
              <p>
              Token ownership grants:
              </p>
 <p>
<span className="text-plasma">-</span> Access to platform features

 </p>
    <p>
<span className="text-plasma">-</span> A share of distributed benefits
      </p> 
 <p>
  <span className="text-plasma">-</span> Optional governance rights in strategic decisions  
      </p>
              
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <Shield className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">4.	Benefits Sharing</h2>
                <p className="text-gray-300">
                  
                </p>
              </div>
            </div>
            <div className="space-y-4 text-gray-300">
              <p>
               Benefits from hardware sales, software licensing, and intellectual property (IP) will be distributed annually on December 15.
              </p>
              <p>
               Distribution is done via smart contract in stablecoin or fiat equivalent.
              </p>
 <p>
Participation Rate = (DRN owned by participant) / (Total amount collected in the form of participations)
               </p>
              
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <Scale className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">5.	Joint Venture Contract</h2>
                <p className="text-gray-300">
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <p>
              After KYC verification, participants must sign the Joint Venture Agreement digitally (via PDF).
              </p>
              <p>
               This contract serves as the legal basis for profit rights, even in cases of lost token access.
              </p>
              <p>
              Losing access to the wallet does not void the profit rights if the contract is signed and registered.
              </p>
            </div>
          </HudPanel>

          <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">6.	Token Phases and Pricing</h2>
                <p className="text-gray-300">
                
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <p>
           <span className="text-plasma"> Phase 1:</span> 1,000,000 € raised / 0.0500 € per DRN / 20,000,000 tokens issued
     
              </p>
              <p>
                 <span className="text-plasma"> Phase 2:</span> 4,000,000 € raised / 0.1250 € per DRN / 32,000,000 tokens issued             
              </p>
              <p>
               <span className="text-plasma"> Phase 3:</span> 95,000,000 € raised / 2.8500 € per DRN / 33,333,333 tokens issued  
              </p>
 <p>
Tokens are subject to a 12-month lockup from issuance per phase.
    </p>
 <p>
Early participants have pre-emptive rights in future phases to maintain their share.
    </p>
              
            </div>
              </HudPanel>
              <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">7.	No Guarantees or Promises</h2>
                <p className="text-gray-300">
                
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <p>
          DRONERA makes no guarantees about token price appreciation or guaranteed ROI.
     
              </p>
              <p>
                Returns are based on future net profits, which are subject to operational risk.      
              </p>
              <p>
              The token is a participation mechanism, not a speculative instrument.
              </p>
            </div>
          </HudPanel>

              <HudPanel className="p-8">
            <div className="flex items-start mb-6">
              <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">8.	Governance Rights</h2>
                <p className="text-gray-300">
                
                </p>
              </div>
            </div>

            <div className="space-y-4 text-gray-300">
              <p>
        Optional voting rights are granted to DRN holders for:
                   </p>
              <p>
               - R&D directions    
              </p>
              <p>
             - IP licensing models
              </p>
 <p>
- Treasury decisions (staking, liquidity, reinvestment)
    </p>
           <p>    
   Governance follows DAO-style smart contracts and may support quadratic voting in future.  
              </p>
            </div>
          </HudPanel>
{/* 9. Transfer Restrictions */}
<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">9. Transfer Restrictions</h2>
      <div className="text-gray-300 space-y-2">
        <p>Tokens may not be transferred or resold except to whitelisted participants.</p>
        <p>Tokens are not tradable on open exchanges during the initial lockup period.</p>
        <p>Secondary market trading may be enabled via regulated platforms after lockup.</p>
      </div>
    </div>
  </div>
</HudPanel>

<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">10. Liability Disclaimer</h2>
      <div className="text-gray-300 space-y-2">
        <p>Dronera does not guarantee that the DE, the Smart Contract(s), the Dronera Platform will be uninterrupted or error-free and shall not be liable for any losses arising from :</p>
        <p>- Regulatory changes</p>
        <p>- Smart contract errors</p>
        <p>- Platform downtimes</p>
        <p>- Investment decisions based on forward-looking projections</p>
        <p>- The information that your Token Buyer(s) and/or You have provided;</p>
        <p>- Your use of the Website, the DE, the Dronera Platform, the Dronera Platform, etc.;</p>
        <p>- Deficiencies in the server service, or communication networks, or problems resulting from the malfunction or use of non-optimized versions of browsers;</p>
        <p>- Interferences, omissions, interruptions, computer viruses, breakdowns and/or disconnections in the operational functioning of the electronic system or computer devices and equipment;</p>
        <p>- Delays or blocks in use caused by Internet or blockchain deficiencies or overloads;</p>
        <p>- Access by minors to the contents of the Dronera Platform, etc. when false, incorrect or misleading information and/or data is used;</p>
        <p>- Attacks by hackers or other malicious groups or organizations that may attempt to interfere with the smart contract, wallets, Dronera Platform, Dronera Platform, Website, and DE in various ways, including, but not limited to, malware attacks, denial of service attacks, consensus-based attacks, sibylline attacks, smurfing, spoofing, etc.;</p>
        <p>- Unintentional errors or weaknesses that may negatively affect the Website, the Dronera Platform;</p>
        <p>- Damage resulting from the malfunction of Internet or network access providers, causes of Force Majeure or any other unforeseen contingency;</p>
        <p>- Failures or incidents that may occur in communications, deletion or incomplete transmissions such that it is not guaranteed that the services of the Website, the Dronera Platform, etc. are constantly operational;</p>
        <p>- Delays or blockages in use caused by deficiencies or overloads of the Internet or other electronic systems that may be caused by third parties through illegitimate interference;</p>
        <p>Based on the foregoing, to the extent legally possible, You agree to hold Dronera harmless for any losses, damages, fines and expenses arising from or related to any claim due to the above situations.</p>
      </div>
    </div>
  </div>
</HudPanel>


<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">11. Intellectual Property Rights and Trademarks</h2>
      <div className="text-gray-300 space-y-2">
        <p>Intellectual and industrial property rights refer to each and every one of the rights that may be provided to brands, inventions, useful models, designs, software, know-how, design, techniques, processes, computer programs (including source codes ), registered or not, including registration requests, rights to technical documentation, methodologies, business model, Website, Smart Contract(s), DE and its features, trade secrets and industrial, know-how and also copyright, and other intellectual property objects (hereinafter, "Intellectual Property Rights").</p>
        <p>Based on the foregoing, the Property Rights will remain the property of Dronera at all times. In this sense, You accept that the use of the DE, the Dronera Platform and any other functionalities do not imply the acquisition of any Intellectual Property Rights.</p>
      </div>
    </div>
  </div>
</HudPanel>

{/* 12. Compliance */}
<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">12. Compliance</h2>
      <p className="text-gray-300">
       By using the DE, You agree to comply with all applicable laws, including, but not limited to, anti-corruption laws and regulations and applicable laws regarding bribery, extortion and kickbacks.
      </p>
    </div>
  </div>
</HudPanel>

{/* 13. Force Majeure */}
<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">13. Force Majeure</h2>
      <div className="text-gray-300 space-y-2">
        <p>Dronera will not be responsible for the non-execution, total or partial, of the content of these T&C due to a fortuitous event or force majeure :</p>
        <p>- acts of war</p>
        <p>- hostility or sabotage</p>
        <p>- pandemics</p>
        <p>- epidemics</p>
        <p>- interruption of telecommunications, Internet or electricity services</p>
        <p>- government restrictions</p>
        <p>- any other event beyond Dronera's reasonable control ("Force majeure case").</p>
        <p>As a general rule, Force Majeure and the events derived from it will not be cause for resolution of the T&C, unless said situation lasts for more than thirty (30) days. If after this period Dronera considers it necessary, it may resolve the T&C and services.</p>
      </div>
    </div>
  </div>
</HudPanel>


{/* 14. No Professional Advice */}
<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">14. No Professional Advice</h2>
      <div className="text-gray-300 space-y-2">
        <p>All information provided by Dronera on your behalf is for informational purposes only and should not be construed as professional advice.</p>
        <p>Therefore, We strongly recommend that before making any financial, legal, or other decisions involving or/and arising from the information appearing on the DE, Dronera Platform, etc., You seek independent professional advice from an individual, who is licensed and qualified in the area for which such advice would be appropriate.</p>
      </div>
    </div>
  </div>
</HudPanel>


{/* 15. Duration */}
<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">15. Duration</h2>
      <div className="text-gray-300 space-y-2">
        <p>Dronera may terminate the relationship formalized with You when it detects unauthorized or supposedly unauthorized use of the DE, the Dronera Platform, etc. If Dronera exercises this power, it will not assume any obligation and/or liability towards You.</p>
        <p>This Agreement terminates if :</p>
        <p>- The participant withdraws before token issuance</p>
        <p>- The participant violates KYC/AML requirements</p>
        <p>- The Company cancels the ITO due to force majeure or regulatory order</p>
      </div>
    </div>
  </div>
</HudPanel>

{/* 16. Governing Law & Jurisdiction */}
<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">16. Governing Law & Jurisdiction</h2>
      <div className="text-gray-300 space-y-2">
        <p>This Agreement shall be governed by the laws of Romania.</p>
        <p>Any disagreement regarding the purchase of tokens, execution of the contract, use of the Dronera platform, etc. will be resolved amicably, for the mediation of all disputes.</p>
        <p>If, despite all efforts, disputes cannot be resolved, these shall be resolved by the Court of Vaslui, unless resolved through arbitration.</p>
      </div>
    </div>
  </div>
</HudPanel>


{/* 17. Modifications and Miscellany */}
<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">17. Modifications and Miscellany</h2>
      <div className="text-gray-300 space-y-2">
        <p>Dronera S.R.L. reserves the right to modify these Terms and Conditions at any time.</p>
        <p>Participants will be notified of any changes via the Dronera Platform or by email.</p>
        <p>Continued use of the Dronera Platform or holding of DRN tokens after such changes are communicated constitutes acceptance of the revised Terms and Conditions.</p>
        <p>If any provision of these Terms and Conditions is found to be invalid or unenforceable, such provision shall be severed, and the remaining provisions shall remain in full force and effect.</p>
        <p>Dronera S.R.L. reserves the right to assign its contractual position to another legal entity without prior notice.</p>
      </div>
    </div>
  </div>
</HudPanel>

          {/* 18. Customer Service */}
<HudPanel className="p-8">
  <div className="flex items-start mb-6">
    <FileText className="w-8 h-8 text-plasma mr-4 flex-shrink-0" />
    <div>
      <h2 className="text-2xl font-bold mb-2">18. Customer service</h2>
      <div className="text-gray-300 space-y-2">
        <p>For support or technical inquiries, please contact Dronera at the following email address: support@dronera.eu</p>
        <p>Support inquiries may include technical, token-related, or account access issues.</p>
        <p>Dronera does not provide legal or financial advice through this channel.</p>
      </div>
    </div>
  </div>
</HudPanel>
          
          <div className="text-center text-sm text-gray-400">
            <p>Last updated: June 25, 2025</p>
            <p>DRONERA S.R.L. - All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
