import { useState, useCallback, useRef, useEffect } from 'react';
import { Piece, getSquareInfo } from '@/lib/chess';

interface StockfishMove {
  from: number;
  to: number;
}

export function useStockfish(enabled: boolean) {
  const [isThinking, setIsThinking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((move: StockfishMove | null) => void) | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        setIsReady(false);
      }
      return;
    }

    // Initialize Stockfish Web Worker
    const worker = new Worker('/stockfish.js');
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const message = e.data;
      
      if (message === 'uciok') {
        worker.postMessage('isready');
      } else if (message === 'readyok') {
        setIsReady(true);
      } else if (message.startsWith('bestmove')) {
        const parts = message.split(' ');
        const moveStr = parts[1];
        
        if (moveStr && moveStr !== '(none)' && resolveRef.current) {
          const from = algebraicToIndex(moveStr.slice(0, 2));
          const to = algebraicToIndex(moveStr.slice(2, 4));
          resolveRef.current({ from, to });
          resolveRef.current = null;
        } else if (resolveRef.current) {
          resolveRef.current(null);
          resolveRef.current = null;
        }
        setIsThinking(false);
      }
    };

    worker.postMessage('uci');

    return () => {
      worker.terminate();
      workerRef.current = null;
      setIsReady(false);
    };
  }, [enabled]);

  const getBestMove = useCallback((fen: string): Promise<StockfishMove | null> => {
    return new Promise((resolve) => {
      if (!workerRef.current || !isReady) {
        resolve(null);
        return;
      }

      setIsThinking(true);
      resolveRef.current = resolve;
      
      workerRef.current.postMessage(`position fen ${fen}`);
      workerRef.current.postMessage('go depth 10');
    });
  }, [isReady]);

  return { isThinking, isReady, getBestMove };
}

function algebraicToIndex(algebraic: string): number {
  const file = algebraic.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = parseInt(algebraic[1]) - 1;
  return rank * 8 + file;
}

export function positionToFenWithTurn(position: Map<number, Piece>, isWhiteTurn: boolean): string {
  const rows: string[] = [];
  
  for (let rank = 7; rank >= 0; rank--) {
    let row = '';
    let emptyCount = 0;
    
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      const piece = position.get(index);
      
      if (piece) {
        if (emptyCount > 0) {
          row += emptyCount;
          emptyCount = 0;
        }
        const fenChar = piece.type;
        row += piece.color === 'white' ? fenChar : fenChar.toLowerCase();
      } else {
        emptyCount++;
      }
    }
    
    if (emptyCount > 0) {
      row += emptyCount;
    }
    rows.push(row);
  }
  
  return rows.join('/') + ` ${isWhiteTurn ? 'w' : 'b'} KQkq - 0 1`;
}
