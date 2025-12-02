import { PIECE_INFO, PIECE_SYMBOLS, PieceType } from '@/lib/chess';

export function MovementRules() {
  const pieces: PieceType[] = ['K', 'Q', 'R', 'B', 'N', 'P'];

  return (
    <div className="info-panel">
      <h3 className="text-sm font-semibold mb-3 text-foreground">Movement Rules</h3>
      <div className="space-y-2">
        {pieces.map(type => {
          const info = PIECE_INFO[type];
          return (
            <div key={type} className="flex items-start gap-2 text-xs">
              <span className="text-xl leading-none">{PIECE_SYMBOLS.white[type]}</span>
              <div>
                <span className="font-semibold text-foreground">{info.name}</span>
                <span className="text-muted-foreground ml-1">({info.value || '∞'})</span>
                <p className="text-muted-foreground mt-0.5">{info.movementRule}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
