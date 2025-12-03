import { useState, useMemo, useCallback } from 'react';
import { ChessSquare } from './ChessSquare';
import { SquareInfoPanel } from './SquareInfoPanel';
import { BitboardGrid } from './BitboardGrid';
import { MovePanel } from './MovePanel';
import { SquareMappingTable } from './SquareMappingTable';
import { MovementRules } from './MovementRules';
import { MoveHistory, MoveRecord } from './MoveHistory';
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
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);

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

    const fromSquare = getSquareInfo(selectedIndex);
    const toSquare = getSquareInfo(targetIndex);
    const capturedPiece = position.get(targetIndex);
    const isCapture = capturedPiece !== undefined;

    const newPosition = new Map(position);
    newPosition.delete(selectedIndex);
    newPosition.set(targetIndex, selectedPiece);
    
    // Add to move history
    setMoveHistory(prev => [...prev, {
      from: fromSquare,
      to: toSquare,
      piece: selectedPiece,
      isCapture,
      capturedPiece
    }]);
    
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
    setMoveHistory([]);
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
      {/* Main Section: Board + Move History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Left: Chessboard */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Interactive Board</h2>
            <button
              onClick={handleReset}
              className="text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded-lg transition-colors duration-150 font-medium border border-destructive/20"
            >
              Reset Board
            </button>
          </div>
          
          {/* File labels (top) */}
          <div className="flex ml-7 mb-1">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(file => (
              <div key={file} className="w-10 sm:w-12 md:w-14 text-center text-xs text-muted-foreground font-mono">
                {file}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Rank labels (left) */}
            <div className="flex flex-col justify-around pr-1">
              {[8, 7, 6, 5, 4, 3, 2, 1].map(rank => (
                <div key={rank} className="h-10 sm:h-12 md:h-14 flex items-center justify-center text-xs text-muted-foreground font-mono w-6">
                  {rank}
                </div>
              ))}
            </div>

            {/* Board */}
            <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden shadow-lg">
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
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-primary rounded-sm" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent/60 rounded-full" />
              <span>Legal Move</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-destructive rounded-sm" />
              <span>Capture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500/40 rounded-sm" />
              <span>Last Move</span>
            </div>
          </div>
        </div>

        {/* Right: Move History */}
        <div className="dashboard-card">
          <MoveHistory moves={moveHistory} />
        </div>
      </div>

      {/* Middle Section: Info Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="dashboard-card">
          {selectedSquare ? (
            <SquareInfoPanel square={selectedSquare} piece={selectedPiece} />
          ) : (
            <div className="flex items-center justify-center text-muted-foreground text-sm py-6">
              <div className="text-center">
                <div className="text-2xl mb-2">♟</div>
                <p>Click any square to see details</p>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <MovePanel
            selectedSquare={selectedSquare}
            selectedPiece={selectedPiece}
            targetSquare={targetSquare}
            isValidMove={isValidMove}
            isCapture={isCapture}
            onMakeMove={handleMakeMove}
            onCancel={handleCancel}
          />
        </div>

        <div className="dashboard-card">
          <BitboardGrid 
            legalSquares={legalSquares} 
            selectedSquare={selectedIndex ?? undefined}
          />
        </div>
      </div>

      {/* Bottom Section: Reference Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="dashboard-card">
          <SquareMappingTable />
        </div>
        <div className="dashboard-card">
          <MovementRules />
        </div>
      </div>
    </div>
  );
}
