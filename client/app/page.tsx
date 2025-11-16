// app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      
      {/* --- Background gradient grid --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(72,85,255,0.15),transparent_70%)]" />
        <div className="absolute inset-0 
          bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] 
          bg-[size:60px_60px] opacity-25"
        />
      </div>

      {/* --- Hero --- */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-28 px-6">
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold tracking-tight text-white mb-4"
        >
          Alzheimer’s Multimodal Prediction
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-xl text-neutral-300 text-lg"
        >
          A next-generation diagnostic assistant that combines MRI imaging, 
          genetic biomarkers, cognitive evaluation and blood report extraction 
          to predict Alzheimer’s progression with precision.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-10"
        >
          <Link
            href="/intake"
            className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 
            text-white font-medium text-lg shadow-lg shadow-blue-600/40 
            transition-all duration-300 hover:scale-105"
          >
            Begin Diagnosis →
          </Link>
        </motion.div>
      </section>

      {/* --- Feature Cards --- */}
      <section className="relative z-10 mt-32 px-6 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Card 1 */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="rounded-xl p-6 bg-white/5 backdrop-blur-lg border border-white/10 
            hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/20 
            transition-all duration-300"
          >
            <h3 className="text-xl font-semibold mb-2">Multimodal Input</h3>
            <p className="text-neutral-400">
              Upload MRI scans, blood reports or manually enter lifestyle and clinical 
              indicators through a futuristic interactive interface.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="rounded-xl p-6 bg-white/5 backdrop-blur-lg border border-white/10 
            hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/20 
            transition-all duration-300"
          >
            <h3 className="text-xl font-semibold mb-2">AI-Powered Prediction</h3>
            <p className="text-neutral-400">
              Uses deep learning, ensemble biomarkers, and CatBoost cognitive models 
              to determine Alzheimer’s progression probability.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="rounded-xl p-6 bg-white/5 backdrop-blur-lg border border-white/10 
            hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/20 
            transition-all duration-300"
          >
            <h3 className="text-xl font-semibold mb-2">Digital Patient Twin</h3>
            <p className="text-neutral-400">
              Visualize a 3D neurological twin with floating biomarkers, MRI insights, 
              allele risk and complete extracted medical information.
            </p>
          </motion.div>

        </div>
      </section>

    </div>
  );
}
