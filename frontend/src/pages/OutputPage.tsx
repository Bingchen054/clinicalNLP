import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Download, Printer, Save, ChevronDown, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import html2pdf from "html2pdf.js";
import { saveAs } from "file-saver";

interface CriteriaRow {
  criteria: string;
  status: "Met" | "Missing" | "Partial";
  evidence: string;
  guideline: string;
  action: string;
}

const StatusBadge = ({ status }: { status: CriteriaRow["status"] }) => {
  const styles = {
    Met: "bg-green-100 text-green-700",
    Missing: "bg-red-100 text-red-700",
    Partial: "bg-yellow-100 text-yellow-700",
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

  const stateData = location.state as any;
  const data = stateData?.analysis ? stateData.analysis : stateData;

  useEffect(() => {
    console.log("OutputPage received data:", stateData);
  }, [stateData]);

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold">No Analysis Data Found</h2>
            <button
              onClick={() => navigate("/input")}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md"
            >
              Go Back
            </button>
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

  const handleExportPDF = () => {
    const element = document.getElementById("print-area");
    if (!element) return;

    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: "Clinical_Analysis.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  const handleExportWord = () => {
    const element = document.getElementById("print-area");
    if (!element) return;

    const content = element.innerHTML;

    const blob = new Blob(
      [
        `
        <html>
        <head><meta charset="utf-8"></head>
        <body>${content}</body>
        </html>
        `,
      ],
      { type: "application/msword" }
    );

    saveAs(blob, "Clinical_Analysis.doc");
  };

  const handleSave = () => {
    localStorage.setItem("lastClinicalAnalysis", JSON.stringify(data));
    alert("Saved locally.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main id="print-area" className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Analysis Results</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Documentation review completed — review suggestions below.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={handleExportPDF}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm flex items-center"
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export PDF
              </button>

              <button
                onClick={handleExportWord}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm flex items-center"
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export Word
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm flex items-center"
              >
                <Printer className="mr-1.5 h-4 w-4" />
                Print
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm flex items-center"
              >
                <Save className="mr-1.5 h-4 w-4" />
                Save
              </button>

            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">

            <div className="xl:col-span-3">
              <div className="rounded-lg border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Revised Doctor Notes
                  </h2>

                </div>

                <div className="rounded-md border bg-background p-5 text-sm whitespace-pre-line min-h-[400px]">
                  {revisedNote || "No revised note generated."}
                </div>
              </div>
            </div>

            <div className="xl:col-span-2">
              <div className="rounded-lg border bg-card p-6 shadow-card">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide">
                  Missing Criteria Analysis
                </h2>

                {missingCriteria?.length ? (
                  <div className="divide-y">
                    {missingCriteria.map((row: CriteriaRow, index: number) => (
                      <div key={index}>
                        <button
                          onClick={() => toggleRow(index)}
                          className="flex w-full items-start gap-3 py-3 text-left"
                        >
                          <span className="mt-0.5">
                            {expandedRows.has(index) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </span>

                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {row.criteria}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <StatusBadge status={row.status} />

                            </div>
                          </div>
                        </button>

                        {expandedRows.has(index) && (
                          <div className="ml-7 mb-3 p-4 text-sm space-y-2">
                            <p><strong>Evidence:</strong> {row.evidence}</p>
                            <p><strong>Guideline:</strong> {row.guideline}</p>
                            <p><strong>Action:</strong> {row.action}</p>
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
