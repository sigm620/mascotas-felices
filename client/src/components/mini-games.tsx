import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiniGamesProps {
  onStartMemory: () => void;
  onStartLetras: () => void;
  onStartNumeros: () => void;
  onStartColores: () => void;
}

export function MiniGames({ onStartMemory, onStartLetras, onStartNumeros, onStartColores }: MiniGamesProps) {
  return (
    <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-6">
      <h3 className="text-xl font-bold font-display text-gray-800 mb-4 flex items-center gap-2">
        <Gamepad2 className="text-orange-500" size={24} />
        Mini-Juegos
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={onStartMemory}
          className="bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold min-h-28 flex flex-col items-center justify-center gap-2 rounded-xl font-display transition-all active:scale-95"
        >
          <div className="text-4xl">🧠</div>
          <div className="text-base">Memoria</div>
          <div className="text-xs opacity-90">+50 pts</div>
        </Button>

        <Button
          onClick={onStartLetras}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold min-h-28 flex flex-col items-center justify-center gap-2 rounded-xl font-display transition-all active:scale-95"
        >
          <div className="text-4xl">🔤</div>
          <div className="text-base">Letras</div>
          <div className="text-xs opacity-90">+40 pts</div>
        </Button>

        <Button
          onClick={onStartNumeros}
          className="bg-gradient-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold min-h-28 flex flex-col items-center justify-center gap-2 rounded-xl font-display transition-all active:scale-95"
        >
          <div className="text-4xl">🔢</div>
          <div className="text-base">Números</div>
          <div className="text-xs opacity-90">+40 pts</div>
        </Button>

        <Button
          onClick={onStartColores}
          className="bg-gradient-to-br from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold min-h-28 flex flex-col items-center justify-center gap-2 rounded-xl font-display transition-all active:scale-95"
        >
          <div className="text-4xl">🎨</div>
          <div className="text-base">Colores</div>
          <div className="text-xs opacity-90">+40 pts</div>
        </Button>
      </div>
    </div>
  );
}
