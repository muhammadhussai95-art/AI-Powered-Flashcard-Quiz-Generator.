/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Award, Info, RefreshCw, CheckCircle2, XCircle, ArrowRight, BookOpen } from "lucide-react";
import { Flashcard } from "../types";
import { generateOptionsForCard } from "../utils/csvParser";

interface QuizViewerProps {
  cards: Flashcard[];
  onReviewCards: () => void;
  onAnswerQuiz?: (isCorrect: boolean) => void;
}

export default function QuizViewer({ cards, onReviewCards, onAnswerQuiz }: QuizViewerProps) {
  const [randomizedCards, setRandomizedCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Initialize and shuffle questions upon mount
  const startQuiz = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setRandomizedCards(shuffled);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setCompleted(false);

    if (shuffled.length > 0) {
      const generated = generateOptionsForCard(shuffled[0], cards);
      setOptions(generated);
    }
  };

  useEffect(() => {
    startQuiz();
  }, [cards]);

  if (randomizedCards.length === 0) return null;

  const currentQuestion = randomizedCards[currentIdx];

  const handleSelectOption = (opt: string) => {
    if (isSubmitted) return;
    setSelectedOption(opt);
    setIsSubmitted(true);
    
    const isCorrect = opt.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    if (onAnswerQuiz) {
      onAnswerQuiz(isCorrect);
    }
  };

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < randomizedCards.length) {
      setCurrentIdx(nextIdx);
      setSelectedOption(null);
      setIsSubmitted(false);
      // Generate options for the next card
      const generated = generateOptionsForCard(randomizedCards[nextIdx], cards);
      setOptions(generated);
    } else {
      setCompleted(true);
    }
  };

  const progressPercent = Math.round((currentIdx / randomizedCards.length) * 100);
  const scorePercent = randomizedCards.length > 0 ? Math.round((score / randomizedCards.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Quiz Progress header bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider">
              Quiz Setup
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              Question {currentIdx + 1} of {randomizedCards.length}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
            Score: {score} / {isSubmitted ? currentIdx + 1 : currentIdx}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${completed ? 100 : progressPercent}%` }}
          ></div>
        </div>
      </div>

      {!completed ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="inline-flex px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-slate-150 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono tracking-wider">
              {currentQuestion.tag || "Biology"}
            </span>
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((opt, index) => {
              const isCorrectTarget = opt.toLowerCase().trim() === currentQuestion.answer.toLowerCase().trim();
              const isSelectedTarget = opt === selectedOption;

              let buttonStyle = "border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200";
              let markerStyle = "border-slate-300 dark:border-slate-700";
              let icon = null;

              if (isSubmitted) {
                if (isCorrectTarget) {
                  buttonStyle = "border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/20 text-green-800 dark:text-green-300";
                  markerStyle = "bg-green-100 dark:bg-green-900 text-green-600";
                  icon = <CheckCircle2 className="w-4 h-4" />;
                } else if (isSelectedTarget) {
                  buttonStyle = "border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 text-red-800 dark:text-red-300";
                  markerStyle = "bg-red-100 dark:bg-red-900 text-red-600";
                  icon = <XCircle className="w-4 h-4" />;
                } else {
                  buttonStyle = "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-xl border text-xs md:text-sm font-medium transition-all flex items-center justify-between ${
                    !isSubmitted ? "active:scale-[0.98] cursor-pointer" : ""
                  } ${buttonStyle}`}
                >
                  <span className="pr-4">{opt}</span>
                  <div className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center ${markerStyle}`}>
                    {icon}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation revealed post answer */}
          {isSubmitted && currentQuestion.explanation && (
            <div className="p-4 rounded-xl border border-indigo-50 bg-indigo-50/10 dark:border-indigo-900/40 dark:bg-slate-900/50 space-y-1.5 animate-fade-in">
              <h4 className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Context & Rationale
              </h4>
              <p className="text-xs md:text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-normal">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {isSubmitted && (
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-150 dark:text-slate-900 text-xs font-semibold rounded-xl tracking-tight transition shadow cursor-pointer inline-flex items-center gap-1.5"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg space-y-6">
          <div className="flex justify-center">
            <div className="p-5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="relative flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-850"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-indigo-600 transition-all duration-500"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - (scorePercent / 100) * (2 * Math.PI * 40)}
                  />
                </svg>
                <div className="absolute text-xl font-bold font-mono text-slate-850 dark:text-slate-100">
                  {scorePercent}%
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-indigo-500" /> Quiz Completed!
            </h3>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
              {scorePercent >= 85
                ? "Excellent mastery! You display deep retention of these terminology schemas."
                : scorePercent >= 60
                ? "Praiseable performance! Flipping standard deck flashcards a few times can secure the remaining concepts."
                : "A wonderful opportunity to learn! Keep repeating the flashcards to build robust neural networks."}
            </p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2 font-mono">
              Total Score: {score} out of {randomizedCards.length} corrects
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <button
              onClick={startQuiz}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restart Quiz
            </button>
            <button
              onClick={onReviewCards}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" /> Review Cards
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
