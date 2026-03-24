"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import {
  Shield,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FilePlus2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import SurveyWizard from "@/components/survey/SurveyWizard";
import RIReport from "@/components/report/RIReport";
import SurveyorReport from "@/components/SurveyorReport";
import PinDialog, { type AnalystIdentity } from "@/components/PinDialog";
import { RoleProvider } from "@/lib/role-context";
import type { UserRole } from "@/lib/role-context";
import type { SurveyDataV2, RIReportAnalysis, SurveyorIdentity, TaggedPhoto } from "@/lib/survey-types";
import { PHOTO_CATEGORY_GROUPS } from "@/lib/survey-types";
import SurveyorIdentityScreen, { loadSurveyorIdentity } from "@/components/SurveyorIdentityScreen";

type AppState = "form" | "analyzing" | "report" | "surveyorComplete";

const STORAGE_KEY = "risklens-v2-survey";

const ANALYSIS_STEPS = [
  "Uploading survey data & images...",
  "Analyzing general property information...",
  "Evaluating construction & structural details...",
  "Assessing fire protection systems...",
  "Reviewing EHS & hazard information...",
  "Inspecting housekeeping & maintenance...",
  "Cross-referencing photos with checklist...",
  "Generating compliance assessment...",
  "Building professional RI report...",
  "Finalizing recommendations...",
];

export default function SurveyPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SurveyPage />
    </Suspense>
  );
}

function SurveyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role: UserRole = searchParams.get("role") === "analyst" ? "analyst" : "surveyor";

  const [appState, setAppState] = useState<AppState>("form");
  const [surveyData, setSurveyData] = useState<SurveyDataV2 | null>(null);
  const [analysis, setAnalysis] = useState<RIReportAnalysis | null>(null);
  const [error, setError] = useState<string>("");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [wizardKey, setWizardKey] = useState(0);

  // PIN verification state (analyst only)
  const [pinVerified, setPinVerified] = useState(false);
  const [pinChecked, setPinChecked] = useState(false);

  // Surveyor identity state (surveyor only)
  const [surveyorIdentity, setSurveyorIdentity] = useState<SurveyorIdentity | null>(null);
  const [identityChecked, setIdentityChecked] = useState(false);

  // Analyst identity state
  const [analystIdentity, setAnalystIdentity] = useState<AnalystIdentity | null>(null);

  // Import file ref
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (role === "analyst") {
      const verified = sessionStorage.getItem("ntru-analyst-verified") === "true";
      setPinVerified(verified);
      // Restore analyst identity from sessionStorage if already logged in
      if (verified) {
        const savedName = sessionStorage.getItem("ntru-analyst-name");
        const savedDate = sessionStorage.getItem("ntru-analyst-date");
        if (savedName) {
          setAnalystIdentity({ analystName: savedName, loginDate: savedDate || new Date().toISOString().split("T")[0] });
        }
      }
      setIdentityChecked(true); // Analysts skip surveyor identity screen
    } else {
      setPinVerified(true); // Surveyors don't need PIN
      // Check if surveyor already has saved identity
      const saved = loadSurveyorIdentity();
      if (saved) {
        setSurveyorIdentity(saved);
      }
      setIdentityChecked(true);
    }
    setPinChecked(true);
  }, [role]);

  // --- Surveyor submit: show completion page ---
  const handleSurveyorSubmit = (data: SurveyDataV2) => {
    // Attach surveyor identity metadata (not shown in reports)
    if (surveyorIdentity) {
      data._meta = surveyorIdentity;
    }
    setSurveyData(data);

    // Clear localStorage
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

    setAppState("surveyorComplete");
  };

  // --- Compress a single photo for API submission ---
  const compressPhoto = (dataUrl: string, maxW: number, quality: number): Promise<string> =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxW) { height = (height * maxW) / width; width = maxW; }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(dataUrl); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });

  // --- Smart photo selection: one photo per category first, then extras ---
  const selectPhotosForApi = (photos: TaggedPhoto[], maxTotal: number): TaggedPhoto[] => {
    // Get all category codes
    const allCodes = PHOTO_CATEGORY_GROUPS.flatMap((g) =>
      g.categories.map((c) => c.code)
    );

    // Pick one photo per category (best coverage for AI analysis)
    const picked: TaggedPhoto[] = [];
    const remaining: TaggedPhoto[] = [];

    for (const code of allCodes) {
      const catPhotos = photos.filter((p) => p.caption.startsWith(`[${code}]`));
      if (catPhotos.length > 0) {
        picked.push(catPhotos[0]);
        remaining.push(...catPhotos.slice(1));
      }
    }

    // Add general photos to remaining pool
    const general = photos.filter(
      (p) => !allCodes.some((code) => p.caption.startsWith(`[${code}]`))
    );
    remaining.push(...general);

    // Fill up to maxTotal with remaining photos
    const result = [...picked];
    for (const photo of remaining) {
      if (result.length >= maxTotal) break;
      result.push(photo);
    }

    return result.slice(0, maxTotal);
  };

  // --- Build API payload that fits within Vercel 4.5MB body limit ---
  const buildApiPayload = async (data: SurveyDataV2) => {
    const VERCEL_LIMIT = 4_000_000; // 4MB safety margin (actual limit ~4.5MB)

    // Progressively more aggressive compression settings
    const LEVELS = [
      { maxPhotos: 18, maxW: 640, quality: 0.40 },
      { maxPhotos: 14, maxW: 512, quality: 0.35 },
      { maxPhotos: 10, maxW: 480, quality: 0.30 },
      { maxPhotos: 8, maxW: 400, quality: 0.25 },
      { maxPhotos: 6, maxW: 320, quality: 0.20 },
    ];

    for (const level of LEVELS) {
      // Smart selection: one per category first, then extras
      const selected = selectPhotosForApi(data.photos, level.maxPhotos);
      const compressed = await Promise.all(
        selected.map(async (p) => ({
          ...p,
          dataUrl: await compressPhoto(p.dataUrl, level.maxW, level.quality),
        }))
      );

      const apiData: SurveyDataV2 = { ...data, photos: compressed };
      const payload = JSON.stringify({ version: 2, surveyData: apiData });

      if (payload.length < VERCEL_LIMIT) {
        return payload;
      }
    }

    // Last resort: send with no photos at all (AI still uses checklist data)
    const apiData: SurveyDataV2 = { ...data, photos: [] };
    return JSON.stringify({ version: 2, surveyData: apiData });
  };

  // --- Analyst submit: AI analysis ---
  const handleAnalystSubmit = async (data: SurveyDataV2) => {
    setError("");
    setSurveyData(data);
    setAppState("analyzing");
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 3000);

    try {
      // Build payload that fits within Vercel's body size limit
      // Automatically compresses photos more aggressively if needed
      const payload = await buildApiPayload(data);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        let errMsg = "Analysis failed";
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch {
          errMsg = `Server error (${response.status}). The request may be too large — try reducing photo count or size.`;
        }
        throw new Error(errMsg);
      }

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Failed to parse analysis response. Please try again.");
      }

      setAnalysis(result.analysis);
      setSurveyData(data);
      setAppState("report");
    } catch (err) {
      clearInterval(stepInterval);
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      setAppState("form");
    }
  };

  const handleSubmit = (data: SurveyDataV2) => {
    if (role === "analyst") {
      handleAnalystSubmit(data);
    } else {
      handleSurveyorSubmit(data);
    }
  };

  const handleNewSurvey = () => {
    // Clear ALL saved data: form, photos, analysis
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem("ntru-survey-photos"); } catch { /* ignore */ }
    // Clear IndexedDB photos too
    try {
      const req = indexedDB.open("ntru-survey");
      req.onsuccess = () => {
        try {
          const db = req.result;
          const tx = db.transaction("photos", "readwrite");
          tx.objectStore("photos").clear();
          db.close();
        } catch { /* ignore */ }
      };
    } catch { /* ignore */ }
    setSurveyData(null);
    setAnalysis(null);
    setError("");
    setAppState("form");
    setWizardKey((k) => k + 1);
  };

  // --- Import surveyor JSON (analyst only) ---
  const [importing, setImporting] = useState(false);

  // --- Helper: extract embedded survey JSON from a .docx ZIP ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractEmbeddedJson = async (zip: any): Promise<SurveyDataV2 | null> => {
    // 1. Custom XML part
    const xmlFile = zip.file("customXml/ntruSurveyData.xml");
    if (xmlFile) {
      const xml = await xmlFile.async("string");
      const s = xml.indexOf("<ntruData>");
      const e = xml.indexOf("</ntruData>");
      if (s !== -1 && e !== -1) {
        const decoded = xml
          .substring(s + 10, e)
          .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        return JSON.parse(decoded) as SurveyDataV2;
      }
    }
    // 2. Legacy JSON file
    const jsonFile = zip.file("ntru-survey-data.json");
    if (jsonFile) {
      return JSON.parse(await jsonFile.async("string")) as SurveyDataV2;
    }
    // 3. ZIP comment
    const MARKER = "<!--NTRU_SURVEY_DATA:";
    const comment = (zip as unknown as { comment?: string }).comment || "";
    const mi = comment.indexOf(MARKER);
    if (mi !== -1) {
      const b64End = comment.indexOf(":END-->", mi + MARKER.length);
      if (b64End !== -1) {
        const b64 = comment.substring(mi + MARKER.length, b64End);
        return JSON.parse(decodeURIComponent(escape(atob(b64)))) as SurveyDataV2;
      }
    }
    return null;
  };

  // --- Helper: extract text content from Word document XML ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractDocxText = async (zip: any): Promise<string> => {
    const docFile = zip.file("word/document.xml");
    if (!docFile) return "";
    const xml = await docFile.async("string");
    // Strip XML tags, keep text nodes — gives us all visible text from the document
    return xml
      .replace(/<w:br[^>]*\/>/g, "\n")
      .replace(/<w:tab[^>]*\/>/g, "\t")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // --- Helper: extract images from Word document ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractDocxImages = async (zip: any): Promise<TaggedPhoto[]> => {
    const photos: TaggedPhoto[] = [];
    const mediaFiles = zip.folder("word/media");
    if (!mediaFiles) return photos;

    const imageFiles: string[] = [];
    mediaFiles.forEach((path: string, file: { dir: boolean }) => {
      if (!file.dir && /\.(png|jpe?g|gif|bmp|webp)$/i.test(path)) {
        imageFiles.push("word/media/" + path);
      }
    });

    // Limit to avoid memory issues
    const MAX_IMAGES = 20;
    for (const imgPath of imageFiles.slice(0, MAX_IMAGES)) {
      const imgFile = zip.file(imgPath);
      if (!imgFile) continue;
      const blob = await imgFile.async("blob");
      const ext = imgPath.split(".").pop()?.toLowerCase() || "jpeg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(new Blob([blob], { type: mimeType }));
      });
      photos.push({ dataUrl, section: "general", caption: `Imported: ${imgPath.split("/").pop()}` });
    }
    return photos;
  };

  // --- Helper: convert an image File to a TaggedPhoto ---
  const imageFileToPhoto = (file: File): Promise<TaggedPhoto> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ dataUrl: reader.result as string, section: "general", caption: `Imported: ${file.name}` });
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsDataURL(file);
    });

  // --- Helper: parse structured text from a Word survey into form fields ---
  const parseDocxTextToSurvey = (text: string): SurveyDataV2 => {
    const d = emptySurvey();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // Build a label→value map: each label line is followed by its value line
    const map = new Map<string, string>();
    for (let i = 0; i < lines.length - 1; i++) {
      map.set(lines[i].toLowerCase(), lines[i + 1]);
    }
    const g = (key: string): string => map.get(key.toLowerCase()) || "";
    const dash = (v: string) => (v === "—" || v === "-" ? "" : v);

    // Section A
    d.sectionA.insuredName = g("insured name");
    d.sectionA.address = g("address");
    d.sectionA.contactPerson = g("contact person");
    d.sectionA.contactPhone = g("contact phone");
    d.sectionA.dateOfSurvey = g("date of survey");
    d.sectionA.surveyorName = g("surveyor name") || g("surveyor");
    d.sectionA.occupancy = g("occupancy");
    d.sectionA.occupancyOther = dash(g("occupancy (other)"));
    d.sectionA.occupancyDetails = g("occupancy details");
    d.sectionA.buildingAge = g("building age");
    d.sectionA.plotArea = g("plot area (sqm)") || g("plot area");
    d.sectionA.constructedArea = g("constructed area (sqm)") || g("constructed area");
    d.sectionA.numberOfFloors = g("number of floors");
    d.sectionA.numberOfBasements = g("number of basements");
    d.sectionA.surroundingExposures = g("surrounding exposures");
    d.sectionA.latitude = g("latitude");
    d.sectionA.longitude = g("longitude");
    d.sectionA.floodRiskLevel = g("flood risk level");
    d.sectionA.floodRiskDetails = g("flood risk details");

    // Section B
    d.sectionB.structuralFrame = g("structural frame");
    d.sectionB.externalWalls = g("external walls");
    d.sectionB.roofStructure = g("roof structure");
    d.sectionB.roofCovering = g("roof covering");
    d.sectionB.floorType = g("floor type");
    d.sectionB.ceilingType = dash(g("ceiling type"));
    d.sectionB.insulationType = g("insulation type");
    d.sectionB.mezzanineFloors = g("mezzanine floors");
    d.sectionB.buildingCondition = g("building condition");
    d.sectionB.structuralConcerns = g("structural concerns");

    // Section C
    d.sectionC.fireDetectionSystem = g("fire detection system");
    d.sectionC.detectionType = g("detection type");
    d.sectionC.sprinklerSystem = g("sprinkler system");
    d.sectionC.sprinklerType = g("sprinkler type");
    d.sectionC.sprinklerCoverage = g("sprinkler coverage");
    d.sectionC.fireExtinguishers = g("fire extinguishers");
    d.sectionC.extinguisherTypes = g("extinguisher types");
    d.sectionC.fireHoseReels = g("fire hose reels");
    d.sectionC.externalHydrants = g("external hydrants");
    d.sectionC.fireAlarmPanel = g("fire alarm panel");
    d.sectionC.emergencyExits = g("emergency exits");
    d.sectionC.fireBrigade = g("fire brigade");
    d.sectionC.lastFireDrillDate = g("last fire drill date");
    d.sectionC.hotWorkProcedures = g("hot work procedures");

    // Section D
    d.sectionD.hazardousStorage = g("hazardous storage");
    d.sectionD.hazardousMaterials = dash(g("hazardous materials"));
    d.sectionD.storageArrangement = dash(g("storage arrangement"));
    d.sectionD.electricalInstallation = g("electrical installation");
    d.sectionD.electricalMaintDate = g("electrical maint. date") || g("electrical maint date");
    d.sectionD.lightningProtection = dash(g("lightning protection"));
    d.sectionD.emergencyLighting = g("emergency lighting");
    d.sectionD.smokingPolicy = g("smoking policy");
    d.sectionD.flammableLiquidStorage = dash(g("flammable liquid storage"));
    d.sectionD.lpgStorage = dash(g("lpg storage"));
    d.sectionD.dustHazard = g("dust hazard");
    d.sectionD.processHazards = dash(g("process hazards"));

    // Section E
    d.sectionE.generalHousekeeping = g("general housekeeping");
    d.sectionE.wasteManagement = g("waste management");
    d.sectionE.maintenanceProgram = g("maintenance program");
    d.sectionE.roofMaintenance = g("roof maintenance");
    d.sectionE.electricalMaintenance = g("electrical maintenance");
    d.sectionE.fireSafetyMaintenance = g("fire safety maintenance");
    d.sectionE.securityArrangements = g("security arrangements");
    d.sectionE.perimeterFencing = g("perimeter fencing");
    d.sectionE.accessControl = g("access control");
    d.sectionE.floodExposure = g("flood exposure");
    d.sectionE.naturalCatExposure = g("natural cat exposure");
    d.sectionE.businessContinuityPlan = g("business continuity plan");

    return d;
  };

  // --- Helper: empty survey data shell ---
  const emptySurvey = (): SurveyDataV2 => ({
    sectionA: { insuredName: "", address: "", contactPerson: "", contactPhone: "", dateOfSurvey: "", surveyorName: "", occupancy: "", occupancyOther: "", occupancyDetails: "", buildingAge: "", plotArea: "", constructedArea: "", numberOfFloors: "", numberOfBasements: "", surroundingExposures: "", latitude: "", longitude: "", floodRiskLevel: "", floodRiskDetails: "" },
    sectionB: { structuralFrame: "", externalWalls: "", roofStructure: "", roofCovering: "", floorType: "", ceilingType: "", insulationType: "", mezzanineFloors: "", buildingCondition: "", structuralConcerns: "" },
    sectionC: { fireDetectionSystem: "", detectionType: "", sprinklerSystem: "", sprinklerType: "", sprinklerCoverage: "", fireExtinguishers: "", extinguisherTypes: "", fireHoseReels: "", externalHydrants: "", fireAlarmPanel: "", emergencyExits: "", fireBrigade: "", lastFireDrillDate: "", hotWorkProcedures: "" },
    sectionD: { hazardousStorage: "", hazardousMaterials: "", storageArrangement: "", electricalInstallation: "", electricalMaintDate: "", lightningProtection: "", emergencyLighting: "", smokingPolicy: "", flammableLiquidStorage: "", lpgStorage: "", dustHazard: "", processHazards: "" },
    sectionE: { generalHousekeeping: "", wasteManagement: "", maintenanceProgram: "", roofMaintenance: "", electricalMaintenance: "", fireSafetyMaintenance: "", securityArrangements: "", perimeterFencing: "", accessControl: "", floodExposure: "", naturalCatExposure: "", businessContinuityPlan: "" },
    photos: [],
  });

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    // Copy files into a plain array BEFORE clearing the input
    // (clearing the input empties the live FileList reference)
    const files = Array.from(fileList);
    e.target.value = "";

    setImporting(true);
    setError("");

    try {
      let data: SurveyDataV2 | null = null;
      const allPhotos: TaggedPhoto[] = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const nameLower = (f.name || "").toLowerCase();

        // Try as image first (only if clearly an image)
        const isImage = f.type.startsWith("image/") && !nameLower.endsWith(".docx");
        if (isImage) {
          allPhotos.push(await imageFileToPhoto(f));
          continue;
        }

        // Try to open as ZIP (.docx is a ZIP) — always attempt this for non-images
        let zipError = "";
        try {
          const buffer = await f.arrayBuffer();
          if (buffer.byteLength === 0) {
            zipError = "File is empty (0 bytes)";
            throw new Error(zipError);
          }
          const JSZip = (await import("jszip")).default;
          const zip = await JSZip.loadAsync(buffer);

          // It's a valid ZIP — check for embedded survey JSON
          data = await extractEmbeddedJson(zip);

          if (!data) {
            // No embedded JSON — parse text from the Word document into form fields
            const textContent = await extractDocxText(zip);
            const docImages = await extractDocxImages(zip);

            if (textContent) {
              data = parseDocxTextToSurvey(textContent);
            } else {
              data = emptySurvey();
            }
            allPhotos.push(...docImages);
          }
        } catch (zipErr) {
          zipError = zipError || (zipErr instanceof Error ? zipErr.message : String(zipErr));
          // Not a valid ZIP — try as JSON text
          try {
            const text = await f.text();
            const parsed = JSON.parse(text) as SurveyDataV2;
            if (parsed.sectionA || parsed.sectionB) {
              data = parsed;
            }
          } catch {
            // Not JSON either — try as image regardless of type
            try {
              allPhotos.push(await imageFileToPhoto(f));
            } catch {
              // Last resort failed — record diagnostic info
              console.error(`Import failed for "${f.name}" (type: ${f.type}, size: ${f.size}). ZIP error: ${zipError}`);
            }
          }
        }
      }

      // Merge photos
      if (!data && allPhotos.length > 0) data = emptySurvey();
      if (data && allPhotos.length > 0) {
        data.photos = [...(data.photos || []), ...allPhotos];
      }

      if (!data) {
        const fileInfo = files.map(f => `${f.name} (${f.type || "no type"}, ${(f.size / 1024).toFixed(0)}KB)`).join(", ");
        throw new Error(`Could not extract data from: ${fileInfo}. Check browser console for details.`);
      }

      // Ensure all sections exist (for partial/external data)
      if (!data.sectionA) data.sectionA = emptySurvey().sectionA;
      if (!data.sectionB) data.sectionB = emptySurvey().sectionB;
      if (!data.sectionC) data.sectionC = emptySurvey().sectionC;
      if (!data.sectionD) data.sectionD = emptySurvey().sectionD;
      if (!data.sectionE) data.sectionE = emptySurvey().sectionE;
      if (!Array.isArray(data.photos)) data.photos = [];

      // Load into wizard
      setSurveyData(data);
      setError("");
      setAppState("form");
      setWizardKey((k) => k + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("out of memory") || msg.includes("allocation") || msg.includes("RangeError")) {
        setError("This file is too large to import in the browser. Try reducing the number of photos.");
      } else {
        setError(msg || "Failed to import file.");
      }
    } finally {
      setImporting(false);
    }
  };

  // --- Wait for checks ---
  if (!pinChecked || !identityChecked) return null;

  // --- PIN gate for analyst ---
  if (role === "analyst" && !pinVerified) {
    return (
      <PinDialog
        onVerified={(identity) => {
          setAnalystIdentity(identity);
          setPinVerified(true);
        }}
        onCancel={() => router.push("/")}
      />
    );
  }

  // --- Identity gate for surveyor ---
  if (role === "surveyor" && !surveyorIdentity) {
    return (
      <SurveyorIdentityScreen
        onContinue={(identity) => setSurveyorIdentity(identity)}
      />
    );
  }

  // --- Surveyor complete view ---
  if (appState === "surveyorComplete" && surveyData) {
    return (
      <RoleProvider role={role}>
        <SurveyorReport surveyData={surveyData} onBack={handleNewSurvey} />
      </RoleProvider>
    );
  }

  // --- Report view (analyst only) ---
  if (appState === "report" && analysis && surveyData) {
    return (
      <RoleProvider role={role}>
        <RIReport
          analysis={analysis}
          surveyData={surveyData}
          onBack={handleNewSurvey}
          analystName={analystIdentity?.analystName}
          analystDate={analystIdentity?.loginDate}
        />
      </RoleProvider>
    );
  }

  // --- Analyzing view ---
  if (appState === "analyzing") {
    const photoCount = surveyData?.photos.length || 0;
    return (
      <RoleProvider role={role}>
        <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
          <div className="mx-auto max-w-md px-6 text-center">
            <div className="relative mb-8">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Generating RI Report
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Our AI is analyzing your survey data
              {photoCount > 0 ? ` and ${photoCount} photo${photoCount > 1 ? "s" : ""}` : ""}
              {" "}to produce a professional Risk Inspection Report
            </p>

            <div className="mt-8 space-y-2.5">
              {ANALYSIS_STEPS.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all duration-500 ${
                    index < analysisStep
                      ? "bg-green-50 text-green-700"
                      : index === analysisStep
                      ? "bg-blue-50 text-[var(--primary)] font-medium"
                      : "text-gray-300"
                  }`}
                >
                  {index < analysisStep ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </div>
                  ) : index === analysisStep ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                  ) : (
                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-200" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </RoleProvider>
    );
  }

  // --- Form view ---
  return (
    <RoleProvider role={role}>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Nav */}
        <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-[var(--foreground)]">
                NTRU
              </span>
            </div>
            <div className="flex items-center gap-2">
              {role === "analyst" && (
                <>
                  <button
                    type="button"
                    onClick={() => importFileRef.current?.click()}
                    disabled={importing}
                    className="flex items-center gap-1.5 rounded-lg border border-[#3D1556] bg-white px-3 py-1.5 text-xs font-bold text-[#3D1556] transition-colors hover:bg-purple-50 disabled:opacity-50"
                  >
                    {importing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {importing ? "Importing..." : "Import File"}
                  </button>
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".docx,.doc,.json,.jpg,.jpeg,.png,.gif,.webp,.heic,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Start a new survey? This will clear all current data and photos.")) {
                    handleNewSurvey();
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-gray-50 hover:text-[var(--foreground)]"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                New Survey
              </button>
            </div>
          </div>
        </nav>

        {/* Wizard */}
        <div className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Property Risk Survey
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Complete the checklist below. Your progress is automatically saved.
            </p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <SurveyWizard
            key={wizardKey}
            onSubmit={handleSubmit}
            importedData={surveyData}
          />
        </div>
      </div>
    </RoleProvider>
  );
}
