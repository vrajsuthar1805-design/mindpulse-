import React from 'react';
import { User, Phone, Calendar, Heart, ShieldCheck, MapPin, AlertCircle, FileText } from 'lucide-react';

const PatientProfileCard = ({ profile }) => {
  if (!profile) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-500/30">
            <User className="h-7 w-7" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Doctor-Verified Demographics</span>
            <h2 className="text-xl font-bold text-white mt-0.5">{profile.full_name || 'Patient Profile'}</h2>
            {profile.mobile_number && (
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1 font-mono">
                <Phone className="h-3.5 w-3.5 text-blue-400" /> {profile.mobile_number}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-3.5 py-1.5 rounded-full font-bold border border-emerald-500/30 self-start sm:self-auto">
          <ShieldCheck className="h-4 w-4" />
          <span>Doctor Input • Read Only</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Core Demographics Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Blood Group</span>
            <span className="text-base font-black text-red-600">{profile.blood_group || 'Not set'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Age & Gender</span>
            <span className="text-sm font-bold text-slate-800">
              {profile.age ? `${profile.age} yrs` : '-'} • {profile.gender || 'Male'}
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date of Birth</span>
            <span className="text-sm font-semibold text-slate-700">{profile.date_of_birth || 'Not specified'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Emergency Contact</span>
            <span className="text-xs font-semibold text-slate-700 truncate block">{profile.emergency_contact || 'None'}</span>
          </div>
        </div>

        {/* Address & Known Allergies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.address && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <MapPin className="h-4 w-4 text-blue-600" /> Residential Address
              </h4>
              <p className="text-xs text-slate-700 font-medium">{profile.address}</p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" /> Recorded Allergies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.allergies && profile.allergies.length > 0 ? (
                profile.allergies.map((all, idx) => (
                  <span key={idx} className="bg-red-50 text-red-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-red-200">
                    ⚠️ {all}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No known drug allergies recorded</span>
              )}
            </div>
          </div>
        </div>

        {/* Past Medical History */}
        {profile.past_medical_history && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <FileText className="h-4 w-4 text-purple-600" /> Past Medical History & Conditions
            </h4>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">{profile.past_medical_history}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfileCard;
