"use client";

import type { SurveyDataV2 } from "@/lib/survey-types";
import { SECTION_META } from "@/lib/survey-types";
import {
  ClipboardCheck,
  Edit3,
  Camera,
  Building2,
  HardHat,
  Flame,
  AlertTriangle,
  Wrench,
} from "lucide-react";

interface ReviewStepProps {
  data: SurveyDataV2;
  onGoToStep: (step: number) => void;
}

function ReviewCard({
  title,
  icon: Icon,
  color,
  stepIndex,
  entries,
  onEdit,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  stepIndex: number;
  entries: { label: string; value: string }[];
  onEdit: () => void;
}) {
  const filledCount = entries.filter((e) => e.value).length;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
            <span className="text-xs text-[var(--muted)]">
              {filledCount}/{entries.length} fields completed
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--primary)] transition-all hover:bg-blue-50"
        >
          <Edit3 className="h-3 w-3" />
          Edit
        </button>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {entries.map(({ label, value }) => (
            <div key={label} className="text-xs">
              <span className="text-[var(--muted)]">{label}:</span>{" "}
              <span className={`font-medium ${value ? "text-[var(--foreground)]" : "text-gray-300 italic"}`}>
                {value || "Not provided"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReviewStep({ data, onGoToStep }: ReviewStepProps) {
  const sectionAEntries = [
    { label: "Insured", value: data.sectionA.insuredName },
    { label: "Address", value: data.sectionA.address },
    { label: "Contact", value: data.sectionA.contactPerson },
    { label: "Phone", value: data.sectionA.contactPhone },
    { label: "Survey Date", value: data.sectionA.dateOfSurvey },
    { label: "Surveyor", value: data.sectionA.surveyorName },
    { label: "Occupancy", value: data.sectionA.occupancy },
    { label: "Area", value: data.sectionA.totalArea ? `${data.sectionA.totalArea} sqm` : "" },
    { label: "Floors", value: data.sectionA.numberOfFloors },
    { label: "Building Age", value: data.sectionA.buildingAge ? `${data.sectionA.buildingAge} yrs` : "" },
  ];

  const sectionBEntries = [
    { label: "Frame", value: data.sectionB.structuralFrame },
    { label: "Walls", value: data.sectionB.externalWalls },
    { label: "Roof", value: data.sectionB.roofStructure },
    { label: "Roof Cover", value: data.sectionB.roofCovering },
    { label: "Floor", value: data.sectionB.floorType },
    { label: "Insulation", value: data.sectionB.insulationType },
    { label: "Condition", value: data.sectionB.buildingCondition },
    { label: "Mezzanine", value: data.sectionB.mezzanineFloors },
  ];

  const sectionCEntries = [
    { label: "Detection", value: data.sectionC.fireDetectionSystem },
    { label: "Detection Type", value: data.sectionC.detectionType },
    { label: "Sprinklers", value: data.sectionC.sprinklerSystem },
    { label: "Sprinkler Type", value: data.sectionC.sprinklerType },
    { label: "Extinguishers", value: data.sectionC.fireExtinguishers },
    { label: "Hose Reels", value: data.sectionC.fireHoseReels },
    { label: "Hydrants", value: data.sectionC.externalHydrants },
    { label: "Emergency Exits", value: data.sectionC.emergencyExits },
    { label: "Fire Brigade", value: data.sectionC.fireBrigade },
    { label: "Hot Work", value: data.sectionC.hotWorkProcedures },
  ];

  const sectionDEntries = [
    { label: "Hazardous Storage", value: data.sectionD.hazardousStorage },
    { label: "Materials", value: data.sectionD.hazardousMaterials },
    { label: "Storage Arrangement", value: data.sectionD.storageArrangement },
    { label: "Electrical Condition", value: data.sectionD.electricalInstallation },
    { label: "Lightning Protection", value: data.sectionD.lightningProtection },
    { label: "Emergency Lighting", value: data.sectionD.emergencyLighting },
    { label: "Smoking Policy", value: data.sectionD.smokingPolicy },
    { label: "Dust Hazard", value: data.sectionD.dustHazard },
  ];

  const sectionEEntries = [
    { label: "Housekeeping", value: data.sectionE.generalHousekeeping },
    { label: "Waste Mgmt", value: data.sectionE.wasteManagement },
    { label: "Maintenance", value: data.sectionE.maintenanceProgram },
    { label: "Security", value: data.sectionE.securityArrangements },
    { label: "Fencing", value: data.sectionE.perimeterFencing },
    { label: "Access Control", value: data.sectionE.accessControl },
    { label: "Flood Risk", value: data.sectionE.floodExposure },
    { label: "Nat Cat", value: data.sectionE.naturalCatExposure },
    { label: "BCP", value: data.sectionE.businessContinuityPlan },
  ];

  const sectionPhotos = SECTION_META.map((s) => ({
    id: s.id,
    count: data.photos.filter((p) => p.section === s.id).length,
  }));
  const generalPhotos = data.photos.filter((p) => p.section === "general").length;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
          <ClipboardCheck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Review & Submit
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Review your inputs before submitting for AI analysis
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <ReviewCard
          title="A: General Information"
          icon={Building2}
          color="bg-blue-100 text-blue-600"
          stepIndex={1}
          entries={sectionAEntries}
          onEdit={() => onGoToStep(1)}
        />
        <ReviewCard
          title="B: Construction Details"
          icon={HardHat}
          color="bg-orange-100 text-orange-600"
          stepIndex={2}
          entries={sectionBEntries}
          onEdit={() => onGoToStep(2)}
        />
        <ReviewCard
          title="C: Fire Protection"
          icon={Flame}
          color="bg-red-100 text-red-600"
          stepIndex={3}
          entries={sectionCEntries}
          onEdit={() => onGoToStep(3)}
        />
        <ReviewCard
          title="D: EHS / Hazards"
          icon={AlertTriangle}
          color="bg-amber-100 text-amber-600"
          stepIndex={4}
          entries={sectionDEntries}
          onEdit={() => onGoToStep(4)}
        />
        <ReviewCard
          title="E: Housekeeping & Maintenance"
          icon={Wrench}
          color="bg-purple-100 text-purple-600"
          stepIndex={5}
          entries={sectionEEntries}
          onEdit={() => onGoToStep(5)}
        />

        {/* Photo summary */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Site Photos</h3>
                <span className="text-xs text-[var(--muted)]">
                  {data.photos.length} photos uploaded
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(0)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--primary)] transition-all hover:bg-blue-50"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </button>
          </div>
          <div className="p-4">
            {data.photos.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {generalPhotos > 0 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                    General: {generalPhotos}
                  </span>
                )}
                {sectionPhotos.map(
                  (sp) =>
                    sp.count > 0 && (
                      <span
                        key={sp.id}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        Section {sp.id}: {sp.count}
                      </span>
                    )
                )}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] italic">
                No photos uploaded. Photos improve analysis accuracy.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
