"use client";

import { useEffect, useRef, useState } from "react";

interface GeoResult {
  found: boolean;
  lat?: number;
  lng?: number;
  name?: string;
}

interface Props {
  destination: string | null;
}

export default function DestinationMap({ destination }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<GeoResult | null>(null);
  const [loading, setLoading] = useState(true);
  // Keep a ref to the map instance so we only init once
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (!destination) {
      setLoading(false);
      return;
    }
    fetch(`/api/geocode?q=${encodeURIComponent(destination)}`)
      .then((r) => r.json())
      .then((d: GeoResult) => {
        setGeo(d);
        setLoading(false);
      })
      .catch(() => {
        setGeo({ found: false });
        setLoading(false);
      });
  }, [destination]);

  useEffect(() => {
    if (loading || !geo?.found || !mapRef.current || mapInstance.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstance.current) return;

      // Fix default marker icon path issue with bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const zoom = destination && destination.split(",").length > 1 ? 10 : 5;
      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false }).setView(
        [geo.lat!, geo.lng!],
        zoom
      );

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.marker([geo.lat!, geo.lng!])
        .addTo(map)
        .bindPopup(`<b>Votre guide couvre</b><br/>${destination}`)
        .openPopup();

      mapInstance.current = map;
    });
  }, [geo, loading, destination]);

  if (!destination) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-md flex items-center justify-center" style={{ height: 300, background: "#f0f4f8", border: "1px solid #e2e8f0" }}>
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-2">🌍</div>
          <p className="text-sm">Destination non encore définie</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-md flex items-center justify-center" style={{ height: 300, background: "#f0f4f8" }}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2 animate-pulse">🗺️</div>
          <p className="text-sm">Chargement de la carte…</p>
        </div>
      </div>
    );
  }

  if (!geo?.found) {
    return (
      <div className="rounded-2xl overflow-hidden shadow-md flex items-center justify-center" style={{ height: 300, background: "#f0f4f8", border: "1px solid #e2e8f0" }}>
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-2">🌐</div>
          <p className="text-sm">Destination : {destination}</p>
          <p className="text-xs mt-1">Carte non disponible pour cette destination</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={mapRef}
        className="rounded-2xl overflow-hidden shadow-md"
        style={{ height: 300, border: "1px solid #e2e8f0" }}
      />
    </>
  );
}
