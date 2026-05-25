/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Sun, 
  Moon, 
  Download, 
  BookOpen, 
  Award, 
  Dna,
  Shuffle,
  FileSpreadsheet,
  Layers,
  Flame,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Settings,
  History,
  FileText
} from "lucide-react";
import CsvUploader from "./components/CsvUploader";
import AIGenerator from "./components/AIGenerator";
import FlashcardViewer from "./components/FlashcardViewer";
import QuizViewer from "./components/QuizViewer";
import { Flashcard } from "./types";
import { sampleFlashcards } from "./utils/csvParser";
import { generateSingleFileHtml } from "./utils/exporter";

export default function App() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeMode, setActiveMode] = useState<"study" | "quiz">("study");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<"deck" | "settings">("settings");
  
  // Real session stats
  const [viewedCardIds, setViewedCardIds] = useState<Set<string>>(new Set());
  const [quizStats, setQuizStats] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [recentUploads, setRecentUploads] = useState<{ id: string; name: string; count: number; date: string }[]>([]);

  // Apply dark mode selector on outer body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handle deck loading history and initial load
  useEffect(() => {
    const historyRegistry = localStorage.getItem("flashcard_uploads_history");
    if (historyRegistry) {
      try {
        setRecentUploads(JSON.parse(historyRegistry));
      } catch (e) {}
    } else {
      const initial = [
        { id: "h-1", name: "biology_101.csv", count: 12, date: "2 days ago" },
        { id: "h-2", name: "history_midterm.csv", count: 8, date: "5 days ago" }
      ];
      setRecentUploads(initial);
      localStorage.setItem("flashcard_uploads_history", JSON.stringify(initial));
    }
  }, []);

  const addUploadHistory = (name: string, count: number) => {
    const item = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      count,
      date: "Just now"
    };
    setRecentUploads(prev => {
      const filtered = prev.filter(p => p.name !== name).slice(0, 4);
      const next = [item, ...filtered];
      localStorage.setItem("flashcard_uploads_history", JSON.stringify(next));
      return next;
    });
  };

  // Auto add active card to viewed list for Retention metrics
  useEffect(() => {
    if (cards.length > 0 && cards[activeIndex]) {
      setViewedCardIds(prev => {
        const next = new Set(prev);
        next.add(cards[activeIndex].id);
        return next;
      });
    }
  }, [activeIndex, cards]);

  // Handle deck loading
  const handleCardsLoaded = (loadedCards: Flashcard[]) => {
    setCards(loadedCards);
    setActiveIndex(0);
    setActiveMode("study");
    setViewedCardIds(new Set([loadedCards[0]?.id].filter(Boolean)));
    setQuizStats({ correct: 0, total: 0 });
    addUploadHistory("Imported Deck " + (loadedCards[0]?.tag || "Session"), loadedCards.length);
  };

  const loadSampleData = () => {
    setCards(sampleFlashcards);
    setActiveIndex(0);
    setActiveMode("study");
    setViewedCardIds(new Set([sampleFlashcards[0]?.id].filter(Boolean)));
    setQuizStats({ correct: 0, total: 0 });
    addUploadHistory("biology_sample.csv", sampleFlashcards.length);
  };

  const handleShuffle = () => {
    if (cards.length === 0) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setActiveIndex(0);
  };

  const handleAnswerQuiz = (isCorrect: boolean) => {
    setQuizStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  // Compile and download single HTML application package
  const handleDownloadStandalone = () => {
    const htmlContent = generateSingleFileHtml(cards);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai_flashcard_quiz_generator.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Auto switch sidebar tab when card count updates
  useEffect(() => {
    if (cards.length > 0) {
      setSidebarTab("deck");
    } else {
      setSidebarTab("settings");
    }
  }, [cards.length]);

  const retentionPercent = cards.length > 0 ? Math.round((viewedCardIds.size / cards.length) * 100) : 0;
  const accuracyPercent = quizStats.total > 0 ? Math.round((quizStats.correct / quizStats.total) * 100) : 0;

  // Compute smart dynamic recommendation
  const getAIInsightText = () => {
    if (cards.length === 0) {
      return "Your workspace is vacant! Load standard sample schemas or generate with AI prompts to start analytics tracking.";
    }
    const tags = cards.map(c => c.tag).filter(Boolean) as string[];
    if (tags.length === 0) {
      return "Study complete terminology list with 3D flashcards first, then switch to Quiz Mode to test binary retention stats!";
    }
    const freq: Record<string, number> = {};
    tags.forEach(t => freq[t] = (freq[t] || 0) + 1);
    const primary = Object.keys(freq).sort((a,b) => freq[b] - freq[a])[0];
    
    return `We've detected heavy density with the topic "${primary}". Review and study this module thoroughly to reinforce neural pathing.`;
  };

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">
      
      {/* High Density Premium Header Bar */}
      <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100 dark:shadow-none select-none">
            🎓
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-bold tracking-tight leading-none text-slate-950 dark:text-white">
              FlashAI Studio
            </h1>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest leading-none mt-1">
              High Density Study Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={loadSampleData}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 cursor-pointer text-slate-700 dark:text-slate-300 shadow-xs"
            >
              Load Sample
            </button>
            <button
              onClick={handleDownloadStandalone}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-150 text-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
              title="Download Standalone HTML Deck"
            >
              <Download className="w-3 h-3" /> Standalone File
            </button>
          </div>

          <div className="h-6 w-px bg-slate-205 dark:bg-slate-800 hidden sm:block"></div>

          {/* Theme Switcher Toggle button block */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-955 dark:hover:text-white cursor-pointer transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-650" />}
          </button>
        </div>
      </header>

      {/* Main Multi-Pane Content Runway */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Sidebar: Active Deck Navigation & Dashboard Config */}
        <aside className="w-full lg:w-80 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-205 dark:border-slate-800 flex flex-col shrink-0 shadow-xs overflow-hidden">
          
          {/* Tabs header for sidebar density selection */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs shrink-0 select-none">
            <button
              type="button"
              onClick={() => cards.length > 0 && setSidebarTab("deck")}
              disabled={cards.length === 0}
              className={`flex-1 py-3 font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
                cards.length === 0 ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
              } ${
                sidebarTab === "deck"
                  ? "border-b-2 border-indigo-600 text-indigo-650 dark:text-indigo-400 bg-slate-50/40 dark:bg-slate-900/40"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Active Deck ({cards.length})
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab("settings")}
              className={`flex-1 py-3 font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                sidebarTab === "settings"
                  ? "border-b-2 border-indigo-600 text-indigo-650 dark:text-indigo-400 bg-slate-50/40 dark:bg-slate-900/40"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Generator Workspace
            </button>
          </div>

          {/* Active Deck Tab Content view */}
          {sidebarTab === "deck" && cards.length > 0 ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-widest font-mono">
                    Study Deck List
                  </span>
                  <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold rounded-md uppercase font-mono">
                    NAVIGATIONAL
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                  {cards[0].tag || "General Terminology"} Deck
                </h2>
              </div>

              {/* Scrollable grid representation of cards */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 bg-slate-50/20 dark:bg-slate-955/10">
                {cards.map((card, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <div
                      key={card.id || idx}
                      onClick={() => {
                        setActiveIndex(idx);
                        setActiveMode("study");
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                        isActive
                          ? "bg-white dark:bg-slate-900 border-indigo-250 dark:border-indigo-800/80 border-l-4 border-l-indigo-600 shadow-sm"
                          : "bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 text-[9px] font-mono leading-none font-bold">
                        <span className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-550"}>
                          CARD {String(idx + 1).padStart(2, "0")}
                        </span>
                        {card.tag && (
                          <span className="text-slate-400 dark:text-slate-550 max-w-[100px] truncate uppercase">
                            #{card.tag}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-snug line-clamp-2 transition-colors ${
                        isActive 
                          ? "text-slate-900 dark:text-white font-semibold" 
                          : "text-slate-600 dark:text-slate-400 group-hover:text-slate-850 dark:group-hover:text-slate-200"
                      }`}>
                        {card.question}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Goal tracker progress on left container footer */}
              <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 select-none">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> Session Cards Viewed
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {viewedCardIds.size} / {cards.length}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${cards.length > 0 ? (viewedCardIds.size / cards.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            // Settings and generator workspace forms
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="p-1 px-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl space-y-1">
                <h3 className="text-xs font-bold text-indigo-750 dark:text-indigo-400 flex items-center gap-1 font-mono uppercase tracking-wider">
                  <BrainCircuit className="w-3.5 h-3.5" /> Workspace Config
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-normal">
                  Drop a vocabulary glossary sheet, load sample lists, or invoke state-of-the-art AI synthesis to build dynamic cards.
                </p>
              </div>

              <CsvUploader 
                onUpload={handleCardsLoaded}
                onLoadSamples={loadSampleData}
                totalCards={cards.length}
              />

              <AIGenerator 
                onGenerated={handleCardsLoaded}
              />
            </div>
          )}
        </aside>

        {/* Center Canvas Area: Mode Select and Central View Stage */}
        <div className="flex-1 flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/30 relative">
          
          {/* Mode switch navigation pills */}
          <div className="flex justify-center select-none shrink-0">
            <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex shadow-sm gap-1.5">
              <button
                onClick={() => cards.length > 0 && setActiveMode("study")}
                disabled={cards.length === 0}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  cards.length === 0
                    ? "opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600"
                    : activeMode === "study"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Flashcards
              </button>
              <button
                onClick={() => cards.length > 0 && setActiveMode("quiz")}
                disabled={cards.length === 0}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  cards.length === 0
                    ? "opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600"
                    : activeMode === "quiz"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Quiz Mode
              </button>
            </div>
          </div>

          {/* Active Mode Render Runway */}
          <div className="flex-1 flex items-center justify-center">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 max-w-sm text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-[2.5rem] shadow-xl space-y-4 my-auto py-12">
                <div className="p-4.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 animate-pulse">
                  <GraduationCap className="w-10 h-10 text-indigo-505 dark:text-indigo-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Study Center Empty
                  </h3>
                  <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed max-w-xs">
                    Get started by choosing a generation workspace flow on the left sidebar to compile instant flashcards!
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={loadSampleData}
                    className="px-4.5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition cursor-pointer"
                  >
                    🚀 Load Starter Sample Card Deck
                  </button>
                </div>
              </div>
            ) : activeMode === "study" ? (
              <FlashcardViewer 
                cards={cards} 
                onShuffle={handleShuffle} 
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
              />
            ) : (
              <QuizViewer 
                cards={cards} 
                onReviewCards={() => setActiveMode("study")}
                onAnswerQuiz={handleAnswerQuiz}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar: Session Analytics & Dynamic Recommendations */}
        <aside className="w-full lg:w-72 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 shrink-0 shadow-sm overflow-y-auto">
          
          {/* Section: Session Analytics progress rate tracking */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
              Session Analytics
            </h3>
            
            <div className="space-y-4 border-l border-slate-100 dark:border-slate-800 pl-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider">
                  <span>RETENTION</span>
                  <span>{retentionPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-400 rounded-full transition-all duration-300"
                    style={{ width: `${retentionPercent}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                  {viewedCardIds.size} of {cards.length} distinct terms
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider">
                  <span>QUIZ ACCURACY</span>
                  <span>{accuracyPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${accuracyPercent}%` }}
                  ></div>
                </div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                  {quizStats.correct} Correct responses
                </span>
              </div>
            </div>
          </section>

          {/* Section: Immersive AI insights mockup card */}
          <section className="bg-slate-900 rounded-2xl p-4.5 text-white overflow-hidden relative select-none border border-slate-850 shadow-md">
            <div className="relative z-10 space-y-1.5">
              <div className="text-[9px] font-bold font-mono tracking-widest text-indigo-400 uppercase flex items-center gap-1 leading-none">
                <BrainCircuit className="w-3.5 h-3.5" /> AI Feedback Insight
              </div>
              <p className="text-xs leading-relaxed font-normal text-slate-200">
                {getAIInsightText()}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-15 blur-xl w-24 h-24 bg-indigo-505 rounded-full"></div>
          </section>

          {/* Section: Recent Deck Upload history tracking */}
          <section className="mt-auto space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black text-slate-800 dark:text-slate-350 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <History className="w-3.5 h-3.5 text-indigo-500" /> Recent Imports
              </h3>
            </div>
            
            <div className="space-y-1.5 select-none">
              {recentUploads.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center gap-2.5 p-2 hover:bg-slate-50 dark:hover:bg-slate-850/60 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800/50"
                >
                  <div className="w-7 h-7 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold uppercase shrink-0">
                    CSV
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 leading-none">
                    <span className="text-[11px] font-bold text-slate-705 dark:text-slate-300 truncate">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1">
                      {item.count} Cards • {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

      </main>
    </div>
  );
}
