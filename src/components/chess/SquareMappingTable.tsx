import { useState } from 'react';
import { getAllSquares, formatBitboard } from '@/lib/chess';
import { ScrollArea } from '@/components/ui/scroll-area';

export function SquareMappingTable() {
  const [showAll, setShowAll] = useState(false);
  const squares = getAllSquares();
  const displayedSquares = showAll ? squares : squares.filter((_, i) => 
    i === 0 || i === 1 || i === 7 || i === 8 || i === 56 || i === 62 || i === 63
  );

  return (
    <div className="info-panel">
      <h3 className="text-sm font-display font-semibold mb-3 text-foreground flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary/70" />
        Square Mapping
      </h3>
      <ScrollArea className="h-52">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2 px-3 font-semibold">Index</th>
              <th className="text-left py-2 px-3 font-semibold">Square</th>
              <th className="text-left py-2 px-3 font-semibold">Bitboard</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {displayedSquares.map(sq => (
              <tr key={sq.index} className="border-b border-border/30 hover:bg-muted/40 transition-colors">
                <td className="py-2 px-3 text-muted-foreground">{sq.index}</td>
                <td className="py-2 px-3">
                  <span className="text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded">
                    {sq.algebraic}
                  </span>
                </td>
                <td className="py-2 px-3 text-muted-foreground text-[10px]">{formatBitboard(sq.bitboard)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-3 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
      >
        {showAll ? '← Show less' : 'Show all 64 squares →'}
      </button>
    </div>
  );
}
