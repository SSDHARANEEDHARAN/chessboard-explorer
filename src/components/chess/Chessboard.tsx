import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChessSquare } from './ChessSquare';
import { SquareInfoPanel } from './SquareInfoPanel';
import { SquareMappingTable } from './SquareMappingTable';
import { MovementRules } from './MovementRules';
import { MoveHistory, MoveRecord } from './MoveHistory';
import { FenPanel } from './FenPanel';
import { useChessAI } from '@/hooks/useChessAI';
import { 
  getAllSquares, 
  getInitialPosition, 
  getLegalMoves, 
  getSquareInfo,
  positionToFen,
  fenToPosition,
  Piece,
  Square
} from '@/lib/chess';

export function Chessboard() {
  const squares = useMemo(() => getAllSquares(), []);
  const [position, setPosition] = useState(() => getInitialPosition());
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  
  // Chess AI for black pieces
  const { isThinking, getBestMove } = useChessAI();

  const selectedSquare = selectedIndex !== null ? getSquareInfo(selectedIndex) : undefined;
  const selectedPiece = selectedIndex !== null ? position.get(selectedIndex) : undefined;

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

  const makeMove = useCallback((fromIdx: number, toIdx: number, piece: Piece) => {
    const fromSquare = getSquareInfo(fromIdx);
    const toSquare = getSquareInfo(toIdx);
    const capturedPiece = position.get(toIdx);
    const isCaptureMove = capturedPiece !== undefined;

    const newPosition = new Map(position);
    newPosition.delete(fromIdx);
    newPosition.set(toIdx, piece);
    
    setMoveHistory(prev => [...prev, {
      from: fromSquare,
      to: toSquare,
      piece: piece,
      isCapture: isCaptureMove,
      capturedPiece
    }]);
    
    setPosition(newPosition);
    setLastMove({ from: fromIdx, to: toIdx });
    setSelectedIndex(null);
    setIsWhiteTurn(prev => !prev);
  }, [position]);

  const handleSquareClick = useCallback((index: number) => {
    // Don't allow moves when AI is thinking or it's black's turn
    if (!isWhiteTurn || isThinking) return;
    
    const clickedPiece = position.get(index);
    
    // If we have a selected piece and clicked a legal square, make the move immediately
    if (selectedIndex !== null && selectedPiece && legalSquares.has(index)) {
      makeMove(selectedIndex, index, selectedPiece);
      return;
    }

    // If clicking own white piece, select it
    if (clickedPiece && clickedPiece.color === 'white') {
      setSelectedIndex(index);
      return;
    }

    // If clicking empty non-legal square, deselect
    setSelectedIndex(null);
  }, [selectedIndex, selectedPiece, legalSquares, position, isWhiteTurn, isThinking, makeMove]);

  // AI makes a move when it's black's turn
  useEffect(() => {
    if (isWhiteTurn || isThinking) return;
    
    const makeAIMove = async () => {
      const move = await getBestMove(position);
      
      if (move) {
        const piece = position.get(move.from);
        if (piece) {
          makeMove(move.from, move.to, piece);
        }
      }
    };
    
    const timeout = setTimeout(makeAIMove, 300);
    return () => clearTimeout(timeout);
  }, [isWhiteTurn, isThinking, position, getBestMove, makeMove]);

  const handleReset = useCallback(() => {
    setPosition(getInitialPosition());
    setSelectedIndex(null);
    setLastMove(null);
    setMoveHistory([]);
    setIsWhiteTurn(true);
  }, []);

  const currentFen = useMemo(() => positionToFen(position), [position]);

  const handleFenImport = useCallback((fen: string): boolean => {
    const newPosition = fenToPosition(fen);
    if (newPosition) {
      setPosition(newPosition);
      setSelectedIndex(null);
      setLastMove(null);
      setMoveHistory([]);
      const parts = fen.trim().split(' ');
      setIsWhiteTurn(parts[1] !== 'b');
      return true;
    }
    return false;
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
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-6">
      {/* Top Section: Square Info (Left) + Chess Board (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-6">
        {/* Left: Square Info Panel */}
        <div className="dashboard-card order-2 lg:order-1">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">♟</span>
            Square Information
          </h3>
          {selectedSquare ? (
            <SquareInfoPanel square={selectedSquare} piece={selectedPiece} />
          ) : (
            <div className="flex items-center justify-center text-muted-foreground text-sm py-12">
              <div className="text-center">
                <div className="text-4xl mb-3">♟</div>
                <p className="text-sm">Click any square to see its details</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Index, Bitboard value, Piece info</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Chessboard */}
        <div className="dashboard-card order-1 lg:order-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Chess Board</h2>
            <button
              onClick={handleReset}
              className="text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive px-4 py-2 rounded-lg transition-colors duration-150 font-medium border border-destructive/20"
            >
              New Game
            </button>
          </div>
          
          {/* Turn Indicator */}
          <div className="mb-4 flex items-center gap-3 text-sm p-3 bg-muted/30 rounded-lg">
            <div className={`w-4 h-4 rounded-full ${isWhiteTurn ? 'bg-white border-2 border-border' : 'bg-foreground'}`} />
            <span className="text-foreground font-medium">
              {isThinking ? (
                <span className="text-accent animate-pulse">⏳ Computer is thinking...</span>
              ) : isWhiteTurn ? (
                '👤 Your turn (White) - Click a piece to move'
              ) : (
                '🤖 Computer turn (Black)'
              )}
            </span>
          </div>
          
          {/* File labels (top) */}
          <div className="flex ml-8 mb-1">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(file => (
              <div key={file} className="w-12 sm:w-14 text-center text-sm text-muted-foreground font-mono font-medium">
                {file}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Rank labels (left) */}
            <div className="flex flex-col justify-around pr-2">
              {[8, 7, 6, 5, 4, 3, 2, 1].map(rank => (
                <div key={rank} className="h-12 sm:h-14 flex items-center justify-center text-sm text-muted-foreground font-mono font-medium w-6">
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
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
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
      </div>

      {/* Move History - Full Width */}
      <div className="dashboard-card mb-6">
        <MoveHistory moves={moveHistory} />
      </div>

      {/* FEN Panel - Full Width */}
      <div className="dashboard-card mb-6">
        <FenPanel
          currentFen={currentFen}
          onImport={handleFenImport}
          onReset={handleReset}
        />
      </div>

      {/* Square Mapping - Full Width */}
      <div className="dashboard-card mb-6">
        <SquareMappingTable />
      </div>

      {/* Movement Rules - Full Width */}
      <div className="dashboard-card mb-6">
        <MovementRules />
      </div>
    </div>
  );
}