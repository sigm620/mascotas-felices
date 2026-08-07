import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon, Volume2 } from 'lucide-react';

interface NumerosGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const EMOJIS_CONTEO = ['🍎','⭐','🐶','🌸','🎈','🦋','🍓','🐥','🍕','🎵','🌙','🐠','🍦','🎀','🌈','🍄'];
const TOTAL_PREGUNTAS = 8;
const TIEMPO = 15;

function hablar(texto: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(texto);
  utt.lang = 'es-ES';
  utt.rate = 0.85;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
}

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
  const emoji = EMOJIS_CONTEO[Math.floor(Math.random() * EMOJIS_CONTEO.length)];

  if (tipo === 'contar') {
    const cantidad = Math.floor(Math.random() * 5) + 1;
    const opciones = generarOpciones(cantidad, 1, 6);
    return { tipo, emoji, cantidad, respuesta: cantidad, opciones, emoji2: null as string | null, cantidad2: 0 };
  } else {
    const a = Math.floor(Math.random() * 3) + 1;
    const b = Math.floor(Math.random() * 3) + 1;
    let emoji2 = EMOJIS_CONTEO[Math.floor(Math.random() * EMOJIS_CONTEO.length)];
    while (emoji2 === emoji) emoji2 = EMOJIS_CONTEO[Math.floor(Math.random() * EMOJIS_CONTEO.length)];
    const respuesta = a + b;
    const opciones = generarOpciones(respuesta, 1, 7);
    return { tipo, emoji, cantidad: a, respuesta, opciones, emoji2, cantidad2: b };
  }
}

export function NumerosGame({ onComplete, onExit }: NumerosGameProps) {
  const [preguntas] = useState(() => Array.from({ length: TOTAL_PREGUNTAS }, generarPregunta));
  const [indice, setIndice] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIEMPO);
  const [seleccion, setSeleccion] = useState<number | null>(null);

  const p = preguntas[indice];

  const leerPregunta = useCallback((tipo: string) => {
    const texto = tipo === 'contar' ? '¿Cuántos hay?' : '¿Cuántos hay en total?';
    setTimeout(() => hablar(texto), 300);
  }, []);

  useEffect(() => {
    leerPregunta(p.tipo);
    return () => { window.speechSynthesis?.cancel(); };
  }, [indice, p.tipo, leerPregunta]);

  useEffect(() => {
    if (seleccion !== null) return;
    if (timeLeft <= 0) { avanzar(false); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, seleccion]);

  function avanzar(correcto: boolean) {
    const nuevoScore = correcto ? score + 1 : score;
    if (correcto) setScore(nuevoScore);
    setTimeout(() => {
      if (indice + 1 >= TOTAL_PREGUNTAS) {
        window.speechSynthesis?.cancel();
        onComplete(nuevoScore);
      } else {
        setIndice(i => i + 1);
        setSeleccion(null);
        setTimeLeft(TIEMPO);
      }
    }, 900);
  }

  function elegir(op: number) {
    if (seleccion !== null) return;
    setSeleccion(op);
    const correcto = op === p.respuesta;
    hablar(correcto ? '¡Correcto!' : `Son ${p.respuesta}`);
    avanzar(correcto);
  }

  const colorOpcion = (op: number) => {
    if (seleccion === null) return 'bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50';
    if (op === p.respuesta) return 'bg-green-100 border-2 border-green-500 text-green-800';
    if (op === seleccion) return 'bg-red-100 border-2 border-red-400 text-red-700';
    return 'bg-white border-2 border-gray-200 opacity-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-teal-300 p-4 flex items-center justify-center">
      <Card className="w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold font-display text-blue-700">{indice + 1} / {TOTAL_PREGUNTAS}</span>
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
            <>
              <div className="text-4xl mb-2 flex flex-wrap justify-center gap-1">
                {Array.from({ length: p.cantidad }, (_, i) => <span key={i}>{p.emoji}</span>)}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-3xl mb-2 flex-wrap justify-center">
              <span className="flex gap-1">{Array.from({ length: p.cantidad }, (_, i) => <span key={i}>{p.emoji}</span>)}</span>
              <span className="text-2xl font-bold text-gray-500">+</span>
              <span className="flex gap-1">{Array.from({ length: p.cantidad2 }, (_, i) => <span key={i}>{p.emoji2}</span>)}</span>
            </div>
          )}
          <button
            onClick={() => leerPregunta(p.tipo)}
            className="flex items-center gap-1 mx-auto text-sm font-bold text-blue-600 hover:text-blue-800 mt-2"
          >
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
