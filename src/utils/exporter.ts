/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flashcard } from "../types";

export function generateSingleFileHtml(cards: Flashcard[]): string {
  const embeddedData = JSON.stringify(cards, null, 2);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Flashcard & Quiz Generator</title>
    <!-- Tailwind CSS Play CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Inter & JetBrains Mono Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
      body {
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
      }
      .font-mono {
        font-family: 'JetBrains Mono', monospace;
      }
      /* Interactive Card Flip Custom Styles */
      .perspective-1000 {
        perspective: 1000px;
      }
      .backface-hidden {
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
      }
      .rotate-y-180 {
        transform: rotateY(180deg);
      }
      .transform-style-3d {
        transform-style: preserve-3d;
      }
    </style>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              slate: {
                950: '#0b0f19'
              }
            }
          }
        }
      }
    </script>
  </head>
  <body class="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-300">
    <div id="app" class="max-w-5xl mx-auto px-4 py-8">
      
      <!-- Top header bar -->
      <header class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div>
          <span class="text-xs font-mono tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Self-Contained Exported App</span>
          <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">AI Flashcard & Quiz Generator</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Study smarter with interactive cards and custom MCQ quizzes.</p>
        </div>
        <button id="themeToggleBtn" onclick="toggleDarkMode()" class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer" title="Switch Theme">
          <i data-lucide="moon" class="w-5 h-5 dark:hidden"></i>
          <i data-lucide="sun" class="w-5 h-5 hidden dark:block"></i>
        </button>
      </header>

      <!-- Main Columns Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Sidebar / Source Upload Control Block -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 class="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
              <i data-lucide="database" class="w-5 h-5 text-indigo-500"></i> Code Deck Source
            </h2>
            
            <!-- File Drag and Drop Zone -->
            <div 
              id="dropzone"
              class="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-900/50 transition-all"
            >
              <input type="file" id="csvFileInput" accept=".csv" class="hidden" onchange="handleFileChange(event)">
              <div onclick="document.getElementById('csvFileInput').click()" class="space-y-3">
                <div class="inline-flex p-3 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <i data-lucide="upload-cloud" class="w-6 h-6"></i>
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-800 dark:text-slate-200">Upload CSV File</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Requires 'Question' & 'Answer' columns</p>
                </div>
              </div>
            </div>

            <div class="relative flex py-4 items-center">
              <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span class="flex-shrink mx-3 text-xs text-slate-400 uppercase font-mono">Demo options</span>
              <div class="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <!-- Preload dataset buttons -->
            <button 
              onclick="loadSampleData()"
              class="w-full py-2.5 px-4 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 transition-all shadow-sm cursor-pointer"
            >
              <i data-lucide="rocket" class="w-4 h-4"></i>
              Load Sample Data
            </button>

            <!-- API Keys Settings for standalone AI usage if desired -->
            <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <button onclick="toggleApiKeyInput()" class="text-xs font-medium text-slate-500 hover:text-indigo-500 flex items-center gap-1 cursor-pointer">
                <i data-lucide="key" class="w-3.5 h-3.5"></i>
                Use custom Gemini key for AI generation?
              </button>
              
              <div id="apiKeySection" class="mt-3 hidden space-y-3">
                <input 
                  type="password" 
                  id="geminiApiKeyInput" 
                  placeholder="Enter your GEMINI_API_KEY" 
                  class="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                <input 
                  type="text" 
                  id="aiTopicInput" 
                  placeholder="Topic (e.g. Roman Empire)" 
                  class="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                <button 
                  onclick="generateAIWithCustomKey()"
                  id="aiGenBtn"
                  class="w-full py-2 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                  Generate Cards with AI
                </button>
              </div>
            </div>
          </div>

          <!-- Active card metadata / stats summary -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 font-mono">Deck Intelligence</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Total Deck Size</p>
                <p id="totalCardsCount" class="text-xl md:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mt-1">0</p>
              </div>
              <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <p class="text-xs text-slate-400 dark:text-slate-500 font-medium font-mono">Current Mode</p>
                <p id="currentModeLabel" class="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-2 font-mono uppercase">None</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Primary Active Area for Interactive Learning -->
        <div class="lg:col-span-8 flex flex-col space-y-6">
          
          <!-- Mode Toggle Tabs -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm inline-flex w-full md:w-fit self-start gap-1">
            <button 
              id="tabStudy" 
              onclick="switchMode('study')"
              class="w-1/2 md:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all inline-flex items-center justify-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <i data-lucide="book-open" class="w-4 h-4"></i>
              Flashcard Mode
            </button>
            <button 
              id="tabQuiz" 
              onclick="switchMode('quiz')"
              class="w-1/2 md:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all inline-flex items-center justify-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <i data-lucide="award" class="w-4 h-4"></i>
              Quiz Mode
            </button>
          </div>

          <!-- Empty State (No flashcards loaded yet) -->
          <div id="emptyState" class="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl min-h-[400px]">
            <div class="p-4 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-4 animate-pulse">
              <i data-lucide="graduation-cap" class="w-12 h-12 text-slate-400 dark:text-slate-500"></i>
            </div>
            <h3 class="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">No Flashcards Loaded</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-2 mx-auto">
              Populate your workspace by uploading a CSV file, or trigger the sample demo data to explore immediately.
            </p>
            <div class="mt-6 flex flex-wrap gap-3 justify-center">
              <button onclick="document.getElementById('csvFileInput').click()" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer">
                Upload CSV
              </button>
              <button onclick="loadSampleData()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer">
                Load Sample Data
              </button>
            </div>
          </div>

          <!-- Flashcard View Board -->
          <div id="flashcardModeContainer" class="hidden space-y-6">
            
            <!-- Cards space-carousel -->
            <div class="perspective-1000 w-full min-h-[300px] md:min-h-[360px]" onclick="flipActiveCard()">
              <div id="flashcardInner" class="w-full h-full min-h-[300px] md:min-h-[360px] transform-style-3d transition-transform duration-500 relative cursor-pointer">
                
                <!-- Front Side of Active Card -->
                <div class="absolute inset-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 rounded-3xl p-8 flex flex-col justify-between backface-hidden shadow-md">
                  <div class="flex items-center justify-between">
                    <span id="cardTagFront" class="inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">TAG</span>
                    <span class="text-xs font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <i data-lucide="eye" class="w-4 h-4"></i> Click card to flip
                    </span>
                  </div>
                  <div class="my-auto py-6">
                    <p id="cardQuestionText" class="text-lg md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug text-center max-w-2xl mx-auto"></p>
                  </div>
                  <div class="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <span class="text-xs font-mono text-indigo-500 font-semibold uppercase">Question Card</span>
                    <span id="cardProgressIndexFront" class="text-xs font-mono font-medium text-slate-400">Card 1 / 5</span>
                  </div>
                </div>

                <!-- Back Side of Active Card -->
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-indigo-100/20 dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-200/50 dark:border-indigo-900/50 rounded-3xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-md">
                  <div class="flex items-center justify-between">
                    <span id="cardTagBack" class="inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/50">TAG</span>
                    <span class="text-xs font-mono text-indigo-500 flex items-center gap-1 font-semibold uppercase">
                      <i data-lucide="sparkles" class="w-4 h-4"></i> Correct Answer Revealed
                    </span>
                  </div>
                  <div class="my-auto py-6 space-y-4 text-center max-w-2xl mx-auto">
                    <div id="cardAnswerText" class="text-xl md:text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400"></div>
                    <div id="explanationBox" class="hidden text-xs md:text-sm text-slate-500 dark:text-slate-400 border-t border-indigo-100 dark:border-indigo-900/50 pt-4 px-4">
                      
                    </div>
                  </div>
                  <div class="flex items-center justify-between border-t border-indigo-100 dark:border-indigo-900/40 pt-4">
                    <span class="text-xs font-mono text-indigo-500 font-semibold uppercase">Back Answer</span>
                    <span id="cardProgressIndexBack" class="text-xs font-mono font-medium text-indigo-400">Card 1 / 5</span>
                  </div>
                </div>

              </div>
            </div>

            <!-- Card Controls -->
            <div class="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
              <button 
                onclick="prevCard()"
                class="px-4 py-2.5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <i data-lucide="chevron-left" class="w-4 h-4"></i> Previous
              </button>
              
              <button 
                onclick="shuffleDeck()"
                class="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                title="Shuffle Deck"
              >
                <i data-lucide="shuffle" class="w-4 h-4"></i>
              </button>

              <button 
                onclick="nextCard()"
                class="px-4 py-2.5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Next <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            </div>
            
            <!-- Quick Keyboard Assist Hint -->
            <p class="text-center text-xs text-slate-400 dark:text-slate-500">
              💡 Keyboard Pro-Tip: You can use <kbd class="px-1.5 py-0.5 rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900">←</kbd> and <kbd class="px-1.5 py-0.5 rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900">→</kbd> arrows to navigate, and <kbd class="px-3 py-0.5 rounded border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900">Space</kbd> to flip!
            </p>
          </div>

          <!-- Quiz Mode Container -->
          <div id="quizModeContainer" class="hidden space-y-6">
            
            <!-- Overall Active Quiz Header -->
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">Quiz Speed-Run</span>
                <span id="quizScoreCount" class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">Score: 0 / 0</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div id="quizProgressBar" class="bg-indigo-600 h-full w-0 transition-all duration-350"></div>
              </div>
            </div>

            <!-- Quiz Play-Card Container -->
            <div id="quizRunningBoard" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              
              <!-- Question Label & Text -->
              <div class="space-y-2">
                <div id="quizActiveTag" class="inline-flex px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-150 dark:bg-slate-800 tracking-wider">TOPIC</div>
                <h3 id="quizQuestionText" class="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-relaxed"></h3>
              </div>

              <!-- Answer Choices List -->
              <div id="quizOptionsList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Programmatically generated buttons -->
              </div>

              <!-- Question Explanatory details (Fades in post submission) -->
              <div id="quizExplanationBox" class="hidden p-5 rounded-xl border border-indigo-50 bg-indigo-50/20 dark:border-indigo-900/40 dark:bg-slate-900/50 space-y-2 animate-fade-in">
                <h4 class="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase flex items-center gap-1">
                  <i data-lucide="info" class="w-3.5 h-3.5"></i> Explanation & Hint
                </h4>
                <p id="quizExplanationText" class="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed"></p>
              </div>

              <!-- Action slide next bar -->
              <div id="quizSubmissionFooter" class="hidden pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button 
                  onclick="nextQuizQuestion()"
                  class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-sm font-semibold rounded-xl tracking-tight transition shadow cursor-pointer inline-flex items-center gap-1"
                >
                  Next Question <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <!-- Quiz Results Report Card -->
            <div id="quizCompletionBoard" class="hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg space-y-6">
              <div class="flex justify-center">
                <div class="p-4 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div class="relative flex items-center justify-center">
                    <!-- Radial Gauge representation -->
                    <svg class="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" class="text-slate-100 dark:text-slate-800" fill="transparent"/>
                      <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" id="svgGaugeCircle" class="text-indigo-600" fill="transparent" stroke-dasharray="251.2" stroke-dashoffset="0"/>
                    </svg>
                    <div class="absolute text-xl font-bold font-mono text-slate-800 dark:text-slate-100" id="gaugeCenterLabel"></div>
                  </div>
                </div>
              </div>

              <div class="space-y-1.5 max-w-md mx-auto">
                <h3 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" id="quizProgressCongrats">Quiz Finished!</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400" id="quizPerformanceFeedback">Congratulations on completing this study session.</p>
              </div>

              <div class="flex flex-wrap gap-4 justify-center">
                <button 
                  onclick="restartQuiz()"
                  class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md cursor-pointer"
                >
                  Try Again
                </button>
                <button 
                  onclick="switchMode('study')"
                  class="px-5 py-2.5 bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Review Flashcards
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>

    <!-- Alert / Toast Popup notifications -->
    <div id="toastNotification" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none">
      <div class="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-850">
        <i data-lucide="info" class="w-4 h-4 text-indigo-400"></i>
        <span id="toastMessage" class="text-xs font-semibold">Message here</span>
      </div>
    </div>

    <!-- Initialization Scripts -->
    <script>
      // Embedded default flashcards
      let activeDeck = ${embeddedData};

      let activeIndex = 0;
      let isCardFlipped = false;
      let activeMode = 'study'; // 'study' | 'quiz'

      // Quiz variables
      let currentQuizIndex = 0;
      let quizScore = 0;
      let isQuizAnswered = false;
      let quizActiveQuestionsList = [];

      window.addEventListener('DOMContentLoaded', () => {
        // Init state
        loadInitialState();
        lucide.createIcons();
      });

      function loadInitialState() {
        if (activeDeck && activeDeck.length > 0) {
          showToast('Preloaded deck containing ' + activeDeck.length + ' cards.');
          document.getElementById('emptyState').classList.add('hidden');
          switchMode(activeMode);
          updateAnalytics();
        } else {
          document.getElementById('emptyState').classList.remove('hidden');
          document.getElementById('flashcardModeContainer').classList.add('hidden');
          document.getElementById('quizModeContainer').classList.add('hidden');
        }
      }

      function showToast(message) {
        const toast = document.getElementById('toastNotification');
        const text = document.getElementById('toastMessage');
        text.innerText = message;
        toast.className = "fixed bottom-6 right-6 z-50 transform translate-y-0 opacity-100 transition-all duration-300 pointer-events-auto";
        setTimeout(() => {
          toast.className = "fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none";
        }, 3000);
      }

      function toggleDarkMode() {
        if (document.documentElement.classList.contains('dark')) {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      }

      function switchMode(mode) {
        if (!activeDeck || activeDeck.length === 0) {
          showToast('Please load active deck data first.');
          return;
        }
        activeMode = mode;
        document.getElementById('currentModeLabel').innerText = mode === 'study' ? 'Study' : 'Quiz';

        const studyTab = document.getElementById('tabStudy');
        const quizTab = document.getElementById('tabQuiz');

        const studyContainer = document.getElementById('flashcardModeContainer');
        const quizContainer = document.getElementById('quizModeContainer');

        if (mode === 'study') {
          studyTab.className = "w-1/2 md:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all inline-flex items-center justify-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white";
          quizTab.className = "w-1/2 md:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all inline-flex items-center justify-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
          
          studyContainer.classList.remove('hidden');
          quizContainer.classList.add('hidden');
          renderActiveCard();
        } else {
          quizTab.className = "w-1/2 md:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all inline-flex items-center justify-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white";
          studyTab.className = "w-1/2 md:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all inline-flex items-center justify-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800";
          
          quizContainer.classList.remove('hidden');
          studyContainer.classList.add('hidden');
          setupQuiz();
        }
      }

      function renderActiveCard() {
        if (!activeDeck || activeDeck.length === 0) return;
        
        // Ensure index holds valid boundaries
        if (activeIndex >= activeDeck.length) activeIndex = 0;
        if (activeIndex < 0) activeIndex = activeDeck.length - 1;

        const card = activeDeck[activeIndex];
        
        // Reset card flipping state transition
        isCardFlipped = false;
        document.getElementById('flashcardInner').style.transform = 'none';

        // Set card contents
        document.getElementById('cardQuestionText').innerText = card.question;
        document.getElementById('cardAnswerText').innerText = card.answer;
        document.getElementById('cardTagFront').innerText = card.tag || 'Study Front';
        document.getElementById('cardTagBack').innerText = card.tag || 'Revealed';
        
        const progressIndexFront = document.getElementById('cardProgressIndexFront');
        const progressIndexBack = document.getElementById('cardProgressIndexBack');
        progressIndexFront.innerText = "Card " + (activeIndex + 1) + " of " + activeDeck.length;
        progressIndexBack.innerText = "Card " + (activeIndex + 1) + " of " + activeDeck.length;

        const explanationBox = document.getElementById('explanationBox');
        if (card.explanation) {
          explanationBox.classList.remove('hidden');
          explanationBox.innerText = card.explanation;
        } else {
          explanationBox.classList.add('hidden');
          explanationBox.innerText = '';
        }
      }

      function flipActiveCard() {
        const inner = document.getElementById('flashcardInner');
        if (isCardFlipped) {
          inner.style.transform = 'none';
        } else {
          inner.style.transform = 'rotateY(180deg)';
        }
        isCardFlipped = !isCardFlipped;
      }

      function nextCard() {
        activeIndex++;
        renderActiveCard();
      }

      function prevCard() {
        activeIndex--;
        renderActiveCard();
      }

      function shuffleDeck() {
        if (!activeDeck || activeDeck.length === 0) return;
        activeDeck.sort(() => Math.random() - 0.5);
        activeIndex = 0;
        renderActiveCard();
        showToast('Deck elements shuffled successfully.');
      }

      // Keyboard Controls
      document.addEventListener('keydown', (e) => {
        if (activeMode === 'study' && activeDeck && activeDeck.length > 0) {
          if (e.key === 'ArrowRight') {
            nextCard();
          } else if (e.key === 'ArrowLeft') {
            prevCard();
          } else if (e.key === ' ') {
            e.preventDefault();
            flipActiveCard();
          }
        }
      });

      // CSV parser logic
      function parseCSVText(text) {
        const lines = [];
        let currentLine = "";
        let insideQuote = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const nextChar = text[i + 1];
          
          if (char === '"') {
            if (insideQuote && nextChar === '"') {
              currentLine += '"';
              i++;
            } else {
              insideQuote = !insideQuote;
            }
          } else if (char === '\\n' || char === '\\r') {
            if (insideQuote) {
              currentLine += char;
            } else {
              if (currentLine.trim()) {
                lines.push(currentLine);
              }
              currentLine = "";
              if (char === '\\r' && nextChar === '\\n') {
                i++;
              }
            }
          } else {
            currentLine += char;
          }
        }
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        
        const result = [];
        let hasHeaders = false;
        if (lines.length > 0) {
          const firstRow = parseCSVRowText(lines[0]);
          const col0 = firstRow[0]?.toLowerCase() || "";
          const col1 = firstRow[1]?.toLowerCase() || "";
          if (col0.includes("question") || col0.includes("term") || col1.includes("answer") || col1.includes("definition")) {
            hasHeaders = true;
          }
        }

        const startIndex = hasHeaders ? 1 : 0;
        for (let i = startIndex; i < lines.length; i++) {
          const row = parseCSVRowText(lines[i]);
          if (row.length >= 2 && row[0].trim() && row[1].trim()) {
            result.push({
              id: Math.random().toString(36).substring(2, 9),
              question: row[0].trim(),
              answer: row[1].trim(),
              tag: row[2]?.trim() || "CSV File",
              explanation: row[3]?.trim() || ""
            });
          }
        }
        return result;
      }

      function parseCSVRowText(rowText) {
        const result = [];
        let currentVal = "";
        let insideQuote = false;
        
        for (let i = 0; i < rowText.length; i++) {
          const char = rowText[i];
          const nextChar = rowText[i + 1];
          
          if (char === '"') {
            if (insideQuote && nextChar === '"') {
              currentVal += '"';
              i++;
            } else {
              insideQuote = !insideQuote;
            }
          } else if (char === ',') {
            if (insideQuote) {
              currentVal += char;
            } else {
              result.push(currentVal);
              currentVal = "";
            }
          } else {
            currentVal += char;
          }
        }
        result.push(currentVal);
        return result;
      }

      function handleFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
          const content = e.target.result;
          try {
            const parsed = parseCSVText(content);
            if (parsed.length === 0) {
              showToast("No valid flashcards parsed. Check headers or column spacing.");
              return;
            }
            activeDeck = parsed;
            activeIndex = 0;
            document.getElementById('emptyState').classList.add('hidden');
            switchMode('study');
            updateAnalytics();
            showToast("Successfully uploaded and processed " + parsed.length + " card(s)!");
          } catch(err) {
            showToast("Critical error compiling CSV file format.");
          }
        };
        reader.readAsText(file);
      }

      // Drag and Drop listeners
      const dropzone = document.getElementById('dropzone');
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-indigo-500', 'bg-indigo-50/10');
      });
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/10');
      });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-indigo-500', 'bg-indigo-50/10');
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
          const input = document.getElementById('csvFileInput');
          input.files = e.dataTransfer.files;
          handleFileChange({ target: { files: e.dataTransfer.files } });
        } else {
          showToast("Unsupported file. Please upload a structured .csv schema.");
        }
      });

      function loadSampleData() {
        const samples = [
          {
            id: "sample-1",
            question: "What is the primary site of photosynthesis in eukaryotic plant cells?",
            answer: "Chloroplast",
            tag: "Biology",
            explanation: "Chloroplasts contain chlorophyll molecules, which absorb light energy to drive the synthesis of glucose from CO₂ and H₂O."
          },
          {
            id: "sample-2",
            question: "Which gas law states that, at constant temperature, the volume of a gas is inversely proportional to its pressure?",
            answer: "Boyle's Law",
            tag: "Physics",
            explanation: "Formulated by Robert Boyle in 1662. Expressed as P₁V₁ = P₂V₂, meaning as pressure increases, volume decreases."
          },
          {
            id: "sample-3",
            question: "What is the worst-case time complexity of searching a sorted array using Binary Search?",
            answer: "O(log n)",
            tag: "Computer Sci",
            explanation: "Binary search repeatedly divides the search interval in half. Even in the worst case, searching takes log₂n steps."
          },
          {
            id: "sample-4",
            question: "Which landmark diplomatic pact officially concluded the American Revolutionary War in 1783?",
            answer: "Treaty of Paris",
            tag: "History",
            explanation: "Signed by American commissioners and British representatives, recognizing United States sovereignty and establishing boundaries."
          },
          {
            id: "sample-5",
            question: "What is the coding term for a function that calls itself to break down a problem into smaller instances?",
            answer: "Recursion",
            tag: "Coding",
            explanation: "Recursion runs until a 'base case' is reached. Without a proper base case, recursion results in stack overflow errors."
          }
        ];
        activeDeck = samples;
        activeIndex = 0;
        document.getElementById('emptyState').classList.add('hidden');
        switchMode('study');
        updateAnalytics();
        showToast("Loaded 5 Educational Starter flashcards!");
      }

      function updateAnalytics() {
        document.getElementById('totalCardsCount').innerText = activeDeck.length;
      }

      // Quiz state generator
      function setupQuiz() {
        if (!activeDeck || activeDeck.length === 0) return;
        
        currentQuizIndex = 0;
        quizScore = 0;
        isQuizAnswered = false;
        
        // Assemble randomized lists
        quizActiveQuestionsList = [...activeDeck].sort(() => Math.random() - 0.5);
        
        document.getElementById('quizRunningBoard').classList.remove('hidden');
        document.getElementById('quizCompletionBoard').classList.add('hidden');
        
        renderQuizQuestion();
      }

      function renderQuizQuestion() {
        const card = quizActiveQuestionsList[currentQuizIndex];
        isQuizAnswered = false;

        document.getElementById('quizActiveTag').innerText = card.tag || 'Quiz';
        document.getElementById('quizQuestionText').innerText = card.question;
        document.getElementById('quizExplanationBox').classList.add('hidden');
        document.getElementById('quizSubmissionFooter').classList.add('hidden');

        // Update indicators
        document.getElementById('quizScoreCount').innerText = "Score: " + quizScore + " / " + (currentQuizIndex);
        
        const progress = Math.round((currentQuizIndex / quizActiveQuestionsList.length) * 100);
        document.getElementById('quizProgressBar').style.width = progress + '%';

        // Resolve 4 randomized options
        const options = generateOptions(card, activeDeck);
        const listContainer = document.getElementById('quizOptionsList');
        listContainer.innerHTML = '';

        options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = "w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-between";
          btn.innerHTML = '<span>' + escapeHTML(opt) + '</span><div class="status-marker w-5 h-5 border border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center"></div>';
          btn.onclick = () => submitQuizAnswer(btn, opt, card.answer);
          listContainer.appendChild(btn);
        });
      }

      function generateOptions(card, allCards) {
        const correctAnswer = card.answer;
        const wrongs = new Set();
        
        const possibleWrongs = allCards.filter(c => c.answer !== correctAnswer);
        possibleWrongs.sort(() => Math.random() - 0.5);

        for (const item of possibleWrongs) {
          if (wrongs.size >= 3) break;
          wrongs.add(item.answer);
        }

        const backups = [
          "Hypothesis is invalid in these conditions",
          "This result cannot be calculated at runtime",
          "None of the above matches are appropriate here",
          "General-purpose baseline metric response"
        ];
        let backupIndex = 0;
        while (wrongs.size < 3 && backupIndex < backups.length) {
          const opt = backups[backupIndex++];
          if (opt !== correctAnswer) wrongs.add(opt);
        }
        while (wrongs.size < 3) {
          wrongs.add("Alternative metric option " + (wrongs.size + 1));
        }

        const finalArr = [correctAnswer, ...Array.from(wrongs)];
        return finalArr.sort(() => Math.random() - 0.5);
      }

      function submitQuizAnswer(selectedBtn, answer, correctAnswer) {
        if (isQuizAnswered) return;
        isQuizAnswered = true;

        const listContainer = document.getElementById('quizOptionsList');
        const buttons = listContainer.getElementsByTagName('button');

        let isCorrect = answer === correctAnswer;
        if (isCorrect) {
          quizScore++;
        }

        // Color appropriate targets
        for (let btn of buttons) {
          btn.onclick = null; // disable future clicks
          btn.classList.remove('hover:bg-slate-50', 'dark:hover:bg-slate-800/80');
          
          const text = btn.getElementsByTagName('span')[0].innerText;
          const marker = btn.getElementsByClassName('status-marker')[0];

          if (text === correctAnswer) {
            btn.className = "w-full text-left p-4 rounded-xl border border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/20 text-sm font-medium text-green-800 dark:text-green-300 transition-all flex items-center justify-between";
            marker.innerHTML = '<i data-lucide="check" class="w-3.5 h-3.5 text-green-600 dark:text-green-400"></i>';
            marker.className = "status-marker w-5 h-5 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600";
          } else if (btn === selectedBtn && !isCorrect) {
            btn.className = "w-full text-left p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/20 text-sm font-medium text-red-800 dark:text-red-300 transition-all flex items-center justify-between";
            marker.innerHTML = '<i data-lucide="x" class="w-3.5 h-3.5 text-red-600 dark:text-red-400"></i>';
            marker.className = "status-marker w-5 h-5 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900 text-red-600";
          }
        }

        lucide.createIcons();

        // Reveal explanation if available
        const card = quizActiveQuestionsList[currentQuizIndex];
        if (card.explanation) {
          document.getElementById('quizExplanationBox').classList.remove('hidden');
          document.getElementById('quizExplanationText').innerText = card.explanation;
        }

        document.getElementById('quizScoreCount').innerText = "Score: " + quizScore + " / " + (currentQuizIndex + 1);
        document.getElementById('quizSubmissionFooter').classList.remove('hidden');
      }

      function nextQuizQuestion() {
        currentQuizIndex++;
        if (currentQuizIndex < quizActiveQuestionsList.length) {
          renderQuizQuestion();
        } else {
          showQuizResults();
        }
      }

      function showQuizResults() {
        document.getElementById('quizRunningBoard').classList.add('hidden');
        const completions = document.getElementById('quizCompletionBoard');
        completions.classList.remove('hidden');

        document.getElementById('quizProgressBar').style.width = '100%';

        const percentage = quizActiveQuestionsList.length > 0 
          ? Math.round((quizScore / quizActiveQuestionsList.length) * 100) 
          : 0;
        
        document.getElementById('gaugeCenterLabel').innerText = percentage + '%';

        // Rotate dashed dashoffset
        const circle = document.getElementById('svgGaugeCircle');
        const circumference = 2 * Math.PI * 40; // 251.2
        const dashOffset = circumference - (percentage / 100) * circumference;
        circle.setAttribute('stroke-dashoffset', dashOffset);

        // Grade Congratulations
        const textLabel = document.getElementById('quizProgressCongrats');
        const feedbackLabel = document.getElementById('quizPerformanceFeedback');

        if (percentage >= 85) {
          textLabel.innerText = "Mastery Achieved!";
          feedbackLabel.innerText = "Superb job! You scored " + quizScore + " out of " + quizActiveQuestionsList.length + ". Double check explanations details to secure score.";
        } else if (percentage >= 60) {
          textLabel.innerText = "Good effort!";
          feedbackLabel.innerText = "You scored " + quizScore + " / " + quizActiveQuestionsList.length + ". Reviewing flashcards flipping sides can reinforce correct memory associations.";
        } else {
          textLabel.innerText = "Keep practicing!";
          feedbackLabel.innerText = "You scored " + quizScore + " out of " + quizActiveQuestionsList.length + ". It is okay, learning from mistakes is the quickest retention tool.";
        }
      }

      function restartQuiz() {
        setupQuiz();
      }

      function escapeHTML(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }

      // Customized API call helper
      function toggleApiKeyInput() {
        const sec = document.getElementById('apiKeySection');
        sec.classList.toggle('hidden');
      }

      async function generateAIWithCustomKey() {
        const key = document.getElementById('geminiApiKeyInput').value.trim();
        const topic = document.getElementById('aiTopicInput').value.trim();

        if (!key) {
          showToast("Please enter a valid GEMINI_API_KEY first.");
          return;
        }
        if (!topic) {
          showToast("Please write a topic name.");
          return;
        }

        const genBtn = document.getElementById('aiGenBtn');
        genBtn.disabled = true;
        genBtn.innerHTML = '<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i> Generating...';
        lucide.createIcons();

        try {
          const userPrompt = "Create list of exactly 8 educational flashcards covering critical terminologies on: " + topic + ". Answer to system instructions with JSON matching this array structure: [{question, answer, explanation}]";
          const queryUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key;
          
          const response = await fetch(queryUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });

          const result = await response.json();
          const rawText = result.candidates[0].content.parts[0].text;
          
          const parsed = JSON.parse(rawText);
          const sanitized = parsed.map(c => ({
            id: Math.random().toString(36).substring(2, 9),
            question: c.question || 'Terminology',
            answer: c.answer || 'Definition',
            tag: topic.slice(0, 15),
            explanation: c.explanation || ''
          }));

          activeDeck = sanitized;
          activeIndex = 0;
          document.getElementById('emptyState').classList.add('hidden');
          switchMode('study');
          updateAnalytics();
          showToast("AI synthesized " + sanitized.length + " key flashcards!");
        } catch (err) {
          showToast("Error. Ensure API key is correct & has CORS connectivity.");
        } finally {
          genBtn.disabled = false;
          genBtn.innerHTML = '<i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Generate Cards with AI';
          lucide.createIcons();
        }
      }
    </script>
  </body>
</html>`;
}
