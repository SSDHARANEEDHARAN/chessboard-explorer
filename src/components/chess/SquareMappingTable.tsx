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
      <h3 className="text-sm font-semibold mb-2 text-foreground">Square Mapping</h3>
      <ScrollArea className="h-48">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-1 px-2">Index</th>
              <th className="text-left py-1 px-2">Square</th>
              <th className="text-left py-1 px-2">Bitboard</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {displayedSquares.map(sq => (
              <tr key={sq.index} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-1 px-2">{sq.index}</td>
                <td className="py-1 px-2 text-primary">{sq.algebraic}</td>
                <td className="py-1 px-2 text-muted-foreground">{formatBitboard(sq.bitboard)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-2 text-xs text-primary hover:underline"
      >
        {showAll ? 'Show less' : 'Show all 64 squares'}
      </button>
    </div>
  );
}
