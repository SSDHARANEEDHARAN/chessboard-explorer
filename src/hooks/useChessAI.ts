import { useState, useCallback, useRef } from 'react';
import { Piece, getLegalMoves, PieceType } from '@/lib/chess';

interface AIMove {
  from: number;
  to: number;
}

// Piece values for evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  'P': 100,
  'N': 320,
  'B': 330,
  'R': 500,
  'Q': 900,
  'K': 20000
};

// Position bonuses for pieces (encourage center control)
const CENTER_BONUS = [
  0,  0,  0,  0,  0,  0,  0,  0,
  0,  5,  5,  5,  5,  5,  5,  0,
  0,  5, 10, 15, 15, 10,  5,  0,
  0,  5, 15, 20, 20, 15,  5,  0,
  0,  5, 15, 20, 20, 15,  5,  0,
  0,  5, 10, 15, 15, 10,  5,  0,
  0,  5,  5,  5,  5,  5,  5,  0,
  0,  0,  0,  0,  0,  0,  0,  0,
];

function evaluatePosition(position: Map<number, Piece>, isBlack: boolean): number {
  let score = 0;
  
  position.forEach((piece, index) => {
    const value = PIECE_VALUES[piece.type];
    const posBonus = piece.type !== 'K' ? CENTER_BONUS[index] : 0;
    
    if (piece.color === 'black') {
      score += value + posBonus;
    } else {
      score -= value + posBonus;
    }
  });
  
  return isBlack ? score : -score;
}

function getAllLegalMoves(position: Map<number, Piece>, color: 'white' | 'black'): AIMove[] {
  const moves: AIMove[] = [];
  
  position.forEach((piece, index) => {
    if (piece.color === color) {
      const { moves: legalMoves, captures } = getLegalMoves(index, piece, position);
      [...legalMoves, ...captures].forEach(to => {
        moves.push({ from: index, to });
      });
    }
  });
  
  return moves;
}

function minimax(
  position: Map<number, Piece>, 
  depth: number, 
  alpha: number, 
  beta: number, 
  isMaximizing: boolean
): number {
  if (depth === 0) {
    return evaluatePosition(position, true);
  }
  
  const color = isMaximizing ? 'black' : 'white';
  const moves = getAllLegalMoves(position, color);
  
  if (moves.length === 0) {
    return isMaximizing ? -100000 : 100000;
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newPosition = new Map(position);
      const piece = newPosition.get(move.from)!;
      newPosition.delete(move.from);
      newPosition.set(move.to, piece);
      
      const evalScore = minimax(newPosition, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newPosition = new Map(position);
      const piece = newPosition.get(move.from)!;
      newPosition.delete(move.from);
      newPosition.set(move.to, piece);
      
      const evalScore = minimax(newPosition, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function findBestMove(position: Map<number, Piece>, depth: number = 3): AIMove | null {
  const moves = getAllLegalMoves(position, 'black');
  
  if (moves.length === 0) return null;
  
  let bestMove: AIMove | null = null;
  let bestScore = -Infinity;
  
  for (const move of moves) {
    const newPosition = new Map(position);
    const piece = newPosition.get(move.from)!;
    newPosition.delete(move.from);
    newPosition.set(move.to, piece);
    
    const score = minimax(newPosition, depth - 1, -Infinity, Infinity, false);
    
    // Add some randomness for variety
    const adjustedScore = score + (Math.random() * 10 - 5);
    
    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestMove = move;
    }
  }
  
  return bestMove;
}

export function useChessAI() {
  const [isThinking, setIsThinking] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getBestMove = useCallback((position: Map<number, Piece>): Promise<AIMove | null> => {
    return new Promise((resolve) => {
      setIsThinking(true);
      
      // Add small delay for visual feedback
      timeoutRef.current = setTimeout(() => {
        const move = findBestMove(position, 3);
        setIsThinking(false);
        resolve(move);
      }, 300);
    });
  }, []);

  const cancelThinking = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsThinking(false);
  }, []);

  return { isThinking, getBestMove, cancelThinking };
}