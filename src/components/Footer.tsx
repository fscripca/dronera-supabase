import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldPlus, X, Facebook, Linkedin, Mail, FileText, BookOpen, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { emailService } from '../lib/emailService';

const Footer: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!name.trim() || !email.trim() || !message.trim()) {
        setSubmitError('Please fill in all fields');
        return;
      }
      
      setIsSubmitting(true);
      setSubmitError(null);
      
      await emailService.sendSupportEmail(
        name,
        email,
        'Contact Form Submission',
        message
      );
      
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setSubmitError('Please fill in all fields');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-stealth bg-opacity-80 backdrop-blur-sm border-t border-gray-800 mt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <ShieldPlus className="w-8 h-8 text-plasma" />
              <span className="text-xl font-bold text-white dronera-logo">
                DRONE<span className="text-plasma dronera-one">RA</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Invest in quantum-secure UAVs with Mach 20+ performance.
              Tokenized aerospace defense for the future.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-plasma transition-colors">
                <X className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-plasma transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-plasma transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-plasma transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-plasma transition-colors">
                <BookOpen className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-plasma uppercase tracking-wider text-sm font-medium mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/technology" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/token" className="text-gray-400 hover:text-white text-sm transition-colors">
                  DRONE Token
                </Link>
              </li>
              <li>
                <Link to="/proceeds" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Use of Proceeds
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Team & Governance
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-plasma uppercase tracking-wider text-sm font-medium mb-4">Investors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/investor-portal" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Investor Portal
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Whitepaper <FileText className="w-3 h-3 inline-block ml-1" />
                </a>
              </li>
              <li>
                <Link to="/legal-documents" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Legal Documents
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-plasma uppercase tracking-wider text-sm font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/compliance" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Compliance
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Contact Form */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 text-center">Contact Us</h3>
            
            {submitSuccess && (
              <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-300">Your message has been sent successfully! We'll get back to you soon.</p>
              </div>
            )}
            
            {submitError && (
              <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-300">{submitError}</p>
                </div>
                <button 
                  onClick={() => setSubmitError(null)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0d0d14] border border-gray-700 text-white px-3 py-2 rounded-md focus:ring-plasma focus:border-plasma resize-none"
                  placeholder="How can we help you?"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 cyber-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} DRONERA. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2 md:mt-0">
              DRONE Token is a security token offered under EU regulatory frameworks.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;