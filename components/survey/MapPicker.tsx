"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, X, Check, Loader2, Search, LocateFixed } from "lucide-react";

// Leaflet CSS is loaded via <link> in the component
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

// Fix default marker icons (Leaflet CDN icons)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

/* ── Sub-component: handles click events on the map ── */
function ClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/* ── Sub-component: flies the map to a new location ── */
function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 1.2 });
  }, [map, lat, lng]);
  return null;
}

export default function MapPicker({
  initialLat,
  initialLng,
  onConfirm,
  onClose,
}: MapPickerProps) {
  // Default to Dubai if no initial coordinates
  const defaultLat = initialLat || 25.2048;
  const defaultLng = initialLng || 55.2708;

  const [pinLat, setPinLat] = useState<number | null>(
    initialLat || null
  );
  const [pinLng, setPinLng] = useState<number | null>(
    initialLng || null
  );
  const [flyTarget, setFlyTarget] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPinLat(lat);
    setPinLng(lng);
    setSearchError("");
  }, []);

  const handleConfirm = () => {
    if (pinLat !== null && pinLng !== null) {
      onConfirm(pinLat, pinLng);
    }
  };

  // Search for a place name and fly to it
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", searchQuery.trim());
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");

      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "RiskLens-SurveyApp/1.0" },
      });

      if (!res.ok) throw new Error("Search failed");

      const results = await res.json();

      if (!results || results.length === 0) {
        setSearchError("Location not found. Try a different search term.");
        return;
      }

      const lat = parseFloat(results[0].lat);
      const lng = parseFloat(results[0].lon);

      setPinLat(lat);
      setPinLng(lng);
      setFlyTarget({ lat, lng });
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  // Use browser geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setSearchError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setPinLat(lat);
        setPinLng(lng);
        setFlyTarget({ lat, lng });
      },
      () => {
        setSearchError(
          "Could not get your location. Please allow location access."
        );
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">
              Pin Location on Map
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="border-b border-gray-100 px-5 py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for a place (e.g. Dubai Production City)"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-40 shrink-0"
            >
              {searching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              Search
            </button>
            <button
              type="button"
              onClick={handleLocateMe}
              title="Use my current location"
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-all hover:bg-gray-50 shrink-0"
            >
              <LocateFixed className="h-3.5 w-3.5" />
            </button>
          </div>
          {searchError && (
            <p className="mt-1.5 text-xs text-amber-600">{searchError}</p>
          )}
        </div>

        {/* Map */}
        <div className="h-[400px] w-full">
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <MapContainer
            center={[defaultLat, defaultLng]}
            zoom={initialLat ? 16 : 11}
            className="h-full w-full"
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onClick={handleMapClick} />
            {flyTarget && (
              <FlyToLocation lat={flyTarget.lat} lng={flyTarget.lng} />
            )}
            {pinLat !== null && pinLng !== null && (
              <Marker position={[pinLat, pinLng]} icon={defaultIcon} />
            )}
          </MapContainer>
        </div>

        {/* Footer with coordinates + confirm */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5">
          <div>
            {pinLat !== null && pinLng !== null ? (
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-indigo-700">
                  📍 {pinLat.toFixed(6)}, {pinLng.toFixed(6)}
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Click on the map to drop a pin
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pinLat === null || pinLng === null}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Check className="h-4 w-4" />
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
