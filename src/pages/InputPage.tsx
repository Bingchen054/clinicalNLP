import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const InputPage = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setFileName(file.name);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleAnalyze = () => {
    navigate("/output");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-8 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Clinical Documentation Optimization
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Align physician documentation with MCG admission criteria.
            </p>
          </div>

          {/* Two-column cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Card - Doctor Notes */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <h2 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wide">
                Doctor Raw Notes
              </h2>
              <div className="relative">
                <Textarea
                  placeholder="Paste physician documentation here..."
                  className="min-h-[320px] resize-none text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {notes.length} characters
                </span>
              </div>
            </div>

            {/* Right Card - PDF Upload */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  MCG Guideline PDF
                </h2>
                <Badge variant={fileName ? "default" : "secondary"} className="text-xs">
                  {fileName ? "Uploaded" : "Ready"}
                </Badge>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`flex min-h-[320px] flex-col items-center justify-center rounded-md border-2 border-dashed transition-colors ${
                  dragOver
                    ? "border-primary bg-accent"
                    : "border-border bg-background"
                }`}
              >
                {fileName ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <FileText className="h-10 w-10 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{fileName}</p>
                      <p className="text-xs text-muted-foreground">PDF uploaded successfully</p>
                    </div>
                    <button
                      onClick={() => setFileName(null)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Drop PDF here or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MCG guideline document (.pdf)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="mt-8 flex justify-center">
            <Button size="lg" className="px-12" onClick={handleAnalyze}>
              Analyze Documentation
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InputPage;
