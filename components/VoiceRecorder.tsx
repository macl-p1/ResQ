"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

type RecorderState = "idle" | "recording" | "processing" | "done" | "error";
interface VoiceRecorderProps { onTranscript: (text: string) => void; }

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 48000, echoCancellation: true, noiseSuppression: true } });
      const mimeTypes = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'];
      let selectedMime = '';
      for (const mt of mimeTypes) { if (MediaRecorder.isTypeSupported(mt)) { selectedMime = mt; break; } }
      const options: MediaRecorderOptions = {}; if (selectedMime) options.mimeType = selectedMime;
      const mr = new MediaRecorder(stream, options);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setState("processing");
        try {
          const blob = new Blob(chunksRef.current, { type: selectedMime || 'audio/webm' });
          if (blob.size < 100) { setErrorMsg("Recording too short."); setState("error"); return; }
          const fd = new FormData(); fd.append("audio", blob, "recording.webm");
          const res = await fetch("/api/stt", { method: "POST", body: fd }); const data = await res.json();
          if (data.error && !data.transcript) { setErrorMsg(data.error); setState("error"); }
          else if (data.transcript) { setTranscript(data.transcript); setState("done"); }
          else { setErrorMsg("No speech detected."); setState("error"); }
        } catch { setErrorMsg("Transcription failed."); setState("error"); }
      };
      mr.start(250); mediaRef.current = mr; setState("recording"); setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err: any) {
      setErrorMsg(err.name === 'NotAllowedError' ? "Microphone denied." : err.message);
      setState("error");
    }
  };
  const stopRecording = () => { if (mediaRef.current?.state === 'recording') mediaRef.current.stop(); };
  const reset = () => { setState("idle"); setTranscript(""); setErrorMsg(""); setSeconds(0); };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {state === "idle" && <>
        <button onClick={startRecording} className="h-20 w-20 rounded-full bg-primary flex items-center justify-center shadow-glow-blue hover:opacity-90 transition-google"><Mic className="h-8 w-8 text-primary-foreground" /></button>
        <p className="text-sm text-muted-foreground">Tap to speak</p>
        <p className="text-[10px] text-muted-foreground/60">Supports English, Hindi, Tamil, Telugu, Bengali</p>
      </>}
      {state === "recording" && <>
        <button onClick={stopRecording} className="h-20 w-20 rounded-full bg-destructive flex items-center justify-center animate-pulse shadow-glow-red"><Square className="h-6 w-6 text-white" fill="white" /></button>
        <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <div key={i} className="w-1 bg-destructive rounded-full" style={{ animation: `soundWave 0.8s ease-in-out ${i * 0.15}s infinite`, height: "12px" }} />)}</div>
        <p className="text-sm text-destructive font-medium">Recording... {seconds}s</p>
        {seconds >= 2 && <button onClick={stopRecording} className="px-4 py-2 border border-destructive/30 text-destructive rounded-lg text-xs font-medium">Stop</button>}
      </>}
      {state === "processing" && <>
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
        <p className="text-sm text-muted-foreground">Transcribing...</p>
      </>}
      {state === "done" && <>
        <div className="h-16 w-16 rounded-full bg-green-50 dark:bg-emerald-950/50 flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-green-600 dark:text-emerald-400" /></div>
        <div className="w-full bg-muted rounded-lg p-3 border border-border"><p className="text-xs text-green-600 dark:text-emerald-400 font-medium mb-1">✅ Transcript ready</p><p className="text-sm text-foreground">{transcript}</p></div>
        <div className="flex gap-3">
          <button onClick={() => { onTranscript(transcript); reset(); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Use this</button>
          <button onClick={reset} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-google flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> Retry</button>
        </div>
      </>}
      {state === "error" && <>
        <div className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div>
        <p className="text-sm text-destructive">{errorMsg}</p>
        <button onClick={reset} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-google flex items-center gap-1"><RotateCcw className="h-3.5 w-3.5" /> Retry</button>
      </>}
    </div>
  );
}
