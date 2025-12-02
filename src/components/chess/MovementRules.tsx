import { PIECE_INFO, PIECE_SYMBOLS, PieceType } from '@/lib/chess';

export function MovementRules() {
  const pieces: PieceType[] = ['K', 'Q', 'R', 'B', 'N', 'P'];

  return (
    <div className="info-panel">
      <h3 className="text-sm font-display font-semibold mb-4 text-foreground flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent" />
        Movement Rules
      </h3>
      <div className="space-y-3">
        {pieces.map(type => {
          const info = PIECE_INFO[type];
          return (
            <div key={type} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-2xl leading-none mt-0.5">{PIECE_SYMBOLS.white[type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">{info.name}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {info.value || '∞'} pts
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{info.movementRule}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
