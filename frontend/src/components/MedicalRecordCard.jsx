import React from 'react';
import { ShieldCheck, Pill, Stethoscope, TestTube, Calendar, FileText, CheckCircle2 } from 'lucide-react';

const MedicalRecordCard = ({ record }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
      <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">Official Verified Diagnosis</span>
          <h3 className="text-xl font-bold text-white mt-0.5">{record.diagnosis}</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-semibold border border-white/30">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <span>Doctor Verified</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Symptoms & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Stethoscope className="h-4 w-4 text-blue-600" /> Symptoms Reported
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {record.symptoms && record.symptoms.length > 0 ? (
                record.symptoms.map((sym, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-lg border border-blue-100">
                    {sym}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">None specified</span>
              )}
            </div>
          </div>

          {record.duration && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" /> Symptom Duration
              </h4>
              <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 inline-block">
                {record.duration}
              </span>
            </div>
          )}
        </div>

        {/* Medicines */}
        {record.medicines && record.medicines.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Pill className="h-4 w-4 text-emerald-600" /> Prescribed Medications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {record.medicines.map((med, idx) => (
                <div key={idx} className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-start justify-between">
                  <div>
                    <div className="font-bold text-sm text-emerald-950">{med.name}</div>
                    <div className="text-xs text-emerald-700 font-medium">{med.dosage} • {med.frequency}</div>
                  </div>
                  {med.duration && (
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {med.duration}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tests & Follow-Up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {record.tests && record.tests.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <TestTube className="h-4 w-4 text-purple-600" /> Diagnostic Tests
              </h4>
              <ul className="space-y-1">
                {record.tests.map((test, idx) => (
                  <li key={idx} className="text-xs text-purple-900 font-medium bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-600" /> {test}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {record.follow_up && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Calendar className="h-4 w-4 text-amber-600" /> Follow-Up
              </h4>
              <p className="text-xs text-amber-900 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {record.follow_up}
              </p>
            </div>
          )}
        </div>

        {/* Patient Simple Instructions */}
        {record.patient_instructions && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <FileText className="h-4 w-4 text-slate-600" /> Care & Recovery Instructions
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {record.patient_instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecordCard;
