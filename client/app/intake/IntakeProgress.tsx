// app/intake/IntakeProgress.tsx
"use client";

interface Props {
  step: number;
}

export default function IntakeProgress({ step }: Props) {
  const total = 3;
  const progress = (step / total) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center text-lg font-medium mb-4">
        Step {step} of {total}
      </div>

      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          style={{ width: `${progress}%` }}
          className="h-full bg-blue-500 shadow-[0_0_20px_#3b82f6] transition-all duration-500"
        />
      </div>
    </div>
  );
}
