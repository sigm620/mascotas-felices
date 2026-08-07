import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon, Volume2 } from 'lucide-react';

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
  { emoji: '🐓', letra: 'G', opciones: ['G','J','C','P'], pista: 'Gallo' },
  { emoji: '🦈', letra: 'T', opciones: ['T','D','S','R'], pista: 'Tiburón' },
  { emoji: '🌵', letra: 'C', opciones: ['C','S','K','G'], pista: 'Cactus' },
  { emoji: '🍉', letra: 'S', opciones: ['S','C','Z','P'], pista: 'Sandía' },
  { emoji: '🐓', letra: 'G', opciones: ['G','P','T','C'], pista: 'Gallina' },
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
];

const TOTAL_PREGUNTAS = 8;
const TIEMPO = 20;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Síntesis de voz en español
function hablar(texto: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(texto);
  utt.lang = 'es-ES';
  utt.rate = 0.85;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
}

export function LetraGame({ onComplete, onExit }: LetraGameProps) {
  const [preguntas] = useState(() => shuffle(PREGUNTAS).slice(0, TOTAL_PREGUNTAS));
  const [indice, setIndice] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIEMPO);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [terminado, setTerminado] = useState(false);

  const preguntaActual = preguntas[indice];

  const leerPregunta = useCallback((pista: string) => {
    setTimeout(() => hablar(`¿Con qué letra empieza? ${pista}`), 300);
  }, []);

  useEffect(() => {
    leerPregunta(preguntaActual.pista);
    return () => { window.speechSynthesis?.cancel(); };
  }, [indice, preguntaActual.pista, leerPregunta]);

  useEffect(() => {
    if (terminado || seleccion !== null) return;
    if (timeLeft <= 0) { avanzar(false); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, seleccion, terminado]);

  function avanzar(correcto: boolean) {
    const nuevoScore = correcto ? score + 1 : score;
    if (correcto) setScore(nuevoScore);
    setTimeout(() => {
      if (indice + 1 >= TOTAL_PREGUNTAS) {
        setTerminado(true);
        window.speechSynthesis?.cancel();
        setTimeout(() => onComplete(nuevoScore), 500);
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
    const correcto = opcion === preguntaActual.letra;
    hablar(correcto ? '¡Muy bien!' : `Es la ${preguntaActual.letra}, de ${preguntaActual.pista}`);
    avanzar(correcto);
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

        <div className="text-center mb-2">
          <span className="text-sm font-bold text-yellow-600">⭐ {score} aciertos</span>
        </div>

        <div className="text-center mb-6">
          <div className="text-8xl mb-3">{preguntaActual.emoji}</div>
          <button
            onClick={() => leerPregunta(preguntaActual.pista)}
            className="flex items-center gap-2 mx-auto text-sm font-bold text-purple-600 hover:text-purple-800"
          >
            <Volume2 size={16} />
            ¿Con qué letra empieza?
          </button>
          <p className="text-xs text-gray-400 mt-1">{preguntaActual.pista}</p>
        </div>

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
