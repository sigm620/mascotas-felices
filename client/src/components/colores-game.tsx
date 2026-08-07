import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon, Volume2 } from 'lucide-react';
import { hablar, esperar } from '@/lib/speech';

interface ColoresGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

type Forma = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond';

interface ColorOpcion { color: string; nombre: string; hex: string; }

const COLORES: ColorOpcion[] = [
  { color: 'rojo',     nombre: 'Rojo',     hex: '#ef4444' },
  { color: 'azul',     nombre: 'Azul',     hex: '#3b82f6' },
  { color: 'verde',    nombre: 'Verde',    hex: '#22c55e' },
  { color: 'amarillo', nombre: 'Amarillo', hex: '#eab308' },
  { color: 'naranja',  nombre: 'Naranja',  hex: '#f97316' },
  { color: 'morado',   nombre: 'Morado',   hex: '#a855f7' },
  { color: 'rosado',   nombre: 'Rosado',   hex: '#ec4899' },
  { color: 'celeste',  nombre: 'Celeste',  hex: '#06b6d4' },
  { color: 'café',     nombre: 'Café',     hex: '#92400e' },
  { color: 'gris',     nombre: 'Gris',     hex: '#6b7280' },
];

const FORMAS: Forma[] = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];

const NOMBRES_FORMAS: Record<Forma, string> = {
  circle: 'círculo', square: 'cuadrado', triangle: 'triángulo',
  star: 'estrella', heart: 'corazón', diamond: 'rombo',
};

function FormaIcon({ forma, color, size = 80 }: { forma: Forma; color: string; size?: number }) {
  if (forma === 'circle') return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />;
  if (forma === 'square') return <div style={{ width: size, height: size, borderRadius: 12, backgroundColor: color }} />;
  if (forma === 'triangle') return <div style={{ width: 0, height: 0, borderLeft: `${size/2}px solid transparent`, borderRight: `${size/2}px solid transparent`, borderBottom: `${size}px solid ${color}` }} />;
  if (forma === 'heart') return <div style={{ fontSize: size * 0.9, lineHeight: 1, color }}>♥</div>;
  if (forma === 'diamond') return <div style={{ fontSize: size * 0.85, lineHeight: 1, color }}>◆</div>;
  return <div style={{ fontSize: size, lineHeight: 1, color }}>★</div>;
}

const TOTAL = 8;
const TIEMPO = 12;
type TipoPregunta = 'color' | 'forma';

function generarPregunta(tipo: TipoPregunta) {
  const color = COLORES[Math.floor(Math.random() * COLORES.length)];
  const forma = FORMAS[Math.floor(Math.random() * FORMAS.length)];
  if (tipo === 'color') {
    const otros = COLORES.filter(c => c.color !== color.color).sort(() => Math.random() - 0.5).slice(0, 3);
    return { tipo, forma, color, opciones: [color, ...otros].sort(() => Math.random() - 0.5) };
  } else {
    const otras = FORMAS.filter(f => f !== forma).sort(() => Math.random() - 0.5).slice(0, 3);
    return { tipo, forma, color, opciones: [forma, ...otras].sort(() => Math.random() - 0.5) };
  }
}

export function ColoresGame({ onComplete, onExit }: ColoresGameProps) {
  const [preguntas] = useState(() =>
    Array.from({ length: TOTAL }, (_, i) => generarPregunta(i % 2 === 0 ? 'color' : 'forma'))
  );
  const [indice, setIndice] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIEMPO);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const p = preguntas[indice];

  const leerPregunta = useCallback((tipo: string, nombreForma: string) => {
    hablar(tipo === 'color' ? `¿De qué color es el ${nombreForma}?` : '¿Cuál tiene la misma forma?');
  }, []);

  useEffect(() => {
    setBloqueado(false);
    setSeleccion(null);
    setTimeLeft(TIEMPO);
    const pp = preguntas[indice];
    setTimeout(() => leerPregunta(pp.tipo, NOMBRES_FORMAS[pp.forma]), 400);
  }, [indice]);

  useEffect(() => {
    if (bloqueado || seleccion !== null) return;
    if (timeLeft <= 0) { elegirColor({ color: '__timeout__', nombre: '', hex: '' }); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, seleccion, bloqueado]);

  async function elegirColor(op: ColorOpcion) {
    if (bloqueado || seleccion !== null) return;
    setBloqueado(true);
    setSeleccion(op.color);
    const correcto = op.color === p.color.color;
    if (correcto) setScore(s => s + 1);
    await hablar(correcto ? '¡Muy bien!' : `Es el color ${p.color.nombre}`);
    await esperar(300);
    if (indice + 1 >= TOTAL) { window.speechSynthesis?.cancel(); onComplete(correcto ? score + 1 : score); }
    else setIndice(i => i + 1);
  }

  async function elegirForma(forma: Forma) {
    if (bloqueado || seleccion !== null) return;
    setBloqueado(true);
    setSeleccion(forma);
    const correcto = forma === p.forma;
    if (correcto) setScore(s => s + 1);
    await hablar(correcto ? '¡Correcto!' : `Es un ${NOMBRES_FORMAS[p.forma]}`);
    await esperar(300);
    if (indice + 1 >= TOTAL) { window.speechSynthesis?.cancel(); onComplete(correcto ? score + 1 : score); }
    else setIndice(i => i + 1);
  }

  const borde = (esCorrecta: boolean, esSeleccionada: boolean) => {
    if (seleccion === null) return '3px solid transparent';
    if (esCorrecta) return '3px solid #22c55e';
    if (esSeleccionada) return '3px solid #ef4444';
    return '3px solid transparent';
  };

  const preguntaTexto = p.tipo === 'color'
    ? `¿De qué color es el ${NOMBRES_FORMAS[p.forma]}?`
    : '¿Cuál tiene la misma forma?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-200 to-indigo-300 p-4 flex items-center justify-center">
      <Card className="w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold font-display text-purple-700">{indice + 1} / {TOTAL}</span>
          <span className={`text-lg font-bold font-display ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
            ⏱ {timeLeft}s
          </span>
          <Button size="sm" variant="ghost" onClick={onExit}><CloseIcon size={18} /></Button>
        </div>

        <div className="text-center mb-2">
          <span className="text-sm font-bold text-purple-600">⭐ {score} aciertos</span>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 mb-4 flex flex-col items-center justify-center min-h-36">
          <FormaIcon forma={p.forma} color={p.color.hex} size={90} />
          <button onClick={() => leerPregunta(p.tipo, NOMBRES_FORMAS[p.forma])}
            className="flex items-center gap-1 mx-auto text-sm font-bold text-purple-600 hover:text-purple-800 mt-3">
            <Volume2 size={14} /> {preguntaTexto}
          </button>
        </div>

        {p.tipo === 'color' && (
          <div className="grid grid-cols-2 gap-3">
            {(p.opciones as ColorOpcion[]).map(op => {
              const esCorrecta = op.color === p.color.color;
              const esSeleccionada = seleccion === op.color;
              return (
                <button key={op.color} onClick={() => elegirColor(op)}
                  className="py-6 rounded-2xl transition-all active:scale-95"
                  style={{ backgroundColor: op.hex, border: borde(esCorrecta, esSeleccionada), opacity: seleccion !== null && !esCorrecta && !esSeleccionada ? 0.4 : 1 }} />
              );
            })}
          </div>
        )}

        {p.tipo === 'forma' && (
          <div className="grid grid-cols-2 gap-3">
            {(p.opciones as Forma[]).map(forma => {
              const esCorrecta = forma === p.forma;
              const esSeleccionada = seleccion === forma;
              return (
                <button key={forma} onClick={() => elegirForma(forma)}
                  className="py-3 rounded-2xl bg-white flex items-center justify-center transition-all active:scale-95"
                  style={{ border: borde(esCorrecta, esSeleccionada), opacity: seleccion !== null && !esCorrecta && !esSeleccionada ? 0.4 : 1, minHeight: 80 }}>
                  <FormaIcon forma={forma} color={p.color.hex} size={45} />
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-400' : 'bg-pink-400'}`}
            style={{ width: `${(timeLeft / TIEMPO) * 100}%` }} />
        </div>
      </Card>
    </div>
  );
}
