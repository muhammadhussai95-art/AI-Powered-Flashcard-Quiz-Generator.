/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Flashcard } from "../types";

export function parseCSV(text: string): Flashcard[] {
  const lines: string[] = [];
  let currentLine = "";
  let insideQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentLine += '"';
        i++; // skip next quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === '\n' || char === '\r') {
      if (insideQuote) {
        currentLine += char;
      } else {
        if (currentLine.trim()) {
          lines.push(currentLine);
        }
        currentLine = "";
        if (char === '\r' && nextChar === '\n') {
          i++; // skip \n
        }
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  const result: Flashcard[] = [];
  let hasHeaders = false;
  
  if (lines.length > 0) {
    const firstRowValues = parseCSVRow(lines[0]);
    const col0 = firstRowValues[0]?.toLowerCase() || "";
    const col1 = firstRowValues[1]?.toLowerCase() || "";
    if (col0.includes("question") || col0.includes("term") || col1.includes("answer") || col1.includes("definition")) {
      hasHeaders = true;
    }
  }
  
  const startIndex = hasHeaders ? 1 : 0;
  for (let i = startIndex; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
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

function parseCSVRow(rowText: string): string[] {
  const result: string[] = [];
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

export function generateOptionsForCard(card: Flashcard, allCards: Flashcard[]): string[] {
  const correctAnswer = card.answer;
  const incorrectAnswers = new Set<string>();
  
  // Find other cards that have different answers
  const otherCards = allCards.filter(c => c.id !== card.id && c.answer.trim().toLowerCase() !== correctAnswer.trim().toLowerCase());
  
  // Shuffle incorrect choices
  const shuffledOther = [...otherCards].sort(() => Math.random() - 0.5);
  
  for (const other of shuffledOther) {
    if (incorrectAnswers.size >= 3) break;
    if (other.answer.trim()) {
      incorrectAnswers.add(other.answer.trim());
    }
  }
  
  // Fallbacks if deck doesn't have enough distinct elements
  const fallbackWrongOptions = [
    "Unrelated system definition",
    "Alternative state value or invalid parameter",
    "Hypothesis has been disproven through research",
    "Variable or structure not found in this domain",
    "Opposite relationship of this given metric",
    "None of the above options are true"
  ];
  
  let fallbackIndex = 0;
  while (incorrectAnswers.size < 3 && fallbackIndex < fallbackWrongOptions.length) {
    const opt = fallbackWrongOptions[fallbackIndex++];
    if (opt.toLowerCase() !== correctAnswer.toLowerCase()) {
      incorrectAnswers.add(opt);
    }
  }
  
  while (incorrectAnswers.size < 3) {
    incorrectAnswers.add(`Option Parameter ${incorrectAnswers.size + 1}`);
  }
  
  const options = [correctAnswer, ...Array.from(incorrectAnswers)];
  return options.sort(() => Math.random() - 0.5);
}

export const sampleFlashcards: Flashcard[] = [
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
