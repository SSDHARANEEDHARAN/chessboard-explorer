import { Square, Piece, PIECE_INFO, formatBitboard } from '@/lib/chess';

interface SquareInfoPanelProps {
  square: Square;
  piece?: Piece;
}

export function SquareInfoPanel({ square, piece }: SquareInfoPanelProps) {
  const pieceInfo = piece ? PIECE_INFO[piece.type] : null;

  return (
    <div className="info-panel space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-primary">Square Info</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Algebraic:</span>
            <span className="font-mono font-semibold">{square.algebraic}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Index:</span>
            <span className="font-mono">{square.index}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bitboard:</span>
            <span className="font-mono text-xs">{formatBitboard(square.bitboard)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Color:</span>
            <span className={square.isLight ? 'text-amber-200' : 'text-teal-400'}>
              {square.isLight ? 'Light' : 'Dark'}
            </span>
          </div>
        </div>
      </div>

      {piece && pieceInfo && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-accent">Piece Info</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-semibold">{pieceInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Color:</span>
              <span className={piece.color === 'white' ? 'text-amber-100' : 'text-slate-400'}>
                {piece.color}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ID:</span>
              <span className="font-mono">{pieceInfo.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Value:</span>
              <span className="font-mono">{pieceInfo.value || '∞'}</span>
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <span className="text-muted-foreground text-xs">Movement:</span>
              <p className="text-xs mt-1 text-foreground/80">{pieceInfo.movementRule}</p>
            </div>
          </div>
        </div>
      )}

      {!piece && (
        <div className="text-center text-muted-foreground text-sm py-4">
          Empty square
        </div>
      )}
    </div>
  );
}
