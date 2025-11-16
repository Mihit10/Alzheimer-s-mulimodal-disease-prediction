"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";

export default function IntakeWizard() {
  const [step, setStep] = useState(1);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen">
      {/* Top progress indicator */}
      <div className="w-full px-6 py-6 flex justify-center">
        <div className="w-full max-w-2xl flex items-center gap-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-2 flex-1 rounded-full transition-all ${
                n <= step
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated step container */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <Step1 next={next} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <Step2 next={next} back={back} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <Step3 back={back} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
