import { Square, Piece, getMoveNotation, getSquareInfo } from '@/lib/chess';

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
      <div className="info-panel text-center text-muted-foreground text-sm py-6">
        Select a piece to see available moves
      </div>
    );
  }

  const notation = targetSquare 
    ? getMoveNotation(selectedSquare, targetSquare, selectedPiece, isCapture)
    : null;

  return (
    <div className="info-panel space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Move Input</h3>
      
      <div className="bg-muted/50 rounded p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">From:</span>
          <span className="font-mono font-semibold text-primary">{selectedSquare.algebraic}</span>
        </div>
        
        {targetSquare ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">To:</span>
              <span className="font-mono font-semibold text-primary">{targetSquare.algebraic}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Notation:</span>
              <span className="font-mono font-semibold">{notation}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Valid:</span>
              <span className={isValidMove ? 'text-green-400' : 'text-destructive'}>
                {isValidMove ? '✓ Legal move' : '✗ Illegal'}
              </span>
            </div>
            {isCapture && (
              <div className="text-xs text-destructive">⚔️ Capture move</div>
            )}
          </>
        ) : (
          <div className="text-xs text-muted-foreground">
            Click a highlighted square to select target
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {targetSquare && isValidMove && (
          <button
            onClick={onMakeMove}
            className="flex-1 bg-primary text-primary-foreground py-2 px-3 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Make Move
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex-1 bg-secondary text-secondary-foreground py-2 px-3 rounded text-sm font-medium hover:bg-secondary/90 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
