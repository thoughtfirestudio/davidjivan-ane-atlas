import type { Act } from '../lib/atlas'
import { formatYear } from '../lib/atlas'

interface TimelineSliderProps {
  year: number
  min: number // oldest year, drawn at the LEFT edge (e.g. 1200)
  max: number // newest year, drawn at the RIGHT edge (e.g. 539)
  acts: Act[]
  onChange: (year: number) => void
  onEventTick: (year: number) => void
}

// The brass instrument needle: one thin pointer on a long rule, BCE dates as
// ticks, act boundaries as heavier marks. Dragging drives the whole map.
// The native range input runs min→max left→right, so it is given the
// newest→oldest bounds with direction:rtl — putting 1200 at the left edge.
export default function TimelineSlider({ year, min, max, acts, onChange, onEventTick }: TimelineSliderProps) {
  const span = min - max // e.g. 1200 - 539 = 661
  const pct = ((min - year) / span) * 100

  return (
    <div className="timeline">
      <div className="timeline-acts">
        {acts.map((a) => {
          const startPct = ((min - a.years[0]) / span) * 100
          const endPct = ((min - a.years[1]) / span) * 100
          const active = year <= a.years[0] && year >= a.years[1]
          return (
            <button
              key={a.id}
              className={`timeline-act ${active ? 'is-active' : ''}`}
              style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
              onClick={() => onChange(a.years[0])}
              title={`${a.title} (${a.years[0]}–${a.years[1]} BCE)`}
            >
              {a.id}
            </button>
          )
        })}
      </div>
      <div className="timeline-rule">
        <div className="timeline-track">
          <div className="timeline-fill" style={{ width: `${pct}%` }} />
          <input
            type="range"
            dir="rtl"
            className="timeline-input"
            min={max}
            max={min}
            step={1}
            value={year}
            aria-label="Year"
            onChange={(e) => {
              const v = Number(e.target.value)
              onChange(v)
              onEventTick(v)
            }}
          />
          <div className="timeline-thumb" style={{ left: `${pct}%` }}>
            <span className="timeline-year">{formatYear(year)}</span>
          </div>
        </div>
        <div className="timeline-ends">
          <span>{formatYear(min)}</span>
          <span>{formatYear(max)}</span>
        </div>
      </div>
    </div>
  )
}
