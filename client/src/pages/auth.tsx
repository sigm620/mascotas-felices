import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Mode = 'login' | 'register' | 'join';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [familyCode, setFamilyCode] = useState('');

  // En "Nueva Familia" siempre es padre. En "Unirse" se elige.
  const [joinRole, setJoinRole] = useState<'parent' | 'child'>('child');

  const loginMutation = useMutation({
    mutationFn: async () => apiRequest('POST', '/api/auth/login', { username, password }),
    onSuccess: () => window.location.reload(),
    onError: (e: Error) => alert(e.message),
  });

  const registerMutation = useMutation({
    mutationFn: async () =>
      apiRequest('POST', '/api/auth/register', { username, password, role: 'parent' }),
    onSuccess: () => window.location.reload(),
    onError: (e: Error) => alert(e.message),
  });

  const joinMutation = useMutation({
    mutationFn: async () =>
      apiRequest('POST', '/api/auth/join-family', {
        username,
        password,
        role: joinRole,
        familyId: familyCode,
      }),
    onSuccess: () => window.location.reload(),
    onError: (e: Error) => alert(e.message),
  });

  // Debe ir DESPUÉS de declarar las mutaciones (antes causaba el error TDZ).
  const isPending = loginMutation.isPending || registerMutation.isPending || joinMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Por favor escribe tu usuario y contraseña.');
      return;
    }
    if (mode === 'join' && !familyCode.trim()) {
      alert('Por favor ingresa el código familiar.');
      return;
    }
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
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-sm font-bold font-display transition-colors ${mode === 'register' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted/50'}`}
          >
            Nueva Familia
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2.5 text-sm font-bold font-display transition-colors ${mode === 'join' ? 'bg-primary text-primary-foreground' : 'bg-white text-muted-foreground hover:bg-muted/50'}`}
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
            />
          </div>

          {/* Nueva Familia: solo padres, explicación clara */}
          {mode === 'register' && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-1">
              <p className="text-sm font-bold text-purple-800">👨‍👩‍👧 Creando nueva familia</p>
              <p className="text-xs text-purple-700">
                Tu cuenta será de <strong>Padre/Madre</strong>. Una vez creada, comparte el 
                <strong> código familiar</strong> con tus hijos para que se unan desde "Unirse".
              </p>
            </div>
          )}

          {/* Unirse: código familiar + selector de rol */}
          {mode === 'join' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="familyCode" className="font-semibold">Código Familiar</Label>
                <Input
                  id="familyCode"
                  value={familyCode}
                  onChange={e => setFamilyCode(e.target.value)}
                  placeholder="Pide el código a tu padre/madre"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  El código está en la sección Perfil de la cuenta del padre/madre.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold">Soy...</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setJoinRole('parent')}
                    className={`p-3 rounded-xl border-2 font-bold font-display transition-all ${joinRole === 'parent' ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}
                  >
                    Padre/Madre
                  </button>
                  <button
                    type="button"
                    onClick={() => setJoinRole('child')}
                    className={`p-3 rounded-xl border-2 font-bold font-display transition-all ${joinRole === 'child' ? 'border-primary bg-primary/10 text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}
                  >
                    Hijo/a
                  </button>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full min-h-12 text-base font-bold font-display"
          >
            {isPending
              ? 'Cargando...'
              : mode === 'login'
              ? 'Iniciar Sesión'
              : mode === 'register'
              ? 'Crear Familia'
              : 'Unirse a Familia'}
          </Button>
        </form>
      </div>
    </div>
  );
}
