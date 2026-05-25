/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tag?: string;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Flashcard[];
  createdAt: string;
}
