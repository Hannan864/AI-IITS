import React, { useState } from "react";
import { Hand, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import GlassCard from "../components/GlassCard";
import { Asset, User } from "../types";
import {
  StepSelectHardware,
  StepSelectFaculty,
  StepSetLimits,
  StepAuthorisationManifest,
  StepCheckoutCompleted
} from "../components/issuance/CheckoutStepUIs";

interface IssuancePageProps {
  assets: Asset[];
  users: User[];
  onIssueAsset: (assetId: string, facultyId: string, returnDate: string, issuedBy: string) => Promise<boolean>;
  currentUser: User;
}

export default function IssuancePage({ assets, users, onIssueAsset, currentUser }: IssuancePageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [durationPreset, setDurationPreset] = useState("Semester End (120 days)");
  const [digitalSignature, setDigitalSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [assetCategoryFilter, setAssetCategoryFilter] = useState("ALL");
  const [facultySearchQuery, setFacultySearchQuery] = useState("");

  const availableAssets = assets.filter((a) => a.status === "Available");
  const facultyUsers = users.filter((u) => u.role.includes("Faculty") || u.role.includes("Visiting"));

  const filteredAvailableAssets = availableAssets.filter((a) => {
    const matchesSearch =
      a.assetName.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(assetSearchQuery.toLowerCase());
    const matchesCategory = assetCategoryFilter === "ALL" || a.category === assetCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredFaculty = facultyUsers.filter((u) => {
    return (
      u.name.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(facultySearchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(facultySearchQuery.toLowerCase())
    );
  });

  const handleDurationPresetChange = (preset: string) => {
    setDurationPreset(preset);
    const today = new Date();
    if (preset.includes("15 days")) {
      today.setDate(today.getDate() + 15);
    } else if (preset.includes("120 days")) {
      today.setDate(today.getDate() + 120);
    } else if (preset.includes("365 days")) {
      today.setDate(today.getDate() + 365);
    }
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setReturnDate(`${year}-${month}-${day}`);
  };

  React.useEffect(() => {
    if (!returnDate) {
      handleDurationPresetChange("Semester End (120 days)");
    }
  }, [returnDate]);

  React.useEffect(() => {
    if (currentStep === 4 && !digitalSignature) {
      setDigitalSignature(currentUser.name || "Authorized Officer");
    }
    setStepError(null);
  }, [currentStep, currentUser.name, digitalSignature]);

  const chosenAsset = assets.find((a) => a.id === selectedAssetId);
  const chosenFaculty = users.find((u) => u.id === selectedUserId);

  const handleNextStep = () => {
    setStepError(null);
    if (currentStep === 1 && !selectedAssetId) {
      setStepError("Please select an available asset from the list to continue.");
      return;
    }
    if (currentStep === 2 && !selectedUserId) {
      setStepError("Please select a faculty recipient to continue.");
      return;
    }
    if (currentStep === 3 && !returnDate) {
      setStepError("Please specify or calculate a valid return deadline date.");
      return;
    }
    const sig = digitalSignature.trim() || currentUser.name || "Authorized Officer";
    if (currentStep === 4) {
      handleCheckoutSubmit(sig);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStepError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleCheckoutSubmit = async (sig: string) => {
    if (!selectedAssetId || !selectedUserId || !returnDate) {
      setStepError("Required checkout parameters missing. Please recheck previous steps.");
      return;
    }

    setLoading(true);
    try {
      const ok = await onIssueAsset(selectedAssetId, selectedUserId, returnDate, sig || currentUser.name);
      if (ok) {
        setCurrentStep(5);
      } else {
        setStepError("Lending authorization sequence failed. Hardware allocation is locked.");
      }
    } catch (err) {
      console.error("Issuance error:", err);
      setStepError("An unexpected error occurred while finalizing checkout.");
    } finally {
      setLoading(false);
    }
  };

  const resetWizardState = () => {
    setSelectedAssetId("");
    setSelectedUserId("");
    setDigitalSignature("");
    setAssetSearchQuery("");
    setFacultySearchQuery("");
    setCurrentStep(1);
    handleDurationPresetChange("Semester End (120 days)");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
          <Hand className="h-4.5 w-4.5 text-indigo-400" /> Outbound Allocation Checkout Wizard
        </h3>
        <p className="text-xs text-slate-400">
          Step-by-step equipment issuance wizard. Link physical hardware with verified faculty members.
        </p>
      </div>

      <div className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-white/5 select-none text-[10.5px]">
        {[
          { label: "1. Select Equipment", step: 1 },
          { label: "2. Recipient", step: 2 },
          { label: "3. Limits", step: 3 },
          { label: "4. Authorization", step: 4 },
          { label: "5. Completed", step: 5 }
        ].map((item) => (
          <div
            key={item.step}
            className={`flex items-center gap-1.5 font-bold transition-all ${
              currentStep === item.step
                ? "text-indigo-400 font-extrabold"
                : currentStep > item.step
                ? "text-emerald-400"
                : "text-slate-500"
            }`}
          >
            <span className={`h-5 w-5 rounded-full flex items-center justify-center border font-mono text-[10.5px] ${
              currentStep === item.step
                ? "bg-indigo-650 border-indigo-400 text-white shadow"
                : currentStep > item.step
                ? "bg-emerald-600/10 border-emerald-500 text-emerald-400"
                : "bg-transparent border-slate-700 text-slate-500"
            }`}>
              {item.step === 5 || currentStep > item.step ? "✓" : item.step}
            </span>
            <span className="hidden md:inline tracking-tight text-[10px] uppercase font-bold">{item.label}</span>
          </div>
        ))}
      </div>

      <GlassCard className="p-6 relative">
        {currentStep === 1 && (
          <StepSelectHardware
            assetCategoryFilter={assetCategoryFilter}
            setAssetCategoryFilter={setAssetCategoryFilter}
            assetSearchQuery={assetSearchQuery}
            setAssetSearchQuery={setAssetSearchQuery}
            filteredAvailableAssets={filteredAvailableAssets}
            selectedAssetId={selectedAssetId}
            setSelectedAssetId={setSelectedAssetId}
            chosenAsset={chosenAsset}
          />
        )}

        {currentStep === 2 && (
          <StepSelectFaculty
            facultySearchQuery={facultySearchQuery}
            setFacultySearchQuery={setFacultySearchQuery}
            filteredFaculty={filteredFaculty}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            chosenFaculty={chosenFaculty}
          />
        )}

        {currentStep === 3 && (
          <StepSetLimits
            durationPreset={durationPreset}
            onDurationPresetChange={handleDurationPresetChange}
            returnDate={returnDate}
            setReturnDate={setReturnDate}
            setDurationPreset={setDurationPreset}
            chosenFaculty={chosenFaculty}
          />
        )}

        {currentStep === 4 && chosenAsset && chosenFaculty && (
          <StepAuthorisationManifest
            chosenAsset={chosenAsset}
            chosenFaculty={chosenFaculty}
            returnDate={returnDate}
            currentUser={currentUser}
            digitalSignature={digitalSignature}
            setDigitalSignature={setDigitalSignature}
          />
        )}

        {currentStep === 5 && chosenAsset && chosenFaculty && (
          <StepCheckoutCompleted
            chosenAsset={chosenAsset}
            chosenFaculty={chosenFaculty}
            returnDate={returnDate}
            resetWizardState={resetWizardState}
          />
        )}

        {currentStep < 5 && (
          <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
            {stepError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{stepError}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1 || loading}
                className="bg-white/5 hover:bg-white/10 disabled:opacity-20 border border-white/10 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 border border-indigo-500/30 text-white font-bold px-5 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Finalizing Allocation...
                  </>
                ) : (
                  <>
                    {currentStep === 4 ? "Finalize Checkout" : "Next Step"}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
