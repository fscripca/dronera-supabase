import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldPlus, Menu, X, Lock, ChevronDown } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-stealth bg-opacity-90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center py-4">
          <NavLink to="/" className="flex items-center space-x-2">
            <ShieldPlus className="w-8 h-8 text-plasma" />
            <span className="text-xl font-bold text-white dronera-logo">
              DRONERA
            </span>
          </NavLink>

          {/* Desktop Menu */}
          
          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm uppercase tracking-wider font-medium hover:text-plasma transition-colors ${
                  isActive ? 'text-plasma' : 'text-gray-300'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/technology"
              className={({ isActive }) =>
                `text-sm uppercase tracking-wider font-medium hover:text-plasma transition-colors ${
                  isActive ? 'text-plasma' : 'text-gray-300'
                }`
              }
            >
              Technology
            </NavLink>
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `text-sm uppercase tracking-wider font-medium hover:text-plasma transition-colors ${
                  isActive ? 'text-plasma' : 'text-gray-300'
                }`
              }
            >
              Marketplace
            </NavLink>
            <NavLink
              to="/token"
              className={({ isActive }) =>
                `text-sm uppercase tracking-wider font-medium hover:text-plasma transition-colors ${
                  isActive ? 'text-plasma' : 'text-gray-300'
                }`
              }
            >
              Drone Token
            </NavLink>
            <NavLink
              to="/team"
              className={({ isActive }) =>
                `text-sm uppercase tracking-wider font-medium hover:text-plasma transition-colors ${
                  isActive ? 'text-plasma' : 'text-gray-300'
                }`
              }
            >
              Team
            </NavLink>
           <NavLink
              to="/investor-portal"
              className={({ isActive }) =>
                `text-sm uppercase tracking-wider font-medium hover:text-plasma transition-colors ${
                  isActive ? 'text-plasma' : 'text-gray-300'
                }`
              }
            >
              Investor Portal
            </NavLink>
          
             <NavLink
              to="/faq"
              className={({ isActive }) =>
                `text-sm uppercase tracking-wider font-medium hover:text-plasma transition-colors ${
                  isActive ? 'text-plasma' : 'text-gray-300'
                }`
              }
            >
              FAQ
            </NavLink>
            
           
            <NavLink
              to="/dashboard"
              className="flex items-center space-x-1 cyber-button text-xs"
            >
              <span>DASHBOARD INVESTMENT</span>
              <Lock className="w-4 h-4" />
            </NavLink>

          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-plasma" />
            ) : (
              <Menu className="w-6 h-6 text-plasma" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-stealth bg-opacity-95 backdrop-blur-md overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div className="container mx-auto px-4 py-2 space-y-4">
          <NavLink
            to="/technology"
            className={({ isActive }) =>
              `block py-2 text-sm uppercase tracking-wider font-medium ${
                isActive ? 'text-plasma' : 'text-gray-300'
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Technology
          </NavLink>
          <NavLink
            to="/marketplace"
            className={({ isActive }) =>
              `block py-2 text-sm uppercase tracking-wider font-medium ${
                isActive ? 'text-plasma' : 'text-gray-300'
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Marketplace
          </NavLink>
          <NavLink
            to="/token"
            className={({ isActive }) =>
              `block py-2 text-sm uppercase tracking-wider font-medium ${
                isActive ? 'text-plasma' : 'text-gray-300'
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Drone Token
          </NavLink>
          <NavLink
            to="/team"
            className={({ isActive }) =>
              `block py-2 text-sm uppercase tracking-wider font-medium ${
                isActive ? 'text-plasma' : 'text-gray-300'
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Team
          </NavLink>
          <NavLink
            to="/investor-portal"
            className={({ isActive }) =>
              `block py-2 text-sm uppercase tracking-wider font-medium ${
                isActive ? 'text-plasma' : 'text-gray-300'
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Investor Portal
          </NavLink>
          <NavLink
            to="/dashboard"
            className="flex items-center space-x-1 cyber-button text-xs w-full justify-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <span>ACCESS DASHBOARD</span>
            <Lock className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;