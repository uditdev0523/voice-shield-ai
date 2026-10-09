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
  Lock,
  Radio,
} from 'lucide-react';
import { api } from '../services/api';
import { DetectionResult } from '../services/types';
import { Card } from '../components/ui/Card';
import { RiskBadge } from '../components/ui/StatCard';
import { convertBlobToCanonicalWav } from '../utils/wavEncoder';

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setAudioLevel(0);
        try {
          const rawBlob = new Blob(audioChunksRef.current);
          const wavBlob = await convertBlobToCanonicalWav(rawBlob);
          setAudioBlob(wavBlob);
          setAudioUrl(URL.createObjectURL(wavBlob));
        } catch (err: any) {
          console.warn('WAV conversion fallback:', err);
          const rawBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setAudioBlob(rawBlob);
          setAudioUrl(URL.createObjectURL(rawBlob));
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

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
    <div style={{ padding: '2.25rem 2rem', maxWidth: '1080px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.2rem 0.65rem',
          borderRadius: '999px',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#a5b4fc',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.5rem',
        }}>
          <Radio size={12} color="#818cf8" />
          Real-Time Acoustic Ingestion
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.025em' }}>
          Live Microphone Voice Forensics
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.35rem' }}>
          Record ephemeral voice samples directly in your browser. All audio buffers are discarded immediately following acoustic inference.
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          color: '#fb7185',
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
      <Card style={{ textAlign: 'center', padding: '3.5rem 2rem', marginBottom: '2rem', position: 'relative' }}>
        {/* Glow backdrop behind recording ring */}
        <div style={{
          position: 'relative',
          width: 110,
          height: 110,
          margin: '0 auto 1.5rem',
        }}>
          <div style={{
            position: 'absolute',
            inset: -12,
            borderRadius: '50%',
            background: isRecording
              ? 'radial-gradient(circle, rgba(244, 63, 94, 0.35) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
            filter: 'blur(10px)',
            transition: 'all 0.3s ease',
          }} />
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: isRecording ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.12)',
            border: isRecording ? '2px solid rgba(244, 63, 94, 0.6)' : '2px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isRecording ? '#fb7185' : 'var(--color-primary-light)',
            transform: isRecording ? `scale(${1 + audioLevel * 0.0035})` : 'scale(1)',
            transition: 'transform 0.08s ease',
            boxShadow: isRecording ? '0 0 24px rgba(244, 63, 94, 0.3)' : '0 0 20px rgba(99, 102, 241, 0.2)',
          }}>
            <Mic size={44} />
          </div>
        </div>

        {/* Real-time audio waveform / level bar */}
        {isRecording && (
          <div style={{ maxWidth: '320px', margin: '0 auto 1.5rem' }}>
            <div style={{
              height: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '999px',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                height: '100%',
                width: `${audioLevel}%`,
                background: audioLevel > 75
                  ? 'linear-gradient(90deg, #f59e0b, #f43f5e)'
                  : 'linear-gradient(90deg, #6366f1, #06b6d4)',
                borderRadius: '999px',
                transition: 'width 0.08s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontFamily: 'JetBrains Mono, monospace' }}>
              Acoustic Intensity: {audioLevel}%
            </div>
          </div>
        )}

        {/* Timer */}
        <div style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
        }}>
          00:{duration < 10 ? `0${duration}` : duration}
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem', fontWeight: 500 }}>/ 00:30 MAX</span>
        </div>

        {/* Recording Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {!isRecording ? (
            <button onClick={startRecording} className="btn btn-primary btn-lg">
              <Mic size={18} />
              <span>Capture Live Voice</span>
            </button>
          ) : (
            <button onClick={stopRecording} className="btn btn-danger btn-lg">
              <Square size={18} />
              <span>Halt Recording</span>
            </button>
          )}

          {audioBlob && !isRecording && (
            <>
              <button onClick={analyzeAudio} className="btn btn-primary btn-lg" disabled={analyzing}>
                <Activity size={18} className={analyzing ? 'animate-spin' : ''} />
                <span>{analyzing ? 'Evaluating Acoustic Spectrogram...' : 'Run Neural Analysis'}</span>
              </button>
              <button onClick={cancelRecording} className="btn btn-secondary btn-lg" disabled={analyzing}>
                <RotateCcw size={18} />
                <span>Reset Capture</span>
              </button>
            </>
          )}
        </div>

        {audioUrl && !isRecording && (
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
            <audio controls src={audioUrl} style={{ maxWidth: '420px', width: '100%', filter: 'invert(0.9) hue-rotate(180deg)' }} />
          </div>
        )}
      </Card>

      {/* Analysis Results Display */}
      {result && (
        <Card style={{
          borderLeft: `4px solid ${
            result.result_label === 'SYNTHETIC_SUSPECTED'
              ? '#f43f5e'
              : result.result_label === 'GENUINE'
              ? '#10b981'
              : '#f59e0b'
          }`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                TELEMETRY EVENT: {result.event_id}
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                {result.result_label === 'SYNTHETIC_SUSPECTED' && '🚨 Voice Clone Artifacts Suspected'}
                {result.result_label === 'GENUINE' && '✅ Biometrically Natural Speech Cleared'}
                {result.result_label === 'INCONCLUSIVE' && '⚠️ Inconclusive Acoustic Features'}
                {result.result_label === 'MODEL_UNAVAILABLE' && 'ℹ️ Neural Model Offline'}
              </div>
            </div>

            <RiskBadge action={result.risk_action} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Synthetic Score</div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: (result.synthetic_score ?? 0) > 0.7 ? '#fb7185' : (result.synthetic_score ?? 0) > 0.35 ? '#fbbf24' : '#34d399',
                marginTop: '0.2rem',
              }}>
                {result.synthetic_score !== null ? `${(result.synthetic_score * 100).toFixed(1)}%` : 'OFFLINE'}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Channel SNR</div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: result.audio_quality.status === 'optimal' ? '#34d399' : '#fbbf24',
                marginTop: '0.2rem',
              }}>
                {result.audio_quality.status.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
                SNR: {result.audio_quality.snr_db} dB
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pipeline Latency</div>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                color: 'var(--color-primary-light)',
                marginTop: '0.2rem',
              }}>
                {result.processing_latency_ms} ms
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
                Duration: {result.audio_duration_seconds}s
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.08) 0%, rgba(13, 17, 26, 0.6) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '1.1rem',
            marginBottom: '1rem',
          }}>
            <div style={{ fontWeight: 700, color: '#a5b4fc', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
              Mandated Security Directive
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {result.recommended_next_action}
            </div>
          </div>

          {result.reasons && result.reasons.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 700, textTransform: 'uppercase' }}>
                Forensic Reasoning Codes:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {result.reasons.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.825rem',
                    }}
                  >
                    <strong style={{ color: 'var(--color-primary-light)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {r.code}:
                    </strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{r.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
