import { Chessboard } from '@/components/chess/Chessboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Chess Educational Tool</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Learn about squares, bitboards, and piece movements
          </p>
        </div>
      </header>
      
      <main className="py-6">
        <Chessboard />
      </main>

      <footer className="border-t border-border py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-xs text-muted-foreground">
          Click any square to see its algebraic notation, index, and bitboard value.
          Select a piece to see legal moves and make moves on the board.
        </div>
      </footer>
    </div>
  );
};

export default Index;
