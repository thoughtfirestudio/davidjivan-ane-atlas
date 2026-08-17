import { useEffect, useRef } from 'react'
import type { Ruler } from '../lib/atlas'

interface RulerWheelProps {
  rulers: Ruler[]
  year: number
  selected: Ruler | null
  onSelect: (ruler: Ruler | null) => void
}

// A carousel of the powers-that-were for the current year. Auto-spins to keep
// the contemporary rulers in view; clicking a ruler highlights their realm and
// opens the propaganda panel.
export default function RulerWheel({ rulers, year, selected, onSelect }: RulerWheelProps) {
  const railRef = useRef<HTMLDivElement>(null)

  // Keep the wheel centered on the current year's rulers.
  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const el = rail.querySelector('[data-current="true"]') as HTMLElement | null
    if (!el) return
    rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' })
  }, [year])

  return (
    <div className="wheel">
      <div className="wheel-rail" ref={railRef} role="listbox" aria-label="Contemporary rulers">
        {rulers.map((r) => {
          const current = year <= r.start && year >= r.end
          const isSelected = selected?.name === r.name
          return (
            <button
              key={r.name}
              role="option"
              aria-selected={isSelected}
              data-current={current}
              className={`wheel-card ${current ? 'is-current' : ''} ${isSelected ? 'is-selected' : ''}`}
              style={{ '--realm': r.color } as React.CSSProperties}
              onClick={() => onSelect(isSelected ? null : r)}
            >
              <span className="wheel-realm">{r.realm}</span>
              <span className="wheel-name">{r.name}</span>
              <span className="wheel-years">
                {r.start}–{r.end} BCE
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
