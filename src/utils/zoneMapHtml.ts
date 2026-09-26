// The map-based corner picker's page (components/ZoneMapPicker.tsx): the
// website's gfOpenMapPicker (js/geofence-ui.js) as a self-contained HTML
// document for a WebView. MapLibre and the OpenFreeMap positron style come
// from the same URLs the website loads (a network is needed; offline, the
// picker says to type corners instead). Tap adds a corner, drag moves one,
// corners connect in the order placed, 3–8 of them.
//
// The page talks to the app with window.ReactNativeWebView.postMessage
// (JSON): {type:'ready'}, {type:'count', n}, {type:'corners', corners:
// [[lat, lon], ...]} (on Use), {type:'view', center:[lon, lat], zoom} (on
// every move, so the app can remember where the operator was). The app
// drives Undo / Clear / Use by injecting window.__gf.undo() / clear() /
// use().
import type { LatLon } from './geofence';
import { jsStringLiteral } from './liveMap';

export const MAPLIBRE_JS_URL = 'https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.js';
export const MAPLIBRE_CSS_URL = 'https://unpkg.com/maplibre-gl@4.5.0/dist/maplibre-gl.css';
/** Carto ended keyless basemap access; OpenFreeMap's positron is the
 *  keyless equivalent of the old light_all tiles. */
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

export type MapView = { center: [number, number]; zoom: number };

/** The remembered view, AsyncStorage (the website's localStorage
 *  'gf_map_view'). */
export const MAP_VIEW_KEY = 'gf_map_view';

/** A message the page posts, or null for anything else. */
export function parseZoneMapMessage(
  data: string | null | undefined,
):
  | { type: 'ready' }
  | { type: 'count'; n: number }
  | { type: 'corners'; corners: LatLon[] }
  | { type: 'view'; view: MapView }
  | null {
  try {
    const m = JSON.parse(data ?? '');
    if (!m || typeof m !== 'object') return null;
    if (m.type === 'ready') return { type: 'ready' };
    if (m.type === 'count' && Number.isFinite(m.n)) return { type: 'count', n: Number(m.n) };
    if (m.type === 'corners' && Array.isArray(m.corners)) {
      const corners: LatLon[] = [];
      for (const c of m.corners) {
        if (!Array.isArray(c) || c.length !== 2) return null;
        const lat = Number(c[0]);
        const lon = Number(c[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
        corners.push([lat, lon]);
      }
      return { type: 'corners', corners };
    }
    if (
      m.type === 'view' &&
      Array.isArray(m.center) &&
      m.center.length === 2 &&
      m.center.every((x: unknown) => Number.isFinite(x)) &&
      Number.isFinite(m.zoom)
    ) {
      return { type: 'view', view: { center: [Number(m.center[0]), Number(m.center[1])], zoom: Number(m.zoom) } };
    }
  } catch (_) {
    /* not ours */
  }
  return null;
}

/** Where the map opens: on the seeded corners when there are any, else the
 *  remembered view, else the world — the website's rule. */
export function initialView(seed: LatLon[], remembered: MapView | null): MapView {
  if (seed.length) {
    return {
      center: [seed.reduce((a, p) => a + p[1], 0) / seed.length, seed.reduce((a, p) => a + p[0], 0) / seed.length],
      zoom: 14,
    };
  }
  if (remembered) return remembered;
  return { center: [0, 20], zoom: 2 };
}

/** The page. `seed` are corners already in the form (drawn and fitted). */
export function buildZoneMapHtml(seed: LatLon[], remembered: MapView | null): string {
  const view = initialView(seed, remembered);
  const seedJson = jsStringLiteral(JSON.stringify(seed));
  const viewJson = jsStringLiteral(JSON.stringify(view));
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${MAPLIBRE_CSS_URL}">
<style>
  html, body { margin: 0; padding: 0; height: 100%; background: #f3f4f6; }
  #map { position: absolute; inset: 0; }
  #err { display: none; position: absolute; inset: 0; padding: 24px; font: 15px -apple-system, sans-serif;
         color: #444; background: #fff; align-items: center; justify-content: center; text-align: center; }
</style></head>
<body>
<div id="map"></div>
<div id="err">Could not load the map (offline?). Type corners as lat, lon lines instead.</div>
<script>
(function () {
  var post = function (m) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(m)); };
  var fail = function () { document.getElementById('err').style.display = 'flex'; post({ type: 'error' }); };
  var seed = JSON.parse(${seedJson});
  var view = JSON.parse(${viewJson});
  var s = document.createElement('script');
  s.src = ${jsStringLiteral(MAPLIBRE_JS_URL)};
  s.onerror = fail;
  s.onload = function () {
    var map;
    try {
      map = new maplibregl.Map({ container: 'map', style: ${jsStringLiteral(MAP_STYLE_URL)},
                                 center: view.center, zoom: view.zoom, attributionControl: false });
    } catch (e) { fail(); return; }
    map.on('error', function (e) { if (e && e.error && /style/i.test(String(e.error.message || ''))) fail(); });
    var markers = [];
    function polyGeojson() {
      var pts = markers.map(function (m) { var c = m.getLngLat(); return [c.lng, c.lat]; });
      if (pts.length < 2) return { type: 'FeatureCollection', features: [] };
      var ring = pts.length >= 3 ? pts.concat([pts[0]]) : pts;
      return { type: 'Feature', geometry: pts.length >= 3 ? { type: 'Polygon', coordinates: [ring] }
                                                          : { type: 'LineString', coordinates: ring } };
    }
    function redraw() {
      var src = map.getSource('gf-poly');
      if (src) src.setData(polyGeojson());
      post({ type: 'count', n: markers.length });
    }
    function addMarker(lngLat) {
      if (markers.length >= 8) return;
      var el = document.createElement('div');
      el.style.cssText = 'width:18px;height:18px;border-radius:50%;background:#3b82f6;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);';
      var mk = new maplibregl.Marker({ element: el, draggable: true }).setLngLat(lngLat).addTo(map);
      mk.on('drag', redraw); mk.on('dragend', redraw);
      markers.push(mk);
      redraw();
    }
    /* Layers need the style; markers are DOM overlays and don't. MapLibre's
       readiness events are unreliable when a tile request hangs, so attempt
       on every style event and on a bounded timer. */
    var layersAdded = false;
    function ensureLayers() {
      if (layersAdded) return;
      try {
        map.addSource('gf-poly', { type: 'geojson', data: polyGeojson() });
        map.addLayer({ id: 'gf-poly-fill', type: 'fill', source: 'gf-poly', paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.15 } });
        map.addLayer({ id: 'gf-poly-line', type: 'line', source: 'gf-poly', paint: { 'line-color': '#3b82f6', 'line-width': 2 } });
        layersAdded = true;
        redraw();
      } catch (e) { /* style not ready yet */ }
    }
    map.on('load', ensureLayers);
    map.on('styledata', ensureLayers);
    var tries = 0;
    var timer = setInterval(function () { ensureLayers(); if (layersAdded || ++tries > 40) clearInterval(timer); }, 300);
    map.on('click', function (e) { addMarker(e.lngLat); });
    map.on('moveend', function () {
      var c = map.getCenter();
      post({ type: 'view', center: [c.lng, c.lat], zoom: map.getZoom() });
    });
    seed.forEach(function (p) { addMarker([p[1], p[0]]); });
    if (seed.length >= 3) {
      var lons = seed.map(function (p) { return p[1]; }), lats = seed.map(function (p) { return p[0]; });
      map.fitBounds([[Math.min.apply(null, lons), Math.min.apply(null, lats)],
                     [Math.max.apply(null, lons), Math.max.apply(null, lats)]], { padding: 60, maxZoom: 16 });
    }
    window.__gf = {
      undo: function () { var mk = markers.pop(); if (mk) mk.remove(); redraw(); },
      clear: function () { while (markers.length) markers.pop().remove(); redraw(); },
      use: function () {
        post({ type: 'corners', corners: markers.map(function (m) { var c = m.getLngLat(); return [c.lat, c.lng]; }) });
      }
    };
    post({ type: 'ready' });
    redraw();
  };
  document.head.appendChild(s);
})();
</script>
</body></html>`;
}
