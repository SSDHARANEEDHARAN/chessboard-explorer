import { Square, Piece, PIECE_SYMBOLS } from '@/lib/chess';

interface MoveRecord {
  from: Square;
  to: Square;
  piece: Piece;
  isCapture: boolean;
  capturedPiece?: Piece;
}

interface MoveHistoryProps {
  moves: MoveRecord[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  if (moves.length === 0) {
    return (
      <div className="info-panel">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          Move History
        </h3>
        <div className="flex items-center justify-center text-muted-foreground text-sm py-8">
          <div className="text-center">
            <div className="text-2xl mb-2">📜</div>
            <p>No moves yet. Make a move to see history.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="info-panel">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent" />
        Move History
      </h3>
      
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {moves.map((move, idx) => {
          const pieceSymbol = PIECE_SYMBOLS[move.piece.type][move.piece.color];
          const fromBitboard = BigInt(1) << BigInt(move.from.index);
          const toBitboard = BigInt(1) << BigInt(move.to.index);
          
          return (
            <div 
              key={idx} 
              className="bg-muted/30 rounded-lg p-3 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">Move #{idx + 1}</span>
                <span className="text-lg">{pieceSymbol}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* From Square */}
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">From</div>
                  <div className="font-mono font-semibold text-primary">{move.from.algebraic}</div>
                  <div className="text-xs text-muted-foreground">
                    Index: <span className="text-foreground">{move.from.index}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono break-all">
                    Bit: <span className="text-accent">{fromBitboard.toString()}</span>
                  </div>
                </div>
                
                {/* To Square */}
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">To</div>
                  <div className="font-mono font-semibold text-primary">{move.to.algebraic}</div>
                  <div className="text-xs text-muted-foreground">
                    Index: <span className="text-foreground">{move.to.index}</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono break-all">
                    Bit: <span className="text-accent">{toBitboard.toString()}</span>
                  </div>
                </div>
              </div>
              
              {move.isCapture && move.capturedPiece && (
                <div className="mt-2 pt-2 border-t border-border/50 text-xs">
                  <span className="text-chess-capture">Captured: </span>
                  <span>{PIECE_SYMBOLS[move.capturedPiece.type][move.capturedPiece.color]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { MoveRecord };
