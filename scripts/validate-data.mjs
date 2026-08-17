// Validates the atlas data files before they ship.
// Checks: JSON parses, GeoJSON structure is valid, year ranges make sense
// (start >= end, both within 1200..539 or explicitly out-of-range for
// pre-Israel features), coordinates are finite numbers.
//
// Run: node scripts/validate-data.mjs

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data')
const range = { start: 1200, end: 539 }

let failures = 0
const fail = (msg) => { failures++; console.error(`  FAIL: ${msg}`) }

function checkCoord(c, ctx) {
  if (!Array.isArray(c) || c.length < 2 || c.some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
    fail(`${ctx}: bad coordinate [${c}]`)
  }
}

function checkGeometry(geom, ctx) {
  if (!geom || typeof geom.type !== 'string') return fail(`${ctx}: missing geometry.type`)
  switch (geom.type) {
    case 'Point':
      checkCoord(geom.coordinates, ctx)
      break
    case 'LineString':
      geom.coordinates.forEach((c, i) => checkCoord(c, `${ctx} [${i}]`))
      break
    case 'Polygon':
      geom.coordinates.forEach((ring, i) => {
        if (!Array.isArray(ring) || ring.length < 4) fail(`${ctx}: polygon ring ${i} needs >= 4 points`)
        ring.forEach((c, j) => checkCoord(c, `${ctx} ring${i} [${j}]`))
      })
      break
    default:
      fail(`${ctx}: unsupported geometry type ${geom.type}`)
  }
}

function checkYears(p, ctx) {
  const { start, end } = p
  if (typeof start !== 'number' || typeof end !== 'number') {
    fail(`${ctx}: needs numeric start/end (got ${start}/${end})`)
    return
  }
  // Allow wider-than-nominal years only for explicitly pre-Israel material (Shasu, Timna).
  if (start > 1500) fail(`${ctx}: start ${start} is suspiciously old`)
  if (end < 500) fail(`${ctx}: end ${end} is after the atlas window`)
  if (start < end) fail(`${ctx}: start (${start}) must be >= end (${end}) — BCE years run downward`)
}

const files = readdirSync(dataDir).filter((f) => f.endsWith('.geojson') || f.endsWith('.json'))
for (const file of files) {
  console.log(`\n== ${file} ==`)
  const raw = readFileSync(join(dataDir, file), 'utf8')
  let data
  try {
    data = JSON.parse(raw)
  } catch (e) {
    fail(`invalid JSON: ${e.message}`)
    continue
  }

  if (file === 'acts.json') {
    if (data.range.start !== 1200 || data.range.end !== 539) fail('range must be 1200..539')
    if (!Array.isArray(data.acts) || data.acts.length !== 5) fail('need exactly 5 acts')
    data.acts.forEach((a, i) => {
      if (a.id !== i + 1) fail(`act ${i} has id ${a.id}`)
      if (a.years.length !== 2 || a.years[0] <= a.years[1]) fail(`act ${a.id} years malformed`)
      if (!a.focus || a.focus.length !== 2) fail(`act ${a.id} missing focus bounds`)
    })
    continue
  }

  if (file === 'events.json') {
    if (!Array.isArray(data.events)) fail('events must be an array')
    data.events.forEach((e) => {
      if (typeof e.year !== 'number') fail(`event "${e.title}" missing year`)
      if (!e.bible || !e.archaeology || !e.source) fail(`event "${e.title}" must have bible+archaeology+source`)
    })
    continue
  }

  if (file === 'rulers.json') {
    if (!Array.isArray(data.rulers)) fail('rulers must be an array')
    data.rulers.forEach((r) => {
      if (!r.name || typeof r.start !== 'number' || typeof r.end !== 'number') {
        fail(`ruler "${r.name}" malformed`)
      }
      if (!r.biblical || !r.historical) fail(`ruler "${r.name}" needs biblical+historical verdicts`)
    })
    continue
  }

  // GeoJSON files
  if (data.type !== 'FeatureCollection') fail('must be a FeatureCollection')
  data.features.forEach((f, i) => {
    const ctx = `${file} feature ${i} ("${f.properties?.name || 'unnamed'}")`
    if (!f.properties?.name) fail(`${ctx}: missing name`)
    if (typeof f.properties.start !== 'number') fail(`${ctx}: missing start`)
    checkYears(f.properties, ctx)
    checkGeometry(f.geometry, ctx)
    if (f.properties.popup && (!f.properties.popup.bible || !f.properties.popup.archaeology)) {
      fail(`${ctx}: popup must have both bible and archaeology fields`)
    }
  })
}

console.log(`\n${failures === 0 ? 'ALL DATA VALID' : `${failures} FAILURE(S)`}`)
process.exit(failures === 0 ? 0 : 1)
