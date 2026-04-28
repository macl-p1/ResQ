"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, RotateCcw, FileImage } from "lucide-react";

interface ImageUploaderProps {
  onExtractedText: (text: string) => void;
}

export default function ImageUploader({ onExtractedText }: ImageUploaderProps) {
  const [state, setState] = useState<"idle" | "preview" | "processing" | "done" | "error">("idle");
  const [previewUrl, setPreviewUrl] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Photo too large. Please use a photo under 10MB.");
      setState("error");
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setErrorMsg("Please upload an image or PDF file.");
      setState("error");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setState("processing");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/ocr", { method: "POST", body: formData });
      const data = await res.json();

      if (data.error) throw new Error(data.error);
      if (!data.text) throw new Error("No text detected");

      setExtractedText(data.text);
      setConfidence(data.confidence || 0);
      setState("done");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not read text from this photo.");
      setState("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const reset = () => {
    setState("idle");
    setPreviewUrl("");
    setExtractedText("");
    setErrorMsg("");
    setConfidence(0);
  };

  return (
    <div className="space-y-4">
      {/* Idle — Dropzone */}
      {state === "idle" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-google min-h-[200px] ${
            dragOver ? "border-google-blue bg-blue-50" : "border-google-grey-300 hover:border-google-blue hover:bg-blue-50/50"
          }`}
        >
          <Camera className="h-10 w-10 text-google-blue mb-3" />
          <p className="text-sm font-medium text-google-grey-800">Drop survey photo here</p>
          <p className="text-xs text-google-grey-500 mt-1">or click to browse</p>
          <p className="text-[10px] text-google-grey-400 mt-2">JPG, PNG, PDF · Max 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            className="hidden"
          />
        </div>
      )}

      {/* Mobile camera button */}
      {state === "idle" && (
        <label className="flex items-center justify-center gap-2 w-full py-2.5 border border-google-grey-300 rounded-full text-sm text-google-grey-700 cursor-pointer hover:bg-google-grey-50 transition-google md:hidden">
          <FileImage className="h-4 w-4" />
          Take Photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
            className="hidden"
          />
        </label>
      )}

      {/* Processing */}
      {state === "processing" && (
        <div className="text-center py-8">
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="h-32 mx-auto rounded-lg mb-4 object-cover border border-google-grey-200" />
          )}
          <Loader2 className="h-6 w-6 animate-spin text-google-blue mx-auto mb-2" />
          <p className="text-sm text-google-grey-600">Scanning with Google Vision AI...</p>
        </div>
      )}

      {/* Done */}
      {state === "done" && (
        <div className="space-y-3">
          {previewUrl && (
            <img src={previewUrl} alt="Scanned" className="h-24 rounded-lg object-cover border border-google-grey-200" />
          )}
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-google-green" />
            <span className="text-xs font-medium text-google-green">OCR Confidence: {confidence}%</span>
          </div>
          <div className="bg-google-grey-50 rounded-lg p-3 border border-google-grey-200 max-h-32 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-google-grey-800 whitespace-pre-wrap">{extractedText}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { onExtractedText(extractedText); reset(); }}
              className="flex-1 py-2 bg-google-blue text-white rounded-full text-sm font-medium hover:bg-google-blue-hover transition-google"
            >
              Use this text
            </button>
            <button
              onClick={reset}
              className="py-2 px-4 border border-google-grey-300 rounded-full text-sm text-google-grey-700 hover:bg-google-grey-50 transition-google flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try another
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="text-center py-6">
          <AlertCircle className="h-8 w-8 text-google-red mx-auto mb-2" />
          <p className="text-sm text-google-red mb-3">{errorMsg}</p>
          <button
            onClick={reset}
            className="px-4 py-2 border border-google-grey-300 rounded-full text-sm text-google-grey-700 hover:bg-google-grey-50 transition-google inline-flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try again
          </button>
        </div>
      )}
    </div>
  );
}
