// Chibi-style illustrated avatar — mood-driven with CSS animations
// ViewBox 200×240 — head center (100, 88), body below

const ANIM_STYLES = `
  @keyframes avatarFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes avatarBob {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-5px); }
  }
  @keyframes avatarSway {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-3px) rotate(-1.5deg); }
    66%       { transform: translateY(-1px) rotate(1deg); }
  }
  @keyframes auraPulse {
    0%, 100% { transform: scale(0.88); opacity: 0; }
    50%       { transform: scale(1.08); opacity: 1; }
  }
  @keyframes sparkle1 {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); opacity: 1; }
    50%       { transform: translate(-4px, -12px) rotate(180deg) scale(0.7); opacity: 0.4; }
  }
  @keyframes sparkle2 {
    0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); opacity: 0.8; }
    50%       { transform: translate(5px, -10px) rotate(-180deg) scale(0.6); opacity: 0.3; }
  }
  @keyframes sparkle3 {
    0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.9; }
    50%       { transform: translate(-2px, -8px) scale(0.5); opacity: 0.2; }
  }
  @keyframes blink {
    0%, 88%, 100% { transform: scaleY(1); }
    93%            { transform: scaleY(0.08); }
  }
  @keyframes zFloat {
    0%   { transform: translate(0px, 0px); opacity: 0; }
    20%  { opacity: 1; }
    100% { transform: translate(12px, -24px); opacity: 0; }
  }
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.15); }
  }
`

function getMoodConfig(score) {
  if (score >= 80) return {
    skin: '#fde8d8', skinShade: '#f9c5a5',
    hair: '#2d1b69', hairShine: '#4c1d95',
    outfit: '#f472b6', outfitShade: '#db2777', outfitLight: '#fbcfe8',
    eyeColor: '#7c3aed', irisLight: '#a78bfa',
    cheek: '#f87171', cheekOpacity: 0.55,
    aura: 'radial-gradient(circle, #f0abfc 0%, #e879f9 50%, transparent 70%)',
    auraAnimOpacity: 0.45,
    bodyAnim: 'avatarFloat 2.8s ease-in-out infinite',
    expression: 'ecstatic',
    sparkles: true, zzz: false,
  }
  if (score >= 60) return {
    skin: '#fde8d8', skinShade: '#f9c5a5',
    hair: '#2d1b69', hairShine: '#4c1d95',
    outfit: '#fb7185', outfitShade: '#e11d48', outfitLight: '#fecdd3',
    eyeColor: '#7c3aed', irisLight: '#a78bfa',
    cheek: '#fca5a5', cheekOpacity: 0.5,
    aura: 'radial-gradient(circle, #f9a8d4 0%, #f472b6 50%, transparent 70%)',
    auraAnimOpacity: 0.3,
    bodyAnim: 'avatarBob 3.2s ease-in-out infinite',
    expression: 'happy',
    sparkles: false, zzz: false,
  }
  if (score >= 40) return {
    skin: '#fde8d8', skinShade: '#f9c5a5',
    hair: '#2d1b69', hairShine: '#4c1d95',
    outfit: '#c084fc', outfitShade: '#9333ea', outfitLight: '#e9d5ff',
    eyeColor: '#6d28d9', irisLight: '#8b5cf6',
    cheek: '#d8b4fe', cheekOpacity: 0.4,
    aura: 'radial-gradient(circle, #ddd6fe 0%, #c4b5fd 50%, transparent 70%)',
    auraAnimOpacity: 0.2,
    bodyAnim: 'avatarSway 4s ease-in-out infinite',
    expression: 'okay',
    sparkles: false, zzz: false,
  }
  if (score >= 20) return {
    skin: '#e8d5c4', skinShade: '#d4bfad',
    hair: '#1e1b4b', hairShine: '#312e81',
    outfit: '#94a3b8', outfitShade: '#64748b', outfitLight: '#cbd5e1',
    eyeColor: '#475569', irisLight: '#64748b',
    cheek: '#cbd5e1', cheekOpacity: 0.3,
    aura: 'radial-gradient(circle, #e2e8f0 0%, #cbd5e1 50%, transparent 70%)',
    auraAnimOpacity: 0.15,
    bodyAnim: 'none',
    expression: 'sad',
    sparkles: false, zzz: false,
  }
  return {
    skin: '#ddd0c4', skinShade: '#c4b5a8',
    hair: '#1e1b4b', hairShine: '#312e81',
    outfit: '#64748b', outfitShade: '#475569', outfitLight: '#94a3b8',
    eyeColor: '#334155', irisLight: '#475569',
    cheek: '#94a3b8', cheekOpacity: 0.2,
    aura: 'radial-gradient(circle, #cbd5e1 0%, #94a3b8 50%, transparent 70%)',
    auraAnimOpacity: 0.1,
    bodyAnim: 'none',
    expression: 'drained',
    sparkles: false, zzz: true,
  }
}

// ── Eyes ────────────────────────────────────────────────────────────────────
function EyePair({ expression, eyeColor, irisLight }) {
  const blinkStyle = {
    animation: 'blink 5s ease-in-out infinite',
    transformOrigin: '100px 91px',
  }
  // Reusable eye with iris, pupil, highlights, lashes
  const Eye = ({ cx }) => (
    <g>
      {/* White of eye */}
      <ellipse cx={cx} cy="91" rx="13" ry="14" fill="white"/>
      {/* Iris */}
      <ellipse cx={cx} cy="92" rx="10" ry="11" fill={eyeColor}/>
      {/* Pupil */}
      <ellipse cx={cx} cy="93" rx="6" ry="7" fill="#1e1b4b"/>
      {/* Main highlight */}
      <ellipse cx={cx - 3} cy="87" rx="4" ry="4" fill="white" opacity="0.9"/>
      {/* Small highlight */}
      <circle cx={cx + 4} cy="96" r="2" fill="white" opacity="0.6"/>
      {/* Iris ring */}
      <ellipse cx={cx} cy="92" rx="10" ry="11" fill="none" stroke={irisLight} strokeWidth="1.5" opacity="0.4"/>
      {/* Top lash line */}
      <path d={`M ${cx-13} 88 Q ${cx} 83 ${cx+13} 88`} stroke="#1e1b4b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Lash tips */}
      <line x1={cx - 13} y1="88" x2={cx - 16} y2="85" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round"/>
      <line x1={cx + 13} y1="88" x2={cx + 16} y2="85" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round"/>
      <line x1={cx - 7}  y1="84" x2={cx - 8}  y2="81" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1={cx + 7}  y1="84" x2={cx + 8}  y2="81" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round"/>
    </g>
  )

  if (expression === 'ecstatic') return (
    <g style={blinkStyle}>
      {/* Happy arc eyes */}
      <path d="M 73 95 Q 82 82 91 95" stroke="#1e1b4b" strokeWidth="3.5" fill={irisLight} strokeLinecap="round"/>
      <path d="M 109 95 Q 118 82 127 95" stroke="#1e1b4b" strokeWidth="3.5" fill={irisLight} strokeLinecap="round"/>
      {/* Lashes */}
      <line x1="73" y1="95" x2="70" y2="98" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round"/>
      <line x1="91" y1="95" x2="94" y2="98" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round"/>
      <line x1="109" y1="95" x2="106" y2="98" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round"/>
      <line x1="127" y1="95" x2="130" y2="98" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round"/>
      {/* Star sparkles in eyes */}
      <text x="77" y="91" fontSize="8" fill="white">✦</text>
      <text x="113" y="91" fontSize="8" fill="white">✦</text>
    </g>
  )

  if (expression === 'sad') return (
    <g style={blinkStyle}>
      <Eye cx={82}/>
      <Eye cx={118}/>
      {/* Sad eyebrows angled down toward center */}
      <path d="M 70 77 Q 79 73 88 76" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M 112 76 Q 121 73 130 77" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  )

  if (expression === 'drained') return (
    <g>
      {/* Half-closed: eyelid covers top half */}
      <Eye cx={82}/>
      <Eye cx={118}/>
      {/* Droopy eyelids */}
      <path d="M 69 84 Q 82 78 95 84" fill="#ddd0c4" stroke="none"/>
      <path d="M 105 84 Q 118 78 131 84" fill="#ddd0c4" stroke="none"/>
      {/* Sad eyebrows */}
      <path d="M 70 77 Q 79 73 88 76" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M 112 76 Q 121 73 130 77" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  )

  // happy / okay — full anime eyes with blink
  return (
    <g style={blinkStyle}>
      <Eye cx={82}/>
      <Eye cx={118}/>
    </g>
  )
}

// ── Mouth ───────────────────────────────────────────────────────────────────
function Mouth({ expression }) {
  if (expression === 'ecstatic') return (
    <g>
      <path d="M 76 114 Q 100 132 124 114" stroke="#be185d" strokeWidth="2.5" fill="#fda4af" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Teeth glint */}
      <path d="M 82 115 Q 100 128 118 115" fill="white" stroke="none" opacity="0.6"/>
    </g>
  )
  if (expression === 'happy') return (
    <path d="M 80 114 Q 100 128 120 114" stroke="#be185d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  )
  if (expression === 'okay') return (
    <path d="M 85 116 Q 100 122 115 116" stroke="#9333ea" strokeWidth="2" fill="none" strokeLinecap="round"/>
  )
  if (expression === 'sad') return (
    <path d="M 82 120 Q 100 112 118 120" stroke="#64748b" strokeWidth="2" fill="none" strokeLinecap="round"/>
  )
  // drained
  return (
    <path d="M 80 122 Q 100 113 120 122" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round"/>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Avatar3D({ score = 70, size = 160 }) {
  const cfg = getMoodConfig(score)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <style>{ANIM_STYLES}</style>

      {/* Aura glow */}
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          inset: '-10%',
          background: cfg.aura,
          animation: `auraPulse 3s ease-in-out infinite`,
          '--aura-opacity': cfg.auraAnimOpacity,
          opacity: cfg.auraAnimOpacity,
        }}
      />

      {/* SVG character — 200×240 coordinate space */}
      <svg
        viewBox="0 0 200 240"
        width={size}
        height={size}
        style={{ overflow: 'visible', position: 'relative', zIndex: 1, animation: cfg.bodyAnim }}
      >
        {/* ── BACK HAIR (rendered before face so face covers it) ── */}
        <ellipse cx="100" cy="78" rx="57" ry="50" fill={cfg.hair}/>
        {/* Hair sides flowing down */}
        <path d="M 43 90 Q 36 130 42 175 Q 50 155 52 130 Q 56 110 58 90 Z" fill={cfg.hair}/>
        <path d="M 157 90 Q 164 130 158 175 Q 150 155 148 130 Q 144 110 142 90 Z" fill={cfg.hair}/>
        {/* Hair shine streak */}
        <path d="M 80 36 Q 90 46 88 62" stroke={cfg.hairShine} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5"/>

        {/* ── EARS (before face) ── */}
        <ellipse cx="47" cy="93" rx="12" ry="16" fill={cfg.skin}/>
        <ellipse cx="153" cy="93" rx="12" ry="16" fill={cfg.skin}/>
        <ellipse cx="47" cy="93" rx="7" ry="10" fill={cfg.skinShade} opacity="0.5"/>
        <ellipse cx="153" cy="93" rx="7" ry="10" fill={cfg.skinShade} opacity="0.5"/>

        {/* ── FACE (over hair, over ears) ── */}
        <ellipse cx="100" cy="93" rx="52" ry="57" fill={cfg.skin}/>
        {/* Subtle face shading at chin */}
        <ellipse cx="100" cy="138" rx="32" ry="12" fill={cfg.skinShade} opacity="0.2"/>

        {/* ── CHEEKS ── */}
        {score >= 30 && (
          <>
            <ellipse cx="66" cy="108" rx="14" ry="9" fill={cfg.cheek} opacity={cfg.cheekOpacity}/>
            <ellipse cx="134" cy="108" rx="14" ry="9" fill={cfg.cheek} opacity={cfg.cheekOpacity}/>
          </>
        )}

        {/* ── NOSE ── */}
        <ellipse cx="100" cy="110" rx="4" ry="3" fill={cfg.skinShade} opacity="0.55"/>

        {/* ── EYES ── */}
        <EyePair expression={cfg.expression} eyeColor={cfg.eyeColor} irisLight={cfg.irisLight}/>

        {/* ── MOUTH ── */}
        <Mouth expression={cfg.expression}/>

        {/* ── FRONT BANGS (over face, forehead only — bottom edge at y=74, eyes at y=77+) ── */}
        <path
          d="M 52 74 Q 56 32 100 30 Q 144 32 148 74 Q 128 56 100 54 Q 72 56 52 74 Z"
          fill={cfg.hair}
        />
        {/* Bang inner shadow */}
        <path
          d="M 52 74 Q 72 56 100 54 Q 128 56 148 74 Q 128 62 100 60 Q 72 62 52 74 Z"
          fill={cfg.hairShine} opacity="0.25"
        />
        {/* Hair shine on bangs */}
        <path d="M 78 36 Q 84 48 82 58" stroke={cfg.hairShine} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.4"/>

        {/* ── HAIR CLIP (cute star, only when mood ok+) ── */}
        {score >= 40 && (
          <g style={{ animation: score >= 60 ? 'heartbeat 2s ease-in-out infinite' : 'none', transformOrigin: '134px 62px' }}>
            <circle cx="134" cy="62" r="9" fill={score >= 60 ? '#fde68a' : cfg.outfitLight}/>
            <text x="128" y="67" fontSize="10">✦</text>
          </g>
        )}

        {/* ── NECK ── */}
        <rect x="86" y="148" width="28" height="22" rx="12" fill={cfg.skin}/>

        {/* ── BODY / OUTFIT ── */}
        {/* Main body */}
        <rect x="44" y="162" width="112" height="74" rx="32" fill={cfg.outfit}/>
        {/* Outfit collar/neckline */}
        <path d="M 76 165 Q 100 180 124 165" fill={cfg.outfitShade} stroke="none"/>
        {/* Outfit highlight (light area center) */}
        <ellipse cx="100" cy="188" rx="28" ry="22" fill={cfg.outfitLight} opacity="0.25"/>
        {/* Cute bow on outfit */}
        {score >= 40 && (
          <g>
            <path d="M 84 172 L 96 180 L 84 188 Z" fill="white" opacity="0.35"/>
            <path d="M 116 172 L 104 180 L 116 188 Z" fill="white" opacity="0.35"/>
            <circle cx="100" cy="180" r="5" fill="white" opacity="0.4"/>
          </g>
        )}
        {/* Little heart detail */}
        {score >= 60 && (
          <text x="93" y="205" fontSize="11" fill="white" opacity="0.7">♡</text>
        )}

        {/* ── ARMS + HANDS (grouped so hand stays at arm tip) ── */}
        <g transform={
          score >= 80 ? 'rotate(-40 33 166)' :
          score >= 60 ? 'rotate(-28 33 166)' :
          score >= 40 ? 'rotate(-12 33 166)' :
          'rotate(6 33 166)'
        }>
          <rect x="18" y="166" width="30" height="52" rx="15" fill={cfg.outfit}/>
          {/* Hand: circle centered at bottom of arm rect */}
          <circle cx="33" cy="220" r="13" fill={cfg.skin}/>
          <circle cx="33" cy="220" r="10" fill={cfg.skinShade} opacity="0.25"/>
        </g>

        <g transform={
          score >= 80 ? 'rotate(40 167 166)' :
          score >= 60 ? 'rotate(28 167 166)' :
          score >= 40 ? 'rotate(12 167 166)' :
          'rotate(-6 167 166)'
        }>
          <rect x="152" y="166" width="30" height="52" rx="15" fill={cfg.outfit}/>
          <circle cx="167" cy="220" r="13" fill={cfg.skin}/>
          <circle cx="167" cy="220" r="10" fill={cfg.skinShade} opacity="0.25"/>
        </g>

        {/* ── SPARKLES (ecstatic / happy) ── */}
        {cfg.sparkles && (
          <>
            <text x="14" y="72" fontSize="16" style={{ animation: 'sparkle1 2.2s ease-in-out infinite' }}>✨</text>
            <text x="162" y="60" fontSize="13" style={{ animation: 'sparkle2 1.8s ease-in-out infinite 0.4s' }}>⭐</text>
            <text x="168" y="112" fontSize="11" style={{ animation: 'sparkle3 2.5s ease-in-out infinite 0.8s' }}>✦</text>
            <text x="10" y="118" fontSize="11" style={{ animation: 'sparkle1 2s ease-in-out infinite 1.2s' }}>🌸</text>
          </>
        )}
        {score >= 60 && !cfg.sparkles && (
          <text x="162" y="66" fontSize="11" fill={cfg.eyeColor} opacity="0.7" style={{ animation: 'sparkle2 3s ease-in-out infinite' }}>✦</text>
        )}

        {/* ── ZZZ (drained) ── */}
        {cfg.zzz && (
          <>
            <text x="148" y="62" fontSize="11" fill="#94a3b8" style={{ animation: 'zFloat 2.4s ease-in-out infinite' }}>z</text>
            <text x="158" y="46" fontSize="14" fill="#94a3b8" style={{ animation: 'zFloat 2.4s ease-in-out infinite 0.6s' }}>z</text>
            <text x="170" y="28" fontSize="17" fill="#94a3b8" style={{ animation: 'zFloat 2.4s ease-in-out infinite 1.2s' }}>Z</text>
          </>
        )}
      </svg>
    </div>
  )
}
