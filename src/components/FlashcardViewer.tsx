/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Shuffle, Eye, HelpCircle } from "lucide-react";
import { Flashcard } from "../types";

interface FlashcardViewerProps {
  cards: Flashcard[];
  onShuffle: () => void;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function FlashcardViewer({ cards, onShuffle, activeIndex, setActiveIndex }: FlashcardViewerProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Flip back to front whenever card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [activeIndex, cards.length]);

  // Handle arrow keys and space navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cards.length === 0) return;
      if (e.key === "ArrowRight") {
        nextCard();
      } else if (e.key === "ArrowLeft") {
        prevCard();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, cards.length]);

  if (cards.length === 0) return null;

  const activeCard = (cards[activeIndex] || cards[0] || { id: "", question: "", answer: "", tag: "", explanation: "" }) as Flashcard;

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="space-y-6 w-full">
      {/* 3D perspective wrapper click triggers flips */}
      <div 
        className="relative w-full min-h-[300px] md:min-h-[350px] cursor-pointer group"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-full min-h-[300px] md:min-h-[350px] transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl shadow-slate-100 dark:shadow-none"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/40">
                {activeCard.tag || "Core Topic"}
              </span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-mono flex items-center gap-1 font-semibold">
                <Eye className="w-3.5 h-3.5 text-indigo-500" /> CLICK TO FLIP
              </span>
            </div>

            <div className="my-auto py-4 text-center">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-slate-800 dark:text-white leading-normal max-w-2xl mx-auto">
                {activeCard.question}
              </h3>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/85 pt-4">
              <span className="text-[10px] font-mono tracking-wider font-semibold text-indigo-500 uppercase flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Question Side
              </span>
              <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                Card {activeIndex + 1} of {cards.length}
              </span>
            </div>
          </div>

          {/* Back Side (Answers & Explanations) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-indigo-100/10 dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-200/40 dark:border-indigo-900/40 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xl rotate-y-180"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50">
                {activeCard.tag || "Revealed"}
              </span>
              <span className="text-[10px] text-indigo-650 dark:text-indigo-400 font-mono font-bold uppercase tracking-wider">
                💡 Answer Revealed
              </span>
            </div>

            <div className="my-auto py-3 text-center space-y-4 max-w-2xl mx-auto">
              <h4 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                {activeCard.answer}
              </h4>
              {activeCard.explanation && (
                <p className="text-xs md:text-sm text-slate-550 dark:text-slate-400 leading-relaxed max-w-lg mx-auto border-t border-indigo-100/30 dark:border-indigo-900/30 pt-3">
                  {activeCard.explanation}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-indigo-100/30 dark:border-indigo-900/30 pt-4">
              <span className="text-[10px] font-mono tracking-wider font-semibold text-indigo-500 uppercase">
                Back Answer Side
              </span>
              <span className="text-xs font-mono font-medium text-indigo-400">
                Card {activeIndex + 1} of {cards.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Controls row */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <button
          onClick={(e) => { e.stopPropagation(); prevCard(); }}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all duration-150 active:scale-95 flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onShuffle(); }}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition duration-150 cursor-pointer"
          title="Shuffle Deck"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); nextCard(); }}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all duration-150 active:scale-95 flex items-center gap-1.5"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pro keyboard key helper indicator */}
      <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono select-none">
        Pro-Tip: Navigate using <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">←</kbd> and <kbd className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">→</kbd>, press <kbd className="px-3 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">Space</kbd> to flip!
      </p>
    </div>
  );
}
