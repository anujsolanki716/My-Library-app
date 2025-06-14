import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';
import Button from '../Common/Button';
import { APP_NAME } from '../../constants';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tight text-sky-400 hover:text-sky-300 transition-colors">
          {APP_NAME}
        </Link>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              {currentUser.role === Role.ADMIN ? (
                <>
                  <NavLink to="/admin/dashboard">Admin Home</NavLink>
                  <NavLink to="/admin/books">Manage Books</NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/dashboard">Home</NavLink>
                  <NavLink to="/books">Book Catalog</NavLink>
                  <NavLink to="/my-books">My Borrowed Books</NavLink>
                </>
              )}
              <span className="text-sm text-gray-300 hidden sm:inline">
                Hi, {currentUser.username} ({currentUser.role})
              </span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-sky-400 border-sky-400 hover:bg-sky-400 hover:text-slate-800">
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children }) => (
  <Link 
    to={to} 
    className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
  >
    {children}
  </Link>
);


export default Navbar;
