import { useState, useEffect } from 'react';
import { Star, Loader2, LogOut, Copy, CheckCircle, Lock, Coins } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PetDisplay } from '@/components/pet-display';
import { InventoryActions } from '@/components/inventory-actions';
import { MiniGames } from '@/components/mini-games';
import { Shop } from '@/components/shop';
import { MissionList } from '@/components/mission-list';
import { ParentView } from '@/components/parent-view';
import { MemoryGame } from '@/components/memory-game';
import { CatchGame } from '@/components/catch-game';
import { Achievements } from '@/components/achievements';
import { PetSelection } from '@/components/pet-selection';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import type { Pet, Mission, Inventory, GameState, Achievement, PetCosmetic } from '@shared/schema';

interface AuthUser {
  id: string;
  username: string;
  role: string;
  familyId: string;
}

interface GameData {
  pet: Pet;
  inventory: Inventory;
  missions: Mission[];
  gameState: GameState;
  achievements: Achievement[];
  cosmetics: PetCosmetic[];
}

interface HomeProps {
  authUser: AuthUser;
  onLogout: () => void;
}

function parseErrorMessage(err: any, fallback: string): string {
  try {
    const errText = err?.message || '';
    const jsonStart = errText.indexOf('{');
    if (jsonStart !== -1) {
      const parsed = JSON.parse(errText.substring(jsonStart));
      if (parsed.error) return parsed.error;
    }
  } catch {}
  return fallback;
}

export default function Home({ authUser, onLogout }: HomeProps) {
  const { toast } = useToast();
  const [view, setView] = useState<'child' | 'parent'>(() =>
    authUser.role === 'parent' ? 'parent' : 'child'
  );
  const [gameView, setGameView] = useState<'memory' | 'catch' | null>(null);
  const [copiedFamilyCode, setCopiedFamilyCode] = useState(false);
  const [showParentPasswordDialog, setShowParentPasswordDialog] = useState(false);
  const [parentPassword, setParentPassword] = useState('');
  const [parentPasswordError, setParentPasswordError] = useState('');
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [playAnimation, setPlayAnimation] = useState<string | null>(null);

  const handleParentViewClick = () => {
    if (view === 'parent') return;
    if (authUser.role === 'parent') {
      setView('parent');
    } else {
      setShowParentPasswordDialog(true);
      setParentPassword('');
      setParentPasswordError('');
    }
  };

  const handleVerifyParentPassword = async () => {
    if (!parentPassword.trim()) {
      setParentPasswordError('Ingresa la contraseña');
      return;
    }
    setVerifyingPassword(true);
    setParentPasswordError('');
    try {
      await apiRequest('POST', '/api/auth/verify-parent', { password: parentPassword });
      setShowParentPasswordDialog(false);
      setParentPassword('');
      setView('parent');
    } catch (err: any) {
      setParentPasswordError(parseErrorMessage(err, 'Contraseña incorrecta'));
    } finally {
      setVerifyingPassword(false);
    }
  };

  const { data, isLoading, error } = useQuery<GameData>({
    queryKey: ['/api/game-data'],
  });

  useEffect(() => {
    if (!data?.pet) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
    }, 60000);
    return () => clearInterval(interval);
  }, [data?.pet?.id]);

  const configurePetMutation = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: string }) => {
      return apiRequest('POST', '/api/pet/configure', { name, type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      toast({ title: '¡Mascota lista!', description: '¡Tu nueva mascota te está esperando!' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: parseErrorMessage(err, 'No se pudo configurar la mascota'), variant: 'destructive' });
    },
  });

  const useItemMutation = useMutation({
    mutationFn: async (itemType: string) => {
      if (!data?.pet) throw new Error('Mascota no encontrada');
      const res = await apiRequest('POST', `/api/pet/${data.pet.id}/use-item`, { itemType });
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      if (result.playAnimation) {
        setPlayAnimation(result.playAnimation);
        setTimeout(() => setPlayAnimation(null), 2000);
      }
      const messages: Record<string, { title: string; desc: string }> = {
        basicFood: { title: '¡Tu mascota comió!', desc: '¡Hambre restaurada!' },
        snack: { title: '¡Snack delicioso!', desc: '¡Hambre muy restaurada!' },
        ball: { title: '¡A jugar con la pelota!', desc: '¡Felicidad aumentada!' },
        rope: { title: '¡A jugar con la cuerda!', desc: '¡Felicidad aumentada!' },
        medicine: { title: '¡Medicina aplicada!', desc: '¡Salud restaurada!' },
      };
      const msg = messages[result.playAnimation ? result.playAnimation : ''] || { title: '¡Listo!', desc: '¡Tu mascota se siente mejor!' };
      toast({ title: msg.title, description: msg.desc });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: parseErrorMessage(err, 'No se pudo usar el artículo'), variant: 'destructive' });
    },
  });

  const buyConsumableMutation = useMutation({
    mutationFn: async ({ item, quantity }: { item: string; quantity: number }) => {
      return apiRequest('POST', '/api/shop/buy', { item, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      toast({ title: '¡Compra exitosa!', description: 'Revisa tu inventario.' });
    },
    onError: (err: any) => {
      toast({ title: 'Compra fallida', description: parseErrorMessage(err, 'Error al comprar'), variant: 'destructive' });
    },
  });

  const buyPermanentMutation = useMutation({
    mutationFn: async (item: string) => {
      return apiRequest('POST', '/api/shop/buy-permanent', { item });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      toast({ title: '¡Objeto permanente comprado!', description: '¡Ya aparece junto a tu mascota!' });
    },
    onError: (err: any) => {
      toast({ title: 'Compra fallida', description: parseErrorMessage(err, 'Error al comprar'), variant: 'destructive' });
    },
  });

  const buyCosmeticMutation = useMutation({
    mutationFn: async (cosmeticId: string) => {
      return apiRequest('POST', '/api/cosmetics/buy', { cosmeticId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      toast({ title: '¡Accesorio comprado!', description: 'Ahora puedes equiparlo.' });
    },
    onError: (err: any) => {
      toast({ title: 'Compra fallida', description: parseErrorMessage(err, 'Error al comprar'), variant: 'destructive' });
    },
  });

  const equipCosmeticMutation = useMutation({
    mutationFn: async ({ id, equip }: { id: string; equip: boolean }) => {
      return apiRequest('POST', `/api/cosmetics/${id}/equip`, { equip });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar el accesorio', variant: 'destructive' });
    },
  });

  const completeMissionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', `/api/missions/${id}/complete`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      toast({ title: '¡Misión completada!', description: 'Esperando aprobación de los padres.' });
    },
  });

  const approveMissionMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      return apiRequest('POST', `/api/missions/${id}/approve`, { approve });
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      toast({
        title: approve ? '¡Misión aprobada!' : 'Misión rechazada',
        description: approve ? '¡Puntos otorgados a tu hijo/a!' : 'Misión devuelta.',
      });
    },
  });

  const submitScoreMutation = useMutation({
    mutationFn: async ({ score, gameType }: { score: number; gameType: string }) => {
      const res = await apiRequest('POST', '/api/games/submit-score', { score, gameType });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      if (data.newAchievements?.length) {
        setTimeout(() => {
          toast({ title: '¡Logro Desbloqueado!', description: '¡Revisa tu panel de logros!' });
        }, 500);
      }
    },
  });

  const onMemoryGameComplete = (score: number) => {
    submitScoreMutation.mutate(
      { score, gameType: 'memory' },
      {
        onSuccess: () => {
          setGameView(null);
          toast({ title: '¡Ganaste!', description: '+1 moneda' });
        },
      }
    );
  };

  const onCatchGameComplete = (score: number) => {
    submitScoreMutation.mutate(
      { score, gameType: 'catch' },
      {
        onSuccess: () => {
          setGameView(null);
          toast({ title: '¡Fin del juego!', description: `Puntuación: ${score} (+1 moneda)` });
        },
      }
    );
  };

  const copyFamilyCode = () => {
    navigator.clipboard.writeText(authUser.familyId);
    setCopiedFamilyCode(true);
    setTimeout(() => setCopiedFamilyCode(false), 2000);
    toast({ title: '¡Código familiar copiado!', description: 'Compártelo con tu hijo/a para que se una.' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl font-bold font-display text-gray-800">Cargando tu mascota...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-display text-gray-800 mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">No pudimos cargar tu mascota. Intenta refrescar la página.</p>
          <Button onClick={() => window.location.reload()} className="font-bold font-display">
            Refrescar Página
          </Button>
        </div>
      </div>
    );
  }

  if (data.pet && !data.pet.configured) {
    return (
      <PetSelection
        onConfigure={(name, type) => configurePetMutation.mutate({ name, type })}
        isLoading={configurePetMutation.isPending}
      />
    );
  }

  if (gameView === 'memory') {
    return <MemoryGame onComplete={onMemoryGameComplete} onExit={() => setGameView(null)} />;
  }

  if (gameView === 'catch') {
    return <CatchGame onComplete={onCatchGameComplete} onExit={() => setGameView(null)} />;
  }

  const bowlBonus = data.gameState.activeBowl === 'bowl_special' ? 20 : data.gameState.activeBowl === 'bowl_basic' ? 10 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold font-display text-lg">¡Hola, {authUser.username}!</span>
          {authUser.role === 'parent' && (
            <Button
              size="sm"
              variant="outline"
              onClick={copyFamilyCode}
              className="bg-white/20 border-white/40 text-white text-xs"
              data-testid="button-copy-family-code"
            >
              {copiedFamilyCode ? <CheckCircle size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
              Código Familiar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-yellow-400/90 px-3 py-1.5 rounded-full">
            <Coins className="text-yellow-800" size={16} />
            <span className="font-bold text-sm font-display text-yellow-900" data-testid="text-points-header">
              {data.gameState.points}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onLogout}
            className="bg-white/20 border-white/40 text-white"
            data-testid="button-logout"
          >
            <LogOut size={16} className="mr-1" />
            Salir
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-4 flex gap-2">
        <Button
          onClick={() => setView('child')}
          className={`flex-1 min-h-12 text-base font-bold font-display ${
            view === 'child'
              ? 'bg-white text-primary shadow-lg'
              : 'bg-white/50 text-white'
          }`}
          variant="outline"
          data-testid="button-child-view"
        >
          Vista Hijo/a
        </Button>
        <Button
          onClick={handleParentViewClick}
          className={`flex-1 min-h-12 text-base font-bold font-display ${
            view === 'parent'
              ? 'bg-white text-primary shadow-lg'
              : 'bg-white/50 text-white'
          }`}
          variant="outline"
          data-testid="button-parent-view"
        >
          {authUser.role === 'child' && <Lock size={16} className="mr-1" />}
          Vista Padres
        </Button>
      </div>

      <Dialog open={showParentPasswordDialog} onOpenChange={setShowParentPasswordDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Acceso de Padres</DialogTitle>
            <DialogDescription>
              Ingresa la contraseña del padre/madre para ver esta sección.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              type="password"
              placeholder="Contraseña del padre/madre"
              value={parentPassword}
              onChange={(e) => { setParentPassword(e.target.value); setParentPasswordError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyParentPassword(); }}
              data-testid="input-parent-password"
              autoFocus
            />
            {parentPasswordError && (
              <p className="text-sm text-red-500 font-medium" data-testid="text-parent-password-error">{parentPasswordError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowParentPasswordDialog(false)} data-testid="button-cancel-parent-password">
              Cancelar
            </Button>
            <Button onClick={handleVerifyParentPassword} disabled={verifyingPassword} data-testid="button-verify-parent-password">
              {verifyingPassword ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Lock size={16} className="mr-1" />}
              Verificar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {view === 'child' ? (
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-primary">
                Mi Mascota
              </h1>
              <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
                <Star className="text-yellow-500" fill="currentColor" size={20} />
                <span className="font-bold text-lg font-display" data-testid="text-points">
                  {data.gameState.points} monedas
                </span>
              </div>
            </div>

            <PetDisplay pet={data.pet} cosmetics={data.cosmetics} gameState={data.gameState} playAnimation={playAnimation} />

            <InventoryActions
              inventory={data.inventory}
              onUseItem={(itemType) => useItemMutation.mutate(itemType)}
              isLoading={useItemMutation.isPending}
              bowlBonus={bowlBonus}
            />

            <MiniGames
              onStartMemory={() => setGameView('memory')}
              onStartCatch={() => setGameView('catch')}
            />

            <Shop
              points={data.gameState.points}
              inventory={data.inventory}
              gameState={data.gameState}
              onBuyConsumable={(item, quantity) => buyConsumableMutation.mutate({ item, quantity })}
              onBuyPermanent={(item) => buyPermanentMutation.mutate(item)}
              isBuyingConsumable={buyConsumableMutation.isPending}
              isBuyingPermanent={buyPermanentMutation.isPending}
              pet={data.pet}
              cosmetics={data.cosmetics}
              onBuyCosmetic={(cosmeticId) => buyCosmeticMutation.mutate(cosmeticId)}
              onEquipCosmetic={(id, equip) => equipCosmeticMutation.mutate({ id, equip })}
              isCosmeticLoading={buyCosmeticMutation.isPending || equipCosmeticMutation.isPending}
            />

            <MissionList
              missions={data.missions}
              onMarkCompleted={(id) => completeMissionMutation.mutate(id)}
              isLoading={completeMissionMutation.isPending}
            />

            <Achievements achievements={data.achievements} />
          </div>
        ) : (
          <ParentView
            pet={data.pet}
            missions={data.missions}
            achievements={data.achievements}
            gameState={data.gameState}
            onApproveMission={(id, approve) => approveMissionMutation.mutate({ id, approve })}
            isLoading={approveMissionMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
