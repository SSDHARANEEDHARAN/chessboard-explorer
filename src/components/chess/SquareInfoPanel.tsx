import { Square, Piece, PIECE_INFO, formatBitboard } from '@/lib/chess';

interface SquareInfoPanelProps {
  square: Square;
  piece?: Piece;
}

export function SquareInfoPanel({ square, piece }: SquareInfoPanelProps) {
  const pieceInfo = piece ? PIECE_INFO[piece.type] : null;

  return (
    <div className="info-panel space-y-5">
      <div>
        <h3 className="text-sm font-display font-semibold mb-3 text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Square Info
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-muted/40">
            <span className="text-muted-foreground">Algebraic:</span>
            <span className="font-mono font-bold text-lg">{square.algebraic}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-muted/40">
            <span className="text-muted-foreground">Index:</span>
            <span className="font-mono font-semibold">{square.index}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-muted/40">
            <span className="text-muted-foreground">Bitboard:</span>
            <span className="font-mono text-xs">{formatBitboard(square.bitboard)}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-muted/40">
            <span className="text-muted-foreground">Color:</span>
            <span className={`font-medium ${square.isLight ? 'text-amber-400' : 'text-stone-400'}`}>
              {square.isLight ? '◻ Light' : '◼ Dark'}
            </span>
          </div>
        </div>
      </div>

      {piece && pieceInfo && (
        <div>
          <h3 className="text-sm font-display font-semibold mb-3 text-accent flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Piece Info
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-muted/40">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-semibold">{pieceInfo.name}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-muted/40">
              <span className="text-muted-foreground">Color:</span>
              <span className={`font-medium ${piece.color === 'white' ? 'text-amber-200' : 'text-stone-500'}`}>
                {piece.color === 'white' ? '○ White' : '● Black'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-muted/40">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono font-bold">{pieceInfo.id}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-muted/40">
              <span className="text-muted-foreground">Value:</span>
              <span className="font-mono font-semibold">{pieceInfo.value || '∞'} pts</span>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">Movement</span>
              <p className="text-sm mt-1.5 text-foreground/90 leading-relaxed">{pieceInfo.movementRule}</p>
            </div>
          </div>
        </div>
      )}

      {!piece && (
        <div className="text-center text-muted-foreground text-sm py-6 bg-muted/20 rounded-lg">
          <div className="text-2xl mb-1 opacity-50">○</div>
          Empty square
        </div>
      )}
    </div>
  );
}
