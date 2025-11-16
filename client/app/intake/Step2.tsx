"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { usePatientStore } from "../store/patientStore";

interface Props {
  next: () => void;
  back: () => void;
}

export default function Step2({ next, back }: Props) {
  const { session, updateUploads, updateMedical } = usePatientStore();

  const mriInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);

  /* ---------------------- Handlers (NO BACKEND CALLS) ---------------------- */

  const handleMRIUpload = (file: File) => {
    updateUploads({ mriFile: file });
  };

  const handleReportUpload = (file: File) => {
    updateUploads({ reportFile: file });
  };

  /* ---------------------- Reusable Components ---------------------- */

  const FileDropZone = ({
    label,
    icon,
    file,
    onClick,
    onDrop,
  }: {
    label: string;
    icon: string;
    file: File | null;
    onClick: () => void;
    onDrop: (f: File) => void;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer bg-white/5 border-white/20 hover:border-blue-400/40 hover:bg-white/10 transition-all"
      onClick={onClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) onDrop(e.dataTransfer.files[0]);
      }}
    >
      {file ? (
        <div>
          <div className="text-5xl mb-3">{icon}</div>
          <p className="text-blue-200 text-sm">{file.name}</p>
        </div>
      ) : (
        <div>
          <div className="text-5xl mb-3">{icon}</div>
          <p className="text-blue-200">{label}</p>
          <p className="text-xs text-blue-300/50 mt-1">Click or drag a file here</p>
        </div>
      )}
    </motion.div>
  );

  /* ---------------------- Medical History Toggle ---------------------- */

  const MedicalToggle = ({
    label,
    keyName,
    value,
  }: {
    label: string;
    keyName: keyof typeof session.medical;
    value: number | null;
  }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-400/20 transition">
      <span className="text-blue-100">{label}</span>

      <div className="flex gap-3">
        {[0, 1].map((v) => (
          <button
            key={v}
            onClick={() => updateMedical({ [keyName]: v })}
            className={`px-5 py-2 rounded-xl border transition ${
              value === v
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                : "border-white/20 bg-white/5 text-blue-200 hover:bg-white/10"
            }`}
          >
            {v === 1 ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );

  /* ---------------------- Medical Items List ---------------------- */

  const medicalItems = [
    { key: "cardiovascularDisease", label: "Cardiovascular Disease" },
    { key: "diabetes", label: "Diabetes" },
    { key: "depression", label: "Depression" },
    { key: "headInjury", label: "History of Head Injury" },
    { key: "hypertension", label: "Hypertension" },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-4 md:p-8 rounded-xl">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-500/50">
              🧬
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Medical History & Uploads
          </h1>

          <p className="text-blue-200 mt-2">
            Add your clinical background and upload your MRI/report.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* LEFT — MRI & REPORT */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">🧠 MRI Scan</h2>

            <FileDropZone
              label="Upload MRI Image"
              icon="🖼️"
              file={session.uploads.mriFile}
              onClick={() => mriInputRef.current?.click()}
              onDrop={handleMRIUpload}
            />

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={mriInputRef}
              onChange={(e) =>
                e.target.files && handleMRIUpload(e.target.files[0])
              }
            />

            <h2 className="text-xl font-semibold mt-10 mb-4 flex items-center gap-2">📄 Blood Report</h2>

            <FileDropZone
              label="Upload Medical Report"
              icon="📄"
              file={session.uploads.reportFile}
              onClick={() => reportInputRef.current?.click()}
              onDrop={handleReportUpload}
            />

            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              ref={reportInputRef}
              onChange={(e) =>
                e.target.files && handleReportUpload(e.target.files[0])
              }
            />
          </div>

          {/* RIGHT — MEDICAL HISTORY */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ❤️ Medical Background
            </h2>

            <div className="space-y-4">
              {medicalItems.map((item) => (
                <MedicalToggle
                  key={item.key}
                  keyName={item.key}
                  label={item.label}
                  value={session.medical[item.key]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-between mt-10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={back}
            className="px-8 py-4 bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl"
          >
            ← Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={next}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-lg font-semibold shadow-xl"
          >
            Continue →
          </motion.button>
        </div>
      </div>
    </div>
  );
}
