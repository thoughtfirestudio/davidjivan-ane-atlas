import type { NarrativeMode } from '../lib/atlas'

interface NarrativeToggleProps {
  mode: NarrativeMode
  onChange: (mode: NarrativeMode) => void
}

// The whole point of the atlas: the same ground, two different pasts.
export default function NarrativeToggle({ mode, onChange }: NarrativeToggleProps) {
  return (
    <div className="toggle" role="group" aria-label="Narrative view">
      <button
        className={`toggle-opt ${mode === 'biblical' ? 'is-active' : ''}`}
        onClick={() => onChange('biblical')}
      >
        The text says
      </button>
      <button
        className={`toggle-opt ${mode === 'archaeological' ? 'is-active' : ''}`}
        onClick={() => onChange('archaeological')}
      >
        The ground says
      </button>
    </div>
  )
}
