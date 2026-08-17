import type { AtlasEvent } from '../lib/atlas'
import { formatYear } from '../lib/atlas'

interface EventPopupProps {
  event: AtlasEvent
  onClose: () => void
  onYear: (year: number) => void
}

// Fires on the anniversary of a key event: a short narrative, a quote from
// the text, and a quote from the archaeology, side by side.
export default function EventPopup({ event, onClose, onYear }: EventPopupProps) {
  return (
    <div className="event-popup" role="dialog" aria-label={event.title}>
      <button className="event-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <span className="event-year">{formatYear(event.year)}</span>
      <h3>{event.title}</h3>
      <div className="event-quotes">
        <div className="event-quote event-quote-bible">
          <span className="event-tag">The text</span>
          <p>{event.bible}</p>
        </div>
        <div className="event-quote event-quote-arch">
          <span className="event-tag">The archaeology</span>
          <p>{event.archaeology}</p>
        </div>
      </div>
      <p className="event-source">{event.source}</p>
      <button className="event-jump" onClick={() => onYear(event.year)}>
        Go to {formatYear(event.year)}
      </button>
    </div>
  )
}
