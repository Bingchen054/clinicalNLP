const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function analyzeNote(note: string) {
  const response = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ note }),
  });

  if (!response.ok) {
    throw new Error("Analyze API failed");
  }

  return response.json();
}

export async function uploadAndAnalyze(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload-and-analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload and analyze API failed");
  }

  return response.json();
}

export async function analyzeWithGuideline(
  doctorNote: string,
  guidelineFile: File
) {
  const formData = new FormData();
  formData.append("doctor_note", doctorNote);
  formData.append("guideline", guidelineFile);

  const response = await fetch(`${BASE_URL}/analyze-with-guideline`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Analyze with guideline failed");
  }

  return response.json();
}