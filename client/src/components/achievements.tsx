import { Trophy } from 'lucide-react';
import type { Achievement } from '@shared/schema';

const ACHIEVEMENT_DEFS: Record<string, { title: string; description: string; icon: string }> = {
  first_mission: { title: 'Primeros Pasos', description: '¡Completaste tu primera misión!', icon: '🌟' },
  five_missions: { title: 'Maestro de Misiones', description: 'Completaste 5 misiones', icon: '🏆' },
  ten_missions: { title: 'Campeón', description: 'Completaste 10 misiones', icon: '👑' },
  memory_win: { title: 'Genio de la Memoria', description: 'Ganaste el juego de memoria', icon: '🧠' },
  catch_star: { title: 'Estrella Atrapadora', description: 'Puntuación 10+ en atrapar', icon: '⭐' },
  pet_happy: { title: 'Mascota Feliz', description: 'Tu mascota llegó a 90%+ de felicidad', icon: '😊' },
  healthy_pet: { title: 'Mascota Sana', description: 'Tu mascota llegó a 90%+ de salud', icon: '💪' },
  points_100: { title: 'Coleccionista', description: 'Ganaste 100 puntos', icon: '💎' },
  points_500: { title: 'Gran Coleccionista', description: 'Ganaste 500 puntos', icon: '💰' },
};

const ALL_ACHIEVEMENT_TYPES = Object.keys(ACHIEVEMENT_DEFS);

interface AchievementsProps {
  achievements: Achievement[];
}

export function Achievements({ achievements }: AchievementsProps) {
  const earnedTypes = new Set(achievements.map(a => a.type));

  return (
    <div className="bg-amber-50 rounded-2xl p-6">
      <h3 className="text-xl font-bold font-display text-gray-800 mb-4 flex items-center gap-2">
        <Trophy className="text-amber-600" size={24} />
        Logros
        <span className="text-sm font-normal text-muted-foreground ml-auto">
          {achievements.length}/{ALL_ACHIEVEMENT_TYPES.length}
        </span>
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {ALL_ACHIEVEMENT_TYPES.map((type) => {
          const def = ACHIEVEMENT_DEFS[type];
          const earned = earnedTypes.has(type);
          return (
            <div
              key={type}
              className={`rounded-xl p-3 text-center transition-all ${
                earned
                  ? 'bg-white shadow-sm border border-amber-200'
                  : 'bg-gray-100 opacity-50'
              }`}
              data-testid={`achievement-${type}`}
            >
              <div className={`text-2xl mb-1 ${earned ? '' : 'grayscale'}`}>
                {earned ? def.icon : '🔒'}
              </div>
              <div className="text-xs font-bold font-display leading-tight">
                {def.title}
              </div>
              {earned && (
                <div className="text-xs text-muted-foreground mt-1 leading-tight">
                  {def.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
