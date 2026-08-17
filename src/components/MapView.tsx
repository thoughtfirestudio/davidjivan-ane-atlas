import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, Popup, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression, PathOptions } from 'leaflet'
import type { Feature as GeoFeatureType, FeatureCollection as GeoFC } from 'geojson'
import { isVisible, centroid, featureColor } from '../lib/atlas'
import type { AtlasData, GeoFeature, NarrativeMode } from '../lib/atlas'

interface MapViewProps {
  data: AtlasData
  year: number
  mode: NarrativeMode
  focusBox: LatLngBoundsExpression | null
  focusKey: number // bump to re-trigger flyTo on the same box
}

function FitBounds({ box, focusKey }: { box: LatLngBoundsExpression; focusKey: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyToBounds(box, { padding: [24, 24], duration: 1.1 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])
  return null
}

// The one place our data model crosses into GeoJSON territory. The shapes are
// structurally identical; the cast keeps react-leaflet's types happy.
function toFeatureCollection(features: GeoFeature[]): GeoFC {
  return { type: 'FeatureCollection', features: features as unknown as GeoFeatureType[] }
}

const pathBase: PathOptions = {
  weight: 2,
  opacity: 0.9,
  fillOpacity: 0.32,
}

function polygonStyle(feature?: GeoFeatureType): PathOptions {
  const props = (feature?.properties ?? {}) as GeoFeature['properties']
  const color = props.color ?? '#7a6a4a'
  if (props.kind === 'shadow') {
    return { ...pathBase, color, fillColor: color, fillOpacity: 0.14, weight: 1, dashArray: '4 6' }
  }
  if (props.kind === 'ruins') {
    return { ...pathBase, color, fillColor: color, fillOpacity: 0.18, dashArray: '3 4' }
  }
  if (props.kind === 'kingdom') {
    // The kingdoms are the stars of the show — boldest fill and border.
    return { color, fillColor: color, weight: 3, opacity: 0.95, fillOpacity: 0.55 }
  }
  if (props.kind === 'neighbor') {
    return { color, fillColor: color, weight: 2.5, opacity: 0.9, fillOpacity: 0.38 }
  }
  // Empires: keep them quiet so the kingdoms stand out on top.
  return { color, fillColor: color, weight: 2, opacity: 0.85, fillOpacity: 0.3 }
}

function lineStyle(kind: string, color: string): PathOptions {
  if (kind === 'deportation') {
    return { color, weight: 2.5, opacity: 0.85, dashArray: '1 8', lineCap: 'round' }
  }
  return { color, weight: 2.5, opacity: 0.9, dashArray: '6 6', lineCap: 'round', className: 'campaign-path' }
}

function PopupCard({ feature }: { feature: GeoFeature }) {
  const { popup, name, label } = feature.properties
  if (!popup) return null
  return (
    <div className="popup-card">
      <h4>{label ?? name}</h4>
      <p className="popup-voice popup-bible">
        <span className="popup-voice-tag">The text says</span>
        {popup.bible}
      </p>
      <p className="popup-voice popup-arch">
        <span className="popup-voice-tag">The ground says</span>
        {popup.archaeology}
      </p>
      <p className="popup-source">{popup.source}</p>
    </div>
  )
}

export default function MapView({ data, year, mode, focusBox, focusKey }: MapViewProps) {
  // Filter each layer down to the features alive in this year and narrative mode.
  const filter = (fc: GeoFeature[]): GeoFeature[] => fc.filter((f) => isVisible(f, year, mode))

  const superpowers = useMemo(() => filter(data.superpowers.features), [year, mode, data])
  const kingdoms = useMemo(() => filter(data.kingdoms.features), [year, mode, data])
  const neighbors = useMemo(() => filter(data.neighbors.features), [year, mode, data])
  const tradeRoutes = useMemo(() => filter(data.tradeRoutes.features), [year, mode, data])
  const campaigns = useMemo(() => filter(data.campaigns.features), [year, mode, data])
  const deportations = useMemo(() => filter(data.deportations.features), [year, mode, data])
  const sites = useMemo(() => filter(data.sites.features), [year, mode, data])

  return (
    <MapContainer
      center={[31.9, 35.2]}
      zoom={8}
      zoomControl={false}
      attributionControl={true}
      className="atlas-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />

      {/* The empires, then the kingdoms, then the small states — big fills under
          small ones. One GeoJSON per feature with a stable key: react-leaflet's
          GeoJSON only re-applies style on updates and ignores `data` changes,
          so per-feature remounting is what makes layers appear/disappear as the
          year moves. */}
      {superpowers.map((f) => (
        <GeoJSON key={`super-${f.properties.name}`} data={toFeatureCollection([f])} style={polygonStyle} />
      ))}
      {kingdoms.map((f) => (
        <GeoJSON key={`kingdom-${f.properties.name}`} data={toFeatureCollection([f])} style={polygonStyle} />
      ))}
      {neighbors.map((f) => (
        <GeoJSON key={`neighbor-${f.properties.name}`} data={toFeatureCollection([f])} style={polygonStyle} />
      ))}

      {/* Routes, campaigns, deportations */}
      {tradeRoutes.map((f) => (
        <GeoJSON
          key={`route-${f.properties.name}`}
          data={toFeatureCollection([f])}
          style={() => ({ color: featureColor(f), weight: 2, opacity: 0.75, dashArray: '2 6' })}
        />
      ))}
      {campaigns.map((f) => (
        <GeoJSON
          key={`campaign-${f.properties.name}`}
          data={toFeatureCollection([f])}
          style={() => lineStyle('campaign', featureColor(f))}
        />
      ))}
      {deportations.map((f) => (
        <GeoJSON
          key={`deportation-${f.properties.name}`}
          data={toFeatureCollection([f])}
          style={() => lineStyle('deportation', featureColor(f))}
        />
      ))}

      {/* Permanent labels for the big shapes, hover tooltips elsewhere */}
      {[...superpowers, ...kingdoms, ...neighbors].map((f) => {
        const isPoly = f.geometry.type === 'Polygon'
        const coords = isPoly
          ? (f.geometry.coordinates as number[][][])[0]
          : (f.geometry.coordinates as number[][])
        const [lat, lng] = centroid(coords)
        return (
          <CircleMarker key={`label-${f.properties.name}`} center={[lat, lng]} radius={0.0001} pane="markerPane">
            <Tooltip permanent direction="center" className={`atlas-label atlas-label-${f.properties.kind}`} opacity={1}>
              <span>{f.properties.label ?? f.properties.name}</span>
            </Tooltip>
          </CircleMarker>
        )
      })}

      {/* Sites */}
      {sites.map((f) => {
        const [lat, lng] = f.geometry.coordinates as number[]
        const kind = f.properties.kind
        const radius = kind === 'capital' ? 8 : kind === 'imperial' ? 9 : kind === 'fortress' ? 6 : 5
        const color = kind === 'imperial' ? '#8a2020' : kind === 'capital' ? '#1f3a5f' : '#3f3a2f'
        return (
          <CircleMarker
            key={`site-${f.properties.name}`}
            center={[lat, lng]}
            radius={radius}
            color={color}
            weight={1.5}
            fillColor="#f4efe4"
            fillOpacity={0.95}
            pane="markerPane"
          >
            <Tooltip direction="top" offset={[0, -4]}>
              <span>{f.properties.name}</span>
            </Tooltip>
            <Popup maxWidth={360} className="atlas-popup">
              <PopupCard feature={f} />
            </Popup>
          </CircleMarker>
        )
      })}

      {focusBox && <FitBounds box={focusBox} focusKey={focusKey} />}
    </MapContainer>
  )
}
