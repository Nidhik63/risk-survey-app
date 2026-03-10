import { NextRequest, NextResponse } from "next/server";

/* ── Geocode address → lat/lng, then assess flood risk ── */

interface GeocodingResult {
  lat: string;
  lng: string;
  displayName: string;
}

// Geocode via OpenStreetMap Nominatim (free, no API key)
async function geocodeQuery(query: string): Promise<GeocodingResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": "RiskLens-SurveyApp/1.0" },
  });

  if (!response.ok) return null;

  const results = await response.json();
  if (!results || results.length === 0) return null;

  return {
    lat: results[0].lat,
    lng: results[0].lon,
    displayName: results[0].display_name,
  };
}

// Exact address geocoding only — no fallback to avoid inaccurate coordinates
async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  return await geocodeQuery(address);
}

// Find nearest fire station via Overpass API (OpenStreetMap, free, no API key)
// Uses multiple endpoints as fallback since the public server can be unreliable
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function findNearestFireStation(
  lat: string,
  lng: string
): Promise<{ name: string; distance: number; category: string } | null> {
  // Search within 50km radius for fire stations (nodes, ways, and relations)
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="fire_station"](around:50000,${lat},${lng});
      way["amenity"="fire_station"](around:50000,${lat},${lng});
      relation["amenity"="fire_station"](around:50000,${lat},${lng});
    );
    out body center 10;
  `;

  // Try each Overpass endpoint until one succeeds
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`Overpass ${endpoint} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      const elements = data?.elements || [];

      if (elements.length === 0) {
        console.log(`Overpass: No fire stations found within 50km of ${lat},${lng}`);
        return null;
      }

      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      // Calculate distance to each station and find the closest
      let closest: { name: string; distance: number } | null = null;

      for (const el of elements) {
        const sLat = el.lat ?? el.center?.lat;
        const sLng = el.lon ?? el.center?.lon;
        if (!sLat || !sLng) continue;

        // Haversine distance in km
        const R = 6371;
        const dLat = ((sLat - latNum) * Math.PI) / 180;
        const dLon = ((sLng - lngNum) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((latNum * Math.PI) / 180) *
            Math.cos((sLat * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const name =
          el.tags?.name ||
          el.tags?.["name:en"] ||
          el.tags?.operator ||
          "Fire Station";

        if (!closest || dist < closest.distance) {
          closest = { name, distance: dist };
        }
      }

      if (!closest) return null;

      // Map distance to the dropdown category
      let category: string;
      if (closest.distance <= 5) {
        category = "Public - Within 5 km";
      } else if (closest.distance <= 15) {
        category = "Public - 5-15 km";
      } else {
        category = "Public - Over 15 km";
      }

      console.log(`Fire station found: ${closest.name} at ${closest.distance}km`);

      return {
        name: closest.name,
        distance: Math.round(closest.distance * 10) / 10,
        category,
      };
    } catch (err) {
      console.warn(`Overpass ${endpoint} failed:`, err);
      continue;
    }
  }

  console.error("All Overpass endpoints failed for fire station lookup");
  return null;
}

// Assess flood risk via Open-Meteo Flood API (free, no API key)
async function assessFloodRisk(
  lat: string,
  lng: string
): Promise<{ riskLevel: string; details: string }> {
  try {
    const url = new URL("https://flood-api.open-meteo.com/v1/flood");
    url.searchParams.set("latitude", lat);
    url.searchParams.set("longitude", lng);
    url.searchParams.set("daily", "river_discharge");
    url.searchParams.set("forecast_days", "7");

    const response = await fetch(url.toString());

    if (!response.ok) {
      return {
        riskLevel: "",
        details: "Flood data unavailable for this location.",
      };
    }

    const data = await response.json();
    const discharges: number[] = data?.daily?.river_discharge || [];

    const validDischarges = discharges.filter(
      (d) => d !== null && d !== undefined
    );

    if (validDischarges.length === 0) {
      return {
        riskLevel: "Low",
        details:
          "No significant river system detected near this location. Flood risk from rivers is low.",
      };
    }

    const maxDischarge = Math.max(...validDischarges);

    if (maxDischarge < 100) {
      return {
        riskLevel: "Low",
        details: `Low flood risk. Peak river discharge: ${maxDischarge.toFixed(1)} m\u00B3/s. No significant flooding expected.`,
      };
    } else if (maxDischarge < 500) {
      return {
        riskLevel: "Moderate",
        details: `Moderate flood risk. Peak river discharge: ${maxDischarge.toFixed(1)} m\u00B3/s. Minor flooding possible in low-lying areas near rivers.`,
      };
    } else if (maxDischarge < 1500) {
      return {
        riskLevel: "High",
        details: `High flood risk. Peak river discharge: ${maxDischarge.toFixed(1)} m\u00B3/s. Significant flooding possible. Flood mitigation review recommended.`,
      };
    } else {
      return {
        riskLevel: "Very High",
        details: `Very high flood risk. Peak river discharge: ${maxDischarge.toFixed(1)} m\u00B3/s. Severe flooding likely. Immediate flood risk mitigation required.`,
      };
    }
  } catch {
    return {
      riskLevel: "",
      details: "Could not assess flood risk. Service temporarily unavailable.",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, lat, lng } = body as {
      address?: string;
      lat?: string;
      lng?: string;
    };

    // Mode 1: Manual coordinates provided — just assess flood risk + fire station
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
        return NextResponse.json({
          error: "Invalid coordinates. Latitude must be -90 to 90, longitude -180 to 180.",
          lat: "",
          lng: "",
          floodRiskLevel: "",
          floodRiskDetails: "",
        });
      }

      console.log(`Geocode: Manual coords ${lat}, ${lng} — looking up flood + fire station...`);

      const [flood, fireStation] = await Promise.all([
        assessFloodRisk(lat, lng),
        findNearestFireStation(lat, lng),
      ]);

      console.log(`Geocode result: flood=${flood.riskLevel}, fireStation=${fireStation ? fireStation.name : "none found"}`);

      return NextResponse.json({
        lat,
        lng,
        displayName: "Manual coordinates",
        floodRiskLevel: flood.riskLevel,
        floodRiskDetails: flood.details,
        nearestFireStation: fireStation,
        fireStationNote: fireStation ? null : "No fire station found within 50 km in OpenStreetMap data.",
      });
    }

    // Mode 2: Geocode from address
    if (!address || !address.trim()) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Exact address geocoding only — no fallback
    const geoResult = await geocodeAddress(address.trim());

    if (!geoResult) {
      return NextResponse.json({
        error:
          "Could not find coordinates for this address. You can enter coordinates manually below.",
        lat: "",
        lng: "",
        floodRiskLevel: "",
        floodRiskDetails: "",
      });
    }

    console.log(`Geocode: Address → ${geoResult.lat}, ${geoResult.lng} — looking up flood + fire station...`);

    const [flood, fireStation] = await Promise.all([
      assessFloodRisk(geoResult.lat, geoResult.lng),
      findNearestFireStation(geoResult.lat, geoResult.lng),
    ]);

    console.log(`Geocode result: flood=${flood.riskLevel}, fireStation=${fireStation ? fireStation.name : "none found"}`);

    return NextResponse.json({
      lat: geoResult.lat,
      lng: geoResult.lng,
      displayName: geoResult.displayName,
      floodRiskLevel: flood.riskLevel,
      floodRiskDetails: flood.details,
      nearestFireStation: fireStation,
      fireStationNote: fireStation ? null : "No fire station found within 50 km in OpenStreetMap data.",
    });
  } catch (error) {
    console.error("Geocode error:", error);
    return NextResponse.json(
      { error: "Geocoding failed. Please try again." },
      { status: 500 }
    );
  }
}
