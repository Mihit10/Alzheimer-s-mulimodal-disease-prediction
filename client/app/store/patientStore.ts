// app/store/patientStore.ts
"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

/* ----------------------------------------------------------
   INTERFACES
---------------------------------------------------------- */

export interface Demographics {
  name: string | null;
  age: number | null;
  gender: number | null; // 0=Male, 1=Female

  ethnicity: number | null; // 0=Caucasian,1=African American,2=Asian,3=Other
  educationLevel: number | null; // 0=None,1=High School,2=Bachelor's,3=Higher

  height: number | null;
  weight: number | null;
  bmi: number | null;

  smoking: number | null; // 0/1
  alcoholConsumption: number | null; // 0–20
  physicalActivity: number | null; // 0–10
  dietQuality: number | null; // 0–10
  sleepQuality: number | null; // 4–10

  familyHistoryAlzheimers: number | null; // 0/1

  doctorInCharge: string | null; // For completeness ("XXXConfid")
}

export interface Medical {
  cardiovascularDisease: number | null;
  diabetes: number | null;
  depression: number | null;
  headInjury: number | null;
  hypertension: number | null;

  // Clinical Measurements
  systolicBP: number | null;
  diastolicBP: number | null;
  cholesterolTotal: number | null;
  cholesterolLDL: number | null;
  cholesterolHDL: number | null;
  cholesterolTriglycerides: number | null;
}

export interface Cognitive {
  mmse: number | null;
  functionalAssessment: number | null;
  adl: number | null;

  memoryComplaints: number | null;
  behavioralProblems: number | null;
  confusion: number | null;

  disorientation: number | null;
  personalityChanges: number | null;
  difficultyCompletingTasks: number | null;
  forgetfulness: number | null;
}

export interface AlleleInput {
  ABETA: number | null;
  TAU: number | null;
  MMSE: number | null;
  APVOLUME: number | null;
  GENOTYPE: string | null;
}

export interface PatientSession {
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

interface StoreState {
  session: PatientSession;

  updateDemographics: (data: Partial<Demographics>) => void;
  updateMedical: (data: Partial<Medical>) => void;
  updateCognitive: (data: Partial<Cognitive>) => void;
  updateUploads: (data: Partial<PatientSession["uploads"]>) => void;

  setAlleleInput: (data: Partial<AlleleInput>) => void;
  setAlleleResult: (res: { cn_prob: number | null; risk: string | null }) => void;

  setMRIResult: (res: any) => void;
  setOCRResult: (res: any) => void;

  setBaseModelResult: (input: any, prediction: string) => void;

  resetSession: () => void;
}

/* ----------------------------------------------------------
   DEFAULT SESSION OBJECT
---------------------------------------------------------- */

const defaultCognitive: Cognitive = {
  mmse: null,
  functionalAssessment: null,
  adl: null,

  memoryComplaints: null,
  behavioralProblems: null,
  confusion: null,

  disorientation: null,
  personalityChanges: null,
  difficultyCompletingTasks: null,
  forgetfulness: null,
};

const defaultDemographics: Demographics = {
  name: null,
  age: null,
  gender: null,
  ethnicity: null,
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
  doctorInCharge: "XXXConfid",
};

const defaultMedical: Medical = {
  cardiovascularDisease: null,
  diabetes: null,
  depression: null,
  headInjury: null,
  hypertension: null,

  systolicBP: null,
  diastolicBP: null,
  cholesterolTotal: null,
  cholesterolLDL: null,
  cholesterolHDL: null,
  cholesterolTriglycerides: null,
};

const defaultAllele: AlleleInput = {
  ABETA: null,
  TAU: null,
  MMSE: null,
  APVOLUME: null,
  GENOTYPE: null,
};

/* ----------------------------------------------------------
   ZUSTAND STORE
---------------------------------------------------------- */

export const usePatientStore = create<StoreState>((set) => ({
  session: {
    id: nanoid(),
    timestamp: new Date().toISOString(),

    demographics: { ...defaultDemographics },
    medical: { ...defaultMedical },
    cognitive: { ...defaultCognitive },
    alleleInput: { ...defaultAllele },

    uploads: {
      mriFile: null,
      reportFile: null,
      mriResult: null,
      ocrResult: null,
    },

    baseModel: {
      input_used: null,
      prediction: null,
    },

    alleleResult: {
      cn_prob: null,
      risk: null,
    },
  },

  /* ------------------ UPDATE DEMOGRAPHICS ------------------ */
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

  /* ------------------ UPDATE MEDICAL ------------------ */
  updateMedical: (data: Partial<Medical>) =>
    set((state) => ({
      session: {
        ...state.session,
        medical: { ...state.session.medical, ...data },
      },
    })),

  /* ------------------ UPDATE COGNITIVE ------------------ */
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

  setAlleleResult: (res) =>
    set((state) => ({
      session: {
        ...state.session,
        alleleResult: res,
      },
    })),

  /* ------------------ BASE MODEL ------------------ */
  setBaseModelResult: (input, prediction) =>
    set((state) => ({
      session: {
        ...state.session,
        baseModel: { input_used: input, prediction },
      },
    })),

  /* ------------------ RESET EVERYTHING ------------------ */
  resetSession: () =>
    set({
      session: {
        id: nanoid(),
        timestamp: new Date().toISOString(),
        demographics: { ...defaultDemographics },
        medical: { ...defaultMedical },
        cognitive: { ...defaultCognitive },
        uploads: {
          mriFile: null,
          reportFile: null,
          mriResult: null,
          ocrResult: null,
        },
        baseModel: { input_used: null, prediction: null },
        alleleInput: { ...defaultAllele },
        alleleResult: { cn_prob: null, risk: null },
      },
    }),
}));
