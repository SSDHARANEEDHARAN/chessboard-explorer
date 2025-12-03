import { Chessboard } from '@/components/chess/Chessboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border py-4 px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="text-4xl drop-shadow-lg">♞</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">Chess System</h1>
            <p className="text-sm text-muted-foreground">
              Interactive Chess Educational Platform
            </p>
          </div>
        </div>
      </header>
      
      <main className="py-6 flex-1">
        <Chessboard />
      </main>

      <footer className="border-t border-border py-6 px-6 bg-card/30 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">Chess System</strong> — An interactive educational tool for learning chess fundamentals
            </div>
            <p className="text-xs text-muted-foreground">
              Explore square notation (A1-H8), index mapping (0-63), bitboard representation, 
              piece movement rules, and move validation in an intuitive visual interface.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Designed by <span className="text-primary font-medium">Tharanee</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
