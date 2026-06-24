import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus, BookOpen, Brush, UtensilsCrossed, Backpack, Flower2, Pencil, Star, Heart, Home, CircleDot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const ICON_OPTIONS = [
  { id: 'book', label: 'Libro', Icon: BookOpen },
  { id: 'brush', label: 'Escoba', Icon: Brush },
  { id: 'utensils', label: 'Plato', Icon: UtensilsCrossed },
  { id: 'backpack', label: 'Mochila', Icon: Backpack },
  { id: 'flower', label: 'Flor', Icon: Flower2 },
  { id: 'pencil', label: 'Lápiz', Icon: Pencil },
  { id: 'star', label: 'Estrella', Icon: Star },
  { id: 'heart', label: 'Corazón', Icon: Heart },
  { id: 'home', label: 'Casa', Icon: Home },
  { id: 'circle', label: 'Pelota', Icon: CircleDot },
];

const REWARD_OPTIONS = [10, 20, 30, 40, 50];

const STAT_OPTIONS = [
  { value: 'happiness', label: 'Felicidad' },
  { value: 'health', label: 'Salud' },
  { value: 'hunger', label: 'Hambre' },
];

interface CreateMissionProps {
  parentMissionCount: number;
}

export function CreateMission({ parentMissionCount }: CreateMissionProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [points, setPoints] = useState('20');
  const [statBonus, setStatBonus] = useState('happiness');

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/missions', {
        title,
        description: description || undefined,
        icon: selectedIcon,
        points: parseInt(points, 10),
        statBonus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-data'] });
      toast({ title: 'Misión creada', description: `"${title}" agregada exitosamente.` });
      setOpen(false);
      setTitle('');
      setDescription('');
      setSelectedIcon('star');
      setPoints('20');
      setStatBonus('happiness');
    },
    onError: (err: any) => {
      let msg = 'Error al crear misión';
      try {
        const errText = err?.message || '';
        const jsonStart = errText.indexOf('{');
        if (jsonStart !== -1) {
          const parsed = JSON.parse(errText.substring(jsonStart));
          if (parsed.error) msg = parsed.error;
        }
      } catch {}
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Escribe un título para la misión', variant: 'destructive' });
      return;
    }
    createMutation.mutate();
  };

  const atLimit = parentMissionCount >= 4;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground font-semibold" data-testid="text-parent-mission-count">
            Misiones creadas: {parentMissionCount}/4
          </span>
        </div>
        <DialogTrigger asChild>
          <Button
            className="w-full min-h-12 font-bold font-display bg-primary text-primary-foreground"
            disabled={atLimit}
            data-testid="button-create-mission"
          >
            <Plus size={20} className="mr-2" />
            {atLimit ? 'Límite semanal alcanzado' : 'Crear Misión'}
          </Button>
        </DialogTrigger>
        {atLimit && (
          <p className="text-xs text-amber-600 font-medium text-center" data-testid="text-mission-limit-warning">
            Ya alcanzaste el límite semanal de misiones
          </p>
        )}
      </div>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nueva Misión</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="mission-title" className="font-semibold">Título de la Misión</Label>
            <Input
              id="mission-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="ej. Limpiar tu cuarto"
              required
              data-testid="input-mission-title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mission-description" className="font-semibold">Descripción (opcional)</Label>
            <Input
              id="mission-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="ej. Ordenar juguetes y tender la cama"
              data-testid="input-mission-description"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Ícono</Label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedIcon(id)}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                    selectedIcon === id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover-elevate'
                  }`}
                  data-testid={`button-icon-${id}`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="font-semibold">Recompensa</Label>
              <Select value={points} onValueChange={setPoints}>
                <SelectTrigger data-testid="select-mission-points">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_OPTIONS.map(v => (
                    <SelectItem key={v} value={String(v)}>{v} monedas</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-semibold">Bonus</Label>
              <Select value={statBonus} onValueChange={setStatBonus}>
                <SelectTrigger data-testid="select-mission-stat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAT_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 font-bold font-display"
              data-testid="button-submit-mission"
            >
              {createMutation.isPending ? 'Creando...' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
