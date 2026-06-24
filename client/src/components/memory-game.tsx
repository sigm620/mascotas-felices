import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon, Flame } from 'lucide-react';

interface MemoryGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface MemoryCard {
  id: number;
  emoji: string;
}

export function MemoryGame({ onComplete, onExit }: MemoryGameProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [streakFlash, setStreakFlash] = useState(false);

  useEffect(() => {
    const emojis = ['🍎', '🍌', '🍇', '🍓', '🍉', '🍊'];
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, idx) => ({ id: idx, emoji }));
    setCards(shuffledCards);
  }, []);

  const flipCard = (id: number) => {
    if (
      flippedCards.length === 2 ||
      flippedCards.includes(id) ||
      matchedCards.includes(id)
    ) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        const newMatched = [...matchedCards, first, second];
        setMatchedCards(newMatched);
        setFlippedCards([]);

        const newStreak = streak + 1;
        const pointsEarned = newStreak;
        setStreak(newStreak);
        setScore((prev) => {
          const newScore = prev + pointsEarned;
          if (newMatched.length === cards.length) {
            setTimeout(() => onComplete(newScore), 500);
          }
          return newScore;
        });

        if (newStreak > 1) {
          setStreakFlash(true);
          setTimeout(() => setStreakFlash(false), 600);
        }
      } else {
        setStreak(0);
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-2xl font-bold font-display text-primary">
              Juego de Memoria
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                Movimientos: <span className="font-bold text-foreground">{moves}</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                Puntos: <span className="font-bold text-foreground" data-testid="text-memory-score">{score}</span>
              </div>
              {streak > 1 && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-100 text-orange-600 text-sm font-bold transition-all ${streakFlash ? 'scale-125' : 'scale-100'}`}
                  data-testid="text-memory-streak"
                >
                  <Flame className="w-3.5 h-3.5" />
                  {streak}x racha
                </div>
              )}
            </div>
            <Button
              onClick={onExit}
              variant="destructive"
              data-testid="button-exit-memory"
            >
              <CloseIcon size={18} className="mr-1.5" />
              Salir
            </Button>
          </div>

          {streak > 1 && (
            <p className="text-center text-sm text-orange-500 font-semibold mb-3">
              ¡Racha x{streak}! Cada pareja vale {streak} puntos
            </p>
          )}

          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => {
              const isRevealed = flippedCards.includes(card.id) || matchedCards.includes(card.id);
              const isMatched = matchedCards.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => flipCard(card.id)}
                  disabled={isMatched}
                  className={`aspect-square rounded-xl text-4xl font-bold transition-all transform hover:scale-105 active:scale-95 ${
                    isMatched
                      ? 'bg-green-100 border-4 border-green-400 shadow-lg opacity-70'
                      : isRevealed
                      ? 'bg-white border-4 border-primary shadow-lg'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }`}
                  data-testid={`card-memory-${card.id}`}
                >
                  {isRevealed ? card.emoji : '?'}
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            ¡Acierta pares seguidos sin fallar para ganar más puntos!
          </p>
        </Card>
      </div>
    </div>
  );
}
