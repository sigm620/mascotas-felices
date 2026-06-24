import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type AuthMode = 'login' | 'register' | 'join';

interface AuthPageProps {
  onSuccess: () => void;
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'parent' | 'child'>('child');
  const [familyCode, setFamilyCode] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => apiRequest('POST', '/api/auth/login', { username, password }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      toast({ title: 'Error al iniciar sesión', description: err.message || 'Credenciales inválidas', variant: 'destructive' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => apiRequest('POST', '/api/auth/register', { username, password, role }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      toast({ title: 'Error al registrarse', description: err.message || 'No se pudo registrar', variant: 'destructive' });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => apiRequest('POST', '/api/auth/join-family', { username, password, role, familyId: familyCode }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (err: any) => {
      toast({ title: 'No se pudo unir a la familia', description: err.message || 'Verifica el código familiar', variant: 'destructive' });
    },
  });

  const isPending = loginMutation.isPending || registerMutation.isPending || joinMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') loginMutation.mutate();
    else if (mode === 'register') registerMutation.mutate();
    else joinMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🐾</div>
          <h1 className="text-3xl font-bold font-display text-primary">Mascotas Felices</h1>
          <p className="text-muted-foreground mt-1">¡Cuida a tu mascota virtual!</p>
        </div>

        {/* Selector de modo */}
        <div className="flex rounded-xl overflow-hidden border mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-sm font-bold font-display transition-colors ${mode === 'login' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted/50'}`}
            data-testid="button-mode-login"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-sm font-bold font-display transition-colors ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted/50'}`}
            data-testid="button-mode-register"
          >
            Nueva Familia
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2.5 text-sm font-bold font-display transition-colors ${mode === 'join' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted/50'}`}
            data-testid="button-mode-join"
          >
            Unirse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre de usuario */}
          <div className="space-y-2">
            <Label htmlFor="username" className="font-semibold">Nombre de usuario</Label>
            <Input
              id="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Escribe tu nombre de usuario"
              required
              data-testid="input-username"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-semibold">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Escribe tu contraseña"
              required
              data-testid="input-password"
            />
          </div>

          {/* Rol - solo para registro/unirse */}
          {(mode === 'register' || mode === 'join') && (
            <div className="space-y-2">
              <Label className="font-semibold">Soy...</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('parent')}
                  className={`p-3 rounded-xl border-2 font-bold font-display transition-all ${role === 'parent' ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}
                  data-testid="button-role-parent"
                >
                  Padre/Madre
                </button>
                <button
                  type="button"
                  onClick={() => setRole('child')}
                  className={`p-3 rounded-xl border-2 font-bold font-display transition-all ${role === 'child' ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}
                  data-testid="button-role-child"
                >
                  Hijo/a
                </button>
              </div>
            </div>
          )}

          {/* Código familiar - solo para unirse */}
          {mode === 'join' && (
            <div className="space-y-2">
              <Label htmlFor="familyCode" className="font-semibold">Código Familiar</Label>
              <Input
                id="familyCode"
                value={familyCode}
                onChange={e => setFamilyCode(e.target.value)}
                placeholder="Ingresa el código de tu familia"
                required
                data-testid="input-family-code"
              />
              <p className="text-xs text-muted-foreground">
                Pide a tu padre/madre el código familiar de su sección de Perfil.
              </p>
            </div>
          )}

          {mode === 'register' && role === 'child' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              Consejo: Los padres deben registrarse primero para crear la familia. Luego los hijos pueden unirse con el código familiar.
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full min-h-12 text-base font-bold font-display"
            data-testid="button-submit-auth"
          >
            {isPending ? 'Cargando...' : mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Crear Familia' : 'Unirse a Familia'}
          </Button>
        </form>
      </div>
    </div>
  );
}
