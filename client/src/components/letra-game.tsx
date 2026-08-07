import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon, Volume2 } from 'lucide-react';
import { hablar, esperar } from '@/lib/speech';

interface LetraGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const PREGUNTAS = [
  { emoji: '🐶', letra: 'P', opciones: ['P','B','M','T'], pista: 'Perro' },
  { emoji: '🦁', letra: 'L', opciones: ['L','N','R','S'], pista: 'León' },
  { emoji: '🐸', letra: 'S', opciones: ['S','R','G','F'], pista: 'Sapo' },
  { emoji: '🍎', letra: 'M', opciones: ['M','N','P','B'], pista: 'Manzana' },
  { emoji: '🐘', letra: 'E', opciones: ['E','A','O','I'], pista: 'Elefante' },
  { emoji: '🦋', letra: 'M', opciones: ['M','L','P','T'], pista: 'Mariposa' },
  { emoji: '🐬', letra: 'D', opciones: ['D','B','P','G'], pista: 'Delfín' },
  { emoji: '🌺', letra: 'F', opciones: ['F','H','J','L'], pista: 'Flor' },
  { emoji: '🐢', letra: 'T', opciones: ['T','D','C','P'], pista: 'Tortuga' },
  { emoji: '🍌', letra: 'B', opciones: ['B','P','V','M'], pista: 'Banana' },
  { emoji: '🦊', letra: 'Z', opciones: ['Z','S','X','R'], pista: 'Zorro' },
  { emoji: '🐧', letra: 'P', opciones: ['P','B','F','G'], pista: 'Pingüino' },
  { emoji: '🍓', letra: 'F', opciones: ['F','T','H','S'], pista: 'Fresa' },
  { emoji: '🦄', letra: 'U', opciones: ['U','I','O','A'], pista: 'Unicornio' },
  { emoji: '🐙', letra: 'P', opciones: ['P','O','B','C'], pista: 'Pulpo' },
  { emoji: '🐮', letra: 'V', opciones: ['V','B','W','F'], pista: 'Vaca' },
  { emoji: '🦒', letra: 'J', opciones: ['J','G','H','Y'], pista: 'Jirafa' },
  { emoji: '🐼', letra: 'O', opciones: ['O','U','A','E'], pista: 'Oso panda' },
  { emoji: '🦀', letra: 'C', opciones: ['C','G','K','Q'], pista: 'Cangrejo' },
  { emoji: '🦈', letra: 'T', opciones: ['T','D','S','R'], pista: 'Tiburón' },
  { emoji: '🌵', letra: 'C', opciones: ['C','S','K','G'], pista: 'Cactus' },
  { emoji: '🍉', letra: 'S', opciones: ['S','C','Z','P'], pista: 'Sandía' },
  { emoji: '🦜', letra: 'L', opciones: ['L','P','R','N'], pista: 'Loro' },
  { emoji: '🐺', letra: 'L', opciones: ['L','W','N','R'], pista: 'Lobo' },
  { emoji: '🍇', letra: 'U', opciones: ['U','V','I','O'], pista: 'Uvas' },
  { emoji: '🐨', letra: 'K', opciones: ['K','C','G','Q'], pista: 'Koala' },
  { emoji: '🦩', letra: 'F', opciones: ['F','V','P','H'], pista: 'Flamenco' },
  { emoji: '🐦', letra: 'P', opciones: ['P','B','F','V'], pista: 'Pájaro' },
  { emoji: '🍋', letra: 'L', opciones: ['L','R','N','M'], pista: 'Limón' },
  { emoji: '🐰', letra: 'C', opciones: ['C','K','G','S'], pista: 'Conejo' },
  { emoji: '🦝', letra: 'M', opciones: ['M','N','R','P'], pista: 'Mapache' },
  { emoji: '🐷', letra: 'C', opciones: ['C','P','G','S'], pista: 'Cerdo' },
  { emoji: '🌻', letra: 'G', opciones: ['G','J','H','F'], pista: 'Girasol' },
  { emoji: '🦓', letra: 'C', opciones: ['C','Z','S','K'], pista: 'Cebra' },
  { emoji: '🐓', letra: 'G', opciones: ['G','P','T','C'], pista: 'Gallo' },
];

const TOTAL = 8;
const TIEMPO = 20;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function LetraGame({ onComplete, onExit }: LetraGameProps) {
  const [preguntas] = useState(() => shuffle(PREGUNTAS).slice(0, TOTAL));
  const [indice, setIndice] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIEMPO);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const p = preguntas[indice];

  const leerPregunta = useCallback((pista: string) => {
    hablar(`¿Con qué letra empieza? ${pista}`);
  }, []);

  useEffect(() => {
    setBloqueado(false);
    setSeleccion(null);
    setTimeLeft(TIEMPO);
    setTimeout(() => leerPregunta(preguntas[indice].pista), 400);
  }, [indice]);

  useEffect(() => {
    if (bloqueado || seleccion !== null) return;
    if (timeLeft <= 0) { elegir('__timeout__'); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, seleccion, bloqueado]);

  async function elegir(opcion: string) {
    if (bloqueado || seleccion !== null) return;
    setBloqueado(true);
    setSeleccion(opcion);

    const correcto = opcion === p.letra;
    if (correcto) setScore(s => s + 1);

    // Esperar que el audio de retroalimentación termine ANTES de avanzar
    if (correcto) {
      await hablar('¡Muy bien!');
    } else {
      await hablar(`Era la ${p.letra}, de ${p.pista}`);
    }
    await esperar(300);

    if (indice + 1 >= TOTAL) {
      window.speechSynthesis?.cancel();
      onComplete(correcto ? score + 1 : score);
    } else {
      setIndice(i => i + 1);
    }
  }

  const colorOpcion = (op: string) => {
    if (seleccion === null) return 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50';
    if (op === p.letra) return 'bg-green-100 border-2 border-green-500 text-green-800';
    if (op === seleccion && op !== p.letra) return 'bg-red-100 border-2 border-red-400 text-red-700';
    return 'bg-white border-2 border-gray-200 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-200 to-pink-300 p-4 flex items-center justify-center">
      <Card className="w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold font-display text-purple-700">{indice + 1} / {TOTAL}</span>
          <span className={`text-lg font-bold font-display ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
            ⏱ {timeLeft}s
          </span>
          <Button size="sm" variant="ghost" onClick={onExit}><CloseIcon size={18} /></Button>
        </div>

        <div className="text-center mb-2">
          <span className="text-sm font-bold text-yellow-600">⭐ {score} aciertos</span>
        </div>

        <div className="text-center mb-6">
          <div className="text-8xl mb-3">{p.emoji}</div>
          <button onClick={() => leerPregunta(p.pista)}
            className="flex items-center gap-2 mx-auto text-sm font-bold text-purple-600 hover:text-purple-800">
            <Volume2 size={16} /> ¿Con qué letra empieza?
          </button>
          <p className="text-xs text-gray-400 mt-1">{p.pista}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {p.opciones.map(op => (
            <button key={op} onClick={() => elegir(op)}
              className={`py-5 rounded-2xl text-4xl font-bold font-display transition-all active:scale-95 ${colorOpcion(op)}`}>
              {op}
            </button>
          ))}
        </div>

        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-400' : 'bg-purple-400'}`}
            style={{ width: `${(timeLeft / TIEMPO) * 100}%` }} />
        </div>
      </Card>
    </div>
  );
}
