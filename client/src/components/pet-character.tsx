import { BODY_COLOR_MAP } from '@shared/cosmetics';

export type PetState = 'happy' | 'sad' | 'sick' | 'hungry' | 'sleeping' | 'normal';

interface PetColors {
  body: string;
  belly: string;
  dark: string;
  ear: string;
  earInner: string;
  nose: string;
  cheek: string;
  spot: string;
}

function getPetColors(type: string, bodyColor?: string | null): PetColors {
  let base: PetColors;
  switch (type) {
    case '🐱':
      base = { body: '#9E9E9E', belly: '#D5D5D5', dark: '#757575', ear: '#757575', earInner: '#FFACB7', nose: '#4A4A4A', cheek: '#FFCFC8', spot: '#B0B0B0' };
      break;
    case '🐰':
      base = { body: '#F5EDE6', belly: '#FFFFFF', dark: '#DDD0C4', ear: '#DDD0C4', earInner: '#FFACB7', nose: '#FFACB7', cheek: '#FFD5D0', spot: '#E8DDD4' };
      break;
    case '🐹':
      base = { body: '#E8A854', belly: '#FFF0D5', dark: '#C08030', ear: '#C08030', earInner: '#FFACB7', nose: '#3D2C20', cheek: '#FFCFC8', spot: '#D49540' };
      break;
    default:
      base = { body: '#D4915A', belly: '#F0D5B0', dark: '#B07840', ear: '#B07840', earInner: '#E8B88A', nose: '#3D2C20', cheek: '#FFCFC8', spot: '#C48050' };
  }

  if (bodyColor && BODY_COLOR_MAP[bodyColor]) {
    const override = BODY_COLOR_MAP[bodyColor];
    base.body = override.body;
    base.belly = override.belly;
    base.dark = override.dark;
    base.ear = override.ear;
    base.earInner = override.earInner;
    base.spot = override.spot;
  }

  return base;
}

export interface EquippedCosmetics {
  hat?: string | null;
  collar?: string | null;
  glasses?: string | null;
}

interface PetCharacterProps {
  petType: string;
  state: PetState;
  bodyColor?: string | null;
  equipped?: EquippedCosmetics;
}

export function PetCharacter({ petType, state, bodyColor, equipped }: PetCharacterProps) {
  const c = getPetColors(petType, bodyColor);
  const walkClass = state === 'sleeping' ? '' : 'pet-legs-walking';
  const speedClass = state === 'happy' ? 'pet-walk-fast' : (state === 'sad' || state === 'sick') ? 'pet-walk-slow' : '';
  const lookBackClass = state !== 'sleeping' ? 'pet-look-back-anim' : '';

  return (
    <svg
      viewBox="0 0 120 130"
      className={`pet-svg-char ${speedClass} ${lookBackClass}`}
      data-testid="pet-character"
    >
      <ellipse cx="60" cy="126" rx="26" ry="4" fill="rgba(0,0,0,0.07)" className="pet-part-shadow" />

      {renderTail(petType, c, state)}

      <g className={`pet-part-leg pet-part-leg-bl ${walkClass} pet-leg-phase-a`} style={{ transformOrigin: '42px 92px' }}>
        <rect x="36" y="92" width="12" height="22" rx="6" fill={c.dark} />
        <ellipse cx="42" cy="115" rx="7" ry="4" fill={c.dark} />
      </g>
      <g className={`pet-part-leg pet-part-leg-br ${walkClass} pet-leg-phase-b`} style={{ transformOrigin: '78px 92px' }}>
        <rect x="72" y="92" width="12" height="22" rx="6" fill={c.dark} />
        <ellipse cx="78" cy="115" rx="7" ry="4" fill={c.dark} />
      </g>

      <g className={state === 'sleeping' ? 'pet-body-breathe' : state === 'sick' ? 'pet-body-shiver' : state === 'happy' ? 'pet-body-bounce' : ''}>
        <ellipse cx="60" cy="82" rx="27" ry="20" fill={c.body} />
        <ellipse cx="60" cy="86" rx="16" ry="12" fill={c.belly} />
        {petType === '🐶' && <ellipse cx="72" cy="76" rx="6" ry="5" fill={c.spot} opacity="0.5" />}
        {equipped?.collar && renderCollar(equipped.collar)}
      </g>

      <g className={`pet-part-leg pet-part-leg-fl ${walkClass} pet-leg-phase-b`} style={{ transformOrigin: '46px 94px' }}>
        <rect x="40" y="94" width="12" height="24" rx="6" fill={c.body} />
        <ellipse cx="46" cy="119" rx="7" ry="4.5" fill={c.dark} />
      </g>
      <g className={`pet-part-leg pet-part-leg-fr ${walkClass} pet-leg-phase-a`} style={{ transformOrigin: '72px 94px' }}>
        <rect x="66" y="94" width="12" height="24" rx="6" fill={c.body} />
        <ellipse cx="72" cy="119" rx="7" ry="4.5" fill={c.dark} />
      </g>

      <g className={state === 'sleeping' ? 'pet-body-breathe' : state === 'sick' ? 'pet-body-shiver' : state === 'happy' ? 'pet-body-bounce' : ''}>
        <circle cx="60" cy="44" r="30" fill={c.body} />

        {renderEars(petType, c, state)}

        <ellipse cx="60" cy="54" rx="18" ry="14" fill={c.belly} />

        {equipped?.glasses && renderGlasses(equipped.glasses)}

        {renderEyes(state, c)}

        <ellipse cx="60" cy="52" rx="4.5" ry="3.5" fill={c.nose} />
        <ellipse cx="59" cy="51.5" rx="1.8" ry="1" fill="rgba(255,255,255,0.3)" />

        {renderMouth(state)}

        <circle cx="38" cy="52" r="6" fill={c.cheek} opacity="0.35" />
        <circle cx="82" cy="52" r="6" fill={c.cheek} opacity="0.35" />

        {state === 'sick' && (
          <g>
            <rect x="70" y="18" width="22" height="12" rx="4" fill="#FFF9C4" stroke="#D4A060" strokeWidth="1.2" transform="rotate(12 81 24)" />
            <line x1="77" y1="20" x2="85" y2="28" stroke="#D4A060" strokeWidth="1" transform="rotate(12 81 24)" />
            <line x1="85" y1="20" x2="77" y2="28" stroke="#D4A060" strokeWidth="1" transform="rotate(12 81 24)" />
          </g>
        )}

        {state === 'happy' && (
          <ellipse cx="65" cy="60" rx="4" ry="6" fill="#FF8A9E" className="pet-part-tongue" />
        )}

        {equipped?.hat && renderHat(equipped.hat)}
      </g>
    </svg>
  );
}

function renderHat(hatId: string) {
  switch (hatId) {
    case 'hat_cowboy':
      return (
        <g>
          <ellipse cx="60" cy="16" rx="28" ry="5" fill="#8B6914" />
          <rect x="42" y="4" width="36" height="14" rx="6" fill="#A0792C" />
          <ellipse cx="60" cy="4" rx="18" ry="5" fill="#B8912E" />
          <rect x="55" y="8" width="10" height="6" rx="2" fill="#6B4E10" />
        </g>
      );
    case 'hat_crown':
      return (
        <g>
          <rect x="42" y="8" width="36" height="14" rx="3" fill="#FFD700" />
          <polygon points="42,8 48,0 54,8" fill="#FFD700" />
          <polygon points="54,8 60,0 66,8" fill="#FFD700" />
          <polygon points="66,8 72,0 78,8" fill="#FFD700" />
          <circle cx="48" cy="3" r="2" fill="#E53935" />
          <circle cx="60" cy="3" r="2" fill="#1E88E5" />
          <circle cx="72" cy="3" r="2" fill="#43A047" />
          <rect x="42" y="18" width="36" height="3" rx="1" fill="#FFC107" />
        </g>
      );
    case 'hat_wizard':
      return (
        <g>
          <polygon points="60,-10 42,18 78,18" fill="#5C3D99" />
          <ellipse cx="60" cy="18" rx="22" ry="5" fill="#7B52B5" />
          <circle cx="55" cy="6" r="2" fill="#FFD54F" />
          <circle cx="63" cy="0" r="1.5" fill="#FFD54F" />
          <circle cx="58" cy="-4" r="2.5" fill="#FFD54F" />
        </g>
      );
    case 'hat_party':
      return (
        <g>
          <polygon points="60,-6 46,18 74,18" fill="#FF5722" />
          <ellipse cx="60" cy="18" rx="18" ry="4" fill="#E64A19" />
          <circle cx="60" cy="-6" r="3" fill="#FFEB3B" />
          <line x1="52" y1="4" x2="68" y2="4" stroke="#4CAF50" strokeWidth="1.5" />
          <line x1="50" y1="10" x2="70" y2="10" stroke="#2196F3" strokeWidth="1.5" />
        </g>
      );
    case 'hat_beanie':
      return (
        <g>
          <ellipse cx="60" cy="18" rx="24" ry="12" fill="#E53935" />
          <ellipse cx="60" cy="20" rx="24" ry="5" fill="#C62828" />
          <circle cx="60" cy="6" r="4" fill="#FFCDD2" />
          <line x1="40" y1="14" x2="80" y2="14" stroke="#FFCDD2" strokeWidth="2" />
        </g>
      );
    default:
      return null;
  }
}

function renderCollar(collarId: string) {
  switch (collarId) {
    case 'collar_bowtie':
      return (
        <g>
          <polygon points="52,68 60,72 60,68" fill="#E53935" />
          <polygon points="68,68 60,72 60,68" fill="#C62828" />
          <circle cx="60" cy="69" r="2.5" fill="#FF5252" />
        </g>
      );
    case 'collar_bandana':
      return (
        <g>
          <path d="M40 66 Q50 62 60 66 Q70 62 80 66 L70 78 L60 74 L50 78 Z" fill="#1565C0" opacity="0.9" />
          <path d="M44 66 Q52 64 60 66 Q68 64 76 66" stroke="#0D47A1" strokeWidth="1" fill="none" />
        </g>
      );
    case 'collar_bell':
      return (
        <g>
          <path d="M38 66 Q60 62 82 66" stroke="#E53935" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="72" r="5" fill="#FFD54F" stroke="#F9A825" strokeWidth="1" />
          <circle cx="60" cy="73" r="1.5" fill="#F9A825" />
        </g>
      );
    case 'collar_ribbon':
      return (
        <g>
          <path d="M38 66 Q60 62 82 66" stroke="#AB47BC" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M56 68 L50 80 L60 74 L70 80 L64 68" fill="#CE93D8" />
          <circle cx="60" cy="68" r="2" fill="#AB47BC" />
        </g>
      );
    case 'collar_chain':
      return (
        <g>
          <path d="M38 66 Q60 62 82 66" stroke="#FFD54F" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="4 3" />
          <circle cx="60" cy="68" r="4" fill="none" stroke="#FFD54F" strokeWidth="1.5" />
          <circle cx="60" cy="68" r="1.5" fill="#FFD54F" />
        </g>
      );
    default:
      return null;
  }
}

function renderGlasses(glassesId: string) {
  switch (glassesId) {
    case 'glasses_sun':
      return (
        <g>
          <rect x="38" y="34" width="16" height="12" rx="3" fill="#1A1A1A" opacity="0.85" />
          <rect x="66" y="34" width="16" height="12" rx="3" fill="#1A1A1A" opacity="0.85" />
          <line x1="54" y1="40" x2="66" y2="40" stroke="#1A1A1A" strokeWidth="2" />
          <line x1="38" y1="38" x2="32" y2="36" stroke="#1A1A1A" strokeWidth="2" />
          <line x1="82" y1="38" x2="88" y2="36" stroke="#1A1A1A" strokeWidth="2" />
        </g>
      );
    case 'glasses_star':
      return (
        <g>
          <polygon points="46,32 48,38 54,38 49,42 51,48 46,44 41,48 43,42 38,38 44,38" fill="#FFD54F" stroke="#F9A825" strokeWidth="0.8" />
          <polygon points="74,32 76,38 82,38 77,42 79,48 74,44 69,48 71,42 66,38 72,38" fill="#FFD54F" stroke="#F9A825" strokeWidth="0.8" />
          <line x1="54" y1="40" x2="66" y2="40" stroke="#F9A825" strokeWidth="1.5" />
          <line x1="38" y1="38" x2="32" y2="36" stroke="#F9A825" strokeWidth="1.5" />
          <line x1="82" y1="38" x2="88" y2="36" stroke="#F9A825" strokeWidth="1.5" />
        </g>
      );
    case 'glasses_round':
      return (
        <g>
          <circle cx="46" cy="40" r="9" fill="none" stroke="#5D4037" strokeWidth="2" />
          <circle cx="74" cy="40" r="9" fill="none" stroke="#5D4037" strokeWidth="2" />
          <line x1="55" y1="40" x2="65" y2="40" stroke="#5D4037" strokeWidth="2" />
          <line x1="37" y1="38" x2="30" y2="36" stroke="#5D4037" strokeWidth="2" />
          <line x1="83" y1="38" x2="90" y2="36" stroke="#5D4037" strokeWidth="2" />
          <circle cx="46" cy="40" r="8" fill="rgba(255,255,255,0.15)" />
          <circle cx="74" cy="40" r="8" fill="rgba(255,255,255,0.15)" />
        </g>
      );
    case 'glasses_heart':
      return (
        <g>
          <path d="M38 38 C38 34 42 30 46 34 C50 30 54 34 54 38 C54 44 46 48 46 48 C46 48 38 44 38 38Z" fill="#E91E63" opacity="0.7" />
          <path d="M66 38 C66 34 70 30 74 34 C78 30 82 34 82 38 C82 44 74 48 74 48 C74 48 66 44 66 38Z" fill="#E91E63" opacity="0.7" />
          <line x1="54" y1="40" x2="66" y2="40" stroke="#E91E63" strokeWidth="1.5" />
          <line x1="38" y1="38" x2="32" y2="36" stroke="#E91E63" strokeWidth="1.5" />
          <line x1="82" y1="38" x2="88" y2="36" stroke="#E91E63" strokeWidth="1.5" />
        </g>
      );
    case 'glasses_mask':
      return (
        <g>
          <path d="M30 36 Q40 28 60 32 Q80 28 90 36 L86 46 Q72 50 60 46 Q48 50 34 46 Z" fill="#1A237E" opacity="0.85" />
          <ellipse cx="46" cy="40" rx="8" ry="6" fill="white" opacity="0.9" />
          <ellipse cx="74" cy="40" rx="8" ry="6" fill="white" opacity="0.9" />
        </g>
      );
    default:
      return null;
  }
}

function renderTail(type: string, c: PetColors, state: PetState) {
  const wagClass = state === 'sleeping' ? '' : state === 'happy' ? 'pet-tail-wag-fast' : state === 'sad' ? 'pet-tail-droop' : 'pet-tail-wag';

  if (type === '🐱') {
    return (
      <path
        className={`pet-part-tail ${wagClass}`}
        d="M90 76 Q104 58 100 40 Q98 34 102 28"
        stroke={c.dark}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        style={{ transformOrigin: '90px 76px' }}
      />
    );
  }
  if (type === '🐰') {
    return (
      <g className={`pet-part-tail ${wagClass}`} style={{ transformOrigin: '88px 82px' }}>
        <circle cx="90" cy="80" r="7" fill={c.belly} />
        <circle cx="92" cy="78" r="4" fill={c.body} opacity="0.5" />
      </g>
    );
  }
  return (
    <path
      className={`pet-part-tail ${wagClass}`}
      d="M88 74 Q102 56 98 42"
      stroke={c.dark}
      strokeWidth="6"
      fill="none"
      strokeLinecap="round"
      style={{ transformOrigin: '88px 74px' }}
    />
  );
}

function renderEars(type: string, c: PetColors, state: PetState) {
  const droopClass = state === 'sad' ? 'pet-ears-droop' : '';

  if (type === '🐱') {
    return (
      <g className={`pet-part-ears ${droopClass}`}>
        <polygon points="34,16 24,42 46,36" fill={c.ear} />
        <polygon points="36,20 28,38 44,34" fill={c.earInner} />
        <polygon points="86,16 96,42 74,36" fill={c.ear} />
        <polygon points="84,20 92,38 76,34" fill={c.earInner} />
      </g>
    );
  }
  if (type === '🐰') {
    return (
      <g className={`pet-part-ears ${droopClass}`}>
        <ellipse cx="44" cy="10" rx="9" ry="24" fill={c.ear} />
        <ellipse cx="44" cy="10" rx="5" ry="18" fill={c.earInner} />
        <ellipse cx="76" cy="10" rx="9" ry="24" fill={c.ear} />
        <ellipse cx="76" cy="10" rx="5" ry="18" fill={c.earInner} />
      </g>
    );
  }
  return (
    <g className={`pet-part-ears ${droopClass}`}>
      <ellipse cx="32" cy="34" rx="10" ry="18" fill={c.ear} transform="rotate(-10 32 34)" />
      <ellipse cx="33" cy="36" rx="5" ry="12" fill={c.earInner} transform="rotate(-10 33 36)" />
      <ellipse cx="88" cy="34" rx="10" ry="18" fill={c.ear} transform="rotate(10 88 34)" />
      <ellipse cx="87" cy="36" rx="5" ry="12" fill={c.earInner} transform="rotate(10 87 36)" />
    </g>
  );
}

function renderEyes(state: PetState, c: PetColors) {
  switch (state) {
    case 'sleeping':
      return (
        <g className="pet-part-eyes">
          <path d="M42 42 Q48 37 54 42" stroke="#3D2C20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M66 42 Q72 37 78 42" stroke="#3D2C20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'happy':
      return (
        <g className="pet-part-eyes">
          <path d="M42 44 Q48 37 54 44" stroke="#3D2C20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M66 44 Q72 37 78 44" stroke="#3D2C20" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'sad':
      return (
        <g className="pet-part-eyes">
          <line x1="42" y1="32" x2="52" y2="35" stroke="#3D2C20" strokeWidth="2" strokeLinecap="round" />
          <line x1="78" y1="32" x2="68" y2="35" stroke="#3D2C20" strokeWidth="2" strokeLinecap="round" />
          <circle cx="48" cy="42" r="6" fill="white" />
          <circle cx="72" cy="42" r="6" fill="white" />
          <circle cx="48" cy="44" r="3.5" fill="#3D2C20" />
          <circle cx="72" cy="44" r="3.5" fill="#3D2C20" />
          <circle cx="49" cy="43" r="1.3" fill="white" />
          <circle cx="73" cy="43" r="1.3" fill="white" />
        </g>
      );
    case 'sick':
      return (
        <g className="pet-part-eyes">
          <circle cx="48" cy="40" r="6" fill="white" />
          <circle cx="72" cy="40" r="6" fill="white" />
          <g className="pet-eyes-spin">
            <circle cx="48" cy="40" r="2" fill="none" stroke="#7B9E3E" strokeWidth="1.5" />
            <circle cx="48" cy="40" r="0.8" fill="#7B9E3E" />
          </g>
          <g className="pet-eyes-spin">
            <circle cx="72" cy="40" r="2" fill="none" stroke="#7B9E3E" strokeWidth="1.5" />
            <circle cx="72" cy="40" r="0.8" fill="#7B9E3E" />
          </g>
        </g>
      );
    case 'hungry':
      return (
        <g className="pet-part-eyes">
          <ellipse cx="48" cy="42" rx="6" ry="3.5" fill="white" />
          <ellipse cx="72" cy="42" rx="6" ry="3.5" fill="white" />
          <circle cx="48" cy="42" r="2.5" fill="#3D2C20" />
          <circle cx="72" cy="42" r="2.5" fill="#3D2C20" />
        </g>
      );
    default:
      return (
        <g className="pet-part-eyes pet-eyes-blink">
          <circle cx="48" cy="40" r="6" fill="white" />
          <circle cx="72" cy="40" r="6" fill="white" />
          <circle cx="49" cy="40" r="4" fill="#3D2C20" className="pet-pupil-look" />
          <circle cx="73" cy="40" r="4" fill="#3D2C20" className="pet-pupil-look" />
          <circle cx="50.5" cy="38.5" r="1.8" fill="white" />
          <circle cx="74.5" cy="38.5" r="1.8" fill="white" />
        </g>
      );
  }
}

function renderMouth(state: PetState) {
  switch (state) {
    case 'happy':
      return <path d="M52 56 Q60 66 68 56" stroke="#3D2C20" strokeWidth="1.5" fill="none" />;
    case 'sad':
      return <path d="M52 60 Q60 54 68 60" stroke="#3D2C20" strokeWidth="1.5" fill="none" />;
    case 'sick':
      return <path d="M50 58 Q55 60 60 58 Q65 56 70 58" stroke="#3D2C20" strokeWidth="1.5" fill="none" />;
    case 'hungry':
      return (
        <g className="pet-mouth-yawn">
          <ellipse cx="60" cy="60" rx="5" ry="7" fill="#3D2C20" />
          <ellipse cx="60" cy="59" rx="3" ry="4.5" fill="#C62828" opacity="0.4" />
        </g>
      );
    case 'sleeping':
      return null;
    default:
      return <path d="M54 56 Q60 60 66 56" stroke="#3D2C20" strokeWidth="1.5" fill="none" />;
  }
}
