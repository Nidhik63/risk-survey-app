"use client";

import { useState } from "react";
import type { SectionA } from "@/lib/survey-types";
import TextField from "@/components/fields/TextField";
import SelectField from "@/components/fields/SelectField";
import TextAreaField from "@/components/fields/TextAreaField";
import { Building2, MapPin, Loader2, Droplets, PenLine, Flame } from "lucide-react";

interface FireStationResult {
  name: string;
  distance: number;
  category: string;
}

interface SectionAFormProps {
  data: SectionA;
  onChange: (data: SectionA) => void;
  onFireBrigadeFound?: (station: FireStationResult) => void;
}

const OCCUPANCY_OPTIONS = [
  { value: "Warehouse", label: "Warehouse" },
  { value: "Manufacturing", label: "Manufacturing / Factory" },
  { value: "Manufacturing + Warehouse", label: "Manufacturing + Warehouse" },
  { value: "Manufacturing + Warehouse + Office", label: "Manufacturing + Warehouse + Office" },
  { value: "Office", label: "Office Building" },
  { value: "Retail", label: "Retail / Shopping" },
  { value: "Residential", label: "Residential" },
  { value: "Mixed Use", label: "Mixed Use" },
  { value: "Industrial", label: "Industrial" },
  { value: "Cold Storage", label: "Cold Storage" },
  { value: "Food Processing", label: "Food Processing" },
  { value: "Chemical", label: "Chemical / Petrochemical" },
  { value: "Logistics", label: "Logistics / Distribution" },
  { value: "Other", label: "Other" },
];

export default function SectionAForm({ data, onChange, onFireBrigadeFound }: SectionAFormProps) {
  const update = (field: keyof SectionA, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [showManualCoords, setShowManualCoords] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [fireStationInfo, setFireStationInfo] = useState<string>("");
  const [fireStationNote, setFireStationNote] = useState<string>("");

  // Auto-lookup from address
  const handleGeocode = async () => {
    if (!data.address.trim()) return;
    setGeocoding(true);
    setGeocodeError("");
    setFireStationInfo("");
    setFireStationNote("");

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: data.address }),
      });

      const result = await response.json();

      if (result.error && !result.lat) {
        setGeocodeError(result.error);
        setShowManualCoords(true);
        return;
      }

      setShowManualCoords(false);
      onChange({
        ...data,
        latitude: result.lat || "",
        longitude: result.lng || "",
        floodRiskLevel: result.floodRiskLevel || "",
        floodRiskDetails: result.floodRiskDetails || "",
      });

      // Auto-fill fire brigade in Section C
      if (result.nearestFireStation && onFireBrigadeFound) {
        onFireBrigadeFound(result.nearestFireStation);
        setFireStationInfo(
          `${result.nearestFireStation.name} — ${result.nearestFireStation.distance} km (${result.nearestFireStation.category})`
        );
      } else {
        setFireStationNote(result.fireStationNote || "Fire station lookup did not return results.");
      }
    } catch {
      setGeocodeError("Failed to lookup coordinates. You can enter them manually.");
      setShowManualCoords(true);
    } finally {
      setGeocoding(false);
    }
  };

  // Manual coordinates → flood risk + fire station lookup
  const handleManualCoords = async () => {
    if (!manualLat.trim() || !manualLng.trim()) return;
    setGeocoding(true);
    setGeocodeError("");
    setFireStationInfo("");
    setFireStationNote("");

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: manualLat.trim(), lng: manualLng.trim() }),
      });

      const result = await response.json();

      if (result.error && !result.lat) {
        setGeocodeError(result.error);
        return;
      }

      onChange({
        ...data,
        latitude: result.lat || "",
        longitude: result.lng || "",
        floodRiskLevel: result.floodRiskLevel || "",
        floodRiskDetails: result.floodRiskDetails || "",
      });
      setShowManualCoords(false);

      // Auto-fill fire brigade in Section C
      if (result.nearestFireStation && onFireBrigadeFound) {
        onFireBrigadeFound(result.nearestFireStation);
        setFireStationInfo(
          `${result.nearestFireStation.name} — ${result.nearestFireStation.distance} km (${result.nearestFireStation.category})`
        );
      } else {
        setFireStationNote(result.fireStationNote || "Fire station lookup did not return results.");
      }
    } catch {
      setGeocodeError("Failed to assess flood risk. Please try again.");
    } finally {
      setGeocoding(false);
    }
  };

  const floodColor =
    data.floodRiskLevel === "Low"
      ? "bg-green-50 border-green-200 text-green-700"
      : data.floodRiskLevel === "Moderate"
      ? "bg-yellow-50 border-yellow-200 text-yellow-700"
      : data.floodRiskLevel === "High"
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : data.floodRiskLevel === "Very High"
      ? "bg-red-50 border-red-200 text-red-700"
      : "";

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
          <Building2 className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Section A: General Information
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Property details, occupancy, and contact information
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Insured / Company Name"
            value={data.insuredName}
            onChange={(v) => update("insuredName", v)}
            placeholder="e.g. Acme Corporation"
            required
          />
          <TextField
            label="Survey Date"
            value={data.dateOfSurvey}
            onChange={(v) => update("dateOfSurvey", v)}
            type="date"
            required
          />
        </div>

        {/* Address + Geocode Lookup */}
        <div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <TextField
                label="Property Address"
                value={data.address}
                onChange={(v) => update("address", v)}
                placeholder="Full address of the insured property"
                required
              />
            </div>
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding || !data.address.trim()}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {geocoding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {geocoding ? "Looking up..." : "Get GEO Code"}
            </button>
          </div>

          {/* Error message */}
          {geocodeError && (
            <p className="mt-1.5 text-xs text-amber-600">{geocodeError}</p>
          )}

          {/* Manual coordinate entry — shown when auto-lookup fails or user clicks link */}
          {!data.latitude && (
            <div className="mt-2">
              {!showManualCoords ? (
                <button
                  type="button"
                  onClick={() => setShowManualCoords(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <PenLine className="h-3 w-3" />
                  Enter coordinates manually
                </button>
              ) : (
                <div className="mt-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <p className="text-xs font-bold text-indigo-700 mb-3">
                    Enter GPS Coordinates
                  </p>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        placeholder="e.g. 25.031417"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        placeholder="e.g. 55.184110"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleManualCoords}
                      disabled={geocoding || !manualLat.trim() || !manualLng.trim()}
                      className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {geocoding ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Droplets className="h-3.5 w-3.5" />
                      )}
                      {geocoding ? "Checking..." : "Get Flood Risk"}
                    </button>
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400">
                    Tip: You can get coordinates from Google Maps by right-clicking on the location
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Coordinates + Flood Risk badges — shown when we have coordinates */}
          {data.latitude && data.longitude && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2">
                <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-700">
                  {parseFloat(data.latitude).toFixed(6)},{" "}
                  {parseFloat(data.longitude).toFixed(6)}
                </span>
              </div>

              {data.floodRiskLevel && (
                <div
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${floodColor}`}
                >
                  <Droplets className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">
                    Flood Risk: {data.floodRiskLevel}
                  </span>
                </div>
              )}

              {/* Fire station badge — shows when auto-detected */}
              {fireStationInfo && (
                <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-orange-700">
                    🚒 {fireStationInfo}
                  </span>
                </div>
              )}

              {/* Reset button to re-enter coordinates */}
              <button
                type="button"
                onClick={() => {
                  onChange({
                    ...data,
                    latitude: "",
                    longitude: "",
                    floodRiskLevel: "",
                    floodRiskDetails: "",
                  });
                  setShowManualCoords(false);
                  setManualLat("");
                  setManualLng("");
                  setFireStationInfo("");
                  setFireStationNote("");
                }}
                className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors underline"
              >
                Reset
              </button>
            </div>
          )}

          {data.floodRiskDetails && (
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              {data.floodRiskDetails}
            </p>
          )}

          {/* Fire station note — shows if lookup failed or found nothing */}
          {fireStationNote && !fireStationInfo && data.latitude && (
            <p className="mt-1 text-xs text-amber-600">
              ⚠ {fireStationNote} You can select the nearest fire brigade manually in Section C.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <TextField
            label="Contact Person"
            value={data.contactPerson}
            onChange={(v) => update("contactPerson", v)}
            placeholder="Site contact name"
          />
          <TextField
            label="Contact Phone"
            value={data.contactPhone}
            onChange={(v) => update("contactPhone", v)}
            placeholder="+971 50 123 4567"
            type="tel"
          />
        </div>

        <TextField
          label="Surveyor Name"
          value={data.surveyorName}
          onChange={(v) => update("surveyorName", v)}
          placeholder="Your name"
          required
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <SelectField
            label="Occupancy Type"
            value={data.occupancy}
            onChange={(v) => update("occupancy", v)}
            options={OCCUPANCY_OPTIONS}
            required
          />
          <TextField
            label="Occupancy Details"
            value={data.occupancyDetails}
            onChange={(v) => update("occupancyDetails", v)}
            placeholder="Describe what is stored/manufactured"
          />
        </div>

        {data.occupancy === "Other" && (
          <TextField
            label="Please specify occupancy type"
            value={data.occupancyOther || ""}
            onChange={(v) => update("occupancyOther" as keyof SectionA, v)}
            placeholder="e.g. Data Center, Hospital, School, etc."
            required
          />
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="Building Age (Years)"
            value={data.buildingAge}
            onChange={(v) => update("buildingAge", v)}
            placeholder="e.g. 15"
            type="number"
          />
          <TextField
            label="Plot Area (sq m)"
            value={data.plotArea}
            onChange={(v) => update("plotArea", v)}
            placeholder="e.g. 10000"
            type="number"
          />
          <TextField
            label="Constructed Area (sq m)"
            value={data.constructedArea}
            onChange={(v) => update("constructedArea", v)}
            placeholder="e.g. 5000"
            type="number"
          />
          <TextField
            label="Number of Floors"
            value={data.numberOfFloors}
            onChange={(v) => update("numberOfFloors", v)}
            placeholder="e.g. 2"
            type="number"
          />
        </div>

        <TextField
          label="Number of Basements"
          value={data.numberOfBasements}
          onChange={(v) => update("numberOfBasements", v)}
          placeholder="e.g. 0"
          type="number"
        />

        <TextAreaField
          label="Surrounding Exposures"
          value={data.surroundingExposures}
          onChange={(v) => update("surroundingExposures", v)}
          placeholder="Describe neighboring buildings, roads, hazards, open land, etc."
          helper="Note any nearby fire hazards, chemical plants, fuel stations, or flood-prone areas"
        />
      </div>
    </div>
  );
}
