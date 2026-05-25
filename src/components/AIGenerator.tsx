/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Flashcard } from "../types";

interface AIGeneratorProps {
  onGenerated: (newCards: Flashcard[]) => void;
}

export default function AIGenerator({ onGenerated }: AIGeneratorProps) {
  const [useNotes, setUseNotes] = useState(false);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = useNotes ? notes.trim() : topic.trim();
    if (!query) {
      setErrorMsg(useNotes ? "Please enter your notes text." : "Please enter a study topic.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: useNotes ? undefined : topic,
          notes: useNotes ? notes : undefined,
          count,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Generation endpoint communication failed.");
      }

      const data = await response.json();
      if (data.cards && data.cards.length > 0) {
        // Map random short ids
        const enriched: Flashcard[] = data.cards.map((c: any) => ({
          id: Math.random().toString(36).substring(2, 9),
          question: c.question,
          answer: c.answer,
          explanation: c.explanation || "",
          tag: c.tag || (useNotes ? "Notes AI" : topic.slice(0, 15)),
        }));
        onGenerated(enriched);
        setTopic("");
        setNotes("");
      } else {
        throw new Error("No flashcards could be parsed from the AI output.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during card generation. Check API configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> AI Workspace Generator
      </h2>

      {/* Tabs list inside local UI */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs">
        <button
          type="button"
          onClick={() => { setUseNotes(false); setErrorMsg(null); }}
          className={`flex-1 pb-2 border-b-2 font-medium transition-all ${
            !useNotes
              ? "border-indigo-600 text-slate-900 dark:text-white"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          Generate by Topic
        </button>
        <button
          type="button"
          onClick={() => { setUseNotes(true); setErrorMsg(null); }}
          className={`flex-1 pb-2 border-b-2 font-medium transition-all ${
            useNotes
              ? "border-indigo-600 text-slate-900 dark:text-white"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          Generate from Notes
        </button>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        {!useNotes ? (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Study Topic Name
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Photosynthesis vs Respiration, Roman Emperors..."
              disabled={loading}
              className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Paste Copybook Text/Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste custom study notes, study guides, outlines or textbook sections..."
              rows={3}
              disabled={loading}
              className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 resize-y"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 dark:text-slate-500">
              Batch size
            </span>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              disabled={loading}
              className="text-xs px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-md bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {[5, 8, 10, 15, 20].map((v) => (
                <option key={v} value={v}>
                  {v} Cards
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md hover:shadow-indigo-500/10 cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-75"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate AI Cards
              </>
            )}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/50">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
