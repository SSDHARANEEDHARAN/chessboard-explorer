import { cn } from '@/lib/utils';

interface BitboardGridProps {
  legalSquares: Set<number>;
  selectedSquare?: number;
}

export function BitboardGrid({ legalSquares, selectedSquare }: BitboardGridProps) {
  // Display board from rank 8 to rank 1 (top to bottom)
  const rows = Array.from({ length: 8 }, (_, i) => 7 - i);

  return (
    <div className="info-panel">
      <h3 className="text-sm font-semibold mb-2 text-foreground">Bitboard Visualization</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Legal moves shown as 1s in the 64-bit bitboard
      </p>
      <div className="grid grid-cols-8 gap-0 border border-border rounded overflow-hidden">
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
                  isSelected && 'bg-chess-selected/50 text-foreground',
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
      <p className="text-[10px] text-muted-foreground mt-2 font-mono">
        Bitboard value: {legalSquares.size > 0 
          ? Array.from(legalSquares).map(i => `2^${i}`).join(' | ')
          : '0'
        }
      </p>
    </div>
  );
}
