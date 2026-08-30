import React, { useState, useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Upload, FileText, Sparkles } from 'lucide-react';

const AudioRecorder = ({ onProcessConsultation, patients, selectedPatientId, setSelectedPatientId, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [customTranscript, setCustomTranscript] = useState('');
  const [activeTab, setActiveTab] = useState('record'); // 'record' or 'transcript'

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission denied or not available. You can also paste transcript manually.");
      console.error("Microphone error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert("Please select a patient first.");
      return;
    }

    const formData = new FormData();
    formData.append('patient_id', selectedPatientId);

    if (activeTab === 'record' && audioBlob) {
      formData.append('audio_file', audioBlob, 'consultation_recording.wav');
    } else if (customTranscript.trim()) {
      formData.append('custom_transcript', customTranscript.trim());
    } else {
      // Demo fallback audio URL
      formData.append('audio_url', 'https://firebasestorage.googleapis.com/v0/b/healthcare-ai.appspot.com/o/consultations%2Fdemo.mp3?alt=media');
    }

    onProcessConsultation(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-600" />
            New Consultation Session
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Record doctor-patient dialogue or upload audio for AI analysis</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('record')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'record' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            Live Audio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'transcript' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Paste Transcript
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Select Patient <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">-- Choose Assigned Patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.email})
              </option>
            ))}
          </select>
        </div>

        {/* Live Audio Recorder Tab */}
        {activeTab === 'record' && (
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-4">
            <div className="flex justify-center items-center gap-4">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-md shadow-red-200 transition-all"
                >
                  <Mic className="h-4 w-4 animate-pulse" />
                  Start Recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-md transition-all"
                >
                  <Square className="h-4 w-4 text-red-400" />
                  Stop Recording ({formatTime(recordingTime)})
                </button>
              )}
            </div>

            {audioUrl && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 max-w-md mx-auto space-y-3">
                <p className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1">
                  ✓ Audio Recorded Successfully ({formatTime(recordingTime)})
                </p>
                <audio src={audioUrl} controls className="w-full h-8" />
                <button
                  type="button"
                  onClick={resetRecording}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Recording
                </button>
              </div>
            )}
          </div>
        )}

        {/* Paste Transcript Tab */}
        {activeTab === 'transcript' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Raw Dialogue Transcript
            </label>
            <textarea
              rows={4}
              value={customTranscript}
              onChange={(e) => setCustomTranscript(e.target.value)}
              placeholder="Doctor: How are you feeling today?... Patient: I have high fever and headache for 3 days..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        )}

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isProcessing || !selectedPatientId}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
            isProcessing || !selectedPatientId
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Processing Whisper STT & Gemini LLM AI Extraction...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Transcribe & Extract Medical JSON with Gemini AI</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AudioRecorder;
