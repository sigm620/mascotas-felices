import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon, Volume2 } from 'lucide-react';
import { hablar, esperar } from '@/lib/speech';

interface NumerosGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const EMOJIS = ['🍎','⭐','🐶','🌸','🎈','🦋','🍓','🐥','🍕','🎵','🌙','🐠','🍦','🎀','🌈','🍄'];
const TOTAL = 8;
const TIEMPO = 15;

function generarOpciones(correcta: number, min: number, max: number): number[] {
  const ops = new Set<number>([correcta]);
  while (ops.size < 4) {
    const r = Math.floor(Math.random() * (max - min + 1)) + min;
    if (r !== correcta) ops.add(r);
  }
  return Array.from(ops).sort(() => Math.random() - 0.5);
}

function generarPregunta() {
  const tipo = Math.random() < 0.6 ? 'contar' : 'sumar';
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  if (tipo === 'contar') {
    const n = Math.floor(Math.random() * 5) + 1;
    return { tipo, emoji, a: n, b: 0, emoji2: null as string | null, respuesta: n, opciones: generarOpciones(n, 1, 6) };
  } else {
    const a = Math.floor(Math.random() * 3) + 1;
    const b = Math.floor(Math.random() * 3) + 1;
    let emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    while (emoji2 === emoji) emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    return { tipo, emoji, a, b, emoji2, respuesta: a + b, opciones: generarOpciones(a + b, 1, 7) };
  }
}

export function NumerosGame({ onComplete, onExit }: NumerosGameProps) {
  const [preguntas] = useState(() => Array.from({ length: TOTAL }, generarPregunta));
  const [indice, setIndice] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIEMPO);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const p = preguntas[indice];

  const leerPregunta = useCallback((tipo: string) => {
    hablar(tipo === 'contar' ? '¿Cuántos hay?' : '¿Cuántos hay en total?');
  }, []);

  useEffect(() => {
    setBloqueado(false);
    setSeleccion(null);
    setTimeLeft(TIEMPO);
    setTimeout(() => leerPregunta(preguntas[indice].tipo), 400);
  }, [indice]);

  useEffect(() => {
    if (bloqueado || seleccion !== null) return;
    if (timeLeft <= 0) { elegir(-1); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, seleccion, bloqueado]);

  async function elegir(op: number) {
    if (bloqueado || seleccion !== null) return;
    setBloqueado(true);
    setSeleccion(op);

    const correcto = op === p.respuesta;
    if (correcto) setScore(s => s + 1);

    if (correcto) {
      await hablar('¡Correcto!');
    } else {
      await hablar(`Son ${p.respuesta}`);
    }
    await esperar(300);

    if (indice + 1 >= TOTAL) {
      window.speechSynthesis?.cancel();
      onComplete(correcto ? score + 1 : score);
    } else {
      setIndice(i => i + 1);
    }
  }

  const colorOpcion = (op: number) => {
    if (seleccion === null) return 'bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50';
    if (op === p.respuesta) return 'bg-green-100 border-2 border-green-500 text-green-800';
    if (op === seleccion && op !== p.respuesta) return 'bg-red-100 border-2 border-red-400 text-red-700';
    return 'bg-white border-2 border-gray-200 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-teal-300 p-4 flex items-center justify-center">
      <Card className="w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold font-display text-blue-700">{indice + 1} / {TOTAL}</span>
          <span className={`text-lg font-bold font-display ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
            ⏱ {timeLeft}s
          </span>
          <Button size="sm" variant="ghost" onClick={onExit}><CloseIcon size={18} /></Button>
        </div>

        <div className="text-center mb-2">
          <span className="text-sm font-bold text-blue-600">⭐ {score} aciertos</span>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 mb-4 text-center min-h-32 flex flex-col items-center justify-center">
          {p.tipo === 'contar' ? (
            <div className="text-4xl mb-2 flex flex-wrap justify-center gap-1">
              {Array.from({ length: p.a }, (_, i) => <span key={i}>{p.emoji}</span>)}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-3xl mb-2 flex-wrap justify-center">
              <span className="flex gap-1">{Array.from({ length: p.a }, (_, i) => <span key={i}>{p.emoji}</span>)}</span>
              <span className="text-2xl font-bold text-gray-500">+</span>
              <span className="flex gap-1">{Array.from({ length: p.b }, (_, i) => <span key={i}>{p.emoji2}</span>)}</span>
            </div>
          )}
          <button onClick={() => leerPregunta(p.tipo)}
            className="flex items-center gap-1 mx-auto text-sm font-bold text-blue-600 hover:text-blue-800 mt-2">
            <Volume2 size={14} />
            {p.tipo === 'contar' ? '¿Cuántos hay?' : '¿Cuántos en total?'}
          </button>
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
          <div className={`h-2 rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-400' : 'bg-blue-400'}`}
            style={{ width: `${(timeLeft / TIEMPO) * 100}%` }} />
        </div>
      </Card>
    </div>
  );
}
