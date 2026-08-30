import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, Shield, Stethoscope } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-200">
              <Activity className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Healthcare<span className="text-blue-600">AI</span>
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {user.role === 'DOCTOR' && <Stethoscope className="h-4 w-4 text-emerald-600" />}
              {user.role === 'PATIENT' && <UserIcon className="h-4 w-4 text-blue-600" />}
              {user.role === 'ADMIN' && <Shield className="h-4 w-4 text-purple-600" />}
              <span className="text-sm font-semibold text-slate-700">{user.full_name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                user.role === 'DOCTOR' ? 'bg-emerald-100 text-emerald-800' :
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
