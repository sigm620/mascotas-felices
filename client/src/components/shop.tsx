import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ShoppingBag, Sparkles, Lock, Check, Star, Minus, Plus, Crown, Glasses, Shirt, Palette, Trees } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COSMETIC_CATALOG, getCosmeticsByType, getCosmeticById, type CosmeticType } from '@shared/cosmetics';
import { PetCharacter, type EquippedCosmetics } from './pet-character';
import type { PetCosmetic, Pet, Inventory, GameState } from '@shared/schema';

interface ShopProps {
  points: number;
  inventory: Inventory;
  gameState: GameState;
  onBuyConsumable: (item: string, quantity: number) => void;
  onBuyPermanent: (item: string) => void;
  isBuyingConsumable?: boolean;
  isBuyingPermanent?: boolean;
  pet?: Pet;
  cosmetics?: PetCosmetic[];
  onBuyCosmetic?: (cosmeticId: string) => void;
  onEquipCosmetic?: (id: string, equip: boolean) => void;
  isCosmeticLoading?: boolean;
}

type ShopTab = 'permanentes' | 'consumibles' | 'accesorios';
type CosmeticCategory = 'hat' | 'collar' | 'glasses' | 'background' | 'bodyColor';

interface ConfirmPurchase {
  name: string;
  totalPrice: number;
  onConfirm: () => void;
}

const CATEGORY_INFO: { type: CosmeticCategory; label: string; icon: typeof Crown }[] = [
  { type: 'hat', label: 'Sombreros', icon: Crown },
  { type: 'collar', label: 'Collares', icon: Shirt },
  { type: 'glasses', label: 'Lentes', icon: Glasses },
  { type: 'background', label: 'Fondos', icon: Trees },
  { type: 'bodyColor', label: 'Colores', icon: Palette },
];

const CONSUMABLE_ITEMS = [
  { id: 'basicFood', label: 'Comida basica', price: 10, effect: '+30 hambre', inventoryKey: 'basicFood' as const },
  { id: 'snack', label: 'Comida especial', price: 20, effect: '+60 hambre', inventoryKey: 'snack' as const },
  { id: 'ball', label: 'Juguete simple', price: 10, effect: '+30 felicidad', inventoryKey: 'ball' as const },
  { id: 'rope', label: 'Juguete especial', price: 20, effect: '+60 felicidad', inventoryKey: 'rope' as const },
  { id: 'medicine', label: 'Medicina', price: 15, effect: '+30 salud', inventoryKey: 'medicine' as const },
];

const BOWL_ITEMS = [
  { id: 'bowl_basic', label: 'Cuenco basico', price: 80, description: 'Cada comida da +10 hambre extra', ownedKey: 'ownedBowlBasic' as const },
  { id: 'bowl_special', label: 'Cuenco especial', price: 150, description: 'Cada comida da +20 hambre extra', ownedKey: 'ownedBowlSpecial' as const },
];

const HOUSE_ITEMS = [
  { id: 'house_basic', label: 'Casita basica', price: 120, description: 'Recupera +10 salud cada noche', ownedKey: 'ownedHouseBasic' as const },
  { id: 'house_fancy', label: 'Casita bonita', price: 200, description: 'Recupera +20 salud cada noche', ownedKey: 'ownedHouseFancy' as const },
];

export function Shop({
  points,
  inventory,
  gameState,
  onBuyConsumable,
  onBuyPermanent,
  isBuyingConsumable = false,
  isBuyingPermanent = false,
  pet,
  cosmetics = [],
  onBuyCosmetic,
  onEquipCosmetic,
  isCosmeticLoading = false,
}: ShopProps) {
  const [tab, setTab] = useState<ShopTab>('permanentes');
  const [category, setCategory] = useState<CosmeticCategory>('hat');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [confirmPurchase, setConfirmPurchase] = useState<ConfirmPurchase | null>(null);

  const getQuantity = (id: string) => quantities[id] || 1;
  const setQuantity = (id: string, val: number) => setQuantities(prev => ({ ...prev, [id]: val }));

  const ownedIds = new Set(cosmetics.map(c => c.cosmeticId));
  const equippedMap: Record<string, PetCosmetic> = {};
  for (const c of cosmetics) {
    if (c.equipped) {
      const item = getCosmeticById(c.cosmeticId);
      if (item) equippedMap[item.type] = c;
    }
  }

  const currentEquipped: EquippedCosmetics = {};
  for (const c of cosmetics) {
    if (!c.equipped) continue;
    const item = getCosmeticById(c.cosmeticId);
    if (!item) continue;
    if (item.type === 'hat') currentEquipped.hat = c.cosmeticId;
    if (item.type === 'collar') currentEquipped.collar = c.cosmeticId;
    if (item.type === 'glasses') currentEquipped.glasses = c.cosmeticId;
  }

  const previewEquipped: EquippedCosmetics = { ...currentEquipped };
  let previewBodyColor = pet?.bodyColor;
  if (previewId) {
    const previewItem = getCosmeticById(previewId);
    if (previewItem) {
      if (previewItem.type === 'hat') previewEquipped.hat = previewId;
      if (previewItem.type === 'collar') previewEquipped.collar = previewId;
      if (previewItem.type === 'glasses') previewEquipped.glasses = previewId;
      if (previewItem.type === 'bodyColor') previewBodyColor = previewId === 'color_default' ? null : previewId;
    }
  }

  const categoryItems = getCosmeticsByType(category);

  return (
    <div className="bg-yellow-50 rounded-2xl p-6" data-testid="shop-section">
      <h3 className="text-xl font-bold font-display text-gray-800 mb-4 flex items-center gap-2">
        <ShoppingBag className="text-yellow-600" size={24} />
        Tienda
      </h3>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          variant="outline"
          onClick={() => setTab('permanentes')}
          className={cn(
            "flex-1 font-bold font-display",
            tab === 'permanentes' ? 'bg-amber-200 border-amber-400' : 'bg-white'
          )}
          data-testid="button-tab-permanentes"
        >
          <Star size={16} className="mr-1" />
          Permanentes
        </Button>
        <Button
          variant="outline"
          onClick={() => setTab('consumibles')}
          className={cn(
            "flex-1 font-bold font-display",
            tab === 'consumibles' ? 'bg-yellow-200 border-yellow-400' : 'bg-white'
          )}
          data-testid="button-tab-consumibles"
        >
          <ShoppingBag size={16} className="mr-1" />
          Consumibles
        </Button>
        <Button
          variant="outline"
          onClick={() => { setTab('accesorios'); setPreviewId(null); }}
          className={cn(
            "flex-1 font-bold font-display",
            tab === 'accesorios' ? 'bg-purple-200 border-purple-400' : 'bg-white'
          )}
          data-testid="button-tab-accesorios"
        >
          <Sparkles size={16} className="mr-1" />
          Accesorios
        </Button>
      </div>

      {tab === 'permanentes' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-bold font-display text-gray-700 mb-3">Cuencos</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOWL_ITEMS.map((item) => {
                const owned = gameState[item.ownedKey];
                const isActive = gameState.activeBowl === item.id;
                const canAfford = points >= item.price;
                const missing = item.price - points;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "bg-white border-2 rounded-xl p-4 flex flex-col items-center gap-2",
                      owned ? 'border-green-300' : canAfford ? 'border-amber-300' : 'border-gray-200 opacity-70'
                    )}
                    data-testid={`permanent-item-${item.id}`}
                  >
                    {renderBowlIcon(item.id)}
                    <span className="text-sm font-bold font-display text-center">{item.label}</span>
                    <span className="text-xs text-muted-foreground text-center">{item.description}</span>

                    {owned ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="default" className="bg-green-500">
                          <Check size={12} className="mr-1" />
                          Comprado
                        </Badge>
                        {isActive && (
                          <span className="text-xs font-bold text-green-600" data-testid={`text-active-${item.id}`}>(Activo)</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 w-full">
                        <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                          <Star size={14} fill="currentColor" />
                          {item.price} monedas
                        </div>
                        {canAfford ? (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setConfirmPurchase({
                              name: item.label,
                              totalPrice: item.price,
                              onConfirm: () => { onBuyPermanent(item.id); setConfirmPurchase(null); },
                            })}
                            disabled={isBuyingPermanent}
                            data-testid={`button-buy-${item.id}`}
                          >
                            Comprar
                          </Button>
                        ) : (
                          <Button size="sm" className="w-full" disabled variant="outline" data-testid={`button-locked-${item.id}`}>
                            <Lock size={14} className="mr-1" />
                            Te faltan {missing} monedas
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold font-display text-gray-700 mb-3">Casitas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HOUSE_ITEMS.map((item) => {
                const owned = gameState[item.ownedKey];
                const isActive = gameState.activeHouse === item.id;
                const canAfford = points >= item.price;
                const missing = item.price - points;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "bg-white border-2 rounded-xl p-4 flex flex-col items-center gap-2",
                      owned ? 'border-green-300' : canAfford ? 'border-amber-300' : 'border-gray-200 opacity-70'
                    )}
                    data-testid={`permanent-item-${item.id}`}
                  >
                    {renderHouseIcon(item.id)}
                    <span className="text-sm font-bold font-display text-center">{item.label}</span>
                    <span className="text-xs text-muted-foreground text-center">{item.description}</span>

                    {owned ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant="default" className="bg-green-500">
                          <Check size={12} className="mr-1" />
                          Comprado
                        </Badge>
                        {isActive && (
                          <span className="text-xs font-bold text-green-600" data-testid={`text-active-${item.id}`}>(Activo)</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 w-full">
                        <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                          <Star size={14} fill="currentColor" />
                          {item.price} monedas
                        </div>
                        {canAfford ? (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setConfirmPurchase({
                              name: item.label,
                              totalPrice: item.price,
                              onConfirm: () => { onBuyPermanent(item.id); setConfirmPurchase(null); },
                            })}
                            disabled={isBuyingPermanent}
                            data-testid={`button-buy-${item.id}`}
                          >
                            Comprar
                          </Button>
                        ) : (
                          <Button size="sm" className="w-full" disabled variant="outline" data-testid={`button-locked-${item.id}`}>
                            <Lock size={14} className="mr-1" />
                            Te faltan {missing} monedas
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'consumibles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CONSUMABLE_ITEMS.map((item) => {
            const currentCount = inventory[item.inventoryKey] ?? 0;
            const qty = getQuantity(item.id);
            const maxBuyable = 10 - currentCount;
            const totalPrice = item.price * qty;
            const canAfford = points >= totalPrice;
            const missing = totalPrice - points;
            const canBuy = canAfford && qty <= maxBuyable && qty > 0;

            return (
              <div
                key={item.id}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2"
                data-testid={`consumable-item-${item.id}`}
              >
                {renderConsumableIcon(item.id)}
                <span className="text-sm font-bold font-display text-center">
                  {item.label} ({currentCount})
                </span>
                <span className="text-xs text-muted-foreground">{item.effect}</span>
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                  <Star size={12} fill="currentColor" />
                  {item.price} monedas c/u
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(item.id, Math.max(1, qty - 1))}
                    disabled={qty <= 1}
                    data-testid={`button-qty-minus-${item.id}`}
                  >
                    <Minus size={14} />
                  </Button>
                  <span className="text-sm font-bold w-6 text-center" data-testid={`text-qty-${item.id}`}>{qty}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(item.id, Math.min(maxBuyable, qty + 1))}
                    disabled={qty >= maxBuyable}
                    data-testid={`button-qty-plus-${item.id}`}
                  >
                    <Plus size={14} />
                  </Button>
                </div>

                <div className="text-xs font-bold text-gray-600">
                  Total: {totalPrice} monedas
                </div>

                {maxBuyable <= 0 ? (
                  <Button size="sm" className="w-full" disabled variant="outline">
                    Inventario lleno
                  </Button>
                ) : canBuy ? (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => setConfirmPurchase({
                      name: `${item.label} x${qty}`,
                      totalPrice,
                      onConfirm: () => { onBuyConsumable(item.id, qty); setConfirmPurchase(null); },
                    })}
                    disabled={isBuyingConsumable}
                    data-testid={`button-buy-${item.id}`}
                  >
                    Comprar
                  </Button>
                ) : (
                  <div className="flex flex-col items-center gap-1 w-full">
                    <Button size="sm" className="w-full" disabled variant="outline" data-testid={`button-locked-${item.id}`}>
                      <Lock size={14} className="mr-1" />
                      Comprar
                    </Button>
                    <span className="text-xs text-red-500 font-medium">Te faltan {missing} monedas</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'accesorios' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1">
            {CATEGORY_INFO.map(({ type, label, icon: Icon }) => (
              <Button
                key={type}
                size="sm"
                variant="outline"
                onClick={() => { setCategory(type); setPreviewId(null); }}
                className={cn(
                  "text-xs font-bold",
                  category === type ? 'bg-purple-100 border-purple-400' : 'bg-white'
                )}
                data-testid={`button-category-${type}`}
              >
                <Icon size={14} className="mr-1" />
                {label}
              </Button>
            ))}
          </div>

          {pet && previewId && (
            <div className="bg-white rounded-xl p-3 flex items-center justify-center" data-testid="cosmetic-preview">
              <div className="w-24 h-24">
                <PetCharacter
                  petType={pet.type}
                  state="happy"
                  bodyColor={previewBodyColor}
                  equipped={previewEquipped}
                />
              </div>
              <div className="ml-3 text-sm font-semibold text-gray-600">
                Vista previa
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categoryItems.map((item) => {
              const owned = ownedIds.has(item.id);
              const ownedRecord = cosmetics.find(c => c.cosmeticId === item.id);
              const isEquipped = ownedRecord?.equipped ?? false;
              const canAfford = points >= item.price;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "bg-white border-2 rounded-xl p-3 flex flex-col items-center gap-2 transition-all cursor-pointer",
                    previewId === item.id ? 'border-purple-500 ring-2 ring-purple-200' : owned ? 'border-green-300' : 'border-gray-200',
                    !owned && !canAfford && 'opacity-50'
                  )}
                  onClick={() => setPreviewId(previewId === item.id ? null : item.id)}
                  data-testid={`cosmetic-item-${item.id}`}
                >
                  {renderCosmeticIcon(item.id, item.type)}
                  <span className="text-xs font-bold font-display text-center leading-tight">{item.name}</span>

                  {owned ? (
                    <div className="flex flex-col items-center gap-1 w-full">
                      <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <Check size={12} />
                        Obtenido
                      </span>
                      {onEquipCosmetic && ownedRecord && (
                        <Button
                          size="sm"
                          variant={isEquipped ? "default" : "outline"}
                          className="w-full text-xs min-h-7"
                          onClick={(e) => { e.stopPropagation(); onEquipCosmetic(ownedRecord.id, !isEquipped); }}
                          disabled={isCosmeticLoading}
                          data-testid={`button-equip-${item.id}`}
                        >
                          {isEquipped ? 'Quitar' : 'Equipar'}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 w-full">
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                        <Star size={12} fill="currentColor" />
                        {item.price}
                      </div>
                      {onBuyCosmetic && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs min-h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmPurchase({
                              name: item.name,
                              totalPrice: item.price,
                              onConfirm: () => { onBuyCosmetic(item.id); setConfirmPurchase(null); },
                            });
                          }}
                          disabled={!canAfford || isCosmeticLoading}
                          data-testid={`button-buy-cosmetic-${item.id}`}
                        >
                          Comprar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={!!confirmPurchase} onOpenChange={(open) => { if (!open) setConfirmPurchase(null); }}>
        <DialogContent className="sm:max-w-sm" data-testid="dialog-confirm-purchase">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Confirmar compra</DialogTitle>
            <DialogDescription>
              Seguro que quieres comprar {confirmPurchase?.name} por {confirmPurchase?.totalPrice} monedas?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmPurchase(null)} data-testid="button-cancel-purchase">
              Cancelar
            </Button>
            <Button onClick={() => confirmPurchase?.onConfirm()} data-testid="button-confirm-purchase">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function renderBowlIcon(id: string) {
  if (id === 'bowlBasic') {
    return (
      <svg width="48" height="36" viewBox="0 0 48 36" data-testid={`icon-bowl-${id}`}>
        <path d="M8 14 Q8 30 24 32 Q40 30 40 14 Z" fill="#9E9E9E" />
        <ellipse cx="24" cy="14" rx="16" ry="6" fill="#BDBDBD" />
        <ellipse cx="24" cy="14" rx="12" ry="4" fill="#E0E0E0" />
        <rect x="6" y="30" width="36" height="4" rx="2" fill="#757575" />
      </svg>
    );
  }
  return (
    <svg width="56" height="42" viewBox="0 0 56 42" data-testid={`icon-bowl-${id}`}>
      <path d="M6 16 Q6 34 28 36 Q50 34 50 16 Z" fill="#4DB6AC" />
      <ellipse cx="28" cy="16" rx="22" ry="8" fill="#80CBC4" />
      <ellipse cx="28" cy="16" rx="16" ry="5" fill="#B2DFDB" />
      <circle cx="28" cy="26" r="5" fill="none" stroke="#00796B" strokeWidth="1.5" />
      <ellipse cx="26" cy="24" rx="2" ry="2.5" fill="#00796B" />
      <ellipse cx="30" cy="24" rx="2" ry="2.5" fill="#00796B" />
      <ellipse cx="28" cy="28" rx="1.5" ry="1" fill="#00796B" />
      <rect x="4" y="34" width="48" height="4" rx="2" fill="#00897B" />
    </svg>
  );
}

function renderHouseIcon(id: string) {
  if (id === 'houseBasic') {
    return (
      <svg width="48" height="44" viewBox="0 0 48 44" data-testid={`icon-house-${id}`}>
        <polygon points="24,4 4,20 44,20" fill="#D32F2F" />
        <rect x="10" y="20" width="28" height="20" fill="#8D6E63" />
        <rect x="18" y="28" width="12" height="12" rx="1" fill="#5D4037" />
        <circle cx="27" cy="34" r="1" fill="#FFD54F" />
        <rect x="14" y="23" width="6" height="5" rx="1" fill="#BBDEFB" />
        <rect x="28" y="23" width="6" height="5" rx="1" fill="#BBDEFB" />
      </svg>
    );
  }
  return (
    <svg width="56" height="50" viewBox="0 0 56 50" data-testid={`icon-house-${id}`}>
      <polygon points="28,2 2,22 54,22" fill="#E91E63" />
      <rect x="8" y="22" width="40" height="24" fill="#FFF9C4" />
      <rect x="8" y="22" width="40" height="24" fill="none" stroke="#F48FB1" strokeWidth="1" />
      <rect x="20" y="32" width="16" height="14" rx="2" fill="#7B1FA2" />
      <circle cx="32" cy="39" r="1.2" fill="#FFD54F" />
      <rect x="12" y="25" width="8" height="7" rx="1" fill="#81D4FA" />
      <rect x="36" y="25" width="8" height="7" rx="1" fill="#81D4FA" />
      <line x1="16" y1="25" x2="16" y2="32" stroke="#B3E5FC" strokeWidth="0.5" />
      <line x1="12" y1="28.5" x2="20" y2="28.5" stroke="#B3E5FC" strokeWidth="0.5" />
      <line x1="40" y1="25" x2="40" y2="32" stroke="#B3E5FC" strokeWidth="0.5" />
      <line x1="36" y1="28.5" x2="44" y2="28.5" stroke="#B3E5FC" strokeWidth="0.5" />
      <circle cx="10" cy="44" r="3" fill="#66BB6A" />
      <circle cx="14" cy="42" r="2.5" fill="#81C784" />
      <circle cx="46" cy="44" r="3" fill="#66BB6A" />
      <circle cx="42" cy="42" r="2.5" fill="#81C784" />
      <circle cx="12" cy="43" r="1.5" fill="#E91E63" />
      <circle cx="44" cy="43" r="1.5" fill="#FF9800" />
      <circle cx="15" cy="41" r="1" fill="#FFEB3B" />
      <circle cx="41" cy="41" r="1" fill="#FFEB3B" />
    </svg>
  );
}

function renderConsumableIcon(id: string) {
  const size = 40;
  switch (id) {
    case 'basicFood':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" data-testid={`icon-consumable-${id}`}>
          <ellipse cx="20" cy="28" rx="16" ry="6" fill="#E0E0E0" />
          <ellipse cx="20" cy="26" rx="14" ry="5" fill="#F5F5F5" />
          <circle cx="14" cy="22" r="4" fill="#8D6E63" />
          <circle cx="22" cy="20" r="3.5" fill="#FF8A65" />
          <circle cx="18" cy="18" r="3" fill="#A5D6A7" />
          <circle cx="26" cy="23" r="3" fill="#FFCC80" />
        </svg>
      );
    case 'snack':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" data-testid={`icon-consumable-${id}`}>
          <rect x="12" y="8" width="16" height="28" rx="4" fill="#FF7043" />
          <rect x="14" y="10" width="12" height="8" rx="2" fill="#FFAB91" />
          <rect x="14" y="22" width="12" height="3" rx="1" fill="#FFD54F" />
          <circle cx="17" cy="14" r="1.5" fill="#FFD54F" />
          <circle cx="23" cy="12" r="1" fill="#FFF9C4" />
          <circle cx="20" cy="30" r="2" fill="#D84315" />
        </svg>
      );
    case 'ball':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" data-testid={`icon-consumable-${id}`}>
          <circle cx="20" cy="20" r="14" fill="#F44336" />
          <path d="M10 14 Q20 18 30 14" stroke="white" strokeWidth="2" fill="none" />
          <path d="M10 26 Q20 22 30 26" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="14" cy="14" r="3" fill="white" opacity="0.3" />
        </svg>
      );
    case 'rope':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" data-testid={`icon-consumable-${id}`}>
          <path d="M8 32 Q14 10 20 20 Q26 30 32 8" stroke="#8D6E63" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="8" cy="32" r="3" fill="#A1887F" />
          <circle cx="32" cy="8" r="3" fill="#A1887F" />
          <path d="M8 32 Q14 10 20 20 Q26 30 32 8" stroke="#BCAAA4" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="3 4" />
        </svg>
      );
    case 'medicine':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" data-testid={`icon-consumable-${id}`}>
          <rect x="10" y="12" width="20" height="20" rx="4" fill="#EF5350" />
          <rect x="18" y="16" width="4" height="12" rx="1" fill="white" />
          <rect x="14" y="20" width="12" height="4" rx="1" fill="white" />
          <rect x="10" y="8" width="20" height="6" rx="2" fill="#C62828" />
        </svg>
      );
    default:
      return <div className="w-10 h-10 bg-gray-200 rounded-full" />;
  }
}

function renderCosmeticIcon(id: string, type: CosmeticType) {
  const size = 36;
  if (type === 'bodyColor') {
    const colorMap: Record<string, string> = {
      color_pink: '#F48FB1',
      color_blue: '#64B5F6',
      color_green: '#81C784',
      color_purple: '#AB47BC',
      color_golden: '#FFD54F',
      color_default: '#D4915A',
    };
    return (
      <div
        className="w-9 h-9 rounded-full border-2 border-gray-300"
        style={{ backgroundColor: colorMap[id] || '#ccc' }}
        data-testid={`icon-color-${id}`}
      />
    );
  }

  if (type === 'background') {
    const bgMap: Record<string, { bg: string; accent: string }> = {
      bg_garden: { bg: '#4ade80', accent: '#87CEEB' },
      bg_beach: { bg: '#f4d03f', accent: '#0ea5e9' },
      bg_forest: { bg: '#15803d', accent: '#166534' },
      bg_space: { bg: '#1a0a2e', accent: '#6d28d9' },
      bg_house: { bg: '#8B5E3C', accent: '#fef3c7' },
    };
    const colors = bgMap[id] || { bg: '#ccc', accent: '#999' };
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" data-testid={`icon-bg-${id}`}>
        <rect width="36" height="20" fill={colors.accent} rx="4" />
        <rect y="16" width="36" height="20" fill={colors.bg} rx="4" />
      </svg>
    );
  }

  if (type === 'hat') {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" data-testid={`icon-hat-${id}`}>
        {id === 'hat_cowboy' && (
          <g>
            <ellipse cx="18" cy="26" rx="16" ry="4" fill="#8B6914" />
            <rect x="8" y="14" width="20" height="12" rx="4" fill="#A0792C" />
            <ellipse cx="18" cy="14" rx="10" ry="4" fill="#B8912E" />
          </g>
        )}
        {id === 'hat_crown' && (
          <g>
            <rect x="6" y="16" width="24" height="12" rx="2" fill="#FFD700" />
            <polygon points="6,16 12,6 18,16" fill="#FFD700" />
            <polygon points="18,16 24,6 30,16" fill="#FFD700" />
            <circle cx="12" cy="8" r="2" fill="#E53935" />
            <circle cx="24" cy="8" r="2" fill="#1E88E5" />
          </g>
        )}
        {id === 'hat_wizard' && (
          <g>
            <polygon points="18,2 6,28 30,28" fill="#5C3D99" />
            <ellipse cx="18" cy="28" rx="14" ry="4" fill="#7B52B5" />
            <circle cx="16" cy="14" r="2" fill="#FFD54F" />
            <circle cx="20" cy="8" r="1.5" fill="#FFD54F" />
          </g>
        )}
        {id === 'hat_party' && (
          <g>
            <polygon points="18,4 8,28 28,28" fill="#FF5722" />
            <ellipse cx="18" cy="28" rx="12" ry="3" fill="#E64A19" />
            <circle cx="18" cy="4" r="3" fill="#FFEB3B" />
          </g>
        )}
        {id === 'hat_beanie' && (
          <g>
            <ellipse cx="18" cy="22" rx="14" ry="10" fill="#E53935" />
            <ellipse cx="18" cy="26" rx="14" ry="4" fill="#C62828" />
            <circle cx="18" cy="12" r="4" fill="#FFCDD2" />
          </g>
        )}
      </svg>
    );
  }

  if (type === 'collar') {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" data-testid={`icon-collar-${id}`}>
        {id === 'collar_bowtie' && (
          <g>
            <polygon points="8,14 18,20 18,14" fill="#E53935" />
            <polygon points="28,14 18,20 18,14" fill="#C62828" />
            <circle cx="18" cy="16" r="3" fill="#FF5252" />
          </g>
        )}
        {id === 'collar_bandana' && (
          <g>
            <path d="M4 14 Q18 10 32 14 L24 28 L18 24 L12 28 Z" fill="#1565C0" />
          </g>
        )}
        {id === 'collar_bell' && (
          <g>
            <path d="M4 14 Q18 10 32 14" stroke="#E53935" strokeWidth="3" fill="none" />
            <circle cx="18" cy="22" r="5" fill="#FFD54F" stroke="#F9A825" strokeWidth="1" />
          </g>
        )}
        {id === 'collar_ribbon' && (
          <g>
            <path d="M4 14 Q18 10 32 14" stroke="#AB47BC" strokeWidth="3" fill="none" />
            <path d="M14 16 L8 28 L18 22 L28 28 L22 16" fill="#CE93D8" />
          </g>
        )}
        {id === 'collar_chain' && (
          <g>
            <path d="M4 14 Q18 10 32 14" stroke="#FFD54F" strokeWidth="3" fill="none" strokeDasharray="4 3" />
            <circle cx="18" cy="18" r="4" fill="none" stroke="#FFD54F" strokeWidth="2" />
          </g>
        )}
      </svg>
    );
  }

  if (type === 'glasses') {
    return (
      <svg width={size} height={size} viewBox="0 0 36 36" data-testid={`icon-glasses-${id}`}>
        {id === 'glasses_sun' && (
          <g>
            <rect x="4" y="12" width="12" height="10" rx="3" fill="#1A1A1A" opacity="0.85" />
            <rect x="20" y="12" width="12" height="10" rx="3" fill="#1A1A1A" opacity="0.85" />
            <line x1="16" y1="17" x2="20" y2="17" stroke="#1A1A1A" strokeWidth="2" />
          </g>
        )}
        {id === 'glasses_star' && (
          <g>
            <polygon points="10,10 12,16 18,16 13,20 15,26 10,22 5,26 7,20 2,16 8,16" fill="#FFD54F" stroke="#F9A825" strokeWidth="0.5" transform="scale(0.7) translate(4,4)" />
            <polygon points="26,10 28,16 34,16 29,20 31,26 26,22 21,26 23,20 18,16 24,16" fill="#FFD54F" stroke="#F9A825" strokeWidth="0.5" transform="scale(0.7) translate(4,4)" />
            <line x1="14" y1="17" x2="18" y2="17" stroke="#F9A825" strokeWidth="1.5" />
          </g>
        )}
        {id === 'glasses_round' && (
          <g>
            <circle cx="11" cy="17" r="7" fill="none" stroke="#5D4037" strokeWidth="2" />
            <circle cx="25" cy="17" r="7" fill="none" stroke="#5D4037" strokeWidth="2" />
            <line x1="18" y1="17" x2="18" y2="17" stroke="#5D4037" strokeWidth="2" />
          </g>
        )}
        {id === 'glasses_heart' && (
          <g>
            <path d="M4 16 C4 12 8 8 12 12 C16 8 20 12 20 16 C20 22 12 26 12 26 C12 26 4 22 4 16Z" fill="#E91E63" opacity="0.7" transform="scale(0.8) translate(2,2)" />
            <path d="M20 16 C20 12 24 8 28 12 C32 8 36 12 36 16 C36 22 28 26 28 26 C28 26 20 22 20 16Z" fill="#E91E63" opacity="0.7" transform="scale(0.8) translate(2,2)" />
          </g>
        )}
        {id === 'glasses_mask' && (
          <g>
            <path d="M2 14 Q10 8 18 12 Q26 8 34 14 L30 22 Q24 26 18 22 Q12 26 6 22 Z" fill="#1A237E" opacity="0.85" />
            <ellipse cx="11" cy="17" rx="5" ry="4" fill="white" opacity="0.9" />
            <ellipse cx="25" cy="17" rx="5" ry="4" fill="white" opacity="0.9" />
          </g>
        )}
      </svg>
    );
  }

  return <div className="w-9 h-9 bg-gray-200 rounded-full" />;
}