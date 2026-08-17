import { useMemo, useState } from 'react'
import type { LatLngBoundsExpression } from 'leaflet'
import { useAtlasData } from './hooks/useAtlasData'
import { actForYear } from './lib/atlas'
import type { NarrativeMode, Ruler, AtlasEvent, Act } from './lib/atlas'
import MapView from './components/MapView'
import TimelineSlider from './components/TimelineSlider'
import ActSelector from './components/ActSelector'
import NarrativeToggle from './components/NarrativeToggle'
import RulerWheel from './components/RulerWheel'
import PropagandaSidebar from './components/PropagandaSidebar'
import EventPopup from './components/EventPopup'
import IntroOverlay from './components/IntroOverlay'

export default function App() {
  const { data, error } = useAtlasData()
  const [year, setYear] = useState(1200)
  const [mode, setMode] = useState<NarrativeMode>('biblical')
  const [selectedRuler, setSelectedRuler] = useState<Ruler | null>(null)
  const [openEvent, setOpenEvent] = useState<AtlasEvent | null>(null)
  const [focusBox, setFocusBox] = useState<LatLngBoundsExpression | null>(null)
  const [focusKey, setFocusKey] = useState(0)
  const [started, setStarted] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const act = useMemo(() => (data ? actForYear(data.acts, year) : null), [data, year])

  if (error) {
    return (
      <div className="boot-error">
        <h1>Could not load the atlas</h1>
        <p>{error}</p>
        <p>Check that the data files in <code>public/data/</code> are present.</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="boot">
        <p>Unrolling the map…</p>
      </div>
    )
  }

  const jumpToAct = (a: Act) => {
    setYear(a.years[0])
    setFocusBox(a.focus)
    setFocusKey((k) => k + 1)
    setSelectedRuler(null)
  }

  const handleYearChange = (y: number) => {
    setYear(y)
    setSelectedRuler(null)
    // Anniversary: if the year lands exactly on an event, show its card.
    const ev = data.events.find((e) => e.year === y)
    setOpenEvent(ev ?? null)
  }

  const handleEventTick = (y: number) => {
    const ev = data.events.find((e) => e.year === y)
    setOpenEvent(ev ?? null)
  }

  const handleEventJump = (y: number) => {
    setYear(y)
    setFocusBox(actForYear(data.acts, y).focus)
    setFocusKey((k) => k + 1)
    setOpenEvent(null)
  }

  const handleRulerSelect = (r: Ruler | null) => {
    setSelectedRuler(r)
    if (r) {
      setFocusBox(r.focus)
      setFocusKey((k) => k + 1)
      setFlash(`${r.name} — ${r.realm}`)
      window.setTimeout(() => setFlash(null), 1400)
    }
  }

  return (
    <div className="app">
      <MapView data={data} year={year} mode={mode} focusBox={focusBox} focusKey={focusKey} />

      <header className="masthead">
        <div className="masthead-titles">
          <span className="masthead-kicker">ANE ATLAS</span>
          <h1>The Land Between Empires</h1>
          <p className="masthead-range">1200–539 BCE · the Levant under Egypt, Assyria, and Babylon</p>
        </div>
        <NarrativeToggle mode={mode} onChange={setMode} />
      </header>

      <div className="left-panel">
        <ActSelector acts={data.acts} activeAct={act ?? data.acts[0]} onSelect={jumpToAct} />
      </div>

      {act && (
        <section className="act-note">
          <span className="act-note-num">{String(act.id).padStart(2, '0')}</span>
          <div className="act-note-body">
            <h2>{act.title}</h2>
            <p className="act-note-sub">{act.subtitle}</p>
            <p className="act-note-narrative">{act.narrative}</p>
          </div>
        </section>
      )}

      {selectedRuler && (
        <PropagandaSidebar ruler={selectedRuler} onClose={() => setSelectedRuler(null)} />
      )}

      {openEvent && (
        <EventPopup event={openEvent} onClose={() => setOpenEvent(null)} onYear={handleEventJump} />
      )}

      <footer className="console">
        <TimelineSlider
          year={year}
          min={data.range.start}
          max={data.range.end}
          acts={data.acts}
          onChange={handleYearChange}
          onEventTick={handleEventTick}
        />
        <RulerWheel rulers={data.rulers} year={year} selected={selectedRuler} onSelect={handleRulerSelect} />
      </footer>

      {flash && <div className="flash">{flash}</div>}

      {!started && <IntroOverlay onBegin={() => setStarted(true)} />}
    </div>
  )
}
