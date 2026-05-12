/* PredictionTool.tsx — Interactive LSTM diagnosis prediction form */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const VISIT_MONTHS = [0, 6, 12, 24, 36, 48, 60, 72, 78, 84];
const CDGLOBAL_OPTIONS = [0, 0.5, 1, 2, 3];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Visit {
  visit_month: number;
  entry_age: number;
  CDGLOBAL: number;
  MMSCORE: number;
  TOTSCORE: number;
}

interface PredictionResult {
  predicted_class: string;
  predicted_index: number;
  probabilities: { CN: number; MCI: number; AD: number };
  risk_level: string;
}

const emptyVisit = (): Visit => ({
  visit_month: 0,
  entry_age: 72,
  CDGLOBAL: 0,
  MMSCORE: 28,
  TOTSCORE: 3,
});

const RISK_COLORS: Record<string, string> = {
  low: "from-emerald-500/30 to-emerald-600/10 border-emerald-500/40",
  moderate: "from-amber-500/30 to-amber-600/10 border-amber-500/40",
  high: "from-red-500/30 to-red-600/10 border-red-500/40",
};

const CLASS_COLORS: Record<string, string> = {
  CN: "text-emerald-400",
  MCI: "text-amber-400",
  AD: "text-red-400",
};

const CLASS_BAR_COLORS: Record<string, string> = {
  CN: "bg-emerald-500",
  MCI: "bg-amber-500",
  AD: "bg-red-500",
};

const CLASS_LABELS: Record<string, string> = {
  CN: "Cognitively Normal",
  MCI: "Mild Cognitive Impairment",
  AD: "Alzheimer's Disease",
};

export default function PredictionTool() {
  const [visits, setVisits] = useState<Visit[]>([emptyVisit(), emptyVisit()]);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addVisit = () => {
    if (visits.length >= 3) return;
    setVisits([...visits, emptyVisit()]);
  };

  const removeVisit = (index: number) => {
    if (visits.length <= 2) return;
    setVisits(visits.filter((_, i) => i !== index));
  };

  const updateVisit = (index: number, field: keyof Visit, value: number) => {
    const updated = [...visits];
    updated[index] = { ...updated[index], [field]: value };
    setVisits(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/lstm-predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visits }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error: ${res.status}`);
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reach prediction server. Make sure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & info */}
      <div className="text-sm text-neutral-400 leading-relaxed">
        Enter <strong className="text-neutral-200">2 – 3 past clinical visits</strong> for a patient. 
        The LSTM model will analyze temporal progression patterns and predict the diagnosis at the{" "}
        <strong className="text-blue-300">next follow-up visit</strong>.
      </div>

      {/* Visits */}
      <div className="space-y-4">
        {visits.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className="rounded-xl p-5 bg-white/[0.04] border border-white/10 relative"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-blue-300">
                Visit {i + 1}
              </h4>
              {visits.length > 2 && (
                <button
                  onClick={() => removeVisit(i)}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Visit Month */}
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Visit Month</label>
                <select
                  value={v.visit_month}
                  onChange={(e) => updateVisit(i, "visit_month", Number(e.target.value))}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                >
                  {VISIT_MONTHS.map(m => (
                    <option key={m} value={m} className="bg-neutral-900">
                      {m === 0 ? "Baseline (0)" : `Month ${m}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Entry Age</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  step={0.1}
                  value={v.entry_age}
                  onChange={(e) => updateVisit(i, "entry_age", Number(e.target.value))}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>

              {/* CDGLOBAL */}
              <div>
                <label className="block text-xs text-neutral-500 mb-1">CDR Global</label>
                <select
                  value={v.CDGLOBAL}
                  onChange={(e) => updateVisit(i, "CDGLOBAL", Number(e.target.value))}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                >
                  {CDGLOBAL_OPTIONS.map(c => (
                    <option key={c} value={c} className="bg-neutral-900">{c}</option>
                  ))}
                </select>
              </div>

              {/* MMSCORE */}
              <div>
                <label className="block text-xs text-neutral-500 mb-1">MMSE Score</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={v.MMSCORE}
                  onChange={(e) => updateVisit(i, "MMSCORE", Number(e.target.value))}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>

              {/* TOTSCORE */}
              <div>
                <label className="block text-xs text-neutral-500 mb-1">FAQ Total Score</label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.01}
                  value={v.TOTSCORE}
                  onChange={(e) => updateVisit(i, "TOTSCORE", Number(e.target.value))}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add visit + Submit */}
      <div className="flex flex-col sm:flex-row gap-3">
        {visits.length < 3 && (
          <button
            onClick={addVisit}
            className="px-5 py-2.5 rounded-xl text-sm bg-white/5 border border-dashed border-white/20 text-neutral-400 hover:text-white hover:border-white/40 transition-all"
          >
            + Add Visit
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            "Predict Next Visit Diagnosis"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl p-6 md:p-8 bg-gradient-to-br border ${RISK_COLORS[result.risk_level]}`}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Predicted class */}
              <div className="flex-shrink-0 text-center md:text-left">
                <div className="text-xs uppercase tracking-widest text-neutral-400 mb-1">Predicted Diagnosis</div>
                <div className={`text-4xl font-bold ${CLASS_COLORS[result.predicted_class]}`}>
                  {result.predicted_class}
                </div>
                <div className="text-sm text-neutral-300 mt-1">{CLASS_LABELS[result.predicted_class]}</div>
                <div className="mt-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                    result.risk_level === "low"
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : result.risk_level === "moderate"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-red-500/20 border-red-500/40 text-red-300"
                  }`}>
                    {result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)} Risk
                  </span>
                </div>
              </div>

              {/* Probability bars */}
              <div className="flex-1 space-y-3">
                <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Class Probabilities</div>
                {(["CN", "MCI", "AD"] as const).map(cls => (
                  <div key={cls} className="flex items-center gap-3">
                    <span className={`text-sm w-8 font-semibold ${CLASS_COLORS[cls]}`}>{cls}</span>
                    <div className="flex-1 h-4 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(result.probabilities[cls] * 100).toFixed(1)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className={`h-full rounded-full ${CLASS_BAR_COLORS[cls]}`}
                      />
                    </div>
                    <span className="text-sm text-neutral-300 w-14 text-right font-mono">
                      {(result.probabilities[cls] * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 text-xs text-neutral-500">
              Prediction generated using a Bidirectional LSTM trained on ADNI longitudinal data. 
              This is for research purposes only — not a clinical diagnosis.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
