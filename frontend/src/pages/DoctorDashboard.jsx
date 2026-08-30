import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AudioRecorder from '../components/AudioRecorder';
import MedicalRecordEditor from '../components/MedicalRecordEditor';
import PatientProfileForm from '../components/PatientProfileForm';
import api from '../services/api';
import { Stethoscope, UserPlus, Users, Sparkles, FileText, CheckCircle2, Clock, ShieldAlert, UserCheck } from 'lucide-react';

const DoctorDashboard = () => {
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedAssignPatientId, setSelectedAssignPatientId] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [activeRecord, setActiveRecord] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'editor', 'patients', 'profile', 'patient-history'
  const [rbacError, setRbacError] = useState('');

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const [assignedRes, allRes, queueRes] = await Promise.all([
        api.get('/users/patients'),
        api.get('/users/all-patients'),
        api.get('/consultations/doctor-queue')
      ]);
      setAssignedPatients(assignedRes.data);
      setAllPatients(allRes.data);
      setConsultations(queueRes.data);

      if (queueRes.data.length > 0 && queueRes.data[0].medical_record) {
        setActiveRecord(queueRes.data[0].medical_record);
      }
      if (assignedRes.data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(assignedRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load doctor dashboard data", err);
    }
  };

  const handleAssignPatient = async () => {
    if (!selectedAssignPatientId) return;
    try {
      await api.post('/users/assign-patient', { patient_id: selectedAssignPatientId });
      alert("Patient successfully assigned!");
      fetchDoctorData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to assign patient");
    }
  };

  const handleProcessConsultation = async (formData) => {
    setIsProcessing(true);
    setRbacError('');
    try {
      const res = await api.post('/consultations/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newConsultation = res.data;
      setConsultations([newConsultation, ...consultations]);
      if (newConsultation.medical_record) {
        setActiveRecord(newConsultation.medical_record);
      }
      setActiveTab('editor');
    } catch (err) {
      setRbacError(err.response?.data?.detail || "Failed to process consultation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveVerification = async (recordId, updatedData) => {
    setIsSaving(true);
    try {
      const res = await api.put(`/medical-records/${recordId}/verify`, updatedData);
      setActiveRecord(res.data);
      fetchDoctorData();
      alert("Medical Record successfully verified and published to patient!");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to verify record");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewPatientRecords = async (patientId) => {
    setRbacError('');
    try {
      const res = await api.get(`/medical-records/patients/${patientId}/records`);
      setPatientRecords(res.data);
      setSelectedPatientId(patientId);
      setActiveTab('patient-history');
    } catch (err) {
      setRbacError(err.response?.data?.detail || "RBAC Access Denied");
    }
  };

  const handleOpenPatientProfile = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header Summary */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="h-7 w-7 text-emerald-600" />
              Doctor Clinical Workstation
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Record consultations, transcribe via Whisper, extract JSON with Gemini AI, verify records & manage patient demographics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'new' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + New Recording
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'editor' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verification Editor ({consultations.length})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patient Demographics
            </button>
            <button
              onClick={() => setActiveTab('patients')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'patients' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patients ({assignedPatients.length})
            </button>
          </div>
        </div>

        {rbacError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold">
            <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span>{rbacError}</span>
          </div>
        )}

        {/* Tab 1: New Recording */}
        {activeTab === 'new' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AudioRecorder
                onProcessConsultation={handleProcessConsultation}
                patients={assignedPatients}
                selectedPatientId={selectedPatientId}
                setSelectedPatientId={setSelectedPatientId}
                isProcessing={isProcessing}
              />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" /> Assign Patient to Practice
              </h3>
              <p className="text-xs text-slate-500">
                In accordance with RBAC rules, doctors can only process consultations and access medical records for assigned patients.
              </p>
              <select
                value={selectedAssignPatientId}
                onChange={(e) => setSelectedAssignPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="">-- Choose Unassigned Patient --</option>
                {allPatients.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                ))}
              </select>
              <button
                onClick={handleAssignPatient}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
              >
                Assign Patient
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Verification Workstation Editor */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 px-2 flex items-center justify-between">
                <span>Recent Consultations</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{consultations.length}</span>
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {consultations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => c.medical_record && setActiveRecord(c.medical_record)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      activeRecord?.consultation_id === c.id
                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800">
                        {assignedPatients.find(p => p.id === c.patient_id)?.full_name || 'Patient Record'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                      "{c.raw_transcript}"
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2">
              {activeRecord ? (
                <MedicalRecordEditor
                  record={activeRecord}
                  onSaveVerification={handleSaveVerification}
                  isSaving={isSaving}
                />
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm font-semibold">Select a consultation from the queue to start verification</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Patient Profile Manager */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Select Assigned Patient</h3>
              <div className="space-y-1.5">
                {assignedPatients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      selectedPatientId === p.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{p.full_name}</span>
                    <UserCheck className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <PatientProfileForm
                patientId={selectedPatientId}
                onProfileUpdated={fetchDoctorData}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Assigned Patients List */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Assigned Patients (RBAC Protected)</h3>
                <p className="text-xs text-slate-500">Manage demographics or view verified clinical records.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedPatients.map((p) => (
                <div key={p.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{p.full_name}</h4>
                    <p className="text-xs text-slate-500">{p.email}</p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleOpenPatientProfile(p.id)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-all"
                    >
                      Edit Patient Demographics
                    </button>
                    <button
                      onClick={() => handleViewPatientRecords(p.id)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-all"
                    >
                      View Verified Records
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Patient History */}
        {activeTab === 'patient-history' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Patient Medical Record History</h3>
                <p className="text-xs text-slate-500">Loaded via RBAC endpoint `GET /api/v1/medical-records/patients/{selectedPatientId}/records`</p>
              </div>
              <button
                onClick={() => setActiveTab('patients')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                ← Back to Patients List
              </button>
            </div>

            <div className="space-y-4">
              {patientRecords.length > 0 ? (
                patientRecords.map((r) => (
                  <div key={r.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{r.diagnosis}</h4>
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        Verified {new Date(r.verified_at || r.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      <strong>Symptoms:</strong> {r.symptoms.join(', ')}
                    </p>
                    <p className="text-xs text-slate-600 font-medium">
                      <strong>Instructions:</strong> {r.patient_instructions}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No verified medical records found for this patient.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
