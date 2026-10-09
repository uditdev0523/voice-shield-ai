import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  Volume2,
} from 'lucide-react';
import { api } from '../services/api';
import { DetectionResult } from '../services/types';
import { Card } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/StatCard';

export const LiveDetectionPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const animationFrameRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up all audio tracks and contexts on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
    };
  }, []);

  const stopAllTracks = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const startRecording = async () => {
    setError(null);
    setResult(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);

    try {
      // Request mic ONLY upon explicit user click
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Audio Level Analyzer for real-time visualization
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // Configure MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioLevel(0);
      };

      mediaRecorder.start(250); // Slice chunks every 250ms
      setIsRecording(true);

      // Start duration timer (cap at 30 seconds)
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= 29) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      stopAllTracks();
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
      } else {
        setError(`Unable to access microphone: ${err.message || 'Unknown device error'}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopAllTracks();
    setIsRecording(false);
  };

  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
    setResult(null);
    setError(null);
  };

  const analyzeAudio = async () => {
    if (!audioBlob) return;
    setAnalyzing(true);
    setError(null);
    try {
      const data = await api.analyzeLiveChunk(audioBlob);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check backend connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Live Microphone Voice Detection
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Record caller audio directly in your browser. Transient audio is purged immediately upon analysis.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          color: '#f87171',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertTriangle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Recording Console Card */}
      <Card style={{ textAlign: 'center', padding: '3rem 2rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 1.5rem' }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isRecording ? '#ef4444' : '#60a5fa',
            transform: isRecording ? `scale(${1 + audioLevel * 0.003})` : 'scale(1)',
            transition: 'transform 0.1s ease',
          }}>
            <Mic size={42} />
          </div>
        </div>

        {/* Real-time audio waveform / level bar */}
        {isRecording && (
          <div style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
            <div style={{ height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${audioLevel}%`,
                backgroundColor: audioLevel > 75 ? '#ef4444' : audioLevel > 30 ? '#10b981' : '#3b82f6',
                transition: 'width 0.1s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Speaking Level: {audioLevel}%
            </div>
          </div>
        )}

        {/* Timer */}
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace', marginBottom: '1.5rem' }}>
          00:{duration < 10 ? `0${duration}` : duration}
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>/ 00:30 max</span>
        </div>

        {/* Recording Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {!isRecording ? (
            <button onClick={startRecording} className="btn btn-primary btn-lg">
              <Mic size={18} />
              <span>Start Recording</span>
            </button>
          ) : (
            <button onClick={stopRecording} className="btn btn-danger btn-lg">
              <Square size={18} />
              <span>Stop Recording</span>
            </button>
          )}

          {audioBlob && !isRecording && (
            <>
              <button onClick={analyzeAudio} className="btn btn-primary btn-lg" disabled={analyzing}>
                <Activity size={18} className={analyzing ? 'animate-spin' : ''} />
                <span>{analyzing ? 'Running PyTorch Model...' : 'Analyze Recording'}</span>
              </button>
              <button onClick={cancelRecording} className="btn btn-secondary btn-lg" disabled={analyzing}>
                <RotateCcw size={18} />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>

        {audioUrl && !isRecording && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <audio controls src={audioUrl} style={{ maxWidth: '400px', width: '100%' }} />
          </div>
        )}
      </Card>

      {/* Analysis Results Display */}
      {result && (
        <Card style={{ borderLeft: `4px solid ${result.result_label === 'SYNTHETIC_SUSPECTED' ? '#ef4444' : result.result_label === 'GENUINE' ? '#10b981' : '#f59e0b'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analysis Result for Event {result.event_id}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                {result.result_label === 'SYNTHETIC_SUSPECTED' && '🚨 Synthetic Voice Clone Suspected'}
                {result.result_label === 'GENUINE' && '✅ Acoustically Genuine Human Speech'}
                {result.result_label === 'INCONCLUSIVE' && '⚠️ Inconclusive Acoustic Features'}
                {result.result_label === 'MODEL_UNAVAILABLE' && 'ℹ️ Inference Model Offline'}
              </div>
            </div>

            <RiskBadge action={result.risk_action} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Synthetic Speech Score</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: (result.synthetic_score ?? 0) > 0.7 ? '#f87171' : '#34d399', marginTop: '0.2rem' }}>
                {result.synthetic_score !== null ? `${(result.synthetic_score * 100).toFixed(1)}%` : 'Offline'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Signal Quality</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: result.audio_quality.status === 'optimal' ? '#34d399' : '#fbbf24', marginTop: '0.2rem' }}>
                {result.audio_quality.status.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SNR: {result.audio_quality.snr_db} dB</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Processing Latency</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.2rem' }}>
                {result.processing_latency_ms} ms
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Duration: {result.audio_duration_seconds}s</div>
            </div>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, color: '#60a5fa', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              Recommended Security Action
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {result.recommended_next_action}
            </div>
          </div>

          {result.reasons && result.reasons.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Forensic Reasoning Codes:
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {result.reasons.map((r, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{r.code}:</strong> {r.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
