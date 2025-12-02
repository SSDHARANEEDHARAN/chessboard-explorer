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
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-6">
      {/* Main Section: Board + Info Panels */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Chessboard Section */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-display font-semibold text-foreground">Interactive Board</h2>
            <button
              onClick={handleReset}
              className="text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow"
            >
              Reset Board
            </button>
          </div>
          
          {/* File labels (top) */}
          <div className="flex ml-8 mb-2">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(file => (
              <div key={file} className="w-12 sm:w-14 md:w-16 text-center text-xs text-muted-foreground font-mono font-medium">
                {file}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Rank labels (left) */}
            <div className="flex flex-col justify-around pr-2">
              {[8, 7, 6, 5, 4, 3, 2, 1].map(rank => (
                <div key={rank} className="h-12 sm:h-14 md:h-16 flex items-center justify-center text-xs text-muted-foreground font-mono font-medium w-6">
                  {rank}
                </div>
              ))}
            </div>

            {/* Board */}
            <div className="grid grid-cols-8 border-4 border-border/80 rounded-xl overflow-hidden shadow-2xl">
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
          <div className="flex flex-wrap gap-5 mt-5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-chess-selected rounded-sm shadow-sm" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-chess-legal/60 rounded-full shadow-sm" />
              <span>Legal Move</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-chess-capture rounded-sm shadow-sm" />
              <span>Capture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-chess-lastMove/50 rounded-sm shadow-sm" />
              <span>Last Move</span>
            </div>
          </div>
        </div>

        {/* Info Panels (Right Side) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-5 xl:max-w-md">
          {selectedSquare ? (
            <SquareInfoPanel square={selectedSquare} piece={selectedPiece} />
          ) : (
            <div className="info-panel flex items-center justify-center text-muted-foreground text-sm py-8">
              <div className="text-center">
                <div className="text-3xl mb-2">♟</div>
                <p>Click any square to see its information</p>
              </div>
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
        </div>
      </div>

      {/* Bottom Section: Square Mapping & Movement Rules (Full Width) */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SquareMappingTable />
        <MovementRules />
      </div>
    </div>
  );
}
