import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Plus, Trash2, Save, FileCheck, Stethoscope } from 'lucide-react';

const MedicalRecordEditor = ({ record, onSaveVerification, isSaving }) => {
  const [formData, setFormData] = useState({
    symptoms: [],
    duration: '',
    diagnosis: '',
    medicines: [],
    tests: [],
    follow_up: '',
    patient_instructions: ''
  });

  const [symptomInput, setSymptomInput] = useState('');
  const [testInput, setTestInput] = useState('');

  useEffect(() => {
    if (record) {
      setFormData({
        symptoms: record.symptoms || [],
        duration: record.duration || '',
        diagnosis: record.diagnosis || '',
        medicines: record.medicines || [],
        tests: record.tests || [],
        follow_up: record.follow_up || '',
        patient_instructions: record.patient_instructions || ''
      });
    }
  }, [record]);

  if (!record) return null;

  const handleAddSymptom = () => {
    if (symptomInput.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (index) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const handleAddTest = () => {
    if (testInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tests: [...prev.tests, testInput.trim()]
      }));
      setTestInput('');
    }
  };

  const handleRemoveTest = (index) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.filter((_, i) => i !== index)
    }));
  };

  const handleAddMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMeds = [...formData.medicines];
    updatedMeds[index][field] = value;
    setFormData(prev => ({ ...prev, medicines: updatedMeds }));
  };

  const handleRemoveMedicine = (index) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveVerification(record.id, {
      ...formData,
      is_verified: true
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/30">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">Doctor Verification Workstation</h3>
            <p className="text-xs text-slate-400">Verify & edit structured AI extraction before saving to database</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {record.is_verified ? (
            <span className="flex items-center gap-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full animate-pulse">
              <AlertCircle className="h-3.5 w-3.5" /> PENDING DOCTOR VERIFICATION
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Diagnosis & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Diagnosis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Symptom Duration
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Symptoms Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Symptoms
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="Add symptom (e.g. Fever)"
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSymptom())}
            />
            <button
              type="button"
              onClick={handleAddSymptom}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.symptoms.map((s, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-md border border-blue-200">
                {s}
                <button type="button" onClick={() => handleRemoveSymptom(idx)} className="hover:text-red-600">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Prescribed Medicines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Prescribed Medicines
            </label>
            <button
              type="button"
              onClick={handleAddMedicine}
              className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add Medicine
            </button>
          </div>

          <div className="space-y-2">
            {formData.medicines.map((med, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={med.name || ''}
                  onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                  className="col-span-4 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Dosage (500mg)"
                  value={med.dosage || ''}
                  onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                  className="col-span-2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Frequency (BD/TDS)"
                  value={med.frequency || ''}
                  onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                  className="col-span-3 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Duration (5 days)"
                  value={med.duration || ''}
                  onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                  className="col-span-2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(idx)}
                  className="col-span-1 text-slate-400 hover:text-red-600 flex justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tests & Follow-Up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Recommended Lab Tests
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Add Lab Test (e.g. CBC)"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTest())}
              />
              <button
                type="button"
                onClick={handleAddTest}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tests.map((t, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-md border border-purple-200">
                  {t}
                  <button type="button" onClick={() => handleRemoveTest(idx)} className="hover:text-red-600">×</button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Follow-Up Instructions
            </label>
            <input
              type="text"
              value={formData.follow_up}
              onChange={(e) => setFormData({ ...formData, follow_up: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Patient Instructions in Layman Language */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Patient Instructions (Simple Language)
          </label>
          <textarea
            rows={3}
            value={formData.patient_instructions}
            onChange={(e) => setFormData({ ...formData, patient_instructions: e.target.value })}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        {/* Submit Verification */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition-all"
        >
          {isSaving ? (
            <span>Saving Verification...</span>
          ) : (
            <>
              <FileCheck className="h-5 w-5" />
              <span>Verify & Save Record to Database</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MedicalRecordEditor;
