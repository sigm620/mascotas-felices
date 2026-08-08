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
    <div style={{ position: 'absolute', bottom: '10px', left: '8px', zIndex: 3 }} data-testid="bowl-basic">
      <svg width="64" height="44" viewBox="0 0 64 44">
        {/* Sombra */}
        <ellipse cx="32" cy="42" rx="28" ry="3" fill="rgba(0,0,0,0.15)" />
        {/* Base del cuenco */}
        <ellipse cx="32" cy="36" rx="26" ry="6" fill="#a8a29e" />
        {/* Cuerpo */}
        <path d="M6 22 Q6 38 32 40 Q58 38 58 22 L54 12 Q32 16 10 12 Z" fill="#d6d3d1" />
        {/* Borde superior */}
        <ellipse cx="32" cy="13" rx="23" ry="6" fill="#e7e5e4" />
        <ellipse cx="32" cy="13" rx="19" ry="4" fill="#c8c4c0" />
        {/* Contenido (comida) */}
        <ellipse cx="32" cy="14" rx="15" ry="3" fill="#f59e0b" opacity="0.7" />
        <circle cx="26" cy="13" r="2" fill="#d97706" />
        <circle cx="32" cy="12" r="2.5" fill="#d97706" />
        <circle cx="38" cy="13" r="2" fill="#d97706" />
        {/* Línea decorativa */}
        <path d="M12 28 Q32 32 52 28" stroke="#b8b4b0" strokeWidth="1" fill="none" opacity="0.6"/>
      </svg>
    </div>
  );
}

function BowlSpecial() {
  return (
    <div style={{ position: 'absolute', bottom: '10px', left: '6px', zIndex: 3 }} data-testid="bowl-special">
      <svg width="80" height="54" viewBox="0 0 80 54">
        {/* Sombra */}
        <ellipse cx="40" cy="52" rx="34" ry="3.5" fill="rgba(0,0,0,0.18)" />
        {/* Base dorada */}
        <ellipse cx="40" cy="46" rx="32" ry="7" fill="#b45309" />
        <ellipse cx="40" cy="44" rx="30" ry="6" fill="#d97706" />
        {/* Cuerpo del cuenco dorado */}
        <path d="M8 26 Q8 46 40 50 Q72 46 72 26 L68 14 Q40 20 12 14 Z" fill="#f59e0b" />
        {/* Brillo lateral */}
        <path d="M14 20 Q14 40 40 44" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.6"/>
        {/* Borde superior */}
        <ellipse cx="40" cy="15" rx="30" ry="8" fill="#fbbf24" />
        <ellipse cx="40" cy="14" rx="26" ry="6" fill="#fde68a" />
        <ellipse cx="40" cy="14" rx="21" ry="4.5" fill="#f59e0b" />
        {/* Contenido (agua/comida premium) */}
        <ellipse cx="40" cy="15" rx="18" ry="3.5" fill="#7dd3fc" opacity="0.8" />
        <ellipse cx="40" cy="14" rx="14" ry="2" fill="#bae6fd" opacity="0.9" />
        {/* Joyas decorativas en el borde */}
        <circle cx="22" cy="15" r="2.5" fill="#ec4899" stroke="#be185d" strokeWidth="0.5"/>
        <circle cx="40" cy="8" r="2.5" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="0.5"/>
        <circle cx="58" cy="15" r="2.5" fill="#10b981" stroke="#059669" strokeWidth="0.5"/>
        <circle cx="16" cy="24" r="2" fill="#f472b6" stroke="#db2777" strokeWidth="0.5"/>
        <circle cx="64" cy="24" r="2" fill="#a78bfa" stroke="#7c3aed" strokeWidth="0.5"/>
        {/* Estrellas flotantes */}
        <text x="30" y="36" fontSize="8" fill="#fef08a" opacity="0.9">✦</text>
        <text x="44" y="32" fontSize="6" fill="#fef08a" opacity="0.8">✦</text>
        <text x="50" y="38" fontSize="7" fill="#fef08a" opacity="0.7">✦</text>
      </svg>
    </div>
  );
}

function HouseBasicSvg({ isSleeping = false }: { isSleeping?: boolean }) {
  return (
    <div style={{ position: 'absolute', bottom: '0', right: '6px', zIndex: 2 }} data-testid="house-basic">
      <svg width="130" height="112" viewBox="0 0 130 112">
        {/* Sombra */}
        <ellipse cx="65" cy="110" rx="58" ry="5" fill="rgba(0,0,0,0.18)" />
        {/* Cuerpo de la casita */}
        <rect x="8" y="46" width="114" height="66" rx="3" fill="#92400e" />
        {/* Tablas de madera */}
        <rect x="8" y="46" width="114" height="66" rx="3" fill="#b45309" />
        <line x1="8" y1="58" x2="122" y2="58" stroke="#78350f" strokeWidth="1.8" opacity="0.7"/>
        <line x1="8" y1="70" x2="122" y2="70" stroke="#78350f" strokeWidth="1.8" opacity="0.7"/>
        <line x1="8" y1="82" x2="122" y2="82" stroke="#78350f" strokeWidth="1.8" opacity="0.7"/>
        <line x1="8" y1="94" x2="122" y2="94" stroke="#78350f" strokeWidth="1.8" opacity="0.7"/>
        {/* Tejado */}
        <polygon points="0,48 65,4 130,48" fill="#b91c1c" />
        <polygon points="4,48 65,8 126,48" fill="#dc2626" />
        <polygon points="8,48 65,12 122,48" fill="#ef4444" />
        {/* Chimenea */}
        <rect x="88" y="10" width="14" height="28" fill="#a16207" />
        <rect x="85" y="8" width="20" height="7" rx="1" fill="#ca8a04" />
        {/* Humo cuando está durmiendo */}
        {isSleeping && (
          <>
            <circle cx="95" cy="4" r="3" fill="#d1d5db" opacity="0.6"/>
            <circle cx="98" cy="0" r="2" fill="#d1d5db" opacity="0.4"/>
          </>
        )}
        {/* Ventana izquierda */}
        <rect x="14" y="52" width="22" height="20" rx="2" fill={isSleeping ? "#fde68a" : "#bae6fd"} stroke="#78350f" strokeWidth="2"/>
        <line x1="25" y1="52" x2="25" y2="72" stroke="#78350f" strokeWidth="1.2"/>
        <line x1="14" y1="62" x2="36" y2="62" stroke="#78350f" strokeWidth="1.2"/>
        {/* Ventana derecha */}
        <rect x="94" y="52" width="22" height="20" rx="2" fill={isSleeping ? "#fde68a" : "#bae6fd"} stroke="#78350f" strokeWidth="2"/>
        <line x1="105" y1="52" x2="105" y2="72" stroke="#78350f" strokeWidth="1.2"/>
        <line x1="94" y1="62" x2="116" y2="62" stroke="#78350f" strokeWidth="1.2"/>
        {/* Interior del arco (oscuro o con luz nocturna) */}
        <path d="M40,112 L40,76 Q65,54 90,76 L90,112 Z" fill={isSleeping ? "#1a0800" : "#1a0800"}/>
        {/* Cálida luz dentro si está durmiendo */}
        {isSleeping && (
          <path d="M44,112 L44,78 Q65,58 86,78 L86,112 Z" fill="#7c2d12" opacity="0.5"/>
        )}
        {/* Marco del arco */}
        <path d="M38,112 L38,75 Q65,51 92,75 L92,112"
          stroke="#78350f" strokeWidth="3" fill="none"/>
        {/* Placa con nombre */}
        <rect x="50" y="44" width="30" height="10" rx="2" fill="#fef3c7" stroke="#92400e" strokeWidth="1"/>
        <text x="65" y="52" textAnchor="middle" fontSize="6" fill="#78350f" fontWeight="bold">MI CASA</text>
        {/* Zzzs si duerme */}
        {isSleeping && (
          <>
            <text x="56" y="90" fontSize="10" fill="#a5b4fc" opacity="0.9" fontWeight="bold">z</text>
            <text x="62" y="82" fontSize="8" fill="#a5b4fc" opacity="0.7" fontWeight="bold">z</text>
            <text x="67" y="75" fontSize="6" fill="#a5b4fc" opacity="0.5" fontWeight="bold">z</text>
          </>
        )}
      </svg>
    </div>
  );
}

function HouseFancySvg({ isSleeping = false }: { isSleeping?: boolean }) {
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
              <svg width="80" height="36" viewBox="0 0 80 36">
                {/* Sombra nube */}
                <ellipse cx="40" cy="28" rx="30" ry="9" fill="#e0f2fe" opacity="0.5" />
                {/* Cuerpo principal */}
                <ellipse cx="40" cy="22" rx="30" ry="11" fill="white" opacity="0.9" />
                {/* Protuberancias */}
                <ellipse cx="22" cy="17" rx="16" ry="12" fill="white" opacity="0.95" />
                <ellipse cx="40" cy="13" rx="18" ry="14" fill="white" />
                <ellipse cx="58" cy="16" rx="16" ry="12" fill="white" opacity="0.95" />
                {/* Brillo */}
                <ellipse cx="30" cy="11" rx="8" ry="4" fill="white" opacity="0.6" />
              </svg>
            </div>
            <div className="habitat-cloud habitat-cloud-2">
              <svg width="55" height="26" viewBox="0 0 55 26">
                <ellipse cx="27" cy="19" rx="22" ry="8" fill="white" opacity="0.85" />
                <ellipse cx="18" cy="14" rx="13" ry="10" fill="white" opacity="0.9" />
                <ellipse cx="27" cy="11" rx="15" ry="11" fill="white" />
                <ellipse cx="38" cy="14" rx="13" ry="10" fill="white" opacity="0.9" />
                <ellipse cx="22" cy="9" rx="6" ry="3" fill="white" opacity="0.5" />
              </svg>
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
            <span className="habitat-star habitat-star-1"><svg width="10" height="10" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#ffd54f" /><circle cx="5" cy="5" r="1.5" fill="white" opacity="0.7"/></svg></span>
            <span className="habitat-star habitat-star-2"><svg width="6" height="6" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fff176" /></svg></span>
            <span className="habitat-star habitat-star-3"><svg width="12" height="12" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#ffee58" /><circle cx="5" cy="5" r="1.8" fill="white" opacity="0.6"/></svg></span>
            <span className="habitat-star habitat-star-4"><svg width="5" height="5" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#ffd54f" /></svg></span>
            <span className="habitat-star habitat-star-5"><svg width="8" height="8" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fff9c4" /></svg></span>
            <span className="habitat-star habitat-star-1" style={{top:'15%',left:'55%'}}><svg width="7" height="7" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#e9d5ff" /></svg></span>
            <span className="habitat-star habitat-star-2" style={{top:'30%',left:'75%'}}><svg width="9" height="9" viewBox="0 0 10 10"><polygon points="5,0 6.2,3.8 10,3.8 6.9,6.2 8.1,10 5,7.6 1.9,10 3.1,6.2 0,3.8 3.8,3.8" fill="#fde68a" /><circle cx="5" cy="5" r="1.5" fill="white" opacity="0.5"/></svg></span>
            <span className="habitat-star habitat-star-3" style={{top:'8%',left:'35%'}}><svg width="5" height="5" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#c7d2fe" /></svg></span>
          </div>
        )}

        {isDefaultTheme && isSleeping && (
          <div className="habitat-moon">
            <svg width="38" height="38" viewBox="0 0 38 38">
              {/* Halo lunar */}
              <circle cx="19" cy="19" r="17" fill="#fef9c3" opacity="0.12" />
              {/* Luna creciente */}
              <circle cx="19" cy="19" r="13" fill="#fde68a" />
              <circle cx="24" cy="16" r="11" fill="#1e1b4b" />
              {/* Brillo y detalle */}
              <circle cx="12" cy="14" r="2" fill="#fef08a" opacity="0.5"/>
              <circle cx="10" cy="22" r="1.2" fill="#fef08a" opacity="0.35"/>
              <circle cx="14" cy="26" r="1.5" fill="#fef08a" opacity="0.3"/>
              {/* Brillo superior */}
              <ellipse cx="10" cy="12" rx="3" ry="2" fill="white" opacity="0.2" transform="rotate(-30 10 12)" />
            </svg>
          </div>
        )}

        {isDefaultTheme && !isSleeping && (
          <div className="habitat-sun-icon">
            <svg width="40" height="40" viewBox="0 0 40 40">
              {/* Halo exterior */}
              <circle cx="20" cy="20" r="18" fill="#fde68a" opacity="0.3" />
              <circle cx="20" cy="20" r="14" fill="#fde68a" opacity="0.25" />
              {/* Rayos largos */}
              <g stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
                <line x1="20" y1="2" x2="20" y2="6" />
                <line x1="20" y1="34" x2="20" y2="38" />
                <line x1="2" y1="20" x2="6" y2="20" />
                <line x1="34" y1="20" x2="38" y2="20" />
                <line x1="6.2" y1="6.2" x2="9" y2="9" />
                <line x1="31" y1="31" x2="33.8" y2="33.8" />
                <line x1="6.2" y1="33.8" x2="9" y2="31" />
                <line x1="31" y1="9" x2="33.8" y2="6.2" />
              </g>
              {/* Rayos cortos intermedios */}
              <g stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
                <line x1="20" y1="4" x2="20" y2="7" transform="rotate(22.5 20 20)" />
                <line x1="20" y1="4" x2="20" y2="7" transform="rotate(67.5 20 20)" />
                <line x1="20" y1="4" x2="20" y2="7" transform="rotate(112.5 20 20)" />
                <line x1="20" y1="4" x2="20" y2="7" transform="rotate(157.5 20 20)" />
                <line x1="20" y1="4" x2="20" y2="7" transform="rotate(202.5 20 20)" />
                <line x1="20" y1="4" x2="20" y2="7" transform="rotate(247.5 20 20)" />
                <line x1="20" y1="4" x2="20" y2="7" transform="rotate(292.5 20 20)" />
                <line x1="20" y1="4" x2="20" y2="7" transform="rotate(337.5 20 20)" />
              </g>
              {/* Cuerpo del sol */}
              <circle cx="20" cy="20" r="9" fill="#f59e0b" />
              <circle cx="20" cy="20" r="8" fill="#fbbf24" />
              {/* Cara del sol */}
              <circle cx="17" cy="19" r="1.2" fill="#f59e0b" />
              <circle cx="23" cy="19" r="1.2" fill="#f59e0b" />
              <path d="M16.5 22 Q20 25 23.5 22" stroke="#f59e0b" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              {/* Brillo */}
              <ellipse cx="16" cy="15" rx="3" ry="2" fill="white" opacity="0.3" transform="rotate(-20 16 15)" />
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
              {/* Capa base del pasto */}
              <path d="M0 14 Q5 4 10 14 Q15 4 20 14 Q25 4 30 14 Q35 4 40 14 Q45 4 50 14 Q55 4 60 14 Q65 4 70 14 Q75 4 80 14 Q85 4 90 14 Q95 4 100 14 Q105 4 110 14 Q115 4 120 14 Q125 4 130 14 Q135 4 140 14 Q145 4 150 14 Q155 4 160 14 Q165 4 170 14 Q175 4 180 14 Q185 4 190 14 Q195 4 200 14 Q205 4 210 14 Q215 4 220 14 Q225 4 230 14 Q235 4 240 14 Q245 4 250 14 Q255 4 260 14 Q265 4 270 14 Q275 4 280 14 Q285 4 290 14 Q295 4 300 14 Q305 4 310 14 Q315 4 320 14 Q325 4 330 14 Q335 4 340 14 Q345 4 350 14 Q355 4 360 14 Q365 4 370 14 Q375 4 380 14 Q385 4 390 14 Q395 4 400 14 L400 30 L0 30 Z" fill={isSleeping ? '#1a3a1a' : '#4ade80'} />
              {/* Segunda capa más oscura para profundidad */}
              <path d="M0 18 Q7 10 14 18 Q21 10 28 18 Q35 10 42 18 Q49 10 56 18 Q63 10 70 18 Q77 10 84 18 Q91 10 98 18 Q105 10 112 18 Q119 10 126 18 Q133 10 140 18 Q147 10 154 18 Q161 10 168 18 Q175 10 182 18 Q189 10 196 18 Q203 10 210 18 Q217 10 224 18 Q231 10 238 18 Q245 10 252 18 Q259 10 266 18 Q273 10 280 18 Q287 10 294 18 Q301 10 308 18 Q315 10 322 18 Q329 10 336 18 Q343 10 350 18 Q357 10 364 18 Q371 10 378 18 Q385 10 392 18 Q398 12 400 18 L400 30 L0 30 Z" fill={isSleeping ? '#163316' : '#22c55e'} opacity="0.7" />
              {/* Detalle de suelo */}
              <rect x="0" y="24" width="400" height="6" fill={isSleeping ? '#0f2a0f' : '#16a34a'} opacity="0.4" />
            </svg>
          )}
          {isDefaultTheme && (
            <div className="habitat-flowers">
              {/* Flor 1 - Margarita rosa */}
              <svg className="habitat-flower habitat-flower-1" width="20" height="26" viewBox="0 0 20 26">
                <path d="M10 14 Q8 20 10 26" stroke={isSleeping ? '#1a4a1a' : '#16a34a'} strokeWidth="2" fill="none" strokeLinecap="round"/>
                <ellipse cx="7" cy="20" rx="3" ry="1.5" fill={isSleeping ? '#1a4a1a' : '#22c55e'} transform="rotate(-40 7 20)" />
                <ellipse cx="10" cy="9" rx="2.2" ry="4" fill={isSleeping ? '#4a2040' : '#fda4af'} transform="rotate(0 10 13)" />
                <ellipse cx="10" cy="9" rx="2.2" ry="4" fill={isSleeping ? '#4a2040' : '#fda4af'} transform="rotate(45 10 13)" />
                <ellipse cx="10" cy="9" rx="2.2" ry="4" fill={isSleeping ? '#4a2040' : '#fda4af'} transform="rotate(90 10 13)" />
                <ellipse cx="10" cy="9" rx="2.2" ry="4" fill={isSleeping ? '#4a2040' : '#fda4af'} transform="rotate(135 10 13)" />
                <ellipse cx="10" cy="9" rx="2.2" ry="4" fill={isSleeping ? '#4a2040' : '#fda4af'} transform="rotate(180 10 13)" />
                <ellipse cx="10" cy="9" rx="2.2" ry="4" fill={isSleeping ? '#4a2040' : '#fda4af'} transform="rotate(225 10 13)" />
                <ellipse cx="10" cy="9" rx="2.2" ry="4" fill={isSleeping ? '#4a2040' : '#fda4af'} transform="rotate(270 10 13)" />
                <ellipse cx="10" cy="9" rx="2.2" ry="4" fill={isSleeping ? '#4a2040' : '#fda4af'} transform="rotate(315 10 13)" />
                <circle cx="10" cy="13" r="3.2" fill={isSleeping ? '#6a3050' : '#fbbf24'} />
                <circle cx="10" cy="13" r="1.8" fill={isSleeping ? '#7a3060' : '#f59e0b'} />
                <circle cx="9" cy="12.2" r="0.7" fill="white" opacity="0.5"/>
              </svg>
              {/* Flor 2 - Flor violeta */}
              <svg className="habitat-flower habitat-flower-2" width="17" height="22" viewBox="0 0 17 22">
                <path d="M8.5 12 Q6.5 17 8.5 22" stroke={isSleeping ? '#1a4a1a' : '#16a34a'} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                <ellipse cx="6" cy="17" rx="2.5" ry="1.3" fill={isSleeping ? '#1a4a1a' : '#22c55e'} transform="rotate(-35 6 17)" />
                <ellipse cx="8.5" cy="7.5" rx="2" ry="3.5" fill={isSleeping ? '#3a3060' : '#c4b5fd'} transform="rotate(0 8.5 11)" />
                <ellipse cx="8.5" cy="7.5" rx="2" ry="3.5" fill={isSleeping ? '#3a3060' : '#c4b5fd'} transform="rotate(60 8.5 11)" />
                <ellipse cx="8.5" cy="7.5" rx="2" ry="3.5" fill={isSleeping ? '#3a3060' : '#c4b5fd'} transform="rotate(120 8.5 11)" />
                <ellipse cx="8.5" cy="7.5" rx="2" ry="3.5" fill={isSleeping ? '#3a3060' : '#c4b5fd'} transform="rotate(180 8.5 11)" />
                <ellipse cx="8.5" cy="7.5" rx="2" ry="3.5" fill={isSleeping ? '#3a3060' : '#c4b5fd'} transform="rotate(240 8.5 11)" />
                <ellipse cx="8.5" cy="7.5" rx="2" ry="3.5" fill={isSleeping ? '#3a3060' : '#c4b5fd'} transform="rotate(300 8.5 11)" />
                <circle cx="8.5" cy="11" r="2.8" fill={isSleeping ? '#5a4080' : '#fde68a'} />
                <circle cx="8.5" cy="11" r="1.4" fill={isSleeping ? '#6a4090' : '#fbbf24'} />
              </svg>
              {/* Flor 3 - Flor naranja */}
              <svg className="habitat-flower habitat-flower-3" width="16" height="20" viewBox="0 0 16 20">
                <path d="M8 11 Q6.5 15 8 20" stroke={isSleeping ? '#1a4a1a' : '#16a34a'} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                <ellipse cx="5.5" cy="15" rx="2.5" ry="1.3" fill={isSleeping ? '#1a4a1a' : '#22c55e'} transform="rotate(-40 5.5 15)" />
                <ellipse cx="8" cy="7" rx="1.8" ry="3.2" fill={isSleeping ? '#4a3020' : '#fdba74'} transform="rotate(0 8 10)" />
                <ellipse cx="8" cy="7" rx="1.8" ry="3.2" fill={isSleeping ? '#4a3020' : '#fdba74'} transform="rotate(72 8 10)" />
                <ellipse cx="8" cy="7" rx="1.8" ry="3.2" fill={isSleeping ? '#4a3020' : '#fdba74'} transform="rotate(144 8 10)" />
                <ellipse cx="8" cy="7" rx="1.8" ry="3.2" fill={isSleeping ? '#4a3020' : '#fdba74'} transform="rotate(216 8 10)" />
                <ellipse cx="8" cy="7" rx="1.8" ry="3.2" fill={isSleeping ? '#4a3020' : '#fdba74'} transform="rotate(288 8 10)" />
                <circle cx="8" cy="10" r="2.5" fill={isSleeping ? '#6a4030' : '#fb923c'} />
                <circle cx="8" cy="10" r="1.3" fill={isSleeping ? '#7a4040' : '#fef08a'} />
                <circle cx="7.2" cy="9.2" r="0.6" fill="white" opacity="0.5"/>
              </svg>
              {/* Flor 4 - Flor pequeña azul */}
              <svg className="habitat-flower habitat-flower-4" width="14" height="18" viewBox="0 0 14 18">
                <path d="M7 10 Q5.5 14 7 18" stroke={isSleeping ? '#1a4a1a' : '#15803d'} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <ellipse cx="7" cy="6" rx="1.6" ry="2.8" fill={isSleeping ? '#1a2040' : '#93c5fd'} transform="rotate(0 7 9)" />
                <ellipse cx="7" cy="6" rx="1.6" ry="2.8" fill={isSleeping ? '#1a2040' : '#93c5fd'} transform="rotate(60 7 9)" />
                <ellipse cx="7" cy="6" rx="1.6" ry="2.8" fill={isSleeping ? '#1a2040' : '#93c5fd'} transform="rotate(120 7 9)" />
                <ellipse cx="7" cy="6" rx="1.6" ry="2.8" fill={isSleeping ? '#1a2040' : '#93c5fd'} transform="rotate(180 7 9)" />
                <ellipse cx="7" cy="6" rx="1.6" ry="2.8" fill={isSleeping ? '#1a2040' : '#93c5fd'} transform="rotate(240 7 9)" />
                <ellipse cx="7" cy="6" rx="1.6" ry="2.8" fill={isSleeping ? '#1a2040' : '#93c5fd'} transform="rotate(300 7 9)" />
                <circle cx="7" cy="9" r="2.2" fill={isSleeping ? '#3a4060' : '#fef3c7'} />
                <circle cx="7" cy="9" r="1.1" fill={isSleeping ? '#4a5070' : '#fbbf24'} />
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
        {gameState?.activeHouse === 'house_basic' && <HouseBasicSvg isSleeping={isNight} />}
        {gameState?.activeHouse === 'house_fancy' && <HouseFancySvg isSleeping={isNight} />}

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
