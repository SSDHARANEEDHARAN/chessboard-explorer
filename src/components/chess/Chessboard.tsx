import { useState, useMemo, useCallback } from 'react';
import { ChessSquare } from './ChessSquare';
import { SquareInfoPanel } from './SquareInfoPanel';
import { BitboardGrid } from './BitboardGrid';
import { MovePanel } from './MovePanel';
import { SquareMappingTable } from './SquareMappingTable';
import { MovementRules } from './MovementRules';
import { 
  getAllSquares, 
  getInitialPosition, 
  getLegalMoves, 
  getSquareInfo,
  Piece,
  Square
} from '@/lib/chess';

export function Chessboard() {
  const squares = useMemo(() => getAllSquares(), []);
  const [position, setPosition] = useState(() => getInitialPosition());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);

  const selectedSquare = selectedIndex !== null ? getSquareInfo(selectedIndex) : undefined;
  const selectedPiece = selectedIndex !== null ? position.get(selectedIndex) : undefined;
  const targetSquare = targetIndex !== null ? getSquareInfo(targetIndex) : undefined;

  const { legalMoves, legalCaptures } = useMemo(() => {
    if (selectedIndex === null || !selectedPiece) {
      return { legalMoves: [], legalCaptures: [] };
    }
    const result = getLegalMoves(selectedIndex, selectedPiece, position);
    return { legalMoves: result.moves, legalCaptures: result.captures };
  }, [selectedIndex, selectedPiece, position]);

  const legalSquares = useMemo(() => 
    new Set([...legalMoves, ...legalCaptures]),
    [legalMoves, legalCaptures]
  );

  const isValidMove = targetIndex !== null && legalSquares.has(targetIndex);
  const isCapture = targetIndex !== null && legalCaptures.includes(targetIndex);

  const handleSquareClick = useCallback((index: number) => {
    const clickedPiece = position.get(index);
    
    // If we have a selected piece and clicked a legal square, set as target
    if (selectedIndex !== null && legalSquares.has(index)) {
      setTargetIndex(index);
      return;
    }

    // If clicking own piece, select it
    if (clickedPiece) {
      setSelectedIndex(index);
      setTargetIndex(null);
      return;
    }

    // If clicking empty non-legal square, show its info
    setSelectedIndex(index);
    setTargetIndex(null);
  }, [selectedIndex, legalSquares, position]);

  const handleMakeMove = useCallback(() => {
    if (selectedIndex === null || targetIndex === null || !selectedPiece) return;

    const newPosition = new Map(position);
    newPosition.delete(selectedIndex);
    newPosition.set(targetIndex, selectedPiece);
    
    setPosition(newPosition);
    setLastMove({ from: selectedIndex, to: targetIndex });
    setSelectedIndex(null);
    setTargetIndex(null);
  }, [selectedIndex, targetIndex, selectedPiece, position]);

  const handleCancel = useCallback(() => {
    setSelectedIndex(null);
    setTargetIndex(null);
  }, []);

  const handleReset = useCallback(() => {
    setPosition(getInitialPosition());
    setSelectedIndex(null);
    setTargetIndex(null);
    setLastMove(null);
  }, []);

  // Display board from rank 8 to rank 1 (top to bottom)
  const displaySquares = useMemo(() => {
    const result: Square[] = [];
    for (let rank = 7; rank >= 0; rank--) {
      for (let file = 0; file < 8; file++) {
        result.push(squares[rank * 8 + file]);
      }
    }
    return result;
  }, [squares]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto p-4">
      {/* Chessboard */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Interactive Chessboard</h2>
          <button
            onClick={handleReset}
            className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded hover:bg-secondary/80 transition-colors"
          >
            Reset Board
          </button>
        </div>
        
        {/* File labels (top) */}
        <div className="flex ml-6 mb-1">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(file => (
            <div key={file} className="w-12 md:w-14 lg:w-16 text-center text-xs text-muted-foreground font-mono">
              {file}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Rank labels (left) */}
          <div className="flex flex-col justify-around pr-1">
            {[8, 7, 6, 5, 4, 3, 2, 1].map(rank => (
              <div key={rank} className="h-12 md:h-14 lg:h-16 flex items-center text-xs text-muted-foreground font-mono">
                {rank}
              </div>
            ))}
          </div>

          {/* Board */}
          <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden shadow-xl">
            {displaySquares.map(square => (
              <ChessSquare
                key={square.index}
                square={square}
                piece={position.get(square.index)}
                isSelected={selectedIndex === square.index}
                isLegalMove={legalMoves.includes(square.index)}
                isCapture={legalCaptures.includes(square.index)}
                isLastMove={lastMove?.from === square.index || lastMove?.to === square.index}
                onClick={() => handleSquareClick(square.index)}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-chess-selected rounded" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-chess-legal/50 rounded-full" />
            <span>Legal Move</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-chess-capture rounded" />
            <span>Capture</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-chess-lastMove/40 rounded" />
            <span>Last Move</span>
          </div>
        </div>
      </div>

      {/* Info Panels */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:max-w-sm">
        {selectedSquare ? (
          <SquareInfoPanel square={selectedSquare} piece={selectedPiece} />
        ) : (
          <div className="info-panel text-center text-muted-foreground text-sm py-6">
            Click any square to see its information
          </div>
        )}

        <MovePanel
          selectedSquare={selectedSquare}
          selectedPiece={selectedPiece}
          targetSquare={targetSquare}
          isValidMove={isValidMove}
          isCapture={isCapture}
          onMakeMove={handleMakeMove}
          onCancel={handleCancel}
        />

        <BitboardGrid 
          legalSquares={legalSquares} 
          selectedSquare={selectedIndex ?? undefined}
        />

        <SquareMappingTable />
        
        <MovementRules />
      </div>
    </div>
  );
}
