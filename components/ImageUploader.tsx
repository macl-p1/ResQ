"use client";
import { useState, useRef } from "react";
import { Camera, Loader2, CheckCircle2, AlertCircle, RotateCcw, FileImage } from "lucide-react";

interface ImageUploaderProps { onExtractedText: (text: string) => void; }

export default function ImageUploader({ onExtractedText }: ImageUploaderProps) {
  const [state, setState] = useState<"idle"|"processing"|"done"|"error">("idle");
  const [previewUrl, setPreviewUrl] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (file.size > 10*1024*1024) { setErrorMsg("Photo too large (max 10MB)."); setState("error"); return; }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") { setErrorMsg("Upload an image or PDF."); setState("error"); return; }
    setPreviewUrl(URL.createObjectURL(file)); setState("processing");
    try {
      const fd = new FormData(); fd.append("image", file);
      const res = await fetch("/api/ocr", { method: "POST", body: fd }); const data = await res.json();
      if (data.error) throw new Error(data.error); if (!data.text) throw new Error("No text detected");
      setExtractedText(data.text); setConfidence(data.confidence || 0); setState("done");
    } catch (err: any) { setErrorMsg(err.message || "Could not read text."); setState("error"); }
  };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); };
  const reset = () => { setState("idle"); setPreviewUrl(""); setExtractedText(""); setErrorMsg(""); setConfidence(0); };

  return (
    <div className="space-y-4">
      {state === "idle" && <>
        <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-google min-h-[200px] ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary hover:bg-primary/5"}`}>
          <Camera className="h-10 w-10 text-primary mb-3" />
          <p className="text-sm font-medium text-foreground">Drop survey photo here</p>
          <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          <p className="text-[10px] text-muted-foreground/60 mt-2">JPG, PNG, PDF · Max 10MB</p>
          <input ref={inputRef} type="file" accept="image/*,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />
        </div>
        <label className="flex items-center justify-center gap-2 w-full py-2.5 border border-border rounded-lg text-sm text-foreground cursor-pointer hover:bg-muted transition-google md:hidden">
          <FileImage className="h-4 w-4" /> Take Photo
          <input type="file" accept="image/*" capture="environment" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} className="hidden" />
        </label>
      </>}
      {state === "processing" && <div className="text-center py-8">
        {previewUrl && <img src={previewUrl} alt="Preview" className="h-32 mx-auto rounded-lg mb-4 object-cover border border-border" />}
        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" /><p className="text-sm text-muted-foreground">Scanning with Google Vision AI...</p>
      </div>}
      {state === "done" && <div className="space-y-3">
        {previewUrl && <img src={previewUrl} alt="Scanned" className="h-24 rounded-lg object-cover border border-border" />}
        <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 dark:text-emerald-400" /><span className="text-xs font-medium text-green-600 dark:text-emerald-400">OCR Confidence: {confidence}%</span></div>
        <div className="bg-muted rounded-lg p-3 border border-border max-h-32 overflow-y-auto custom-scrollbar"><p className="text-xs text-foreground whitespace-pre-wrap">{extractedText}</p></div>
        <div className="flex gap-3">
          <button onClick={() => { onExtractedText(extractedText); reset(); }} className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-google">Use this text</button>
          <button onClick={reset} className="py-2 px-4 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-google flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> Retry</button>
        </div>
      </div>}
      {state === "error" && <div className="text-center py-6">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" /><p className="text-sm text-destructive mb-3">{errorMsg}</p>
        <button onClick={reset} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-google inline-flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> Retry</button>
      </div>}
    </div>
  );
}
