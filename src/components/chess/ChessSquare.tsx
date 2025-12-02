import { cn } from '@/lib/utils';
import { Square, Piece, PIECE_SYMBOLS } from '@/lib/chess';

interface ChessSquareProps {
  square: Square;
  piece?: Piece;
  isSelected: boolean;
  isLegalMove: boolean;
  isCapture: boolean;
  isLastMove: boolean;
  onClick: () => void;
}

export function ChessSquare({
  square,
  piece,
  isSelected,
  isLegalMove,
  isCapture,
  isLastMove,
  onClick,
}: ChessSquareProps) {
  const pieceSymbol = piece ? PIECE_SYMBOLS[piece.color][piece.type] : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'chess-square w-full aspect-square relative transition-all duration-150',
        square.isLight ? 'chess-square-light' : 'chess-square-dark',
        isSelected && 'chess-square-selected',
        isCapture && 'chess-square-capture',
        isLastMove && !isSelected && 'chess-square-last-move',
        'hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-primary'
      )}
    >
      {/* Square labels */}
      <span className={cn(
        'absolute top-0.5 left-1 text-[8px] font-mono opacity-60',
        square.isLight ? 'text-foreground/70' : 'text-background/70'
      )}>
        {square.algebraic}
      </span>
      <span className={cn(
        'absolute bottom-0.5 right-1 text-[7px] font-mono opacity-50',
        square.isLight ? 'text-foreground/60' : 'text-background/60'
      )}>
        {square.index}
      </span>

      {/* Piece */}
      {pieceSymbol && (
        <span className={cn(
          'text-3xl md:text-4xl lg:text-5xl select-none',
          piece.color === 'white' ? 'chess-piece-white' : 'chess-piece-black'
        )}>
          {pieceSymbol}
        </span>
      )}

      {/* Legal move indicator */}
      {isLegalMove && !piece && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 rounded-full bg-chess-legal/50" />
        </div>
      )}
    </button>
  );
}
