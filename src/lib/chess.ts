// Chess types and utilities

export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  index: number;
  file: string;
  rank: number;
  algebraic: string;
  isLight: boolean;
  bitboard: bigint;
}

export interface PieceInfo {
  name: string;
  symbol: string;
  id: PieceType;
  value: number;
  movementRule: string;
}

export const PIECE_INFO: Record<PieceType, PieceInfo> = {
  K: { name: 'King', symbol: '♔', id: 'K', value: 0, movementRule: 'Moves 1 square in any direction. Cannot move into check.' },
  Q: { name: 'Queen', symbol: '♕', id: 'Q', value: 9, movementRule: 'Moves any number of squares horizontally, vertically, or diagonally.' },
  R: { name: 'Rook', symbol: '♖', id: 'R', value: 5, movementRule: 'Moves any number of squares horizontally or vertically.' },
  B: { name: 'Bishop', symbol: '♗', id: 'B', value: 3, movementRule: 'Moves any number of squares diagonally.' },
  N: { name: 'Knight', symbol: '♘', id: 'N', value: 3, movementRule: 'Moves in L-shape (±1, ±2 or ±2, ±1). Can jump over pieces.' },
  P: { name: 'Pawn', symbol: '♙', id: 'P', value: 1, movementRule: 'Moves forward 1 square (2 on first move). Captures diagonally.' },
};

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

const FILES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function getSquareInfo(index: number): Square {
  const file = FILES[index % 8];
  const rank = Math.floor(index / 8) + 1;
  const algebraic = `${file}${rank}`;
  const fileIndex = index % 8;
  const rankIndex = Math.floor(index / 8);
  const isLight = (fileIndex + rankIndex) % 2 === 1;
  const bitboard = BigInt(1) << BigInt(index);

  return { index, file, rank, algebraic, isLight, bitboard };
}

export function getAllSquares(): Square[] {
  return Array.from({ length: 64 }, (_, i) => getSquareInfo(i));
}

export function getInitialPosition(): Map<number, Piece> {
  const position = new Map<number, Piece>();

  // White pieces
  position.set(0, { type: 'R', color: 'white' });
  position.set(1, { type: 'N', color: 'white' });
  position.set(2, { type: 'B', color: 'white' });
  position.set(3, { type: 'Q', color: 'white' });
  position.set(4, { type: 'K', color: 'white' });
  position.set(5, { type: 'B', color: 'white' });
  position.set(6, { type: 'N', color: 'white' });
  position.set(7, { type: 'R', color: 'white' });
  for (let i = 8; i < 16; i++) {
    position.set(i, { type: 'P', color: 'white' });
  }

  // Black pieces
  position.set(56, { type: 'R', color: 'black' });
  position.set(57, { type: 'N', color: 'black' });
  position.set(58, { type: 'B', color: 'black' });
  position.set(59, { type: 'Q', color: 'black' });
  position.set(60, { type: 'K', color: 'black' });
  position.set(61, { type: 'B', color: 'black' });
  position.set(62, { type: 'N', color: 'black' });
  position.set(63, { type: 'R', color: 'black' });
  for (let i = 48; i < 56; i++) {
    position.set(i, { type: 'P', color: 'black' });
  }

  return position;
}

export function getLegalMoves(
  pieceIndex: number,
  piece: Piece,
  position: Map<number, Piece>
): { moves: number[]; captures: number[] } {
  const moves: number[] = [];
  const captures: number[] = [];
  const file = pieceIndex % 8;
  const rank = Math.floor(pieceIndex / 8);

  const addMove = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex > 63) return false;
    const targetPiece = position.get(targetIndex);
    if (targetPiece) {
      if (targetPiece.color !== piece.color) {
        captures.push(targetIndex);
      }
      return false;
    }
    moves.push(targetIndex);
    return true;
  };

  const addCapture = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex > 63) return;
    const targetPiece = position.get(targetIndex);
    if (targetPiece && targetPiece.color !== piece.color) {
      captures.push(targetIndex);
    }
  };

  switch (piece.type) {
    case 'K': {
      const directions = [-9, -8, -7, -1, 1, 7, 8, 9];
      directions.forEach(d => {
        const target = pieceIndex + d;
        const targetFile = target % 8;
        if (Math.abs(targetFile - file) <= 1) {
          addMove(target);
        }
      });
      break;
    }

    case 'Q': {
      // Rook moves
      for (let i = file + 1; i < 8; i++) if (!addMove(rank * 8 + i)) break;
      for (let i = file - 1; i >= 0; i--) if (!addMove(rank * 8 + i)) break;
      for (let i = rank + 1; i < 8; i++) if (!addMove(i * 8 + file)) break;
      for (let i = rank - 1; i >= 0; i--) if (!addMove(i * 8 + file)) break;
      // Bishop moves
      for (let i = 1; file + i < 8 && rank + i < 8; i++) if (!addMove((rank + i) * 8 + file + i)) break;
      for (let i = 1; file - i >= 0 && rank + i < 8; i++) if (!addMove((rank + i) * 8 + file - i)) break;
      for (let i = 1; file + i < 8 && rank - i >= 0; i++) if (!addMove((rank - i) * 8 + file + i)) break;
      for (let i = 1; file - i >= 0 && rank - i >= 0; i++) if (!addMove((rank - i) * 8 + file - i)) break;
      break;
    }

    case 'R': {
      for (let i = file + 1; i < 8; i++) if (!addMove(rank * 8 + i)) break;
      for (let i = file - 1; i >= 0; i--) if (!addMove(rank * 8 + i)) break;
      for (let i = rank + 1; i < 8; i++) if (!addMove(i * 8 + file)) break;
      for (let i = rank - 1; i >= 0; i--) if (!addMove(i * 8 + file)) break;
      break;
    }

    case 'B': {
      for (let i = 1; file + i < 8 && rank + i < 8; i++) if (!addMove((rank + i) * 8 + file + i)) break;
      for (let i = 1; file - i >= 0 && rank + i < 8; i++) if (!addMove((rank + i) * 8 + file - i)) break;
      for (let i = 1; file + i < 8 && rank - i >= 0; i++) if (!addMove((rank - i) * 8 + file + i)) break;
      for (let i = 1; file - i >= 0 && rank - i >= 0; i++) if (!addMove((rank - i) * 8 + file - i)) break;
      break;
    }

    case 'N': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      knightMoves.forEach(([dr, df]) => {
        const newRank = rank + dr;
        const newFile = file + df;
        if (newRank >= 0 && newRank < 8 && newFile >= 0 && newFile < 8) {
          addMove(newRank * 8 + newFile);
        }
      });
      break;
    }

    case 'P': {
      const direction = piece.color === 'white' ? 1 : -1;
      const startRank = piece.color === 'white' ? 1 : 6;
      
      // Forward move
      const forward = pieceIndex + direction * 8;
      if (forward >= 0 && forward < 64 && !position.has(forward)) {
        moves.push(forward);
        // Double move from start
        if (rank === startRank) {
          const doubleForward = pieceIndex + direction * 16;
          if (!position.has(doubleForward)) {
            moves.push(doubleForward);
          }
        }
      }
      
      // Captures
      const captureLeft = pieceIndex + direction * 8 - 1;
      const captureRight = pieceIndex + direction * 8 + 1;
      if (file > 0) addCapture(captureLeft);
      if (file < 7) addCapture(captureRight);
      break;
    }
  }

  return { moves, captures };
}

export function formatBitboard(value: bigint): string {
  if (value === BigInt(0)) return '0';
  const power = value.toString(2).length - 1;
  if (power < 10) return value.toString();
  return `2^${power}`;
}

export function getMoveNotation(from: Square, to: Square, piece: Piece, isCapture: boolean): string {
  const pieceNotation = piece.type === 'P' ? '' : piece.type;
  const captureNotation = isCapture ? 'x' : '';
  const fromFile = piece.type === 'P' && isCapture ? from.file.toLowerCase() : '';
  return `${pieceNotation}${fromFile}${captureNotation}${to.algebraic.toLowerCase()}`;
}

// FEN notation utilities
const FEN_PIECE_MAP: Record<string, { type: PieceType; color: PieceColor }> = {
  'K': { type: 'K', color: 'white' },
  'Q': { type: 'Q', color: 'white' },
  'R': { type: 'R', color: 'white' },
  'B': { type: 'B', color: 'white' },
  'N': { type: 'N', color: 'white' },
  'P': { type: 'P', color: 'white' },
  'k': { type: 'K', color: 'black' },
  'q': { type: 'Q', color: 'black' },
  'r': { type: 'R', color: 'black' },
  'b': { type: 'B', color: 'black' },
  'n': { type: 'N', color: 'black' },
  'p': { type: 'P', color: 'black' },
};

export function positionToFen(position: Map<number, Piece>): string {
  const rows: string[] = [];
  
  for (let rank = 7; rank >= 0; rank--) {
    let row = '';
    let emptyCount = 0;
    
    for (let file = 0; file < 8; file++) {
      const index = rank * 8 + file;
      const piece = position.get(index);
      
      if (piece) {
        if (emptyCount > 0) {
          row += emptyCount;
          emptyCount = 0;
        }
        const fenChar = piece.type;
        row += piece.color === 'white' ? fenChar : fenChar.toLowerCase();
      } else {
        emptyCount++;
      }
    }
    
    if (emptyCount > 0) {
      row += emptyCount;
    }
    rows.push(row);
  }
  
  return rows.join('/') + ' w KQkq - 0 1';
}

export function fenToPosition(fen: string): Map<number, Piece> | null {
  try {
    const position = new Map<number, Piece>();
    const parts = fen.trim().split(' ');
    const boardPart = parts[0];
    const rows = boardPart.split('/');
    
    if (rows.length !== 8) return null;
    
    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      const rank = 7 - rankIndex;
      let file = 0;
      
      for (const char of rows[rankIndex]) {
        if (file >= 8) return null;
        
        const digit = parseInt(char);
        if (!isNaN(digit)) {
          file += digit;
        } else {
          const pieceInfo = FEN_PIECE_MAP[char];
          if (!pieceInfo) return null;
          
          const index = rank * 8 + file;
          position.set(index, { type: pieceInfo.type, color: pieceInfo.color });
          file++;
        }
      }
      
      if (file !== 8) return null;
    }
    
    return position;
  } catch {
    return null;
  }
}

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
