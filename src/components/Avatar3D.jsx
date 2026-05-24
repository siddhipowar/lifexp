// Illustrated SVG avatar — mood-driven, cozy and cute
// Score 0–100 drives expression, colors, and animation

function getMoodConfig(score) {
  if (score >= 80) return {
    skin: '#fde8d8',
    hair: '#2d1b69',
    outfit: '#f472b6',
    outfitShade: '#ec4899',
    cheek: '#fca5a5',
    eyeStyle: 'happy',
    mouthStyle: 'big-smile',
    aura: '#f0abfc',
    auraOpacity: 0.5,
    sparkles: true,
    bounce: 'animate-bounce-soft',
    stars: true,
  }
  if (score >= 60) return {
    skin: '#fde8d8',
    hair: '#2d1b69',
    outfit: '#fb7185',
    outfitShade: '#f43f5e',
    cheek: '#fca5a5',
    eyeStyle: 'happy',
    mouthStyle: 'smile',
    aura: '#f9a8d4',
    auraOpacity: 0.35,
    sparkles: false,
    bounce: 'animate-bounce-soft',
    stars: false,
  }
  if (score >= 40) return {
    skin: '#fde8d8',
    hair: '#2d1b69',
    outfit: '#c084fc',
    outfitShade: '#a855f7',
    cheek: '#f0abfc',
    eyeStyle: 'neutral',
    mouthStyle: 'neutral',
    aura: '#e9d5ff',
    auraOpacity: 0.2,
    sparkles: false,
    bounce: '',
    stars: false,
  }
  if (score >= 20) return {
    skin: '#e5d5c8',
    hair: '#1e1b4b',
    outfit: '#94a3b8',
    outfitShade: '#64748b',
    cheek: '#cbd5e1',
    eyeStyle: 'sad',
    mouthStyle: 'frown',
    aura: '#e2e8f0',
    auraOpacity: 0.15,
    sparkles: false,
    bounce: '',
    stars: false,
  }
  return {
    skin: '#d4c4b8',
    hair: '#1e1b4b',
    outfit: '#64748b',
    outfitShade: '#475569',
    cheek: '#94a3b8',
    eyeStyle: 'drained',
    mouthStyle: 'deep-frown',
    aura: '#cbd5e1',
    auraOpacity: 0.1,
    sparkles: false,
    bounce: '',
    stars: false,
  }
}

function Eyes({ style, skin }) {
  if (style === 'happy') return (
    <g>
      {/* Happy curved eyes */}
      <path d="M 62 88 Q 70 80 78 88" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 102 88 Q 110 80 118 88" stroke="#1e1b4b" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Sparkle shine */}
      <circle cx="79" cy="87" r="2" fill="white" opacity="0.9"/>
      <circle cx="119" cy="87" r="2" fill="white" opacity="0.9"/>
    </g>
  )
  if (style === 'neutral') return (
    <g>
      <ellipse cx="70" cy="88" rx="7" ry="8" fill="#1e1b4b"/>
      <ellipse cx="110" cy="88" rx="7" ry="8" fill="#1e1b4b"/>
      <circle cx="73" cy="85" r="2.5" fill="white"/>
      <circle cx="113" cy="85" r="2.5" fill="white"/>
    </g>
  )
  if (style === 'sad') return (
    <g>
      <ellipse cx="70" cy="90" rx="6" ry="7" fill="#475569"/>
      <ellipse cx="110" cy="90" rx="6" ry="7" fill="#475569"/>
      <circle cx="72" cy="87" r="2" fill="white" opacity="0.7"/>
      <circle cx="112" cy="87" r="2" fill="white" opacity="0.7"/>
      {/* Sad eyebrows */}
      <path d="M 62 80 Q 70 76 78 80" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M 102 80 Q 110 76 118 80" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </g>
  )
  if (style === 'drained') return (
    <g>
      {/* Half-closed eyes */}
      <ellipse cx="70" cy="90" rx="7" ry="5" fill="#64748b"/>
      <ellipse cx="110" cy="90" rx="7" ry="5" fill="#64748b"/>
      {/* Heavy eyelids */}
      <path d="M 63 87 Q 70 83 77 87" fill={skin} stroke="none"/>
      <path d="M 103 87 Q 110 83 117 87" fill={skin} stroke="none"/>
    </g>
  )
  // happy fallback
  return (
    <g>
      <ellipse cx="70" cy="88" rx="7" ry="8" fill="#1e1b4b"/>
      <ellipse cx="110" cy="88" rx="7" ry="8" fill="#1e1b4b"/>
      <circle cx="73" cy="85" r="2.5" fill="white"/>
      <circle cx="113" cy="85" r="2.5" fill="white"/>
    </g>
  )
}

function Mouth({ style }) {
  if (style === 'big-smile') return (
    <path d="M 72 108 Q 90 124 108 108" stroke="#e11d48" strokeWidth="3" fill="#fda4af" strokeLinecap="round" strokeLinejoin="round"/>
  )
  if (style === 'smile') return (
    <path d="M 76 108 Q 90 120 104 108" stroke="#e11d48" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  )
  if (style === 'neutral') return (
    <path d="M 80 110 Q 90 114 100 110" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  )
  if (style === 'frown') return (
    <path d="M 78 114 Q 90 106 102 114" stroke="#64748b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  )
  if (style === 'deep-frown') return (
    <path d="M 76 116 Q 90 106 104 116" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  )
  return null
}

export default function Avatar3D({ score = 70, size = 160 }) {
  const cfg = getMoodConfig(score)

  return (
    <div
      className={`relative flex items-center justify-center ${cfg.bounce}`}
      style={{ width: size, height: size }}
    >
      {/* Aura glow */}
      <div
        className="absolute inset-0 rounded-full blur-xl transition-all duration-1000"
        style={{ background: cfg.aura, opacity: cfg.auraOpacity, transform: 'scale(0.9)' }}
      />

      <svg
        viewBox="0 0 180 220"
        width={size}
        height={size}
        style={{ overflow: 'visible', position: 'relative', zIndex: 1 }}
      >
        {/* ── Body / outfit ── */}
        <rect x="42" y="148" width="96" height="64" rx="28" fill={cfg.outfit}/>
        {/* Outfit neckline */}
        <ellipse cx="90" cy="150" rx="22" ry="10" fill={cfg.outfitShade}/>
        {/* Outfit detail — little bow */}
        {score >= 40 && (
          <g>
            <path d="M 80 158 L 88 164 L 80 170 Z" fill={cfg.outfitShade} opacity="0.7"/>
            <path d="M 100 158 L 92 164 L 100 170 Z" fill={cfg.outfitShade} opacity="0.7"/>
            <circle cx="90" cy="164" r="4" fill="white" opacity="0.5"/>
          </g>
        )}

        {/* ── Neck ── */}
        <rect x="78" y="136" width="24" height="20" rx="10" fill={cfg.skin}/>

        {/* ── Arms ── */}
        {/* Left arm */}
        <rect
          x="20" y="152" width="26" height="48" rx="13"
          fill={cfg.outfit}
          transform={score >= 60 ? 'rotate(-25 33 152)' : score >= 40 ? 'rotate(-10 33 152)' : 'rotate(5 33 152)'}
        />
        {/* Right arm */}
        <rect
          x="134" y="152" width="26" height="48" rx="13"
          fill={cfg.outfit}
          transform={score >= 60 ? 'rotate(25 147 152)' : score >= 40 ? 'rotate(10 147 152)' : 'rotate(-5 147 152)'}
        />

        {/* ── Head ── */}
        <ellipse cx="90" cy="90" rx="52" ry="56" fill={cfg.skin}/>

        {/* ── Hair — back layer ── */}
        <ellipse cx="90" cy="62" rx="54" ry="38" fill={cfg.hair}/>
        {/* Side hair strands */}
        <ellipse cx="40" cy="96" rx="14" ry="30" fill={cfg.hair}/>
        <ellipse cx="140" cy="96" rx="14" ry="30" fill={cfg.hair}/>

        {/* ── Ears ── */}
        <ellipse cx="38" cy="92" rx="10" ry="13" fill={cfg.skin}/>
        <ellipse cx="142" cy="92" rx="10" ry="13" fill={cfg.skin}/>
        {/* Inner ear */}
        <ellipse cx="38" cy="92" rx="6" ry="8" fill="#fca5a5" opacity="0.4"/>
        <ellipse cx="142" cy="92" rx="6" ry="8" fill="#fca5a5" opacity="0.4"/>

        {/* ── Hair — front layer ── */}
        {/* Bangs */}
        <path d="M 44 72 Q 50 42 90 38 Q 130 42 136 72 Q 118 56 90 54 Q 62 56 44 72 Z" fill={cfg.hair}/>
        {/* Hair side part detail */}
        <path d="M 90 38 Q 96 50 100 60" stroke={cfg.hair} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.6"/>

        {/* ── Cheeks ── */}
        {score >= 40 && (
          <g>
            <ellipse cx="58" cy="104" rx="12" ry="8" fill={cfg.cheek} opacity="0.45"/>
            <ellipse cx="122" cy="104" rx="12" ry="8" fill={cfg.cheek} opacity="0.45"/>
          </g>
        )}

        {/* ── Eyes ── */}
        <Eyes style={cfg.eyeStyle} skin={cfg.skin}/>

        {/* ── Mouth ── */}
        <Mouth style={cfg.mouthStyle}/>

        {/* ── Nose ── */}
        <ellipse cx="90" cy="100" rx="4" ry="3" fill={cfg.cheek} opacity="0.5"/>

        {/* ── Sparkles (happy only) ── */}
        {cfg.stars && (
          <g className="animate-sparkle">
            <text x="18" y="70" fontSize="14" opacity="0.9">✨</text>
            <text x="145" y="60" fontSize="12" opacity="0.8">⭐</text>
            <text x="155" y="100" fontSize="10" opacity="0.7">✨</text>
            <text x="8" y="110" fontSize="10" opacity="0.7">🌸</text>
          </g>
        )}

        {/* ── Zzz (drained) ── */}
        {score < 20 && (
          <g opacity="0.7">
            <text x="140" y="55" fontSize="12" fill="#94a3b8">z</text>
            <text x="152" y="42" fontSize="15" fill="#94a3b8">z</text>
            <text x="166" y="26" fontSize="18" fill="#94a3b8">Z</text>
          </g>
        )}
      </svg>
    </div>
  )
}
