import { useState, useEffect, useCallback } from 'react';
import { Droplets, Smile, Heart, Moon, Sun } from 'lucide-react';
import type { Pet, PetCosmetic, GameState } from '@shared/schema';
import { PetCharacter, type PetState, type EquippedCosmetics } from './pet-character';
import { getCosmeticById } from '@shared/cosmetics';

interface PetDisplayProps {
  pet: Pet;
  cosmetics?: PetCosmetic[];
  gameState?: GameState;
  playAnimation?: string | null;
}

function useIsNightTime() {
  const [isNight, setIsNight] = useState(() => {
    const h = new Date().getHours();
    return h >= 21 || h < 7;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const h = new Date().getHours();
      setIsNight(h >= 21 || h < 7);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return isNight;
}

function FloatingHearts() {
  return (
    <div className="habitat-hearts" data-testid="pet-hearts">
      <svg className="habitat-heart habitat-heart-1" width="18" height="18" viewBox="0 0 24 24" fill="#f472b6"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
      <svg className="habitat-heart habitat-heart-2" width="14" height="14" viewBox="0 0 24 24" fill="#fb7185"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
      <svg className="habitat-heart habitat-heart-3" width="16" height="16" viewBox="0 0 24 24" fill="#fda4af"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
    </div>
  );
}

function SadCloud() {
  return (
    <div className="habitat-sad-cloud" data-testid="pet-sad-cloud">
      <svg width="60" height="38" viewBox="0 0 60 38" fill="none">
        <ellipse cx="30" cy="24" rx="24" ry="13" fill="#b0bec5" opacity="0.85" />
        <ellipse cx="18" cy="17" rx="14" ry="11" fill="#cfd8dc" opacity="0.9" />
        <ellipse cx="40" cy="15" rx="15" ry="12" fill="#cfd8dc" opacity="0.9" />
        <ellipse cx="30" cy="13" rx="11" ry="9" fill="#e0e0e0" opacity="0.95" />
      </svg>
      <div className="habitat-rain-drops">
        <span className="habitat-rain habitat-rain-1" />
        <span className="habitat-rain habitat-rain-2" />
        <span className="habitat-rain habitat-rain-3" />
      </div>
    </div>
  );
}

function SneezeParticles() {
  return (
    <div className="habitat-sneeze" data-testid="pet-sneeze">
      <span className="habitat-sneeze-dot habitat-sneeze-dot-1" />
      <span className="habitat-sneeze-dot habitat-sneeze-dot-2" />
      <span className="habitat-sneeze-dot habitat-sneeze-dot-3" />
    </div>
  );
}

function SleepZzz() {
  return (
    <div className="habitat-zzz" data-testid="pet-sleeping">
      <span className="habitat-z habitat-z-1">Z</span>
      <span className="habitat-z habitat-z-2">z</span>
      <span className="habitat-z habitat-z-3">Z</span>
    </div>
  );
}

function HungryZzz() {
  return (
    <div className="habitat-tired-zzz" data-testid="pet-yawn">
      <span className="habitat-z habitat-z-sm-1">z</span>
      <span className="habitat-z habitat-z-sm-2">z</span>
    </div>
  );
}

function PetClickWrapper({ petState, children }: { petState: PetState; children: React.ReactNode }) {
  const [isSurprised, setIsSurprised] = useState(false);

  const handleClick = useCallback(() => {
    if (isSurprised || petState === 'sleeping') return;
    setIsSurprised(true);
  }, [isSurprised, petState]);

  const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.animationName === 'pet-surprise') {
      setIsSurprised(false);
    }
  }, []);

  const directionClass = petState === 'sleeping' ? '' : 'pet-face-direction';
  const surpriseClass = isSurprised ? 'pet-surprise-anim' : '';

  return (
    <div
      className={directionClass}
      data-testid="pet-direction-wrapper"
    >
      <div
        className={surpriseClass}
        onClick={handleClick}
        onAnimationEnd={handleAnimationEnd}
        style={{ cursor: 'pointer' }}
        data-testid="pet-click-wrapper"
      >
        {children}
      </div>
    </div>
  );
}

function BeachDecorations({ isNight }: { isNight: boolean }) {
  return (
    <>
      <div className="habitat-palm-tree" data-testid="decor-palm">
        <svg width="50" height="100" viewBox="0 0 50 100">
          <rect x="22" y="30" width="6" height="70" rx="2" fill={isNight ? '#3a2510' : '#8B5E3C'} />
          <ellipse cx="25" cy="28" rx="22" ry="10" fill={isNight ? '#0a3010' : '#16a34a'} />
          <ellipse cx="15" cy="22" rx="16" ry="6" fill={isNight ? '#0d3a12' : '#22c55e'} transform="rotate(-20 15 22)" />
          <ellipse cx="35" cy="22" rx="16" ry="6" fill={isNight ? '#0d3a12' : '#22c55e'} transform="rotate(20 35 22)" />
          <ellipse cx="25" cy="18" rx="14" ry="5" fill={isNight ? '#0f4518' : '#4ade80'} />
        </svg>
      </div>
      <div className="habitat-waves" data-testid="decor-waves">
        <svg className="habitat-wave-svg" viewBox="0 0 400 20" preserveAspectRatio="none">
          <path d="M0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 Q70 20 80 10 Q90 0 100 10 Q110 20 120 10 Q130 0 140 10 Q150 20 160 10 Q170 0 180 10 Q190 20 200 10 Q210 0 220 10 Q230 20 240 10 Q250 0 260 10 Q270 20 280 10 Q290 0 300 10 Q310 20 320 10 Q330 0 340 10 Q350 20 360 10 Q370 0 380 10 Q390 20 400 10 L400 20 L0 20 Z" fill={isNight ? '#0c4a6e' : '#0ea5e9'} opacity="0.4" />
        </svg>
      </div>
    </>
  );
}

function ForestDecorations({ isNight }: { isNight: boolean }) {
  return (
    <>
      <div className="habitat-tree-trunk habitat-tree-trunk-1" data-testid="decor-tree-1">
        <svg width="30" height="90" viewBox="0 0 30 90">
          <rect x="10" y="0" width="10" height="90" rx="3" fill={isNight ? '#2a1a0a' : '#6d4528'} />
          <ellipse cx="15" cy="10" rx="15" ry="20" fill={isNight ? '#0a2a0a' : '#166534'} />
          <ellipse cx="15" cy="5" rx="10" ry="14" fill={isNight ? '#0d3312' : '#15803d'} />
        </svg>
      </div>
      <div className="habitat-tree-trunk habitat-tree-trunk-2" data-testid="decor-tree-2">
        <svg width="24" height="70" viewBox="0 0 24 70">
          <rect x="8" y="0" width="8" height="70" rx="3" fill={isNight ? '#2a1a0a' : '#6d4528'} />
          <ellipse cx="12" cy="8" rx="12" ry="16" fill={isNight ? '#0a2a0a' : '#166534'} />
        </svg>
      </div>
      <div className="habitat-mushrooms" data-testid="decor-mushrooms">
        <svg className="habitat-mushroom habitat-mushroom-1" width="16" height="16" viewBox="0 0 16 16">
          <rect x="6" y="8" width="4" height="8" rx="1" fill={isNight ? '#4a3a2a' : '#fef3c7'} />
          <ellipse cx="8" cy="8" rx="7" ry="5" fill={isNight ? '#5a1a1a' : '#ef4444'} />
          <circle cx="5" cy="6" r="1.5" fill={isNight ? '#6a2a2a' : '#fef2f2'} />
          <circle cx="10" cy="7" r="1" fill={isNight ? '#6a2a2a' : '#fef2f2'} />
        </svg>
        <svg className="habitat-mushroom habitat-mushroom-2" width="12" height="12" viewBox="0 0 12 12">
          <rect x="4.5" y="6" width="3" height="6" rx="1" fill={isNight ? '#4a3a2a' : '#fef3c7'} />
          <ellipse cx="6" cy="6" rx="5" ry="4" fill={isNight ? '#3a2a1a' : '#f59e0b'} />
          <circle cx="4" cy="5" r="1" fill={isNight ? '#4a3a2a' : '#fef9c3'} />
        </svg>
      </div>
    </>
  );
}

function SpaceDecorations() {
  return (
    <>
      <div className="habitat-planet" data-testid="decor-planet">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="#7c3aed" opacity="0.7" />
          <ellipse cx="20" cy="20" rx="22" ry="4" fill="none" stroke="#a78bfa" strokeWidth="1.5" opacity="0.5" />
          <circle cx="14" cy="15" r="3" fill="#6d28d9" opacity="0.5" />
          <circle cx="24" cy="24" r="2" fill="#6d28d9" opacity="0.4" />
        </svg>
      </div>
      <div className="habitat-asteroids" data-testid="decor-asteroids">
        <svg className="habitat-asteroid habitat-asteroid-1" width="18" height="16" viewBox="0 0 18 16">
          <polygon points="9,0 16,4 18,10 12,16 4,14 0,8 3,2" fill="#6b7280" />
          <circle cx="8" cy="7" r="2" fill="#4b5563" />
          <circle cx="12" cy="11" r="1.5" fill="#4b5563" />
        </svg>
        <svg className="habitat-asteroid habitat-asteroid-2" width="12" height="12" viewBox="0 0 12 12">
          <polygon points="6,0 11,3 12,8 8,12 2,10 0,5" fill="#9ca3af" />
          <circle cx="5" cy="5" r="1.5" fill="#6b7280" />
        </svg>
        <svg className="habitat-asteroid habitat-asteroid-3" width="10" height="10" viewBox="0 0 10 10">
          <polygon points="5,0 9,3 10,7 6,10 1,8 0,4" fill="#78716c" />
        </svg>
      </div>
      <div className="habitat-space-stars" data-testid="decor-space-stars">
        <span className="habitat-space-star" style={{ top: '12%', left: '10%' }} />
        <span className="habitat-space-star" style={{ top: '25%', left: '30%' }} />
        <span className="habitat-space-star" style={{ top: '8%', left: '55%' }} />
        <span className="habitat-space-star" style={{ top: '18%', left: '75%' }} />
        <span className="habitat-space-star" style={{ top: '30%', left: '88%' }} />
        <span className="habitat-space-star" style={{ top: '5%', left: '42%' }} />
        <span className="habitat-space-star" style={{ top: '35%', left: '65%' }} />
        <span className="habitat-space-star" style={{ top: '15%', left: '92%' }} />
      </div>
    </>
  );
}

function HouseDecorations({ isNight }: { isNight: boolean }) {
  return (
    <>
      <div className="habitat-window" data-testid="decor-window">
        <svg width="60" height="50" viewBox="0 0 60 50">
          <rect x="2" y="2" width="56" height="46" rx="3" fill={isNight ? '#1e1b4b' : '#bae6fd'} stroke={isNight ? '#4a3a2a' : '#8B5E3C'} strokeWidth="3" />
          <line x1="30" y1="2" x2="30" y2="48" stroke={isNight ? '#4a3a2a' : '#8B5E3C'} strokeWidth="2" />
          <line x1="2" y1="25" x2="58" y2="25" stroke={isNight ? '#4a3a2a' : '#8B5E3C'} strokeWidth="2" />
          {isNight && (
            <>
              <circle cx="20" cy="14" r="3" fill="#ffd54f" opacity="0.6" />
              <circle cx="42" cy="36" r="2" fill="#ffd54f" opacity="0.4" />
            </>
          )}
          {!isNight && (
            <>
              <rect x="4" y="4" width="24" height="19" fill="#e0f2fe" opacity="0.5" />
              <rect x="32" y="4" width="24" height="19" fill="#e0f2fe" opacity="0.3" />
            </>
          )}
        </svg>
      </div>
      <div className="habitat-rug" data-testid="decor-rug">
        <svg width="80" height="16" viewBox="0 0 80 16">
          <ellipse cx="40" cy="8" rx="38" ry="7" fill={isNight ? '#5a2020' : '#dc2626'} />
          <ellipse cx="40" cy="8" rx="28" ry="5" fill={isNight ? '#6a3030' : '#f87171'} />
          <ellipse cx="40" cy="8" rx="16" ry="3" fill={isNight ? '#7a4040' : '#fca5a5'} />
        </svg>
      </div>
    </>
  );
}

function BowlBasic() {
  return (
    <div className="habitat-bowl" style={{ position: 'absolute', bottom: '8px', left: '15px', zIndex: 2 }} data-testid="bowl-basic">
      <svg width="28" height="18" viewBox="0 0 28 18">
        <ellipse cx="14" cy="14" rx="14" ry="4" fill="#a8a29e" />
        <path d="M2 10 Q2 18 14 18 Q26 18 26 10 L24 6 Q14 8 4 6 Z" fill="#d6d3d1" />
        <ellipse cx="14" cy="6" rx="11" ry="3" fill="#e7e5e4" />
      </svg>
    </div>
  );
}

function BowlSpecial() {
  return (
    <div className="habitat-bowl" style={{ position: 'absolute', bottom: '8px', left: '12px', zIndex: 2 }} data-testid="bowl-special">
      <svg width="38" height="24" viewBox="0 0 38 24">
        <ellipse cx="19" cy="20" rx="18" ry="4" fill="#0d9488" />
        <path d="M2 14 Q2 24 19 24 Q36 24 36 14 L33 8 Q19 10 5 8 Z" fill="#14b8a6" />
        <ellipse cx="19" cy="8" rx="15" ry="4" fill="#2dd4bf" />
        <circle cx="12" cy="16" r="1.5" fill="#0f766e" />
        <circle cx="15" cy="14" r="1" fill="#0f766e" />
        <circle cx="10" cy="14" r="1" fill="#0f766e" />
        <circle cx="12" cy="12.5" r="0.8" fill="#0f766e" />
      </svg>
    </div>
  );
}

function HouseBasicSvg() {
  return (
    <div style={{ position: 'absolute', bottom: '0', right: '10px', zIndex: 2 }} data-testid="house-basic">
      <svg width="50" height="55" viewBox="0 0 50 55">
        <rect x="5" y="22" width="40" height="33" fill="#92400e" />
        <rect x="7" y="24" width="36" height="29" fill="#b45309" />
        <polygon points="0,24 25,2 50,24" fill="#dc2626" />
        <polygon points="3,24 25,5 47,24" fill="#ef4444" />
        <rect x="18" y="30" width="8" height="8" fill="#fef3c7" stroke="#78350f" strokeWidth="1" />
        <line x1="22" y1="30" x2="22" y2="38" stroke="#78350f" strokeWidth="0.5" />
        <line x1="18" y1="34" x2="26" y2="34" stroke="#78350f" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

function HouseFancySvg() {
  return (
    <div style={{ position: 'absolute', bottom: '0', right: '8px', zIndex: 2 }} data-testid="house-fancy">
      <svg width="65" height="70" viewBox="0 0 65 70">
        <rect x="5" y="28" width="55" height="42" fill="#92400e" />
        <rect x="7" y="30" width="51" height="38" fill="#b45309" />
        <polygon points="0,30 32.5,4 65,30" fill="#dc2626" />
        <polygon points="5,30 32.5,8 60,30" fill="#ef4444" />
        <polygon points="10,30 32.5,12 55,30" fill="#f97316" />
        <polygon points="15,28 25,20 35,28" fill="#fbbf24" opacity="0.5" />
        <polygon points="30,28 40,20 50,28" fill="#fbbf24" opacity="0.5" />
        <rect x="12" y="36" width="10" height="10" fill="#fef3c7" stroke="#78350f" strokeWidth="1" />
        <line x1="17" y1="36" x2="17" y2="46" stroke="#78350f" strokeWidth="0.5" />
        <line x1="12" y1="41" x2="22" y2="41" stroke="#78350f" strokeWidth="0.5" />
        <rect x="43" y="36" width="10" height="10" fill="#fef3c7" stroke="#78350f" strokeWidth="1" />
        <line x1="48" y1="36" x2="48" y2="46" stroke="#78350f" strokeWidth="0.5" />
        <line x1="43" y1="41" x2="53" y2="41" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="14" cy="48" r="1.5" fill="#f472b6" />
        <circle cx="17" cy="49" r="1.2" fill="#fb923c" />
        <circle cx="20" cy="48" r="1.5" fill="#a78bfa" />
        <circle cx="45" cy="48" r="1.5" fill="#f472b6" />
        <circle cx="48" cy="49" r="1.2" fill="#fbbf24" />
        <circle cx="51" cy="48" r="1.5" fill="#a78bfa" />
        <rect x="26" y="50" width="13" height="18" rx="1" fill="#78350f" />
        <rect x="28" y="52" width="9" height="14" rx="1" fill="#92400e" />
        <circle cx="35" cy="59" r="1" fill="#fbbf24" />
        <line x1="8" y1="68" x2="8" y2="62" stroke="#22c55e" strokeWidth="1.5" />
        <circle cx="8" cy="61" r="2" fill="#f472b6" />
        <line x1="57" y1="68" x2="57" y2="63" stroke="#22c55e" strokeWidth="1.5" />
        <circle cx="57" cy="62" r="2" fill="#fbbf24" />
        <line x1="4" y1="68" x2="4" y2="64" stroke="#22c55e" strokeWidth="1" />
        <circle cx="4" cy="63" r="1.5" fill="#a78bfa" />
        <line x1="61" y1="68" x2="61" y2="65" stroke="#22c55e" strokeWidth="1" />
        <circle cx="61" cy="64" r="1.5" fill="#f472b6" />
      </svg>
    </div>
  );
}

export function PetDisplay({ pet, cosmetics = [], gameState, playAnimation }: PetDisplayProps) {
  const isNight = useIsNightTime();
  const theme = pet.habitatTheme || null;

  const equipped: EquippedCosmetics = {};
  for (const c of cosmetics) {
    if (!c.equipped) continue;
    const item = getCosmeticById(c.cosmeticId);
    if (!item) continue;
    if (item.type === 'hat') equipped.hat = c.cosmeticId;
    if (item.type === 'collar') equipped.collar = c.cosmeticId;
    if (item.type === 'glasses') equipped.glasses = c.cosmeticId;
  }

  const isHungry = pet.hunger <= 35;
  const isSad = pet.happiness <= 35;
  const isSick = pet.health <= 35;
  const isHappy = pet.happiness > 70 && pet.hunger > 50 && pet.health > 50;
  const isSleeping = isNight;

  const petState: PetState = isSleeping ? 'sleeping'
    : isSick ? 'sick'
    : isSad ? 'sad'
    : isHungry ? 'hungry'
    : isHappy ? 'happy'
    : 'normal';

  const getStatusColor = (value: number) => {
    if (value > 70) return 'bg-green-500';
    if (value > 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusMessage = () => {
    if (isSleeping) return { text: 'Durmiendo...', icon: <Moon size={16} className="text-indigo-300" /> };
    if (isHappy) return { text: 'Muy feliz', icon: <Sun size={16} className="text-yellow-500" /> };
    if (isSick) return { text: 'Se siente mal', icon: <Heart size={16} className="text-red-400" /> };
    if (isSad) return { text: 'Triste', icon: <Smile size={16} className="text-gray-400" /> };
    if (isHungry) return { text: 'Tiene hambre', icon: <Droplets size={16} className="text-orange-400" /> };
    return { text: 'Contento', icon: <Smile size={16} className="text-green-500" /> };
  };

  const wanderSpeed = petState === 'happy' ? 'habitat-wander-fast'
    : petState === 'sad' ? 'habitat-wander-slow'
    : petState === 'sick' ? 'habitat-wander-slow'
    : petState === 'hungry' ? 'habitat-wander-slow'
    : petState === 'sleeping' ? 'habitat-wander-none'
    : 'habitat-wander-normal';

  const status = getStatusMessage();

  const themeClass = theme ? `habitat-theme-${theme}` : '';
  const isDefaultTheme = !theme || theme === 'bg_garden';

  const statusBarBg = theme === 'bg_beach' ? 'from-amber-50 to-white'
    : theme === 'bg_forest' ? 'from-emerald-50 to-white'
    : theme === 'bg_space' ? 'from-purple-50 to-white'
    : theme === 'bg_house' ? 'from-orange-50 to-white'
    : 'from-green-50 to-white';

  return (
    <div className="rounded-2xl overflow-hidden" data-testid="pet-display">
      <div className={`habitat-scene relative ${isSleeping ? 'habitat-night' : 'habitat-day'} ${themeClass}`}>
        <div className="habitat-sky" />

        {isDefaultTheme && !isSleeping && (
          <div className="habitat-clouds">
            <div className="habitat-cloud habitat-cloud-1">
              <svg width="70" height="30" viewBox="0 0 70 30"><ellipse cx="35" cy="20" rx="28" ry="10" fill="white" opacity="0.5" /><ellipse cx="24" cy="15" rx="16" ry="10" fill="white" opacity="0.4" /><ellipse cx="46" cy="13" rx="16" ry="11" fill="white" opacity="0.4" /></svg>
            </div>
            <div className="habitat-cloud habitat-cloud-2">
              <svg width="50" height="22" viewBox="0 0 50 22"><ellipse cx="25" cy="14" rx="20" ry="8" fill="white" opacity="0.35" /><ellipse cx="18" cy="10" rx="12" ry="8" fill="white" opacity="0.3" /><ellipse cx="34" cy="9" rx="12" ry="8" fill="white" opacity="0.3" /></svg>
            </div>
          </div>
        )}

        {theme === 'bg_beach' && !isSleeping && (
          <div className="habitat-clouds">
            <div className="habitat-cloud habitat-cloud-1">
              <svg width="70" height="30" viewBox="0 0 70 30"><ellipse cx="35" cy="20" rx="28" ry="10" fill="white" opacity="0.6" /><ellipse cx="24" cy="15" rx="16" ry="10" fill="white" opacity="0.5" /><ellipse cx="46" cy="13" rx="16" ry="11" fill="white" opacity="0.5" /></svg>
            </div>
          </div>
        )}

        {(isDefaultTheme || theme === 'bg_space') && isSleeping && (
          <div className="habitat-stars">
            <span className="habitat-star habitat-star-1"><svg width="8" height="8" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#ffd54f" /></svg></span>
            <span className="habitat-star habitat-star-2"><svg width="6" height="6" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fff176" /></svg></span>
            <span className="habitat-star habitat-star-3"><svg width="10" height="10" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#ffee58" /></svg></span>
            <span className="habitat-star habitat-star-4"><svg width="5" height="5" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#ffd54f" /></svg></span>
            <span className="habitat-star habitat-star-5"><svg width="7" height="7" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fff9c4" /></svg></span>
          </div>
        )}

        {isDefaultTheme && isSleeping && (
          <div className="habitat-moon">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#ffd54f" opacity="0.9" />
              <circle cx="20" cy="14" r="10" fill="#1e1b4b" opacity="0.85" />
            </svg>
          </div>
        )}

        {isDefaultTheme && !isSleeping && (
          <div className="habitat-sun-icon">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="7" fill="#fbbf24" />
              <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
                <line x1="14" y1="2" x2="14" y2="5" />
                <line x1="14" y1="23" x2="14" y2="26" />
                <line x1="2" y1="14" x2="5" y2="14" />
                <line x1="23" y1="14" x2="26" y2="14" />
                <line x1="5.5" y1="5.5" x2="7.5" y2="7.5" />
                <line x1="20.5" y1="20.5" x2="22.5" y2="22.5" />
                <line x1="5.5" y1="22.5" x2="7.5" y2="20.5" />
                <line x1="20.5" y1="7.5" x2="22.5" y2="5.5" />
              </g>
            </svg>
          </div>
        )}

        {theme === 'bg_beach' && !isSleeping && (
          <div className="habitat-sun-icon">
            <svg width="34" height="34" viewBox="0 0 34 34">
              <circle cx="17" cy="17" r="9" fill="#fbbf24" />
              <g stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round">
                <line x1="17" y1="2" x2="17" y2="6" />
                <line x1="17" y1="28" x2="17" y2="32" />
                <line x1="2" y1="17" x2="6" y2="17" />
                <line x1="28" y1="17" x2="32" y2="17" />
                <line x1="6" y1="6" x2="9" y2="9" />
                <line x1="25" y1="25" x2="28" y2="28" />
                <line x1="6" y1="28" x2="9" y2="25" />
                <line x1="25" y1="9" x2="28" y2="6" />
              </g>
            </svg>
          </div>
        )}

        <div className="habitat-ground">
          {isDefaultTheme && (
            <svg className="habitat-grass-svg" viewBox="0 0 400 30" preserveAspectRatio="none">
              <path d="M0 12 Q5 2 10 12 Q15 2 20 12 Q25 2 30 12 Q35 2 40 12 Q45 2 50 12 Q55 2 60 12 Q65 2 70 12 Q75 2 80 12 Q85 2 90 12 Q95 2 100 12 Q105 2 110 12 Q115 2 120 12 Q125 2 130 12 Q135 2 140 12 Q145 2 150 12 Q155 2 160 12 Q165 2 170 12 Q175 2 180 12 Q185 2 190 12 Q195 2 200 12 Q205 2 210 12 Q215 2 220 12 Q225 2 230 12 Q235 2 240 12 Q245 2 250 12 Q255 2 260 12 Q265 2 270 12 Q275 2 280 12 Q285 2 290 12 Q295 2 300 12 Q305 2 310 12 Q315 2 320 12 Q325 2 330 12 Q335 2 340 12 Q345 2 350 12 Q355 2 360 12 Q365 2 370 12 Q375 2 380 12 Q385 2 390 12 Q395 2 400 12 L400 30 L0 30 Z" fill={isSleeping ? '#1a3a1a' : '#4ade80'} />
            </svg>
          )}
          {isDefaultTheme && (
            <div className="habitat-flowers">
              <svg className="habitat-flower habitat-flower-1" width="12" height="16" viewBox="0 0 12 16">
                <line x1="6" y1="8" x2="6" y2="16" stroke={isSleeping ? '#1a4a1a' : '#22c55e'} strokeWidth="1.5" />
                <circle cx="6" cy="6" r="4" fill={isSleeping ? '#4a2040' : '#f472b6'} />
                <circle cx="6" cy="6" r="2" fill={isSleeping ? '#6a3050' : '#fbbf24'} />
              </svg>
              <svg className="habitat-flower habitat-flower-2" width="10" height="14" viewBox="0 0 10 14">
                <line x1="5" y1="7" x2="5" y2="14" stroke={isSleeping ? '#1a4a1a' : '#22c55e'} strokeWidth="1.5" />
                <circle cx="5" cy="5" r="3.5" fill={isSleeping ? '#3a3060' : '#a78bfa'} />
                <circle cx="5" cy="5" r="1.5" fill={isSleeping ? '#5a4080' : '#fde68a'} />
              </svg>
              <svg className="habitat-flower habitat-flower-3" width="10" height="12" viewBox="0 0 10 12">
                <line x1="5" y1="6" x2="5" y2="12" stroke={isSleeping ? '#1a4a1a' : '#22c55e'} strokeWidth="1.5" />
                <circle cx="5" cy="4" r="3" fill={isSleeping ? '#4a3020' : '#fb923c'} />
                <circle cx="5" cy="4" r="1.5" fill={isSleeping ? '#6a4030' : '#fef08a'} />
              </svg>
            </div>
          )}
        </div>

        {theme === 'bg_beach' && <BeachDecorations isNight={isSleeping} />}
        {theme === 'bg_forest' && <ForestDecorations isNight={isSleeping} />}
        {theme === 'bg_space' && <SpaceDecorations />}
        {theme === 'bg_house' && <HouseDecorations isNight={isSleeping} />}

        {gameState?.activeBowl === 'bowl_basic' && <BowlBasic />}
        {gameState?.activeBowl === 'bowl_special' && <BowlSpecial />}
        {gameState?.activeHouse === 'house_basic' && <HouseBasicSvg />}
        {gameState?.activeHouse === 'house_fancy' && <HouseFancySvg />}

        <div className={`habitat-pet-wrapper ${wanderSpeed}`} data-testid="pet-wander">
          <div className="habitat-pet-container relative">
            {isSad && !isSleeping && <SadCloud />}
            {isHappy && !isSleeping && <FloatingHearts />}
            {isSick && !isSleeping && <SneezeParticles />}
            {isHungry && !isSleeping && !isSick && !isSad && <HungryZzz />}
            {isSleeping && <SleepZzz />}

            {playAnimation && (
              <div className="absolute -top-4 right-0 z-20 animate-bounce" data-testid="play-animation">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  {playAnimation === 'ball' && (
                    <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
                  )}
                  {playAnimation === 'rope' && (
                    <path d="M4 12 Q8 4 12 12 Q16 20 20 12" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
                  )}
                </svg>
              </div>
            )}

            <PetClickWrapper petState={petState}>
              <PetCharacter petType={pet.type} state={petState} bodyColor={pet.bodyColor} equipped={equipped} />
            </PetClickWrapper>
          </div>
        </div>
      </div>

      <div className={`p-6 pt-4 bg-gradient-to-b ${statusBarBg}`}>
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold font-display text-gray-800" data-testid="text-pet-name">
            {pet.name}
          </h2>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-600" data-testid="pet-status">
            {status.icon}
            <span>{status.text}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Droplets size={16} className="text-blue-500" />
                <span>Hambre</span>
              </span>
              <span className="text-sm font-bold font-display" data-testid="text-hunger">
                {Math.round(pet.hunger)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(pet.hunger)}`}
                style={{ width: `${pet.hunger}%` }}
                data-testid="progress-hunger"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Smile size={16} className="text-yellow-500" />
                <span>Felicidad</span>
              </span>
              <span className="text-sm font-bold font-display" data-testid="text-happiness">
                {Math.round(pet.happiness)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(pet.happiness)}`}
                style={{ width: `${pet.happiness}%` }}
                data-testid="progress-happiness"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Heart size={16} className="text-red-500" />
                <span>Salud</span>
              </span>
              <span className="text-sm font-bold font-display" data-testid="text-health">
                {Math.round(pet.health)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(pet.health)}`}
                style={{ width: `${pet.health}%` }}
                data-testid="progress-health"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
