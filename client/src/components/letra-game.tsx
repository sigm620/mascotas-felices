import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon } from 'lucide-react';

interface LetraGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const PREGUNTAS = [
  { emoji: '🐶', letra: 'P', opciones: ['P', 'B', 'M', 'T'], pista: 'Perro' },
  { emoji: '🦁', letra: 'L', opciones: ['L', 'N', 'R', 'S'], pista: 'León' },
  { emoji: '🐸', letra: 'S', opciones: ['S', 'R', 'G', 'F'], pista: 'Sapo' },
  { emoji: '🍎', letra: 'M', opciones: ['M', 'N', 'P', 'B'], pista: 'Manzana' },
  { emoji: '🐘', letra: 'E', opciones: ['E', 'A', 'O', 'I'], pista: 'Elefante' },
  { emoji: '🦋', letra: 'M', opciones: ['M', 'L', 'P', 'T'], pista: 'Mariposa' },
  { emoji: '🐬', letra: 'D', opciones: ['D', 'B', 'P', 'G'], pista: 'Delfín' },
  { emoji: '🌺', letra: 'F', opciones: ['F', 'H', 'J', 'L'], pista: 'Flor' },
  { emoji: '🐢', letra: 'T', opciones: ['T', 'D', 'C', 'P'], pista: 'Tortuga' },
  { emoji: '🍌', letra: 'B', opciones: ['B', 'P', 'V', 'M'], pista: 'Banana' },
  { emoji: '🦊', letra: 'Z', opciones: ['Z', 'S', 'X', 'R'], pista: 'Zorro' },
  { emoji: '🐧', letra: 'P', opciones: ['P', 'B', 'F', 'G'], pista: 'Pingüino' },
  { emoji: '🍓', letra: 'F', opciones: ['F', 'T', 'H', 'S'], pista: 'Fresa' },
  { emoji: '🦄', letra: 'U', opciones: ['U', 'I', 'O', 'A'], pista: 'Unicornio' },
  { emoji: '🐙', letra: 'P', opciones: ['P', 'O', 'B', 'C'], pista: 'Pulpo' },
];

const TOTAL_PREGUNTAS = 8;
const TIEMPO = 20;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function LetraGame({ onComplete, onExit }: LetraGameProps) {
  const [preguntas] = useState(() => shuffle(PREGUNTAS).slice(0, TOTAL_PREGUNTAS));
  const [indice, setIndice] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIEMPO);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [terminado, setTerminado] = useState(false);

  const preguntaActual = preguntas[indice];

  useEffect(() => {
    if (terminado || seleccion !== null) return;
    if (timeLeft <= 0) {
      avanzar(false);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, seleccion, terminado]);

  function avanzar(correcto: boolean) {
    if (correcto) setScore(s => s + 1);
    setTimeout(() => {
      if (indice + 1 >= TOTAL_PREGUNTAS) {
        setTerminado(true);
        setTimeout(() => onComplete(correcto ? score + 1 : score), 1000);
      } else {
        setIndice(i => i + 1);
        setSeleccion(null);
        setTimeLeft(TIEMPO);
      }
    }, 800);
  }

  function elegir(opcion: string) {
    if (seleccion !== null) return;
    setSeleccion(opcion);
    avanzar(opcion === preguntaActual.letra);
  }

  const coloresOpcion = (op: string) => {
    if (seleccion === null) return 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50';
    if (op === preguntaActual.letra) return 'bg-green-100 border-2 border-green-500 text-green-800';
    if (op === seleccion) return 'bg-red-100 border-2 border-red-400 text-red-700';
    return 'bg-white border-2 border-gray-200 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-200 to-pink-300 p-4 flex items-center justify-center">
      <Card className="w-full max-w-sm p-6 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold font-display text-purple-700">
            {indice + 1} / {TOTAL_PREGUNTAS}
          </span>
          <span className={`text-lg font-bold font-display ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
            ⏱ {timeLeft}s
          </span>
          <Button size="sm" variant="ghost" onClick={onExit}>
            <CloseIcon size={18} />
          </Button>
        </div>

        {/* Puntos */}
        <div className="text-center mb-2">
          <span className="text-sm font-bold text-yellow-600">⭐ {score} aciertos</span>
        </div>

        {/* Pregunta */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-3">{preguntaActual.emoji}</div>
          <p className="text-base font-bold text-gray-600">
            ¿Con qué letra empieza?
          </p>
          <p className="text-xs text-gray-400 mt-1">{preguntaActual.pista}</p>
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-2 gap-3">
          {preguntaActual.opciones.map(op => (
            <button
              key={op}
              onClick={() => elegir(op)}
              className={`py-5 rounded-2xl text-4xl font-bold font-display transition-all active:scale-95 ${coloresOpcion(op)}`}
            >
              {op}
            </button>
          ))}
        </div>

        {/* Barra de tiempo */}
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-400' : 'bg-purple-400'}`}
            style={{ width: `${(timeLeft / TIEMPO) * 100}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
