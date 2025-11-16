// app/store/patientStore.ts
"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

/* ---------------------- INTERFACES ---------------------- */

interface Demographics {
  name: string | null;
  age: number | null;
  gender: number | null; // 0=Male,1=Female
  educationLevel: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;

  smoking: number | null;
  alcoholConsumption: number | null;
  physicalActivity: number | null;
  dietQuality: number | null;
  sleepQuality: number | null;

  familyHistoryAlzheimers: number | null;
}

interface Medical {
  cardiovascularDisease: number | null;
  diabetes: number | null;
  depression: number | null;
  headInjury: number | null;
  hypertension: number | null;
}

interface Cognitive {
  mmse: number | null;
  functionalAssessment: number | null;
  adl: number | null;
  memoryComplaints: number | null;
  behavioralProblems: number | null;
  confusion: number | null;
}

interface AlleleInput {
  ABETA: number | null;
  TAU: number | null;
  MMSE: number | null;
  APVOLUME: number | null;
  GENOTYPE: string | null;
}

interface PatientSession {
  id: string;
  timestamp: string;

  demographics: Demographics;
  medical: Medical;

  uploads: {
    mriFile: File | null;
    reportFile: File | null;
    mriResult: any | null;
    ocrResult: any | null;
  };

  cognitive: Cognitive;

  baseModel: {
    input_used: any | null;
    prediction: string | null;
  };

  alleleInput: AlleleInput;

  alleleResult: {
    cn_prob: number | null;
    risk: string | null;
  };
}

/* ---------------------- STORE INTERFACE ---------------------- */

interface StoreState {
  session: PatientSession;

  updateDemographics: (data: Partial<Demographics>) => void;
  updateMedical: (data: Partial<Medical>) => void;

  updateCognitive: (data: Partial<Cognitive>) => void;

  updateUploads: (
    data: Partial<PatientSession["uploads"]>
  ) => void;

  setAlleleInput: (data: Partial<AlleleInput>) => void;
  setAlleleResult: (res: { cn_prob: number | null; risk: string | null }) => void;

  setMRIResult: (res: any) => void;
  setOCRResult: (res: any) => void;

  setBaseModelResult: (input: any, prediction: string) => void;

  resetSession: () => void;
}

/* ---------------------- STORE IMPLEMENTATION ---------------------- */

export const usePatientStore = create<StoreState>((set) => ({
  session: {
    id: nanoid(),
    timestamp: new Date().toISOString(),

    demographics: {
      name: null,
      age: null,
      gender: null,
      educationLevel: null,
      height: null,
      weight: null,
      bmi: null,

      smoking: null,
      alcoholConsumption: null,
      physicalActivity: null,
      dietQuality: null,
      sleepQuality: null,

      familyHistoryAlzheimers: null,
    },

    medical: {
      cardiovascularDisease: null,
      diabetes: null,
      depression: null,
      headInjury: null,
      hypertension: null,
    },

    uploads: {
      mriFile: null,
      reportFile: null,
      mriResult: null,
      ocrResult: null,
    },

    cognitive: {
      mmse: null,
      functionalAssessment: null,
      adl: null,
      memoryComplaints: null,
      behavioralProblems: null,
      confusion: null,
    },

    baseModel: {
      input_used: null,
      prediction: null,
    },

    alleleInput: {
      ABETA: null,
      TAU: null,
      MMSE: null,
      APVOLUME: null,
      GENOTYPE: null,
    },

    alleleResult: {
      cn_prob: null,
      risk: null,
    },
  },

  /* ------------------ DEMOGRAPHICS ------------------ */
  updateDemographics: (data: Partial<Demographics>) =>
    set((state) => {
      const newDemo = { ...state.session.demographics, ...data };

      if (newDemo.height && newDemo.weight) {
        newDemo.bmi = Number(
          (newDemo.weight / (newDemo.height / 100) ** 2).toFixed(1)
        );
      }

      return {
        session: {
          ...state.session,
          demographics: newDemo,
        },
      };
    }),

  /* ------------------ MEDICAL ------------------ */
  updateMedical: (data: Partial<Medical>) =>
    set((state) => ({
      session: {
        ...state.session,
        medical: { ...state.session.medical, ...data },
      },
    })),

  /* ------------------ COGNITIVE ------------------ */
  updateCognitive: (data: Partial<Cognitive>) =>
    set((state) => ({
      session: {
        ...state.session,
        cognitive: { ...state.session.cognitive, ...data },
      },
    })),

  /* ------------------ UPLOADS ------------------ */
  updateUploads: (data: Partial<PatientSession["uploads"]>) =>
    set((state) => ({
      session: {
        ...state.session,
        uploads: { ...state.session.uploads, ...data },
      },
    })),

  setMRIResult: (res: any) =>
    set((state) => ({
      session: {
        ...state.session,
        uploads: { ...state.session.uploads, mriResult: res },
      },
    })),

  setOCRResult: (res: any) =>
    set((state) => ({
      session: {
        ...state.session,
        uploads: { ...state.session.uploads, ocrResult: res },
      },
    })),

  /* ------------------ ALLELE ------------------ */
  setAlleleInput: (data: Partial<AlleleInput>) =>
    set((state) => ({
      session: {
        ...state.session,
        alleleInput: { ...state.session.alleleInput, ...data },
      },
    })),

  setAlleleResult: (res: { cn_prob: number | null; risk: string | null }) =>
    set((state) => ({
      session: {
        ...state.session,
        alleleResult: res,
      },
    })),

  /* ------------------ BASE MODEL ------------------ */
  setBaseModelResult: (input: any, prediction: string) =>
    set((state) => ({
      session: {
        ...state.session,
        baseModel: { input_used: input, prediction },
      },
    })),

  /* ------------------ RESET SESSION ------------------ */
  resetSession: () =>
    set({
      session: {
        id: nanoid(),
        timestamp: new Date().toISOString(),

        demographics: {
          name: null,
          age: null,
          gender: null,
          educationLevel: null,
          height: null,
          weight: null,
          bmi: null,
          smoking: null,
          alcoholConsumption: null,
          physicalActivity: null,
          dietQuality: null,
          sleepQuality: null,
          familyHistoryAlzheimers: null,
        },

        medical: {
          cardiovascularDisease: null,
          diabetes: null,
          depression: null,
          headInjury: null,
          hypertension: null,
        },

        uploads: {
          mriFile: null,
          reportFile: null,
          mriResult: null,
          ocrResult: null,
        },

        cognitive: {
          mmse: null,
          functionalAssessment: null,
          adl: null,
          memoryComplaints: null,
          behavioralProblems: null,
          confusion: null,
        },

        baseModel: {
          input_used: null,
          prediction: null,
        },

        alleleInput: {
          ABETA: null,
          TAU: null,
          MMSE: null,
          APVOLUME: null,
          GENOTYPE: null,
        },

        alleleResult: {
          cn_prob: null,
          risk: null,
        },
      },
    }),
}));
