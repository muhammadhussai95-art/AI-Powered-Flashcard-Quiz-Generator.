/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from "react";
import { UploadCloud, Rocket, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Flashcard } from "../types";
import { parseCSV, sampleFlashcards } from "../utils/csvParser";

interface CsvUploaderProps {
  onUpload: (cards: Flashcard[]) => void;
  onLoadSamples: () => void;
  totalCards: number;
}

export default function CsvUploader({ onUpload, onLoadSamples, totalCards }: CsvUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Please upload a file ending with '.csv'.");
      return;
    }
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      try {
        const cards = parseCSV(text);
        if (cards.length === 0) {
          setErrorMsg("Could not parse any flashcards. Make sure the CSV has 'Question' and 'Answer' columns.");
          return;
        }
        onUpload(cards);
      } catch (err) {
        setErrorMsg("Error parsing CSV format. Please verify it is a valid CSV data schema.");
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-500" /> Deck Configuration
        </h2>
        <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-mono font-medium">
          {totalCards} Card{totalCards !== 1 ? "s" : ""}
        </span>
      </div>

      <div
        id="react-dropzone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20"
            : "border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-800 bg-slate-50 dark:bg-slate-950/20"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={onFileInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center space-y-2">
          <div className="p-2.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Drag & Drop your CSV file here
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              or click to browse local files
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3">
        <span className="font-semibold font-mono">CSV format:</span>
        <span>"Question", "Answer" (Optional columns: tag, explanation)</span>
      </div>

      <button
        onClick={onLoadSamples}
        id="demoPreloadBtn"
        className="w-full py-2 px-4 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-xl transition duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
      >
        <Rocket className="w-3.5 h-3.5" />
        Load Starter Sample Data (5 Cards)
      </button>
    </div>
  );
}
