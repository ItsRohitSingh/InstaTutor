import { Injectable } from '@angular/core';
import { Flashcard } from '../models/study-session.model';

@Injectable({
  providedIn: 'root'
})
export class SpacedRepetitionService {
  /**
   * Applies the SuperMemo-2 (SM-2) spaced repetition algorithm to a flashcard.
   * Ratings:
   * - 'hard': Quality ~ 2-3 (forgot or struggled) -> reset streak, review tomorrow
   * - 'good': Quality ~ 4 (recalled with effort) -> advance standard interval
   * - 'easy': Quality ~ 5 (instant effortless recall) -> advance bonus interval, increase ease factor
   */
  processReview(card: Flashcard, rating: 'easy' | 'good' | 'hard'): Flashcard {
    const currentRepetitions = card.repetitions ?? 0;
    const currentInterval = card.interval ?? 1;
    const currentEase = card.easeFactor ?? 2.5;

    let nextRepetitions = currentRepetitions;
    let nextInterval = currentInterval;
    let nextEase = currentEase;

    switch (rating) {
      case 'hard': {
        nextRepetitions = 0;
        nextInterval = 1;
        nextEase = Math.max(1.3, +(currentEase - 0.2).toFixed(2));
        break;
      }
      case 'good': {
        nextRepetitions = currentRepetitions + 1;
        if (nextRepetitions === 1) {
          nextInterval = 1;
        } else if (nextRepetitions === 2) {
          nextInterval = 6;
        } else {
          nextInterval = Math.round(currentInterval * currentEase);
        }
        break;
      }
      case 'easy': {
        nextRepetitions = currentRepetitions + 1;
        if (nextRepetitions === 1) {
          nextInterval = 2;
        } else if (nextRepetitions === 2) {
          nextInterval = 8;
        } else {
          nextInterval = Math.round(currentInterval * currentEase * 1.3);
        }
        nextEase = Math.min(3.0, +(currentEase + 0.15).toFixed(2));
        break;
      }
    }

    const now = Date.now();
    const nextReviewDate = now + nextInterval * 24 * 60 * 60 * 1000;

    return {
      ...card,
      difficulty: rating,
      repetitions: nextRepetitions,
      interval: nextInterval,
      easeFactor: nextEase,
      nextReviewDate,
      lastReviewedDate: now
    };
  }

  /**
   * Returns true if card has never been reviewed or is due for review today.
   */
  isCardDue(card: Flashcard): boolean {
    if (!card.nextReviewDate) {
      return true;
    }
    return card.nextReviewDate <= Date.now();
  }

  /**
   * Calculate mastery level: cards with 2+ successful repetitions and 'easy' or 'good' rating.
   */
  isCardMastered(card: Flashcard): boolean {
    return (card.repetitions ?? 0) >= 2 && (card.difficulty === 'easy' || card.difficulty === 'good');
  }
}
