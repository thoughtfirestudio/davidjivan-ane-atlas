import { useEffect, useState } from 'react'
import type { Act, AtlasData } from '../lib/atlas'

// acts.json, events.json, and rulers.json all carry their payload inside a
// named field (acts/events/rulers) alongside a _comment. Unwrap those.
interface ActsFile {
  range: { start: number; end: number }
  acts: Act[]
}

interface WrappedEvents {
  events: AtlasData['events']
}

interface WrappedRulers {
  rulers: AtlasData['rulers']
}

// Loads every data file in public/data once, on mount.
const DATA_FILES: Record<keyof Omit<AtlasData, 'range'>, string> = {
  acts: '/data/acts.json',
  sites: '/data/sites.geojson',
  kingdoms: '/data/core_kingdoms.geojson',
  superpowers: '/data/superpowers.geojson',
  neighbors: '/data/neighbors.geojson',
  tradeRoutes: '/data/trade_routes.geojson',
  campaigns: '/data/campaign_arrows.geojson',
  deportations: '/data/deportation_routes.geojson',
  events: '/data/events.json',
  rulers: '/data/rulers.json',
}

export function useAtlasData(): {
  data: AtlasData | null
  error: string | null
} {
  const [data, setData] = useState<AtlasData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const entries = Object.entries(DATA_FILES) as [keyof Omit<AtlasData, 'range'>, string][]
    Promise.all(
      entries.map(async ([key, url]) => {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`${url} — HTTP ${res.status}`)
        return [key, await res.json()] as const
      }),
    )
      .then((pairs) => {
        if (cancelled) return
        const assembled = Object.fromEntries(pairs) as unknown as Omit<AtlasData, 'range'> & {
          acts: ActsFile
          events: WrappedEvents
          rulers: WrappedRulers
        }
        setData({
          ...assembled,
          acts: assembled.acts.acts,
          events: assembled.events.events,
          rulers: assembled.rulers.rulers,
          range: assembled.acts.range,
        })
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error }
}
