export default function XPBar({ xp, needed, className = '' }) {
  const pct = Math.min(100, Math.round((xp / needed) * 100))
  return (
    <div className={`xp-bar ${className}`}>
      <div
        className="xp-bar-fill"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
