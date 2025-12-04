import { useState, useCallback } from 'react';
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

export function FenPanel({ currentFen, onImport, onReset }: FenPanelProps) {
  const [inputFen, setInputFen] = useState('');

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
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="text-primary">♜</span>
        FEN vignesh
      </h3>

      {/* Current Position Export */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-medium">Current Position</label>
        <div className="relative">
          <Textarea
            value={currentFen}
            readOnly
            className="text-xs font-mono bg-muted/30 resize-none h-16 pr-10"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-1 right-1 h-7 w-7"
            onClick={handleCopy}
            title="Copy FEN"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Import Section */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-medium">Import Position</label>
        <Textarea
          value={inputFen}
          onChange={(e) => setInputFen(e.target.value)}
          placeholder="Paste FEN notation here..."
          className="text-xs font-mono resize-none h-16"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={handleImport}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Load Position
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={handleLoadStarting}
            title="Load starting position FEN"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Quick Info */}
      <div className="text-[10px] text-muted-foreground/70 leading-relaxed border-t border-border/50 pt-3">
        <p><strong>FEN</strong> (Forsyth–Edwards Notation) describes a chess position.</p>
        <p className="mt-1">Format: pieces/ranks active castling en-passant halfmove fullmove</p>
      </div>
    </div>
  );
}
