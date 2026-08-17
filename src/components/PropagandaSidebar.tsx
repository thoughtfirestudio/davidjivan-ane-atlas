import type { Ruler } from '../lib/atlas'

interface PropagandaSidebarProps {
  ruler: Ruler
  onClose: () => void
}

// The dual-verdict panel: what the biblical writers said about a ruler versus
// what the records say. The heart of the atlas's honesty.
export default function PropagandaSidebar({ ruler, onClose }: PropagandaSidebarProps) {
  return (
    <aside className="propaganda" aria-label={`Verdicts on ${ruler.name}`}>
      <header className="propaganda-head">
        <span className="propaganda-realm" style={{ color: ruler.color }}>
          {ruler.realm}
        </span>
        <h3>{ruler.name}</h3>
        <span className="propaganda-years">
          {ruler.start}–{ruler.end} BCE
        </span>
        <button className="propaganda-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </header>
      <div className="propaganda-verdicts">
        <div className="propaganda-verdict propaganda-bible">
          <span className="propaganda-tag">The text says</span>
          <p>{ruler.biblical}</p>
        </div>
        <div className="propaganda-verdict propaganda-arch">
          <span className="propaganda-tag">The ground says</span>
          <p>{ruler.historical}</p>
        </div>
      </div>
    </aside>
  )
}
