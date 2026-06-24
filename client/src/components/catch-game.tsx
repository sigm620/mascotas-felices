import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon } from 'lucide-react';

interface CatchGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface FallingItem {
  id: number;
  emoji: string;
  x: number;
  fallDuration: number;
  createdAt: number;
}

const EMOJIS = ['🍎', '🍌', '🍓', '⭐', '💎', '🍊', '🍇', '🌟'];
const GAME_DURATION = 30;

function getDifficulty(timeLeft: number) {
  const elapsed = GAME_DURATION - timeLeft;
  if (elapsed < 10) {
    return { spawnInterval: 1200, fallDuration: 3.0, maxPerSpawn: 1 };
  } else if (elapsed < 20) {
    return { spawnInterval: 700, fallDuration: 2.0, maxPerSpawn: 2 };
  } else {
    return { spawnInterval: 400, fallDuration: 1.2, maxPerSpawn: 3 };
  }
}

export function CatchGame({ onComplete, onExit }: CatchGameProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState(1);

  const timeLeftRef = useRef(GAME_DURATION);
  const scoreRef = useRef(0);
  const isPlayingRef = useRef(true);
  const nextIdRef = useRef(0);

  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const spawnItems = useCallback(() => {
    if (!isPlayingRef.current) return;
    const tl = timeLeftRef.current;
    const { fallDuration, maxPerSpawn } = getDifficulty(tl);
    const count = maxPerSpawn === 1 ? 1 : Math.random() < 0.5 ? 1 : maxPerSpawn;

    const newItems: FallingItem[] = Array.from({ length: count }, () => ({
      id: nextIdRef.current++,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: 5 + Math.random() * 85,
      fallDuration,
      createdAt: Date.now(),
    }));

    setItems((prev) => [...prev, ...newItems]);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setTimeout(() => onComplete(scoreRef.current), 800);
          return 0;
        }
        const next = prev - 1;
        const newPhase = next > 20 ? 1 : next > 10 ? 2 : 3;
        setPhase(newPhase);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, onComplete]);

  useEffect(() => {
    if (!isPlaying) return;
    const { spawnInterval } = getDifficulty(timeLeftRef.current);

    const spawner = setInterval(spawnItems, spawnInterval);
    return () => clearInterval(spawner);
  }, [isPlaying, phase, spawnItems]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setItems((prev) =>
        prev.filter((item) => now - item.createdAt < item.fallDuration * 1000 + 200)
      );
    }, 300);
    return () => clearInterval(cleanup);
  }, []);

  const catchItem = (id: number) => {
    setScore((prev) => prev + 1);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const phaseLabel = phase === 1 ? '🐢 Tranquilo' : phase === 2 ? '⚡ Rápido' : '🔥 ¡Veloz!';
  const phaseColor = phase === 1 ? 'text-green-600' : phase === 2 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-300 to-green-400 p-4 sm:p-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 shadow-2xl" style={{ height: '600px' }}>
          <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
            <div className="text-xl font-bold font-display" data-testid="text-time-left">
              ⏱️ {timeLeft}s
            </div>
            <div className={`text-sm font-bold ${phaseColor}`} data-testid="text-catch-phase">
              {phaseLabel}
            </div>
            <div className="text-xl font-bold font-display text-primary" data-testid="text-catch-score">
              🎯 {score}
            </div>
            <Button
              onClick={onExit}
              variant="destructive"
              data-testid="button-exit-catch"
            >
              <CloseIcon size={18} className="mr-1.5" />
              Salir
            </Button>
          </div>

          <div className="text-center mb-3">
            <p className="text-lg font-semibold font-display">¡Atrapa los objetos!</p>
          </div>

          <div
            className="relative rounded-xl overflow-hidden bg-gradient-to-b from-sky-200 to-sky-100"
            style={{ height: '450px' }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => catchItem(item.id)}
                className="absolute text-4xl hover:scale-125 active:scale-90 transition-transform cursor-pointer"
                style={{
                  left: `${item.x}%`,
                  top: 0,
                  animation: `fall ${item.fallDuration}s linear forwards`,
                }}
                data-testid={`item-catch-${item.id}`}
              >
                {item.emoji}
              </button>
            ))}

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                <div className="bg-white rounded-xl p-6 text-center shadow-xl">
                  <p className="text-2xl font-bold mb-2">¡Tiempo!</p>
                  <p className="text-4xl font-bold text-primary">{score}</p>
                  <p className="text-muted-foreground text-sm">objetos atrapados</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
