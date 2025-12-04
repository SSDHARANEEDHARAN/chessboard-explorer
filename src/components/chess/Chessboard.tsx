import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChessSquare } from './ChessSquare';
import { SquareInfoPanel } from './SquareInfoPanel';
import { BitboardGrid } from './BitboardGrid';
import { MovePanel } from './MovePanel';
import { SquareMappingTable } from './SquareMappingTable';
import { MovementRules } from './MovementRules';
import { MoveHistory, MoveRecord } from './MoveHistory';
import { FenPanel } from './FenPanel';
import { useStockfish, positionToFenWithTurn } from '@/hooks/useStockfish';
import { Switch } from '@/components/ui/switch';
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
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<{ from: number; to: number } | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);
  const [stockfishEnabled, setStockfishEnabled] = useState(false);
  
  const { isThinking, isReady, getBestMove } = useStockfish(stockfishEnabled);

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
    // Don't allow moves when Stockfish is thinking or it's black's turn with Stockfish enabled
    if (stockfishEnabled && (!isWhiteTurn || isThinking)) return;
    
    const clickedPiece = position.get(index);
    
    // If we have a selected piece and clicked a legal square, set as target
    if (selectedIndex !== null && legalSquares.has(index)) {
      setTargetIndex(index);
      return;
    }

    // If clicking own piece (white only when Stockfish is enabled), select it
    if (clickedPiece && (!stockfishEnabled || clickedPiece.color === 'white')) {
      setSelectedIndex(index);
      setTargetIndex(null);
      return;
    }

    // If clicking empty non-legal square, show its info
    setSelectedIndex(index);
    setTargetIndex(null);
  }, [selectedIndex, legalSquares, position, stockfishEnabled, isWhiteTurn, isThinking]);

  const handleMakeMove = useCallback((fromIdx?: number, toIdx?: number, piece?: Piece) => {
    const moveFrom = fromIdx ?? selectedIndex;
    const moveTo = toIdx ?? targetIndex;
    const movePiece = piece ?? selectedPiece;
    
    if (moveFrom === null || moveTo === null || !movePiece) return;

    const fromSquare = getSquareInfo(moveFrom);
    const toSquare = getSquareInfo(moveTo);
    const capturedPiece = position.get(moveTo);
    const isCaptureMove = capturedPiece !== undefined;

    const newPosition = new Map(position);
    newPosition.delete(moveFrom);
    newPosition.set(moveTo, movePiece);
    
    // Add to move history
    setMoveHistory(prev => [...prev, {
      from: fromSquare,
      to: toSquare,
      piece: movePiece,
      isCapture: isCaptureMove,
      capturedPiece
    }]);
    
    setPosition(newPosition);
    setLastMove({ from: moveFrom, to: moveTo });
    setSelectedIndex(null);
    setTargetIndex(null);
    setIsWhiteTurn(prev => !prev);
  }, [selectedIndex, targetIndex, selectedPiece, position]);

  // Stockfish makes a move when it's black's turn
  useEffect(() => {
    if (!stockfishEnabled || isWhiteTurn || isThinking || !isReady) return;
    
    const makeStockfishMove = async () => {
      const fen = positionToFenWithTurn(position, false);
      const move = await getBestMove(fen);
      
      if (move) {
        const piece = position.get(move.from);
        if (piece) {
          handleMakeMove(move.from, move.to, piece);
        }
      }
    };
    
    const timeout = setTimeout(makeStockfishMove, 500);
    return () => clearTimeout(timeout);
  }, [stockfishEnabled, isWhiteTurn, isThinking, isReady, position, getBestMove, handleMakeMove]);

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
    setIsWhiteTurn(true);
  }, []);

  const currentFen = useMemo(() => positionToFen(position), [position]);

  const handleFenImport = useCallback((fen: string): boolean => {
    const newPosition = fenToPosition(fen);
    if (newPosition) {
      setPosition(newPosition);
      setSelectedIndex(null);
      setTargetIndex(null);
      setLastMove(null);
      setMoveHistory([]);
      // Parse turn from FEN
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
      {/* Main Section: Board + Move Panel + Move History on same line */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr] gap-4 mb-8">
        {/* Left: Chessboard */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-display font-semibold text-foreground">Interactive Board</h2>
            <div className="flex items-center gap-3">
              {/* Stockfish Toggle */}
              <div className="flex items-center gap-2">
                <label htmlFor="stockfish-toggle" className="text-xs text-muted-foreground">
                  vs Stockfish
                </label>
                <Switch
                  id="stockfish-toggle"
                  checked={stockfishEnabled}
                  onCheckedChange={setStockfishEnabled}
                />
              </div>
              <button
                onClick={handleReset}
                className="text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium border border-destructive/20"
              >
                Reset
              </button>
            </div>
          </div>
          
          {/* Turn Indicator */}
          {stockfishEnabled && (
            <div className="mb-3 flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${isWhiteTurn ? 'bg-white border border-border' : 'bg-foreground'}`} />
              <span className="text-muted-foreground">
                {isThinking ? (
                  <span className="text-accent animate-pulse">Stockfish is thinking...</span>
                ) : isWhiteTurn ? (
                  'Your turn (White)'
                ) : (
                  "Stockfish's turn (Black)"
                )}
              </span>
              {!isReady && stockfishEnabled && (
                <span className="text-xs text-muted-foreground/60">(Loading engine...)</span>
              )}
            </div>
          )}
          
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
              <span>Legal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 border-2 border-destructive rounded-sm" />
              <span>Capture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-yellow-500/40 rounded-sm" />
              <span>Last Move</span>
            </div>
          </div>
        </div>

        {/* Middle: Move Panel + Square Info */}
        <div className="flex flex-col gap-4">
          <div className="dashboard-card flex-1">
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
          <div className="dashboard-card flex-1">
            {selectedSquare ? (
              <SquareInfoPanel square={selectedSquare} piece={selectedPiece} />
            ) : (
              <div className="flex items-center justify-center text-muted-foreground text-sm py-4">
                <div className="text-center">
                  <div className="text-xl mb-1">♟</div>
                  <p className="text-xs">Click any square</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Move History */}
        <div className="dashboard-card">
          <MoveHistory moves={moveHistory} />
        </div>
      </div>

      {/* Secondary Section: Bitboard + FEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="dashboard-card">
          <BitboardGrid 
            legalSquares={legalSquares} 
            selectedSquare={selectedIndex ?? undefined}
          />
        </div>

        <div className="dashboard-card">
          <FenPanel
            currentFen={currentFen}
            onImport={handleFenImport}
            onReset={handleReset}
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
