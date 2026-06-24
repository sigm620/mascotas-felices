export type CosmeticType = 'hat' | 'collar' | 'glasses' | 'background' | 'bodyColor';

export interface CosmeticItem {
  id: string;
  name: string;
  type: CosmeticType;
  price: number;
}

export const COSMETIC_CATALOG: CosmeticItem[] = [
  { id: 'hat_cowboy', name: 'Sombrero Vaquero', type: 'hat', price: 80 },
  { id: 'hat_crown', name: 'Corona Real', type: 'hat', price: 200 },
  { id: 'hat_wizard', name: 'Gorro de Mago', type: 'hat', price: 80 },
  { id: 'hat_party', name: 'Gorro de Fiesta', type: 'hat', price: 80 },
  { id: 'hat_beanie', name: 'Gorro de Lana', type: 'hat', price: 80 },

  { id: 'collar_bowtie', name: 'Corbatín', type: 'collar', price: 80 },
  { id: 'collar_bandana', name: 'Pañuelo', type: 'collar', price: 80 },
  { id: 'collar_bell', name: 'Cascabel', type: 'collar', price: 80 },
  { id: 'collar_ribbon', name: 'Lazo', type: 'collar', price: 80 },
  { id: 'collar_chain', name: 'Cadena Dorada', type: 'collar', price: 200 },

  { id: 'glasses_sun', name: 'Gafas de Sol', type: 'glasses', price: 100 },
  { id: 'glasses_star', name: 'Gafas Estrella', type: 'glasses', price: 100 },
  { id: 'glasses_round', name: 'Gafas Redondas', type: 'glasses', price: 100 },
  { id: 'glasses_heart', name: 'Gafas Corazón', type: 'glasses', price: 100 },
  { id: 'glasses_mask', name: 'Antifaz', type: 'glasses', price: 100 },

  { id: 'bg_beach', name: 'Playa', type: 'background', price: 150 },
  { id: 'bg_forest', name: 'Bosque', type: 'background', price: 150 },
  { id: 'bg_space', name: 'Espacio', type: 'background', price: 150 },
  { id: 'bg_house', name: 'Casa', type: 'background', price: 150 },
  { id: 'bg_garden', name: 'Jardín', type: 'background', price: 0 },

  { id: 'color_pink', name: 'Rosa', type: 'bodyColor', price: 120 },
  { id: 'color_blue', name: 'Azul', type: 'bodyColor', price: 120 },
  { id: 'color_green', name: 'Verde', type: 'bodyColor', price: 120 },
  { id: 'color_purple', name: 'Morado', type: 'bodyColor', price: 120 },
  { id: 'color_golden', name: 'Dorado', type: 'bodyColor', price: 200 },
  { id: 'color_default', name: 'Original', type: 'bodyColor', price: 0 },
];

export const BODY_COLOR_MAP: Record<string, { body: string; belly: string; dark: string; ear: string; earInner: string; spot: string }> = {
  color_pink: { body: '#F48FB1', belly: '#FCE4EC', dark: '#EC407A', ear: '#EC407A', earInner: '#FFCDD2', spot: '#F06292' },
  color_blue: { body: '#64B5F6', belly: '#E3F2FD', dark: '#42A5F5', ear: '#42A5F5', earInner: '#BBDEFB', spot: '#5C9CE6' },
  color_green: { body: '#81C784', belly: '#E8F5E9', dark: '#66BB6A', ear: '#66BB6A', earInner: '#C8E6C9', spot: '#72B875' },
  color_purple: { body: '#AB47BC', belly: '#F3E5F5', dark: '#8E24AA', ear: '#8E24AA', earInner: '#E1BEE7', spot: '#9C3FAD' },
  color_golden: { body: '#FFD54F', belly: '#FFFDE7', dark: '#FFCA28', ear: '#FFCA28', earInner: '#FFF9C4', spot: '#FFC940' },
};

export function getCosmeticById(id: string): CosmeticItem | undefined {
  return COSMETIC_CATALOG.find(c => c.id === id);
}

export function getCosmeticsByType(type: CosmeticType): CosmeticItem[] {
  return COSMETIC_CATALOG.filter(c => c.type === type);
}
