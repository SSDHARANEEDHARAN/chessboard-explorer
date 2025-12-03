import { Chessboard } from '@/components/chess/Chessboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border py-4 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="text-3xl">♞</span>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">Chess System</h1>
            <p className="text-sm text-muted-foreground">
              Learn squares, bitboards, and piece movements
            </p>
          </div>
        </div>
      </header>
      
      <main className="py-6">
        <Chessboard />
      </main>
    </div>
  );
};

export default Index;
