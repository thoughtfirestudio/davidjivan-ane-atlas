import type { Act } from '../lib/atlas'

interface ActSelectorProps {
  acts: Act[]
  activeAct: Act
  onSelect: (act: Act) => void
}

// The five acts as a numbered column. Each act is a chapter header; picking
// one jumps the map to its opening year.
export default function ActSelector({ acts, activeAct, onSelect }: ActSelectorProps) {
  return (
    <nav className="acts" aria-label="Epochs">
      {acts.map((a) => {
        const active = a.id === activeAct.id
        return (
          <button
            key={a.id}
            className={`act ${active ? 'is-active' : ''}`}
            onClick={() => onSelect(a)}
            aria-current={active ? 'step' : undefined}
          >
            <span className="act-num">{String(a.id).padStart(2, '0')}</span>
            <span className="act-body">
              <span className="act-title">{a.title}</span>
              <span className="act-years">
                {a.years[0]}–{a.years[1]} BCE
              </span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
