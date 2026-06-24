import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { PetCharacter } from './pet-character';
import { Sparkles, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PetSelectionProps {
  onConfigure: (name: string, type: string) => void;
  isLoading?: boolean;
}

const PET_OPTIONS = [
  { type: '🐶', label: 'Perrito', description: 'Leal y juguetón' },
  { type: '🐱', label: 'Gatito', description: 'Curioso y elegante' },
  { type: '🐰', label: 'Conejito', description: 'Suave y saltarín' },
  { type: '🐹', label: 'Hámster', description: 'Pequeño y tierno' },
];

export function PetSelection({ onConfigure, isLoading }: PetSelectionProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = () => {
    const trimmed = petName.trim();
    if (!trimmed) {
      setNameError('Tu mascota necesita un nombre');
      return;
    }
    if (trimmed.length > 20) {
      setNameError('El nombre es muy largo (máximo 20 caracteres)');
      return;
    }
    if (!selectedType) return;
    setNameError('');
    onConfigure(trimmed, selectedType);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 dark:from-sky-950 dark:via-emerald-950 dark:to-amber-950">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <PawPrint className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Mascotas Felices
            </h1>
            <PawPrint className="w-8 h-8 text-amber-500" />
          </div>
          <p className="text-muted-foreground text-lg">
            Elige a tu compañero y dale un nombre
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-center" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Escoge tu mascota
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-6" data-testid="pet-type-grid">
            {PET_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedType(opt.type)}
                className={cn(
                  "relative flex flex-col items-center gap-1 p-4 rounded-md border-2 transition-all",
                  selectedType === opt.type
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover-elevate"
                )}
                data-testid={`button-select-pet-${opt.label.toLowerCase()}`}
              >
                <div className="w-20 h-20 flex items-center justify-center">
                  <PetCharacter petType={opt.type} state="happy" />
                </div>
                <span className="font-semibold text-sm">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
                {selectedType === opt.type && (
                  <div className="absolute top-1 right-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Nombre de tu mascota
            </label>
            <Input
              value={petName}
              onChange={(e) => {
                setPetName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="Escribe un nombre..."
              maxLength={20}
              data-testid="input-pet-name"
              className={cn(nameError && "border-destructive")}
            />
            {nameError && (
              <p className="text-sm text-destructive mt-1" data-testid="text-name-error">{nameError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {petName.trim().length}/20 caracteres
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center mb-4">
            Esta elección es permanente y no se puede cambiar después
          </p>

          <Button
            onClick={handleSubmit}
            disabled={!selectedType || !petName.trim() || isLoading}
            className="w-full"
            data-testid="button-confirm-pet"
          >
            {isLoading ? 'Guardando...' : 'Confirmar mi mascota'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
