import { Unlock, Check, X, TrendingUp, Trophy, Download, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CreateMission } from '@/components/create-mission';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import type { Pet, Mission, Achievement, GameState } from '@shared/schema';

const ACHIEVEMENT_DEFS: Record<string, { title: string; icon: string }> = {
  first_mission: { title: 'Primeros Pasos', icon: '🌟' },
  five_missions: { title: 'Maestro de Misiones', icon: '🏆' },
  ten_missions: { title: 'Campeón', icon: '👑' },
  memory_win: { title: 'Genio de la Memoria', icon: '🧠' },
  catch_star: { title: 'Estrella Atrapadora', icon: '⭐' },
  pet_happy: { title: 'Mascota Feliz', icon: '😊' },
  healthy_pet: { title: 'Mascota Sana', icon: '💪' },
  points_100: { title: 'Coleccionista', icon: '💎' },
  points_500: { title: 'Gran Coleccionista', icon: '💰' },
};

interface ParentViewProps {
  pet: Pet;
  missions: Mission[];
  achievements: Achievement[];
  gameState: GameState;
  onApproveMission: (id: string, approve: boolean) => void;
  isLoading?: boolean;
}

export function ParentView({ pet, missions, achievements, gameState, onApproveMission, isLoading = false }: ParentViewProps) {
  const { toast } = useToast();
  const weeklyMissions = missions.filter(m => m.weekId);
  const pendingMissions = weeklyMissions.filter((m) => m.completed && !m.approved && m.type === 'parent');
  const completedMissions = weeklyMissions.filter((m) => m.approved || (m.completed && m.type !== 'parent'));
  const activeMissions = weeklyMissions.filter((m) => !m.completed && !m.approved);
  const parentMissionsCount = weeklyMissions.filter(m => m.type === 'parent').length;

  const totalWeekly = weeklyMissions.length;
  const completedCount = completedMissions.length;
  const progressPercent = totalWeekly > 0 ? Math.round((completedCount / totalWeekly) * 100) : 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/missions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      toast({ title: 'Misión eliminada' });
    },
    onError: () => {
      toast({ title: 'Error al eliminar misión', variant: 'destructive' });
    },
  });

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/research/export', { credentials: 'include' });
      if (!response.ok) throw new Error('Error al exportar');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'datos_investigacion.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Datos exportados', description: 'Archivo CSV descargado.' });
    } catch {
      toast({ title: 'Error al exportar datos', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Unlock className="text-primary" size={32} />
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-primary">
            Panel de Padres
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={handleExportData}
          data-testid="button-export-data"
        >
          <Download size={16} className="mr-2" />
          Exportar Datos
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 border-2">
        <h3 className="text-xl font-bold font-display text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={24} className="text-blue-600" />
          Estado de {pet.name}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-4xl mb-2">🍖</div>
            <div className="text-sm font-semibold text-muted-foreground">Hambre</div>
            <div className="text-2xl font-bold font-display" data-testid="text-parent-hunger">
              {Math.round(pet.hunger)}%
            </div>
          </div>
          <div>
            <div className="text-4xl mb-2">😊</div>
            <div className="text-sm font-semibold text-muted-foreground">Felicidad</div>
            <div className="text-2xl font-bold font-display" data-testid="text-parent-happiness">
              {Math.round(pet.happiness)}%
            </div>
          </div>
          <div>
            <div className="text-4xl mb-2">❤️</div>
            <div className="text-sm font-semibold text-muted-foreground">Salud</div>
            <div className="text-2xl font-bold font-display" data-testid="text-parent-health">
              {Math.round(pet.health)}%
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 border-2">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Progreso Semanal
          </h3>
          <span className="text-sm font-bold font-display text-primary" data-testid="text-parent-weekly-progress">
            {completedCount}/{totalWeekly}
          </span>
        </div>
        <Progress value={progressPercent} className="h-3 mb-2" />
        <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold font-display text-primary">{completedCount}</div>
            <div className="text-muted-foreground text-xs">Completadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-display text-amber-500">{pendingMissions.length}</div>
            <div className="text-muted-foreground text-xs">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold font-display text-blue-500">{gameState.consecutiveDays}</div>
            <div className="text-muted-foreground text-xs">Días seguidos</div>
          </div>
        </div>
      </Card>

      <div className="bg-blue-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold font-display text-gray-800 mb-4">
          Administrar Misiones
        </h3>
        <CreateMission parentMissionCount={parentMissionsCount} />

        {activeMissions.filter(m => m.type === 'parent').length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">
              Misiones activas de padres
            </p>
            {activeMissions.filter(m => m.type === 'parent').map((mission) => (
              <div
                key={mission.id}
                className="bg-white rounded-xl p-3 flex flex-wrap items-center justify-between gap-2"
                data-testid={`card-active-mission-${mission.id}`}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">{mission.title}</span>
                  {mission.description && (
                    <span className="text-xs text-muted-foreground ml-2">{mission.description}</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-2">+{mission.points} monedas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    onClick={() => onApproveMission(mission.id, true)}
                    disabled={isLoading}
                    className="bg-green-500 text-white font-bold text-xs"
                    data-testid={`button-complete-parent-mission-${mission.id}`}
                  >
                    <Check size={14} className="mr-1" />
                    Completada
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(mission.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-mission-${mission.id}`}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-purple-50 rounded-2xl p-6">
        <h3 className="text-xl font-bold font-display text-gray-800 mb-2">
          Validar Misiones
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Aprueba las misiones que tu hijo/a completó:
        </p>

        <div className="space-y-3">
          {pendingMissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-white rounded-xl">
              No hay misiones pendientes por validar
            </div>
          ) : (
            pendingMissions.map((mission) => (
              <Card
                key={mission.id}
                className="p-4 border-2 border-yellow-400 bg-yellow-50"
                data-testid={`card-pending-mission-${mission.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base" data-testid={`text-pending-mission-title-${mission.id}`}>
                      {mission.title}
                    </div>
                    {mission.description && (
                      <div className="text-xs text-muted-foreground">{mission.description}</div>
                    )}
                  </div>
                  <div className="text-lg font-bold font-display text-primary">
                    +{mission.points} pts
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onApproveMission(mission.id, true)}
                    disabled={isLoading}
                    className="flex-1 bg-green-500 text-white font-bold font-display min-h-12"
                    data-testid={`button-approve-mission-${mission.id}`}
                  >
                    <Check size={18} className="mr-2" />
                    Aprobar
                  </Button>
                  <Button
                    onClick={() => onApproveMission(mission.id, false)}
                    disabled={isLoading}
                    className="flex-1 bg-destructive text-white font-bold font-display min-h-12"
                    data-testid={`button-reject-mission-${mission.id}`}
                  >
                    <X size={18} className="mr-2" />
                    Rechazar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="mt-6 p-4 border-2">
          <h4 className="font-bold font-display mb-3">Resumen Semanal</h4>
          <div className="text-sm space-y-2">
            <div className="flex flex-wrap justify-between gap-1">
              <span className="text-muted-foreground">Misiones completadas:</span>
              <span className="font-bold font-display">{completedCount}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-1">
              <span className="text-muted-foreground">Puntos ganados:</span>
              <span className="font-bold font-display">
                {completedMissions.reduce((sum, m) => sum + m.points, 0)} pts
              </span>
            </div>
            <div className="flex flex-wrap justify-between gap-1">
              <span className="text-muted-foreground">Días consecutivos:</span>
              <span className="font-bold font-display">{gameState.consecutiveDays}</span>
            </div>
            <div className="flex flex-wrap justify-between gap-1">
              <span className="text-muted-foreground">Nivel de mascota:</span>
              <span className="font-bold font-display">{pet.level}</span>
            </div>
          </div>
        </Card>
      </div>

      {achievements.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-6">
          <h3 className="text-xl font-bold font-display text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="text-amber-600" size={24} />
            Logros de tu Hijo/a ({achievements.length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {achievements.map((achievement) => {
              const def = ACHIEVEMENT_DEFS[achievement.type];
              if (!def) return null;
              return (
                <div
                  key={achievement.id}
                  className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm border border-amber-200"
                  data-testid={`parent-achievement-${achievement.type}`}
                >
                  <span className="text-xl">{def.icon}</span>
                  <span className="text-sm font-bold font-display">{def.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
