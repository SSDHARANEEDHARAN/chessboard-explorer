import { cn } from '@/lib/utils';

interface BitboardGridProps {
  legalSquares: Set<number>;
  selectedSquare?: number;
}

export function BitboardGrid({ legalSquares, selectedSquare }: BitboardGridProps) {
  const rows = Array.from({ length: 8 }, (_, i) => 7 - i);

  return (
    <div className="info-panel">
      <h3 className="text-sm font-display font-semibold mb-2 text-foreground flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary/70" />
        Bitboard Visualization
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Legal moves shown as 1s in the 64-bit bitboard
      </p>
      <div className="grid grid-cols-8 gap-0.5 p-2 bg-muted/30 rounded-lg">
        {rows.map(rank => (
          Array.from({ length: 8 }, (_, file) => {
            const index = rank * 8 + file;
            const isActive = legalSquares.has(index);
            const isSelected = index === selectedSquare;
            
            return (
              <div
                key={index}
                className={cn(
                  'bitboard-cell',
                  isSelected && 'bg-chess-selected/40 text-foreground font-bold ring-1 ring-chess-selected',
                  isActive && !isSelected && 'bitboard-cell-active',
                  !isActive && !isSelected && 'bitboard-cell-inactive'
                )}
              >
                {isActive || isSelected ? '1' : '0'}
              </div>
            );
          })
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 font-mono bg-muted/30 rounded px-2 py-1.5 overflow-x-auto">
        Value: {legalSquares.size > 0 
          ? Array.from(legalSquares).slice(0, 4).map(i => `2^${i}`).join(' | ') + (legalSquares.size > 4 ? ' ...' : '')
          : '0'
        }
      </p>
    </div>
  );
}
