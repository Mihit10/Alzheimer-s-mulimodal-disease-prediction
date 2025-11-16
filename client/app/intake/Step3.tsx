"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { usePatientStore } from "../store/patientStore";

interface Props {
  back: () => void;
}

export default function Step3({ back }: Props) {
  const router = useRouter();
  const { session, updateCognitive, setAlleleInput } = usePatientStore();

  const cognitive = session.cognitive;
  const storedAllele = session.alleleInput;

  // Local allele state
  const [ABETA, setABETA] = useState<number | null>(storedAllele.ABETA ?? null);
  const [TAU, setTAU] = useState<number | null>(storedAllele.TAU ?? null);
  const [APVOLUME, setAPVOLUME] = useState<number | null>(storedAllele.APVOLUME ?? null);
  const [GENOTYPE, setGENOTYPE] = useState<string>(storedAllele.GENOTYPE ?? "N/A");

  const [error, setError] = useState<string | null>(null);

  const validateAllele = () => {
    if (ABETA === null || TAU === null || APVOLUME === null) {
      setError("Please fill ABETA, TAU and APVOLUME before continuing.");
      return false;
    }
    return true;
  };

  const proceedToProcessing = () => {
    setError(null);
    if (!validateAllele()) return;

    setAlleleInput({
      ABETA,
      TAU,
      APVOLUME,
      MMSE: cognitive.mmse ?? null,
      GENOTYPE,
    });

    router.push("/processing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-4 md:p-8 rounded-xl">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Cognitive & Biomarker Inputs
          </h1>
          <p className="text-blue-200 mt-2">
            Enter cognitive scores and biomarkers. Processing runs in the next step.
          </p>
        </motion.div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT — Cognitive Assessment */}
          <div className="lg:col-span-2 space-y-8">

            {/* Cognitive Section */}
            <motion.div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
              <h2 className="text-xl font-semibold mb-4">Cognitive Assessment</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* MMSE */}
                <RangeBlock
                  label="MMSE (0–30)"
                  min={0}
                  max={30}
                  value={cognitive.mmse ?? 22}
                  onChange={(v) => updateCognitive({ mmse: v })}
                />

                {/* Functional Assessment */}
                <RangeBlock
                  label="Functional Assessment (0–10)"
                  min={0}
                  max={10}
                  value={cognitive.functionalAssessment ?? 6}
                  onChange={(v) => updateCognitive({ functionalAssessment: v })}
                />

                {/* ADL */}
                <RangeBlock
                  label="ADL (0–10)"
                  min={0}
                  max={10}
                  value={cognitive.adl ?? 4}
                  onChange={(v) => updateCognitive({ adl: v })}
                />
              </div>

              {/* Symptoms */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <EmojiScale
                  label="Memory Complaints"
                  value={cognitive.memoryComplaints ?? 0}
                  onChange={(v) => updateCognitive({ memoryComplaints: v })}
                />
                <EmojiScale
                  label="Behavioral Problems"
                  value={cognitive.behavioralProblems ?? 0}
                  onChange={(v) => updateCognitive({ behavioralProblems: v })}
                />
                <EmojiScale
                  label="Confusion"
                  value={cognitive.confusion ?? 0}
                  onChange={(v) => updateCognitive({ confusion: v })}
                />
              </div>
            </motion.div>

            {/* Allele Inputs */}
            <motion.div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
              <h2 className="text-xl font-semibold mb-4">Biomarker Inputs</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <NumberBlock
                  label="ABETA"
                  value={ABETA}
                  onChange={setABETA}
                  placeholder="e.g. 950"
                />
                <NumberBlock
                  label="TAU"
                  value={TAU}
                  onChange={setTAU}
                  placeholder="e.g. 320"
                />
                <NumberBlock
                  label="APVOLUME"
                  value={APVOLUME}
                  onChange={setAPVOLUME}
                  placeholder="e.g. 4100"
                />
              </div>

              <div className="mt-4">
                <label className="text-sm text-blue-200">GENOTYPE</label>
                <select
                  value={GENOTYPE}
                  onChange={(e) => setGENOTYPE(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
                >
                  {["N/A", "2_2", "2_3", "3_3", "3_4", "4_4"].map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          </div>

          {/* RIGHT Sidebar */}
          <div className="space-y-6">
            <motion.div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-5 rounded-2xl border border-blue-400/20">
              <h3 className="text-lg font-semibold mb-3">Review Summary</h3>

              <SummaryRow label="Patient" value={session.demographics.name ?? "—"} />
              <SummaryRow label="Age" value={session.demographics.age ?? "—"} />
              <SummaryRow label="MMSE" value={cognitive.mmse ?? "—"} />
              <SummaryRow label="ADL" value={cognitive.adl ?? "—"} />

              <div className="h-px bg-white/10 my-3"></div>

              <div className="text-sm text-blue-200 mb-1">Biomarkers</div>
              <div className="text-sm text-white/80">
                ABETA: {ABETA ?? "—"} • TAU: {TAU ?? "—"} • APV: {APVOLUME ?? "—"}
              </div>
              <div className="text-sm text-white/80 mt-1">Genotype: {GENOTYPE}</div>

              {error && <div className="text-rose-400 text-sm mt-2">{error}</div>}

              <div className="flex gap-3 mt-4">
                <button onClick={back} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  ← Back
                </button>

                <button
                  onClick={proceedToProcessing}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold"
                >
                  Run Analysis →
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider {
          height: 6px;
          background: linear-gradient(to right, #3b82f6 0%, #3b82f6 100%);
          border-radius: 10px;
          appearance: none;
        }
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          border: 3px solid white;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------- */
/* COMPONENTS */
/* ------------------------------------------------------- */

function RangeBlock({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-blue-200">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider w-full"
      />
      <div className="flex justify-between text-xs text-blue-300">
        <span>{min}</span>
        <span className="font-semibold">{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function NumberBlock({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm text-blue-200">{label}</label>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className="w-full mt-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10"
        placeholder={placeholder}
      />
    </div>
  );
}

function EmojiScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const list = [
    { v: 0, e: "🙂" },
    { v: 2, e: "😐" },
    { v: 4, e: "😕" },
    { v: 6, e: "😟" },
    { v: 8, e: "😣" },
    { v: 10, e: "😩" },
  ];

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-blue-200">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="flex gap-2">
        {list.map((opt) => (
          <motion.button
            key={opt.v}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt.v)}
            className={`flex-1 py-3 rounded-xl ${
              value === opt.v ? "bg-gradient-to-r from-blue-600 to-cyan-600" : "bg-white/5"
            }`}
          >
            <div className="text-lg">{opt.e}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between text-sm mb-1">
      <span className="text-blue-200/80">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
