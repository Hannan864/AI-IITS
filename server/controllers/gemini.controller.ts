import { GoogleGenAI } from "@google/genai";
import { logForensicEvent } from "../utils";

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("[Gemini] Failed to instantiate GoogleGenAI client:", e);
    }
  }
  return aiClient;
}

export const GeminiController = {
  recoveryPlan: async (req: any, res: any) => {
    const { facultyName, department, daysRemaining, contractDate, assets = [] } = req.body;
    const actor = req.user ? req.user.email : "system-auto@iiui.edu";

    const assetListText = assets.length > 0 
      ? assets.map((a: any) => `- ${a.assetName || "Equipment"} [Tag: ${a.assetTag || "N/A"}] (Issued: ${a.issuedDate || "N/A"}, Due: ${a.returnDate || "N/A"})`).join("\n")
      : "- No individual serial records attached";

    const defaultInstitutionalDraft = `INTERNATIONAL ISLAMIC UNIVERSITY ISLAMABAD (IIUI)
CENTRAL ASSET MANAGEMENT & RECOVERY DIVISION
Sector H-10, Islamabad, Pakistan
Ref: IIUI/STORE/REC-${Date.now().toString().slice(-6)}
Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

TO: ${facultyName || "Faculty Member"}
DEPARTMENT: ${department || "Department of Information Technology"}
SUBJECT: FORMAL NOTIFICATION: PHYSICAL ASSET CLEARANCE & TIMELY HANDOVER

Dear Respected Faculty Member,

According to institutional records maintained in the Centralized Automated Inventory Issuance & Tracking System (AIITS), your contractual tenure with the International Islamic University Islamabad is scheduled to conclude on ${contractDate || "the designated contract conclusion date"} (${daysRemaining <= 0 ? "Contract Expired" : `${daysRemaining} days remaining`}).

As mandated by university governance policies and the Directorate of Asset Control, all institutional liabilities, computing equipment, and laboratory hardware issued for your academic and administrative responsibilities must be surrendered to the Central Store before a formal "No Demand Certificate" (NDC) can be sanctioned.

The following institutional assets are currently cataloged under your personal liabilities ledger:
${assetListText}

ACTION MANDATE:
1. Please coordinate with the Central Store Manager for physical triage, condition grading, and QR barcode verification.
2. Submit this clearance notice alongside the returned equipment to obtain an instantaneous digital return timestamp.
3. Upon physical check-in of all items in good order, your administrative clearance index will update automatically, permitting the generation of your No Demand Certificate (NDC).

Failure to reconcile the listed assets prior to contract conclusion will result in a hold placed on final institutional clearances and administrative releases.

Issued by authority of:
Store & Logistics Operations Desk
International Islamic University Islamabad (IIUI)`;

    try {
      const ai = getGenAI();
      if (ai) {
        const prompt = `You are the Directorate of Asset Management at International Islamic University Islamabad (IIUI). 
Draft a professional, authoritative, and polite recovery notice letter for a visiting/contract faculty member whose contract is concluding.
Details:
- Faculty Name: ${facultyName}
- Department: ${department}
- Contract End Date: ${contractDate}
- Days Remaining: ${daysRemaining}
- Outstanding University Assets:
${assetListText}

Structure the letter with formal university letterhead style (IIUI Central Store, Reference Number, Date, Addressee, Subject, Clear Instructions for returning items, and consequence of clearance hold if not returned). Keep the tone academic, formal, and helpful.`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });

        const generatedText = response.text;
        if (generatedText && generatedText.trim().length > 50) {
          logForensicEvent(actor, department || "Administration", "Generated AI Recovery Notice", "ai_intel", "INFO", `Generated automated clearance recovery notice for ${facultyName}`);
          return res.json({ draft: generatedText });
        }
      }
    } catch (error: any) {
      console.warn("[GeminiController] AI generation fallback triggered:", error.message);
    }

    logForensicEvent(actor, department || "Administration", "Generated Recovery Notice", "ai_intel", "INFO", `Generated institutional clearance recovery notice for ${facultyName}`);
    return res.json({ draft: defaultInstitutionalDraft });
  }
};
