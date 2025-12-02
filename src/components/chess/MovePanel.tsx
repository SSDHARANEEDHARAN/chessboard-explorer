import { Square, Piece, getMoveNotation } from '@/lib/chess';

interface MovePanelProps {
  selectedSquare?: Square;
  selectedPiece?: Piece;
  targetSquare?: Square;
  isValidMove: boolean;
  isCapture: boolean;
  onMakeMove: () => void;
  onCancel: () => void;
}

export function MovePanel({
  selectedSquare,
  selectedPiece,
  targetSquare,
  isValidMove,
  isCapture,
  onMakeMove,
  onCancel,
}: MovePanelProps) {
  if (!selectedSquare || !selectedPiece) {
    return (
      <div className="info-panel flex items-center justify-center text-muted-foreground text-sm py-8">
        <div className="text-center">
          <div className="text-2xl mb-2 opacity-50">↗</div>
          <p>Select a piece to see available moves</p>
        </div>
      </div>
    );
  }

  const notation = targetSquare 
    ? getMoveNotation(selectedSquare, targetSquare, selectedPiece, isCapture)
    : null;

  return (
    <div className="info-panel space-y-4">
      <h3 className="text-sm font-display font-semibold text-foreground flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent" />
        Move Input
      </h3>
      
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">From:</span>
          <span className="font-mono font-bold text-lg text-primary bg-primary/10 px-3 py-1 rounded">
            {selectedSquare.algebraic}
          </span>
        </div>
        
        {targetSquare ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">To:</span>
              <span className="font-mono font-bold text-lg text-primary bg-primary/10 px-3 py-1 rounded">
                {targetSquare.algebraic}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-muted-foreground text-sm">Notation:</span>
              <span className="font-mono font-bold text-foreground">{notation}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Status:</span>
              <span className={`font-medium px-2 py-0.5 rounded text-sm ${isValidMove ? 'bg-green-500/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                {isValidMove ? '✓ Legal' : '✗ Illegal'}
              </span>
            </div>
            {isCapture && (
              <div className="flex items-center gap-2 text-sm bg-destructive/10 text-destructive px-3 py-2 rounded-lg">
                <span>⚔</span>
                <span className="font-medium">Capture move</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 text-center">
            Click a highlighted square to select target
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {targetSquare && isValidMove && (
          <button
            onClick={onMakeMove}
            className="flex-1 bg-primary text-primary-foreground py-2.5 px-4 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Make Move
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex-1 bg-secondary text-secondary-foreground py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
