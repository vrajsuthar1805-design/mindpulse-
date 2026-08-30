import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Shield, RefreshCw, Lock, Eye, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/audit-logs');
      setAuditLogs(res.data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Shield className="h-7 w-7 text-purple-600" />
              Security Audit & Compliance Console
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Simulated Audit Logging for HIPAA / Data Access Control & RBAC Compliance.
            </p>
          </div>

          <button
            onClick={fetchAuditLogs}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Logs
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-400" /> System Security Audit Trail ({auditLogs.length} Entries)
            </h3>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 font-mono">
              ROLE: ADMIN
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Action Event</th>
                  <th className="px-6 py-3">Resource Type</th>
                  <th className="px-6 py-3">Resource ID</th>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-bold">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] ${
                        log.action.includes('UNAUTHORIZED') ? 'bg-red-100 text-red-800' :
                        log.action.includes('VERIFY') ? 'bg-emerald-100 text-emerald-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700">{log.resource_type}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-[10px]">{log.resource_id || '-'}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-[10px]">{log.user_id || 'Anonymous'}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
