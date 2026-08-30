import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Heart, Shield, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const PatientProfileForm = ({ patientId, onProfileUpdated }) => {
  const [profileData, setProfileData] = useState({
    full_name: '',
    mobile_number: '',
    date_of_birth: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    address: '',
    emergency_contact: '',
    allergies: [],
    past_medical_history: ''
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (patientId) {
      fetchPatientProfile();
    }
  }, [patientId]);

  const fetchPatientProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get(`/users/patients/${patientId}/profile`);
      if (res.data) {
        setProfileData({
          full_name: res.data.full_name || '',
          mobile_number: res.data.mobile_number || '',
          date_of_birth: res.data.date_of_birth || '',
          age: res.data.age || '',
          gender: res.data.gender || 'Male',
          blood_group: res.data.blood_group || 'O+',
          address: res.data.address || '',
          emergency_contact: res.data.emergency_contact || '',
          allergies: res.data.allergies || [],
          past_medical_history: res.data.past_medical_history || ''
        });
      }
    } catch (err) {
      console.error("Failed to load patient profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setProfileData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const handleRemoveAllergy = (idx) => {
    setProfileData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put(`/users/patients/${patientId}/profile`, profileData);
      setMessage("✓ Patient profile and demographics saved successfully!");
      if (onProfileUpdated) onProfileUpdated(res.data);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || "Failed to update profile"}`);
    } finally {
      setSaving(false);
    }
  };

  if (!patientId) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
        Please select an assigned patient to edit demographics.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading patient demographics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" /> Patient Demographics & Profile Workstation
          </h3>
          <p className="text-xs text-slate-400">Doctors can update patient entities (Name, Mobile, DOB, Blood Group, Medical History)</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 text-xs font-bold border-b ${
          message.startsWith('✓') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name & Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Patient Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={profileData.full_name}
              onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile / Phone Number
            </label>
            <div className="relative">
              <Phone className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={profileData.mobile_number}
                onChange={(e) => setProfileData({ ...profileData, mobile_number: e.target.value })}
                placeholder="+1-555-0199"
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* DOB, Age, Gender, Blood Group */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              value={profileData.date_of_birth}
              onChange={(e) => setProfileData({ ...profileData, date_of_birth: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              value={profileData.age}
              onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
              placeholder="34"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Gender
            </label>
            <select
              value={profileData.gender}
              onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Blood Group
            </label>
            <select
              value={profileData.blood_group}
              onChange={(e) => setProfileData({ ...profileData, blood_group: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-red-700"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>

        {/* Emergency Contact & Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Emergency Contact
            </label>
            <input
              type="text"
              value={profileData.emergency_contact}
              onChange={(e) => setProfileData({ ...profileData, emergency_contact: e.target.value })}
              placeholder="Jane Doe (Spouse): +1-555-0188"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Residential Address
            </label>
            <input
              type="text"
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              placeholder="123 Health Ave, Suite 400"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>
        </div>

        {/* Known Allergies */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Known Allergies
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              placeholder="Add allergy (e.g. Penicillin)"
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAllergy())}
            />
            <button
              type="button"
              onClick={handleAddAllergy}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {profileData.allergies.map((all, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-md border border-red-200">
                {all}
                <button type="button" onClick={() => handleRemoveAllergy(idx)} className="hover:text-slate-900">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Past Medical History */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Past Medical History & Chronic Conditions
          </label>
          <textarea
            rows={3}
            value={profileData.past_medical_history}
            onChange={(e) => setProfileData({ ...profileData, past_medical_history: e.target.value })}
            placeholder="e.g. Mild Asthma, Hypertension, Diabetes Type 2..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
        >
          {saving ? (
            <span>Saving Patient Profile...</span>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Patient Demographics & Profile</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PatientProfileForm;
