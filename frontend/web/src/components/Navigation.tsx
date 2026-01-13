import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAdmin, isOrganization, isClient, loading } = useRoleAuth();
  const { currentUser } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold text-navy">2Marines</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Always visible links */}
            {!currentUser && (
              <Link to="/login" className="nav-link">
                Login
              </Link>
            )}

            {/* Client and Admin can access resources */}
            {!loading && (isClient || isAdmin) && (
              <>
                <Link to="/resources/housing" className="nav-link">
                  Housing
                </Link>
                <Link to="/resources/employment" className="nav-link">
                  Employment
                </Link>
                <Link to="/resources/health" className="nav-link">
                  Health
                </Link>
                <Link to="/resources/benefits" className="nav-link">
                  Benefits
                </Link>
                <Link to="/profile" className="nav-link">
                  Profile
                </Link>
                
                {/* Add My Conversations link */}
                <Link to="/my-conversations" className="nav-link flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  My Conversations
                </Link>
              </>
            )}

            {/* All authenticated users can access questionnaire */}
            {currentUser && (
              <Link to="/questionnaire" className="nav-link">
                Questionnaire
              </Link>
            )}

            {/* Only organization users and admins can access organization dashboard */}
            {!loading && (isOrganization || isAdmin) && (
              <Link to="/organization" className="nav-link">
                Organization
              </Link>
            )}

            {/* Only admins can access admin dashboard */}
            {!loading && isAdmin && (
              <Link to="/admin" className="nav-link">
                Admin
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-navy hover:text-blue transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            {/* Always visible links */}
            {!currentUser && (
              <Link
                to="/login"
                className="block py-2 text-navy hover:text-blue transition-colors"
              >
                Login
              </Link>
            )}

            {/* Client and Admin can access resources */}
            {!loading && (isClient || isAdmin) && (
              <>
                <Link
                  to="/resources/housing"
                  className="block py-2 text-navy hover:text-blue transition-colors"
                >
                  Housing
                </Link>
                <Link
                  to="/resources/employment"
                  className="block py-2 text-navy hover:text-blue transition-colors"
                >
                  Employment
                </Link>
                <Link
                  to="/resources/health"
                  className="block py-2 text-navy hover:text-blue transition-colors"
                >
                  Health
                </Link>
                <Link
                  to="/resources/benefits"
                  className="block py-2 text-navy hover:text-blue transition-colors"
                >
                  Benefits
                </Link>
                <Link
                  to="/profile"
                  className="block py-2 text-navy hover:text-blue transition-colors"
                >
                  Profile
                </Link>
                
                {/* Add My Conversations link */}
                <Link
                  to="/my-conversations"
                  className="block py-2 text-navy hover:text-blue transition-colors flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  My Conversations
                </Link>
              </>
            )}

            {/* All authenticated users can access questionnaire */}
            {currentUser && (
              <Link
                to="/questionnaire"
                className="block py-2 text-navy hover:text-blue transition-colors"
              >
                Questionnaire
              </Link>
            )}

            {/* Only organization users and admins can access organization dashboard */}
            {!loading && (isOrganization || isAdmin) && (
              <Link
                to="/organization"
                className="block py-2 text-navy hover:text-blue transition-colors"
              >
                Organization
              </Link>
            )}

            {/* Only admins can access admin dashboard */}
            {!loading && isAdmin && (
              <Link
                to="/admin"
                className="block py-2 text-navy hover:text-blue transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
