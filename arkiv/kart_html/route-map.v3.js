/* global L, window, document, location */
/**
 * Forutsetter at route-globals.js har:
 *   window.ROUTE_LEGS: Array<{ fromName, toName, distanceMeters, path:number[][] }>
 * hvor path = [[lat, lng], ...] som følger vei (tett punktrekke).
 *
 * Gjør:
 *  1) Tegner hele ruta (lys grå). Aktiv etappe i gult.
 *  2) Zoomer inn til aktiv etappe (styrt via URL-hash ?leg=<index> eller postMessage).
 *  3) Ved trykk på en etappe: viser distanse (km) i popup.
 *  4) Viser blå markør for “her er vi” (midpoint i aktiv etappe som default),
 *     men kan settes nøyaktig via postMessage {type:'setProgress', leg: i, pointIdx: j}.
 */

(function () {
  const legs = Array.isArray(window.ROUTE_LEGS) ? window.ROUTE_LEGS : [];
  if (!legs.length) {
    console.error("Ingen ROUTE_LEGS funnet.");
    return;
  }

  // Tile layer (kan byttes til lokal/offline om du vil)
  const map = L.map("map", {
    zoomControl: true,
    preferCanvas: true
  });

  const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OSM",
    maxZoom: 19
  }).addTo(map);

  /** Utils **/
  const km = m => (m / 1000).toFixed(1);
  const toLatLngs = (path) => path.map(p => L.latLng(p[0], p[1]));

  // Tegn alle etapper i lys grå, legg klikk-popup med distanse
  const legLayers = legs.map((leg, idx) => {
    const latlngs = toLatLngs(leg.path || []);
    const pl = L.polyline(latlngs, {
      color: "#888",
      weight: 4,
      opacity: 0.85,
      interactive: true
    }).addTo(map);

    pl.on("click", () => {
      const name = `${leg.fromName} → ${leg.toName}`;
      pl.bindPopup(`<b>${name}</b><br/>Distanse: ${km(leg.distanceMeters)} km`).openPopup();
      setActiveLeg(idx, { pan: true });
    });

    return pl;
  });

  // Finn bounds for hele ruta og for en leg
  const fullBounds = L.latLngBounds([]);
  legLayers.forEach(pl => fullBounds.extend(pl.getBounds()));
  map.fitBounds(fullBounds.pad(0.05));

  // Aktiv etappe (fremheves i gult)
  let activeIdx = 0;
  function setActiveLeg(idx, opts = {}) {
    if (idx < 0 || idx >= legLayers.length) return;
    // Reset styles
    legLayers.forEach(pl => pl.setStyle({ color: "#888", weight: 4, opacity: 0.85 }).removeClass && pl.removeClass("leg-active"));
    // Aktiv stil
    const pl = legLayers[idx];
    pl.setStyle({ color: "#ffd400", weight: 6, opacity: 1.0 });
    pl.addClass && pl.addClass("leg-active");

    activeIdx = idx;

    if (opts.pan) {
      const b = pl.getBounds();
      map.fitBounds(b.pad(0.15)); // <- ZOOM INN mot aktiv etappe
    }

    // Flytt “her er vi” markør til midtpunkt som default
    const mid = midpointOfPolyline(pl);
    if (mid) setHereMarker(mid);
  }

  // Blå “her er vi” markør
  const here = L.marker([0,0], {
    // Standard blå Leaflet marker
  });
  let hereAdded = false;
  function setHereMarker(latlng) {
    if (!latlng) return;
    here.setLatLng(latlng);
    if (!hereAdded) { here.addTo(map); hereAdded = true; }
  }

  function midpointOfPolyline(pl) {
    const latlngs = pl.getLatLngs();
    if (!latlngs || latlngs.length === 0) return null;
    return latlngs[Math.floor(latlngs.length / 2)];
  }

  // Startvalg via URL-hash: #leg=12  (eller #leg=mandal-kr.sand hvis du vil mappe navn → index)
  (function initFromHash() {
    const m = location.hash.match(/leg=(\d+)/);
    const i = m ? parseInt(m[1], 10) : 0;
    setActiveLeg(isFinite(i) ? i : 0, { pan: true });
  })();

  // API for appen (WebView) via postMessage:
  // window.postMessage({ type:'setActiveLeg', leg: i }, '*')
  // window.postMessage({ type:'setProgress', leg: i, pointIdx: j }, '*')
  window.addEventListener("message", (ev) => {
    try {
      const msg = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "setActiveLeg" && Number.isInteger(msg.leg)) {
        setActiveLeg(msg.leg, { pan: true });
      }
      if (msg.type === "setProgress" && Number.isInteger(msg.leg) && Number.isInteger(msg.pointIdx)) {
        const leg = legs[msg.leg];
        if (leg && leg.path && leg.path[msg.pointIdx]) {
          const [lat, lng] = leg.path[msg.pointIdx];
          setHereMarker(L.latLng(lat, lng));
          // valgfritt: pan
          map.panTo([lat, lng]);
        }
      }
    } catch (_) { /* ignorer */ }
  });

  // Signal til appen om at kartet er klart
  try { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type:"routeMapReady" })); } catch(_) {}
})();
