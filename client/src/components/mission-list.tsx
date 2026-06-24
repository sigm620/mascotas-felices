import { Lock, ClipboardList, Star, Heart, Gamepad2, BookOpen, Trophy, CircleDot, Brush, UtensilsCrossed, Backpack, Flower2, Pencil, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Mission } from '@shared/schema';

const MISSION_ICONS: Record<string, typeof Star> = {
  star: Star,
  heart: Heart,
  gamepad: Gamepad2,
  book: BookOpen,
  trophy: Trophy,
  circle: CircleDot,
  brush: Brush,
  utensils: UtensilsCrossed,
  backpack: Backpack,
  flower: Flower2,
  pencil: Pencil,
  home: Home,
};

interface MissionListProps {
  missions: Mission[];
  onMarkCompleted: (id: string) => void;
  isLoading?: boolean;
}

export function MissionList({ missions, onMarkCompleted, isLoading = false }: MissionListProps) {
  const weeklyMissions = missions.filter(m => m.weekId);
  const totalWeekly = weeklyMissions.length;
  const completedWeekly = weeklyMissions.filter(m => m.completed || m.approved).length;
  const progressPercent = totalWeekly > 0 ? Math.round((completedWeekly / totalWeekly) * 100) : 0;

  const systemMissions = weeklyMissions.filter(m => m.type === 'system');
  const minigameMissions = weeklyMissions.filter(m => m.type === 'minigame');
  const parentMissions = weeklyMissions.filter(m => m.type === 'parent');

  return (
    <div className="bg-purple-50 rounded-2xl p-6">
      <h3 className="text-xl font-bold font-display text-gray-800 mb-4 flex items-center gap-2">
        <ClipboardList className="text-purple-600" size={24} />
        Mis Misiones Semanales
      </h3>

      <Card className="p-4 mb-5 border-2">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="font-semibold text-sm" data-testid="text-weekly-progress-label">
            Progreso semanal
          </span>
          <span className="font-bold font-display text-primary text-sm" data-testid="text-weekly-progress-count">
            {completedWeekly}/{totalWeekly} misiones
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" data-testid="progress-weekly" />
        <div className="text-xs text-muted-foreground mt-1 text-right">{progressPercent}%</div>
      </Card>

      {systemMissions.length > 0 && (
        <MissionGroup
          title="Misiones del Sistema"
          icon={<Star className="text-yellow-500" size={18} />}
          missions={systemMissions}
          onMarkCompleted={onMarkCompleted}
          isLoading={isLoading}
        />
      )}

      {minigameMissions.length > 0 && (
        <MissionGroup
          title="Misiones de Minijuegos"
          icon={<Gamepad2 className="text-blue-500" size={18} />}
          missions={minigameMissions}
          onMarkCompleted={onMarkCompleted}
          isLoading={isLoading}
        />
      )}

      {parentMissions.length > 0 && (
        <MissionGroup
          title="Misiones de Papás"
          icon={<Heart className="text-pink-500" size={18} />}
          missions={parentMissions}
          onMarkCompleted={onMarkCompleted}
          isLoading={isLoading}
        />
      )}

      {totalWeekly === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Cargando misiones semanales...
        </div>
      )}
    </div>
  );
}

function MissionGroup({
  title,
  icon,
  missions,
  onMarkCompleted,
  isLoading,
}: {
  title: string;
  icon: React.ReactNode;
  missions: Mission[];
  onMarkCompleted: (id: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-semibold text-sm text-muted-foreground">{title}</span>
      </div>
      <div className="space-y-3">
        {missions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onMarkCompleted={onMarkCompleted}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}

function MissionCard({
  mission,
  onMarkCompleted,
  isLoading,
}: {
  mission: Mission;
  onMarkCompleted: (id: string) => void;
  isLoading: boolean;
}) {
  const isAutoMission = mission.type === 'system' || mission.type === 'minigame';
  const isComplete = mission.completed || mission.approved;
  const IconComp = MISSION_ICONS[mission.icon || 'star'] || Star;

  return (
    <Card
      className={`p-4 flex flex-wrap items-center justify-between gap-3 border-2 ${
        isComplete ? 'border-green-300 bg-green-50/50' : 'hover-elevate'
      }`}
      data-testid={`card-mission-${mission.id}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100' : 'bg-purple-100'}`}>
          <IconComp size={18} className={isComplete ? 'text-green-600' : 'text-purple-600'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base" data-testid={`text-mission-title-${mission.id}`}>
            {mission.title}
          </div>
          {mission.description && (
            <div className="text-xs text-muted-foreground mt-0.5">{mission.description}</div>
          )}
          <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
            <span className="font-display font-bold text-primary">+{mission.points} monedas</span>
            {mission.statBonus && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                +{mission.statAmount} {mission.statBonus === 'happiness' ? 'felicidad' : mission.statBonus === 'health' ? 'salud' : 'hambre'}
              </span>
            )}
          </div>
          {isAutoMission && !isComplete && mission.progressTarget > 1 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{mission.progress}/{mission.progressTarget}</span>
              </div>
              <Progress value={(mission.progress / mission.progressTarget) * 100} className="h-1.5 mt-1" />
            </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">
        {isComplete ? (
          <div className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
            <Trophy size={16} />
            <span>Completada</span>
          </div>
        ) : mission.completed && !mission.approved && mission.type === 'parent' ? (
          <div className="flex items-center gap-1.5 text-yellow-600 text-sm font-semibold">
            <Lock size={16} />
            <span>Esperando aprobación</span>
          </div>
        ) : isAutoMission ? (
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Automática
          </div>
        ) : mission.type === 'parent' ? (
          <div className="text-xs text-muted-foreground bg-amber-100 text-amber-700 px-2 py-1 rounded">
            Pendiente de papás
          </div>
        ) : (
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            En progreso
          </div>
        )}
      </div>
    </Card>
  );
}
