// Types for the atlas data model. The data files in public/data are the source
// of truth; these types mirror them so a historian can edit JSON without
// touching React code.

export type NarrativeMode = 'both' | 'biblical' | 'archaeological'

export interface PopupContent {
  bible: string
  archaeology: string
  source: string
}

export interface FeatureProps {
  name: string
  kind: string
  mode: NarrativeMode
  start: number // BCE year it appears (1200 = older)
  end: number // BCE year it disappears
  color?: string
  label?: string
  popup?: PopupContent
}

export interface GeoFeature {
  type: 'Feature'
  properties: FeatureProps
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon'
    coordinates: number[] | number[][] | number[][][]
  }
}

export interface FeatureCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

export interface Act {
  id: number
  title: string
  subtitle: string
  years: [number, number]
  focus: [[number, number], [number, number]]
  narrative: string
  events: number[]
}

export interface AtlasEvent {
  year: number
  title: string
  act: number
  bible: string
  archaeology: string
  source: string
}

export interface Ruler {
  name: string
  realm: string
  start: number
  end: number
  color: string
  biblical: string
  historical: string
  focus: [[number, number], [number, number]]
}

export interface AtlasData {
  acts: Act[]
  range: { start: number; end: number }
  sites: FeatureCollection
  kingdoms: FeatureCollection
  superpowers: FeatureCollection
  neighbors: FeatureCollection
  tradeRoutes: FeatureCollection
  campaigns: FeatureCollection
  deportations: FeatureCollection
  events: AtlasEvent[]
  rulers: Ruler[]
}

// A feature is visible when the current year falls inside its BCE window
// (start >= year >= end, because BCE years run downward) and its narrative
// mode allows the current view.
export function isVisible(feature: GeoFeature, year: number, mode: NarrativeMode): boolean {
  const { start, end, mode: featMode } = feature.properties
  if (year > start || year < end) return false
  if (featMode !== 'both' && featMode !== mode) return false
  return true
}

export function featureColor(feature: GeoFeature): string {
  return feature.properties.color ?? '#7a6a4a'
}

// Rough centroid for polygon labels (average of all ring points).
// coords is the ring: an array of [lng, lat] pairs.
export function centroid(coords: number[][]): [number, number] {
  const n = coords.length
  const sum = coords.reduce(
    (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat] as [number, number],
    [0, 0] as [number, number],
  )
  return [sum[1] / n, sum[0] / n]
}

export function formatYear(year: number): string {
  return `${year} BCE`
}

export function actForYear(acts: Act[], year: number): Act {
  return acts.find((a) => year <= a.years[0] && year >= a.years[1]) ?? acts[acts.length - 1]
}

export function rulersForYear(rulers: Ruler[], year: number): Ruler[] {
  return rulers.filter((r) => year <= r.start && year >= r.end)
}
