"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

type RecorderState = "idle" | "recording" | "processing" | "done" | "error";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Detect best supported mimeType
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
      ];
      let selectedMime = '';
      for (const mt of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mt)) {
          selectedMime = mt;
          break;
        }
      }
      console.log('[VoiceRecorder] Selected mimeType:', selectedMime || 'default');

      const options: MediaRecorderOptions = {};
      if (selectedMime) options.mimeType = selectedMime;

      const mediaRecorder = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('[VoiceRecorder] Chunk received:', e.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setState("processing");

        try {
          const blob = new Blob(chunksRef.current, { type: selectedMime || 'audio/webm' });
          console.log('[VoiceRecorder] Total blob size:', blob.size, 'bytes, chunks:', chunksRef.current.length);

          if (blob.size < 100) {
            setErrorMsg("Recording too short or empty. Please speak for at least 2 seconds.");
            setState("error");
            return;
          }

          const formData = new FormData();
          formData.append("audio", blob, "recording.webm");

          console.log('[VoiceRecorder] Sending to /api/stt...');
          const res = await fetch("/api/stt", { method: "POST", body: formData });
          const data = await res.json();
          console.log('[VoiceRecorder] STT response:', data);

          if (data.error && !data.transcript) {
            setErrorMsg(data.error);
            setState("error");
          } else if (data.transcript) {
            setTranscript(data.transcript);
            setState("done");
          } else {
            setErrorMsg("No speech detected. Please speak clearly and try again.");
            setState("error");
          }
        } catch (err: any) {
          console.error('[VoiceRecorder] Error:', err);
          setErrorMsg("Transcription failed. Please try again.");
          setState("error");
        }
      };

      // Start with timeslice to get periodic data chunks (every 250ms)
      mediaRecorder.start(250);
      mediaRef.current = mediaRecorder;
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err: any) {
      console.error('[VoiceRecorder] Mic error:', err);
      if (err.name === 'NotAllowedError') {
        setErrorMsg("Microphone permission denied. Please allow access in browser settings.");
      } else {
        setErrorMsg("Could not access microphone: " + err.message);
      }
      setState("error");
    }
  };

  const stopRecording = () => {
    if (mediaRef.current && mediaRef.current.state === 'recording') {
      mediaRef.current.stop();
    }
  };

  const reset = () => {
    setState("idle");
    setTranscript("");
    setErrorMsg("");
    setSeconds(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Idle */}
      {state === "idle" && (
        <button
          onClick={startRecording}
          className="h-20 w-20 rounded-full bg-google-blue flex items-center justify-center shadow-google-blue hover:bg-google-blue-hover transition-google"
        >
          <Mic className="h-8 w-8 text-white" />
        </button>
      )}
      {state === "idle" && (
        <>
          <p className="text-sm text-google-grey-600">Tap to speak</p>
          <p className="text-[10px] text-google-grey-400">Supports English, Hindi, Tamil, Telugu, Bengali</p>
        </>
      )}

      {/* Recording */}
      {state === "recording" && (
        <>
          <button
            onClick={stopRecording}
            className="h-20 w-20 rounded-full bg-google-red flex items-center justify-center animate-pulse shadow-google-red"
          >
            <Square className="h-6 w-6 text-white" fill="white" />
          </button>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-google-red rounded-full"
                style={{
                  animation: `soundWave 0.8s ease-in-out ${i * 0.15}s infinite`,
                  height: "12px",
                }}
              />
            ))}
          </div>
          <p className="text-sm text-google-red font-medium">
            Recording... {seconds}s — tap to stop
          </p>
          {seconds >= 2 && (
            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-white border border-google-red text-google-red rounded-full text-xs font-medium"
            >
              Stop Recording
            </button>
          )}
        </>
      )}

      {/* Processing */}
      {state === "processing" && (
        <>
          <div className="h-20 w-20 rounded-full bg-google-grey-100 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-google-blue animate-spin" />
          </div>
          <p className="text-sm text-google-grey-600">Transcribing with Google Speech AI...</p>
          <p className="text-[10px] text-google-grey-400">This may take a few seconds</p>
        </>
      )}

      {/* Done */}
      {state === "done" && (
        <>
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-google-green" />
          </div>
          <div className="w-full bg-google-grey-50 rounded-lg p-3 border border-google-grey-200">
            <p className="text-xs text-google-green font-medium mb-1">✅ Transcript ready</p>
            <p className="text-sm text-google-grey-800">{transcript}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { onTranscript(transcript); reset(); }}
              className="px-4 py-2 bg-google-blue text-white rounded-full text-sm font-medium hover:bg-google-blue-hover transition-google"
            >
              Use this
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 border border-google-grey-300 rounded-full text-sm text-google-grey-700 hover:bg-google-grey-50 transition-google flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try again
            </button>
          </div>
        </>
      )}

      {/* Error */}
      {state === "error" && (
        <>
          <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-google-red" />
          </div>
          <p className="text-sm text-google-red">{errorMsg}</p>
          <button
            onClick={reset}
            className="px-4 py-2 border border-google-grey-300 rounded-full text-sm text-google-grey-700 hover:bg-google-grey-50 transition-google flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Try again
          </button>
        </>
      )}
    </div>
  );
}
