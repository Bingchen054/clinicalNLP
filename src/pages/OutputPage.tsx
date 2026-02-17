import { useState } from "react";
import { Download, Printer, Save, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface CriteriaRow {
  criteria: string;
  status: "Met" | "Missing" | "Partial";
  confidence: number;
  evidence: string;
  guideline: string;
  action: string;
}

const mockCriteria: CriteriaRow[] = [
  {
    criteria: "Acute symptoms requiring inpatient monitoring",
    status: "Met",
    confidence: 96,
    evidence: "Patient presented with acute chest pain radiating to left arm, diaphoresis, and elevated troponin levels.",
    guideline: "MCG A-0401: Acute Coronary Syndrome",
    action: "No action needed",
  },
  {
    criteria: "Failed outpatient treatment",
    status: "Missing",
    confidence: 88,
    evidence: "No documentation of prior outpatient treatment attempts found in notes.",
    guideline: "MCG A-0401: Section 3.2",
    action: "Document prior outpatient treatment or rationale for direct admission",
  },
  {
    criteria: "Vital sign instability",
    status: "Met",
    confidence: 94,
    evidence: "BP 85/52, HR 112, documented hemodynamic instability requiring IV fluids.",
    guideline: "MCG A-0401: Section 2.1",
    action: "No action needed",
  },
  {
    criteria: "Specialist consultation requirement",
    status: "Partial",
    confidence: 72,
    evidence: "Cardiology consult mentioned verbally but not formally documented in notes.",
    guideline: "MCG A-0401: Section 4.3",
    action: "Add formal cardiology consult order documentation",
  },
  {
    criteria: "Ongoing IV medication requirement",
    status: "Met",
    confidence: 91,
    evidence: "Patient on continuous heparin drip and IV nitroglycerin per protocol.",
    guideline: "MCG A-0401: Section 2.4",
    action: "No action needed",
  },
];

const sampleRevisedNotes = `Patient is a 67-year-old male presenting to the ED with acute onset chest pain radiating to the left arm, associated with diaphoresis and nausea. Symptoms began approximately 3 hours prior to arrival.

<highlight>Initial troponin I elevated at 2.4 ng/mL (reference < 0.04), consistent with acute myocardial injury meeting MCG inpatient admission criteria A-0401 Section 1.1.</highlight>

Vital signs on arrival: BP 85/52, HR 112, RR 22, SpO2 94% on room air. <highlight>Hemodynamic instability documented with systolic BP < 90, meeting MCG criteria for inpatient-level monitoring (Section 2.1).</highlight>

Patient was started on IV heparin drip per ACS protocol and IV nitroglycerin for ongoing chest pain management. <highlight>Continuous IV medication administration requires inpatient-level nursing care per MCG Section 2.4.</highlight>

<highlight>Prior outpatient management: Patient had been managed with oral antianginal therapy (metoprolol 50mg BID, isosorbide mononitrate 30mg daily) without resolution of symptoms, supporting the need for escalation to inpatient care.</highlight>

Cardiology consulted. <highlight>Formal cardiology consultation placed by Dr. Ramirez for evaluation of acute coronary syndrome and potential cardiac catheterization.</highlight>

Plan: Admit to cardiac telemetry unit for continuous monitoring, serial troponins, and cardiology evaluation.`;

const StatusBadge = ({ status }: { status: CriteriaRow["status"] }) => {
  const styles = {
    Met: "bg-status-met-bg text-status-met border-transparent",
    Missing: "bg-status-missing-bg text-status-missing border-transparent",
    Partial: "bg-status-partial-bg text-status-partial border-transparent",
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

const OutputPage = () => {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const renderNotes = (text: string) => {
    const parts = text.split(/(<highlight>|<\/highlight>)/);
    let inHighlight = false;
    return parts.map((part, i) => {
      if (part === "<highlight>") { inHighlight = true; return null; }
      if (part === "</highlight>") { inHighlight = false; return null; }
      if (inHighlight) {
        return (
          <span key={i} className="bg-highlight rounded px-0.5">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analysis Results</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Documentation review completed — review suggestions below.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-4 w-4" /> Export PDF
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-1.5 h-4 w-4" /> Export Word
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="mr-1.5 h-4 w-4" /> Print
              </Button>
              <Button size="sm">
                <Save className="mr-1.5 h-4 w-4" /> Save
              </Button>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            {/* Left - Revised Notes (60%) */}
            <div className="xl:col-span-3">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                    Revised Doctor Notes
                  </h2>
                  <Badge className="text-xs">
                    Confidence Score: 92%
                  </Badge>
                </div>
                <div className="rounded-md border border-border bg-background p-5 text-sm leading-relaxed text-foreground whitespace-pre-line min-h-[400px]">
                  {renderNotes(sampleRevisedNotes)}
                </div>
              </div>
            </div>

            {/* Right - Criteria Table (40%) */}
            <div className="xl:col-span-2">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <h2 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wide">
                  Missing Criteria Analysis
                </h2>
                <div className="space-y-0 divide-y divide-border">
                  {mockCriteria.map((row, index) => (
                    <div key={index}>
                      <button
                        onClick={() => toggleRow(index)}
                        className="flex w-full items-start gap-3 py-3 text-left hover:bg-accent/50 transition-colors rounded-sm px-2 -mx-2"
                      >
                        <span className="mt-0.5 text-muted-foreground">
                          {expandedRows.has(index) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {row.criteria}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <StatusBadge status={row.status} />
                            <span className="text-xs text-muted-foreground">
                              {row.confidence}% confidence
                            </span>
                          </div>
                        </div>
                      </button>
                      {expandedRows.has(index) && (
                        <div className="ml-7 mb-3 rounded-md border border-border bg-background p-4 text-sm space-y-2">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Evidence
                            </span>
                            <p className="mt-0.5 text-foreground">{row.evidence}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Guideline Reference
                            </span>
                            <p className="mt-0.5 text-foreground">{row.guideline}</p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Recommended Action
                            </span>
                            <p className="mt-0.5 text-foreground">{row.action}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OutputPage;
