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
      <div className="h-full">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          Move History
        </h3>
        <div className="flex items-center justify-center text-muted-foreground text-sm py-12">
          <div className="text-center">
            <div className="text-3xl mb-3 opacity-50">♟</div>
            <p className="text-sm">No moves yet</p>
            <p className="text-xs mt-1 text-muted-foreground/70">Make a move to see history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent" />
          Move History
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
          {moves.length} moves
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-80">
        {moves.map((move, idx) => {
          const pieceSymbol = PIECE_SYMBOLS[move.piece.type][move.piece.color];
          const fromBitboard = BigInt(1) << BigInt(move.from.index);
          const toBitboard = BigInt(1) << BigInt(move.to.index);
          
          return (
            <div 
              key={idx} 
              className="bg-muted/20 rounded-lg p-3 border border-border/40 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded text-secondary-foreground">#{idx + 1}</span>
                <span className="text-xl">{pieceSymbol}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                {/* From Square */}
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">From</div>
                  <div className="font-mono font-bold text-primary text-lg">{move.from.algebraic}</div>
                  <div className="text-xs text-muted-foreground">
                    Index: <span className="text-foreground font-mono">{move.from.index}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono break-all leading-relaxed">
                    Bit: <span className="text-accent">{fromBitboard.toString()}</span>
                  </div>
                </div>
                
                {/* To Square */}
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">To</div>
                  <div className="font-mono font-bold text-primary text-lg">{move.to.algebraic}</div>
                  <div className="text-xs text-muted-foreground">
                    Index: <span className="text-foreground font-mono">{move.to.index}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono break-all leading-relaxed">
                    Bit: <span className="text-accent">{toBitboard.toString()}</span>
                  </div>
                </div>
              </div>
              
              {move.isCapture && move.capturedPiece && (
                <div className="mt-2 pt-2 border-t border-border/30 text-xs flex items-center gap-1">
                  <span className="text-destructive font-medium">Captured:</span>
                  <span className="text-lg">{PIECE_SYMBOLS[move.capturedPiece.type][move.capturedPiece.color]}</span>
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
