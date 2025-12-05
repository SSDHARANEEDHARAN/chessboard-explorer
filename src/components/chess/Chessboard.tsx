import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChessSquare } from './ChessSquare';
import { SquareInfoPanel } from './SquareInfoPanel';
import { SquareMappingTable } from './SquareMappingTable';
import { MovementRules } from './MovementRules';
import { MoveHistory, MoveRecord } from './MoveHistory';
import { FenPanel } from './FenPanel';
import { useStockfish, positionToFenWithTurn } from '@/hooks/useStockfish';
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
  
  // Stockfish always enabled - white is human, black is Stockfish
  const { isThinking, isReady, getBestMove } = useStockfish(true);

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
    // Don't allow moves when Stockfish is thinking or it's black's turn
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

  // Stockfish makes a move when it's black's turn
  useEffect(() => {
    if (isWhiteTurn || isThinking || !isReady) return;
    
    const makeStockfishMove = async () => {
      const fen = positionToFenWithTurn(position, false);
      const move = await getBestMove(fen);
      
      if (move) {
        const piece = position.get(move.from);
        if (piece) {
          makeMove(move.from, move.to, piece);
        }
      }
    };
    
    const timeout = setTimeout(makeStockfishMove, 500);
    return () => clearTimeout(timeout);
  }, [isWhiteTurn, isThinking, isReady, position, getBestMove, makeMove]);

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
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6">
      {/* Main Section: Board + Move History + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr] gap-4 mb-8">
        {/* Left: Chessboard */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold text-foreground">Chess Board</h2>
            <button
              onClick={handleReset}
              className="text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium border border-destructive/20"
            >
              New Game
            </button>
          </div>
          
          {/* Turn Indicator */}
          <div className="mb-3 flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${isWhiteTurn ? 'bg-white border border-border' : 'bg-foreground'}`} />
            <span className="text-muted-foreground">
              {isThinking ? (
                <span className="text-accent animate-pulse">Stockfish thinking...</span>
              ) : !isReady ? (
                <span className="text-muted-foreground/60">Loading engine...</span>
              ) : isWhiteTurn ? (
                'Your turn (White)'
              ) : (
                "Stockfish's turn (Black)"
              )}
            </span>
          </div>
          
          {/* File labels (top) */}
          <div className="flex ml-7 mb-1">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(file => (
              <div key={file} className="w-10 sm:w-11 text-center text-xs text-muted-foreground font-mono">
                {file}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Rank labels (left) */}
            <div className="flex flex-col justify-around pr-1">
              {[8, 7, 6, 5, 4, 3, 2, 1].map(rank => (
                <div key={rank} className="h-10 sm:h-11 flex items-center justify-center text-xs text-muted-foreground font-mono w-6">
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
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 border-2 border-primary rounded-sm" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-accent/60 rounded-full" />
              <span>Legal Move</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 border-2 border-destructive rounded-sm" />
              <span>Capture</span>
            </div>
          </div>
        </div>

        {/* Middle: Move History */}
        <div className="dashboard-card">
          <MoveHistory moves={moveHistory} />
        </div>

        {/* Right: Square Info + FEN */}
        <div className="flex flex-col gap-4">
          <div className="dashboard-card flex-1">
            {selectedSquare ? (
              <SquareInfoPanel square={selectedSquare} piece={selectedPiece} />
            ) : (
              <div className="flex items-center justify-center text-muted-foreground text-sm py-8">
                <div className="text-center">
                  <div className="text-2xl mb-2">♟</div>
                  <p className="text-xs">Click a white piece to move</p>
                </div>
              </div>
            )}
          </div>
          <div className="dashboard-card flex-1">
            <FenPanel
              currentFen={currentFen}
              onImport={handleFenImport}
              onReset={handleReset}
            />
          </div>
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