import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, Cookie, CircleDot, Ribbon, Pill } from 'lucide-react';
import type { Inventory } from '@shared/schema';

interface InventoryActionsProps {
  inventory: Inventory;
  onUseItem: (itemType: string) => void;
  isLoading?: boolean;
  bowlBonus?: number;
}

const ITEMS = [
  { key: 'basicFood', field: 'basicFood' as const, label: 'Comida', stat: 'Hambre', amount: 30, icon: Utensils, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
  { key: 'snack', field: 'snack' as const, label: 'Especial', stat: 'Hambre', amount: 60, icon: Cookie, color: 'bg-amber-500', hoverColor: 'hover:bg-amber-600' },
  { key: 'ball', field: 'ball' as const, label: 'Juguete', stat: 'Felicidad', amount: 30, icon: CircleDot, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
  { key: 'rope', field: 'rope' as const, label: 'J. Especial', stat: 'Felicidad', amount: 60, icon: Ribbon, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
  { key: 'medicine', field: 'medicine' as const, label: 'Medicina', stat: 'Salud', amount: 30, icon: Pill, color: 'bg-red-500', hoverColor: 'hover:bg-red-600' },
];

export function InventoryActions({
  inventory,
  onUseItem,
  isLoading = false,
  bowlBonus = 0,
}: InventoryActionsProps) {
  const [animatingItem, setAnimatingItem] = useState<string | null>(null);

  const handleUse = (key: string) => {
    setAnimatingItem(key);
    onUseItem(key);
    setTimeout(() => setAnimatingItem(null), 600);
  };

  const totalFood = inventory.basicFood + inventory.snack + (inventory.food || 0);
  const totalToys = inventory.ball + inventory.rope + (inventory.toys || 0);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold font-display text-gray-800 flex items-center gap-2">
        Inventario
        <span className="text-sm font-normal text-gray-500">
          ({totalFood} comida, {totalToys} juguetes, {inventory.medicine} medicina)
        </span>
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {ITEMS.map(({ key, field, label, stat, amount, icon: Icon, color, hoverColor }) => {
          const count = (inventory as any)[field] as number;
          const displayAmount = (stat === 'Hambre' && bowlBonus > 0) ? `+${amount + bowlBonus}` : `+${amount}`;

          return (
            <Button
              key={key}
              onClick={() => handleUse(key)}
              disabled={count === 0 || isLoading}
              className={`${color} ${hoverColor} disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold min-h-20 flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-display transition-all ${animatingItem === key ? 'scale-90' : ''}`}
              data-testid={`button-use-${key}`}
            >
              <Icon size={20} />
              <div className="leading-tight">{label}</div>
              <div className="text-[10px] opacity-80" data-testid={`text-${key}-count`}>
                ({count}) {displayAmount}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
