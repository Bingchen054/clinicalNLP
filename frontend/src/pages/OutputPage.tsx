import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

const StatusBadge = ({ status }: { status: CriteriaRow["status"] }) => {
  const styles = {
    Met: "bg-status-met-bg text-status-met border-transparent",
    Missing: "bg-status-missing-bg text-status-missing border-transparent",
    Partial: "bg-status-partial-bg text-status-partial border-transparent",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
        styles[status] || "bg-gray-200 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

const OutputPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // 🔥 安全读取 state
  const stateData = location.state as any;

  const data = stateData?.analysis ? stateData.analysis : stateData;

  useEffect(() => {
    console.log("📦 OutputPage received data:", stateData);
  }, [stateData]);

  // 如果没有数据，提示用户
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">No Analysis Data Found</h2>
            <p className="text-muted-foreground mt-2">
              Please upload and analyze a document first.
            </p>
            <Button
              className="mt-4"
              onClick={() => navigate("/input")}
            >
              Go Back
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { revisedNote, missingCriteria } = data;

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
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
              <h1 className="text-2xl font-semibold text-foreground">
                Analysis Results
              </h1>
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

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">

            {/* Left - Revised Notes */}
            <div className="xl:col-span-3">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Revised Doctor Notes
                  </h2>
                  <Badge className="text-xs">
                    Confidence Score: 92%
                  </Badge>
                </div>

                <div className="rounded-md border border-border bg-background p-5 text-sm whitespace-pre-line min-h-[400px]">
                  {revisedNote || "No revised note generated."}
                </div>
              </div>
            </div>

            {/* Right - Criteria */}
            <div className="xl:col-span-2">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                  Missing Criteria Analysis
                </h2>

                {missingCriteria?.length ? (
                  <div className="divide-y divide-border">
                    {missingCriteria.map((row: CriteriaRow, index: number) => (
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
                            <p className="text-sm font-medium leading-snug">
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
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Evidence
                              </span>
                              <p className="mt-0.5">{row.evidence}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Guideline Reference
                              </span>
                              <p className="mt-0.5">{row.guideline}</p>
                            </div>
                            <div>
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Recommended Action
                              </span>
                              <p className="mt-0.5">{row.action}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No criteria analysis available.
                  </p>
                )}
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
