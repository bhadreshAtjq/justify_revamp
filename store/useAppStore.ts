import { create } from "zustand";
import type { AnchorResponse, OCRResponse, VerifyResponse } from "@/services/api";

export interface ActivityLogEntry {
  id: string;
  type: "csv_uploaded" | "hashes_generated" | "root_generated" | "anchored" | "ocr_complete" | "verified" | "quality_validated" | "bulk_ocr_started" | "bulk_ocr_finished" | "bulk_ocr_error" | "anchoring_started" | "anchor_error";
  message: string;
  timestamp: Date;
}

export interface HashEntry {
  hash: string;
  registrationNo: string;
  index: number;
}

export interface HashConfig {
  includeName: boolean;
  includeRegNo: boolean;
  includeGPA: boolean;
  includeSubjects: boolean;
}

interface AppState {
  // Dashboard state
  uploadType: "marksheet" | "certificate" | "transcript";
  csvFile: File | null;
  csvHeaders: string[];
  csvRecords: Record<string, string>[];
  hashes: HashEntry[];
  merkleRoot: string;
  merkleLeaves: string[];
  anchorResult: AnchorResponse | null;
  university: string;
  year: string;
  hashConfig: HashConfig;

  // Verify state
  verifyFile: File | null;
  ocrResult: OCRResponse | null;
  qualityResult: any | null;
  verifyHash: string;
  verifyResult: VerifyResponse | null;

  // Loading states
  isParsingCSV: boolean;
  isGeneratingHashes: boolean;
  isGeneratingMerkle: boolean;
  isAnchoring: boolean;
  isValidatingQuality: boolean;
  isProcessingOCR: boolean;
  isVerifying: boolean;
  isSyncing: boolean;

  // Error states
  error: string | null;

  // Activity log
  activityLog: ActivityLogEntry[];

  // Settings
  developerMode: boolean;

  // Actions
  setUploadType: (type: "marksheet" | "certificate" | "transcript") => void;
  setCSVFile: (file: File | null) => void;
  setCSVData: (headers: string[], records: Record<string, string>[]) => void;
  setHashes: (hashes: HashEntry[]) => void;
  setMerkleData: (root: string, leaves: string[]) => void;
  setHashesFromRecords: (hashes: HashEntry[]) => void;
  setAnchorResult: (result: AnchorResponse | null) => void;
  setUniversity: (university: string) => void;
  setYear: (year: string) => void;
  updateHashConfig: (config: Partial<HashConfig>) => void;
  setVerifyFile: (file: File | null) => void;
  setOCRResult: (result: OCRResponse | null) => void;
  setQualityResult: (result: any | null) => void;
  setVerifyHash: (hash: string) => void;
  setVerifyResult: (result: VerifyResponse | null) => void;
  setLoading: (key: string, value: boolean) => void;
  setError: (error: string | null) => void;
  addActivityLog: (type: ActivityLogEntry["type"], message: string) => void;
  setDeveloperMode: (mode: boolean) => void;
  resetDashboard: () => void;
  resetVerify: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Dashboard state
  uploadType: "marksheet",
  csvFile: null,
  csvHeaders: [],
  csvRecords: [],
  hashes: [],
  merkleRoot: "",
  merkleLeaves: [],
  anchorResult: null,
  university: "",
  year: new Date().getFullYear().toString(),
  hashConfig: {
    includeName: true,
    includeRegNo: true,
    includeGPA: true,
    includeSubjects: false,
  },

  // Verify state
  verifyFile: null,
  ocrResult: null,
  qualityResult: null,
  verifyHash: "",
  verifyResult: null,

  // Loading states
  isParsingCSV: false,
  isGeneratingHashes: false,
  isGeneratingMerkle: false,
  isAnchoring: false,
  isValidatingQuality: false,
  isProcessingOCR: false,
  isVerifying: false,
  isSyncing: false,

  // Error
  error: null,

  // Activity log
  activityLog: [],

  // Settings
  developerMode: false,

  // Actions
  setUploadType: (type) => set({ uploadType: type }),
  setCSVFile: (file) => set({ csvFile: file }),

  setCSVData: (headers, records) =>
    set({ csvHeaders: headers, csvRecords: records }),

  setHashes: (hashes) => set({ hashes }),
  
  setHashesFromRecords: (hashes) => set({ hashes }),

  setMerkleData: (root, leaves) =>
    set({ merkleRoot: root, merkleLeaves: leaves }),

  setAnchorResult: (result) => set({ anchorResult: result }),

  setUniversity: (university) => set({ university }),

  setYear: (year) => set({ year }),
  updateHashConfig: (config) => set((state) => ({ 
    hashConfig: { ...state.hashConfig, ...config } 
  })),

  setVerifyFile: (file) => set({ verifyFile: file }),

  setOCRResult: (result) => set({ ocrResult: result }),

  setQualityResult: (result) => set({ qualityResult: result }),

  setVerifyHash: (hash) => set({ verifyHash: hash }),

  setVerifyResult: (result) => set({ verifyResult: result }),

  setLoading: (key, value) =>
    set((state) => ({ ...state, [key]: value })),

  setError: (error) => set({ error }),

  addActivityLog: (type, message) =>
    set((state) => ({
      activityLog: [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type,
          message,
          timestamp: new Date(),
        },
        ...state.activityLog,
      ],
    })),

  setDeveloperMode: (mode) => set({ developerMode: mode }),

  resetDashboard: () =>
    set({
      csvFile: null,
      csvHeaders: [],
      csvRecords: [],
      hashes: [],
      merkleRoot: "",
      merkleLeaves: [],
      anchorResult: null,
      error: null,
    }),

  resetVerify: () =>
    set({
      verifyFile: null,
      ocrResult: null,
      qualityResult: null,
      verifyHash: "",
      verifyResult: null,
      error: null,
    }),
}));
