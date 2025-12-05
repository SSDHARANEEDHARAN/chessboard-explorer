import { useState, useCallback, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Upload, RotateCcw } from 'lucide-react';
import { STARTING_FEN } from '@/lib/chess';

interface FenPanelProps {
  currentFen: string;
  onImport: (fen: string) => boolean;
  onReset: () => void;
}

interface FenPart {
  label: string;
  value: string;
  explanation: string;
}

function parseFenParts(fen: string): FenPart[] {
  const parts = fen.trim().split(' ');
  const explanations: FenPart[] = [];

  // Piece placement
  if (parts[0]) {
    const ranks = parts[0].split('/');
    explanations.push({
      label: 'Piece Placement',
      value: parts[0],
      explanation: `8 ranks from rank 8 to rank 1. Uppercase = White pieces (K=King, Q=Queen, R=Rook, B=Bishop, N=Knight, P=Pawn). Lowercase = Black pieces. Numbers = empty squares.`
    });
  }

  // Active color
  if (parts[1]) {
    explanations.push({
      label: 'Active Color',
      value: parts[1],
      explanation: parts[1] === 'w' 
        ? '"w" means White to move next' 
        : '"b" means Black to move next'
    });
  }

  // Castling availability
  if (parts[2]) {
    let castlingExpl = '';
    if (parts[2] === '-') {
      castlingExpl = 'No castling available for either side';
    } else {
      const c = parts[2];
      const rights = [];
      if (c.includes('K')) rights.push('White can castle kingside (O-O)');
      if (c.includes('Q')) rights.push('White can castle queenside (O-O-O)');
      if (c.includes('k')) rights.push('Black can castle kingside');
      if (c.includes('q')) rights.push('Black can castle queenside');
      castlingExpl = rights.join('. ');
    }
    explanations.push({
      label: 'Castling Rights',
      value: parts[2],
      explanation: castlingExpl
    });
  }

  // En passant
  if (parts[3]) {
    explanations.push({
      label: 'En Passant Target',
      value: parts[3],
      explanation: parts[3] === '-' 
        ? 'No en passant capture available' 
        : `En passant capture possible on square ${parts[3].toUpperCase()}`
    });
  }

  // Halfmove clock
  if (parts[4]) {
    explanations.push({
      label: 'Halfmove Clock',
      value: parts[4],
      explanation: `${parts[4]} moves since last pawn move or capture. Used for 50-move draw rule.`
    });
  }

  // Fullmove number
  if (parts[5]) {
    explanations.push({
      label: 'Fullmove Number',
      value: parts[5],
      explanation: `This is move number ${parts[5]} of the game. Increments after Black moves.`
    });
  }

  return explanations;
}

export function FenPanel({ currentFen, onImport, onReset }: FenPanelProps) {
  const [inputFen, setInputFen] = useState('');

  const fenParts = useMemo(() => parseFenParts(currentFen), [currentFen]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentFen);
    toast.success('FEN copied to clipboard');
  }, [currentFen]);

  const handleImport = useCallback(() => {
    const fenToImport = inputFen.trim();
    if (!fenToImport) {
      toast.error('Please enter a FEN string');
      return;
    }
    
    const success = onImport(fenToImport);
    if (success) {
      toast.success('Position loaded successfully');
      setInputFen('');
    } else {
      toast.error('Invalid FEN notation');
    }
  }, [inputFen, onImport]);

  const handleLoadStarting = useCallback(() => {
    setInputFen(STARTING_FEN);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <span className="text-primary">♜</span>
        FEN Vignesh - Position Notation
      </h3>

      {/* Current Position Export */}
      <div className="space-y-2">
        <label className="text-sm text-muted-foreground font-medium">Current Position FEN</label>
        <div className="relative">
          <Textarea
            value={currentFen}
            readOnly
            className="text-sm font-mono bg-muted/30 resize-none h-14 pr-10"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-8 w-8"
            onClick={handleCopy}
            title="Copy FEN"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* FEN Breakdown */}
      <div className="space-y-3">
        <label className="text-sm text-muted-foreground font-medium">FEN Breakdown - What Each Part Means</label>
        <div className="grid gap-2">
          {fenParts.map((part, idx) => (
            <div key={idx} className="bg-muted/20 rounded-lg p-3 border border-border/50">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-primary">{part.label}</span>
                <code className="text-xs bg-background px-2 py-0.5 rounded font-mono text-accent">
                  {part.value.length > 30 ? part.value.slice(0, 30) + '...' : part.value}
                </code>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{part.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Import Section */}
      <div className="space-y-2 border-t border-border/50 pt-4">
        <label className="text-sm text-muted-foreground font-medium">Import Position</label>
        <Textarea
          value={inputFen}
          onChange={(e) => setInputFen(e.target.value)}
          placeholder="Paste FEN notation here to load a position..."
          className="text-sm font-mono resize-none h-14"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleImport}
          >
            <Upload className="h-4 w-4 mr-2" />
            Load Position
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLoadStarting}
            title="Load starting position FEN"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}