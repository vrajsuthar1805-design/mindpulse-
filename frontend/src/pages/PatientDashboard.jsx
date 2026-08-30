import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MedicalRecordCard from '../components/MedicalRecordCard';
import PatientProfileCard from '../components/PatientProfileCard';
import api from '../services/api';
import { User, ShieldCheck, RefreshCw, FileText } from 'lucide-react';

const PatientDashboard = () => {
  const [records, setRecords] = useState([]);
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    setLoading(true);
    setError('');
    try {
      const [recordsRes, profileRes] = await Promise.all([
        api.get('/medical-records/my-records'),
        api.get('/users/my-profile')
      ]);
      setRecords(recordsRes.data);
      setPatientProfile(profileRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch medical data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Banner */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <User className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Personal Health Portal</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Secure RBAC Protected Access (`GET /api/v1/users/my-profile` & `GET /api/v1/medical-records/my-records`). Read-only patient access.
            </p>
          </div>

          <button
            onClick={fetchPatientData}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Portal
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-200 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Doctor-Verified Patient Demographics (Read-Only) */}
        {patientProfile && (
          <PatientProfileCard profile={patientProfile} />
        )}

        {/* Verified Medical Records Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Verified Medical Consultation Prescriptions ({records.length})
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : records.length > 0 ? (
            <div className="space-y-6">
              {records.map((rec) => (
                <MedicalRecordCard key={rec.id} record={rec} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <FileText className="h-12 w-12 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-800 text-base">No Verified Medical Records Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Once your doctor completes a consultation recording and verifies the AI extracted diagnosis, your official medical prescription and instructions will appear here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
