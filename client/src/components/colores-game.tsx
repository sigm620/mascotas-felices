import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X as CloseIcon } from 'lucide-react';

interface ColoresGameProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

type Forma = 'circle' | 'square' | 'triangle' | 'star';

interface Opcion {
  color: string;
  nombre: string;
  hex: string;
}

const COLORES: Opcion[] = [
  { color: 'rojo',     nombre: 'Rojo',     hex: '#ef4444' },
  { color: 'azul',     nombre: 'Azul',     hex: '#3b82f6' },
  { color: 'verde',    nombre: 'Verde',    hex: '#22c55e' },
  { color: 'amarillo', nombre: 'Amarillo', hex: '#eab308' },
  { color: 'naranja',  nombre: 'Naranja',  hex: '#f97316' },
  { color: 'morado',   nombre: 'Morado',   hex: '#a855f7' },
  { color: 'rosado',   nombre: 'Rosado',   hex: '#ec4899' },
  { color: 'celeste',  nombre: 'Celeste',  hex: '#06b6d4' },
];

const FORMAS: Forma[] = ['circle', 'square', 'triangle', 'star'];

function FormaIcon({ forma, color, size = 80 }: { forma: Forma; color: string; size?: number }) {
  if (forma === 'circle') {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
    );
  }
  if (forma === 'square') {
    return (
      <div style={{ width: size, height: size, borderRadius: 12, backgroundColor: color, display: 'inline-block' }} />
    );
  }
  if (forma === 'triangle') {
    return (
      <div style={{
        width: 0, height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
        display: 'inline-block',
      }} />
    );
  }
  // star
  return (
    <div style={{ fontSize: size, lineHeight: 1, color, display: 'inline-block', filter: `drop-shadow(0 0 2px ${color}88)` }}>
      ★
    </div>
  );
}

const TOTAL_PREGUNTAS = 8;
const TIEMPO = 12;

type TipoPregunta = 'color' | 'forma';

function generarPregunta(tipo: TipoPregunta) {
  const color = COLORES[Math.floor(Math.random() * COLORES.length)];
  const forma = FORMAS[Math.floor(Math.random() * FORMAS.length)];

  if (tipo === 'color') {
    // Mostrar forma de un color, elegir el color correcto entre 4 cuadros de color
    const otroCols = COLORES.filter(c => c.color !== color.color)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opciones = [color, ...otroCols].sort(() => Math.random() - 0.5);
    return { tipo, forma, color, opciones };
  } else {
    // Mostrar una forma de un color, elegir la misma forma entre 4 opciones de formas
    const otrasFormas = FORMAS.filter(f => f !== forma)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const opciones = [forma, ...otrasFormas].sort(() => Math.random() - 0.5);
    return { tipo, forma, color, opciones };
  }
}

export function ColoresGame({ onComplete, onExit }: ColoresGameProps) {
  const [preguntas] = useState(() =>
    Array.from({ length: TOTAL_PREGUNTAS }, (_, i) =>
      generarPregunta(i % 2 === 0 ? 'color' : 'forma')
    )
  );
  const [indice, setIndice] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIEMPO);
  const [seleccion, setSeleccion] = useState<string | null>(null);

  const p = preguntas[indice];

  useEffect(() => {
    if (seleccion !== null) return;
    if (timeLeft <= 0) { avanzar(false); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, seleccion]);

  function avanzar(correcto: boolean) {
    if (correcto) setScore(s => s + 1);
    setTimeout(() => {
      if (indice + 1 >= TOTAL_PREGUNTAS) {
        onComplete(correcto ? score + 1 : score);
      } else {
        setIndice(i => i + 1);
        setSeleccion(null);
        setTimeLeft(TIEMPO);
      }
    }, 900);
  }

  function elegirColor(opcion: Opcion) {
    if (seleccion !== null) return;
    setSeleccion(opcion.color);
    avanzar(opcion.color === p.color.color);
  }

  function elegirForma(forma: Forma) {
    if (seleccion !== null) return;
    setSeleccion(forma);
    avanzar(forma === p.forma);
  }

  const borderColor = (esCorrecta: boolean, esSeleccionada: boolean) => {
    if (seleccion === null) return '3px solid transparent';
    if (esCorrecta) return '3px solid #22c55e';
    if (esSeleccionada) return '3px solid #ef4444';
    return '3px solid transparent';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-200 to-indigo-300 p-4 flex items-center justify-center">
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
          <span className="text-sm font-bold text-purple-600">⭐ {score} aciertos</span>
        </div>

        {/* Figura en display */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-4 flex flex-col items-center justify-center min-h-36">
          <FormaIcon forma={p.forma} color={p.color.hex} size={90} />
          {p.tipo === 'color' ? (
            <p className="text-sm font-bold text-gray-600 mt-3">¿De qué color es?</p>
          ) : (
            <p className="text-sm font-bold text-gray-600 mt-3">¿Cuál tiene la misma forma?</p>
          )}
        </div>

        {/* Opciones de color */}
        {p.tipo === 'color' && (
          <div className="grid grid-cols-2 gap-3">
            {(p.opciones as Opcion[]).map(op => {
              const esCorrecta = op.color === p.color.color;
              const esSeleccionada = seleccion === op.color;
              return (
                <button
                  key={op.color}
                  onClick={() => elegirColor(op)}
                  className="py-4 rounded-2xl transition-all active:scale-95"
                  style={{
                    backgroundColor: op.hex,
                    border: borderColor(esCorrecta, esSeleccionada),
                    opacity: seleccion !== null && !esCorrecta && !esSeleccionada ? 0.5 : 1,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Opciones de forma */}
        {p.tipo === 'forma' && (
          <div className="grid grid-cols-2 gap-3">
            {(p.opciones as Forma[]).map(forma => {
              const esCorrecta = forma === p.forma;
              const esSeleccionada = seleccion === forma;
              return (
                <button
                  key={forma}
                  onClick={() => elegirForma(forma)}
                  className="py-4 rounded-2xl bg-white flex items-center justify-center transition-all active:scale-95"
                  style={{
                    border: borderColor(esCorrecta, esSeleccionada),
                    opacity: seleccion !== null && !esCorrecta && !esSeleccionada ? 0.5 : 1,
                    minHeight: 80,
                  }}
                >
                  <FormaIcon forma={forma} color={p.color.hex} size={45} />
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${timeLeft <= 5 ? 'bg-red-400' : 'bg-pink-400'}`}
            style={{ width: `${(timeLeft / TIEMPO) * 100}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
