/**
 * Converts any browser AudioBuffer or recorded audio Blob into a canonical
 * 16 kHz 16-bit Mono PCM WAV Blob compatible with soundfile and libsndfile.
 */
export async function convertBlobToCanonicalWav(
  rawBlob: Blob,
  audioContext?: AudioContext
): Promise<Blob> {
  const ctx = audioContext && audioContext.state !== 'closed'
    ? audioContext
    : new (window.AudioContext || (window as any).webkitAudioContext)();

  const arrayBuffer = await rawBlob.arrayBuffer();
  // decodeAudioData decodes WebM, Opus, Ogg, MP3, etc. into raw PCM Float32
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  return encodeAudioBufferToWav(audioBuffer, 16000);
}

export function encodeAudioBufferToWav(buffer: AudioBuffer, targetSampleRate = 16000): Blob {
  const numChannels = 1; // Downmix to Mono for forensic analysis
  const inputSampleRate = buffer.sampleRate;
  const numInputFrames = buffer.length;

  // Extract mono float32 data (average all channels)
  const monoData = new Float32Array(numInputFrames);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const channelData = buffer.getChannelData(c);
    for (let i = 0; i < numInputFrames; i++) {
      monoData[i] += channelData[i] / buffer.numberOfChannels;
    }
  }

  // Resample to targetSampleRate (linear interpolation)
  const resampleRatio = targetSampleRate / inputSampleRate;
  const targetLength = Math.round(numInputFrames * resampleRatio);
  const resampledData = new Float32Array(targetLength);

  for (let i = 0; i < targetLength; i++) {
    const originalPos = i / resampleRatio;
    const idx = Math.floor(originalPos);
    const frac = originalPos - idx;
    const s1 = monoData[idx] ?? 0;
    const s2 = monoData[idx + 1] ?? s1;
    resampledData[i] = s1 + frac * (s2 - s1);
  }

  // Convert float32 [-1.0, 1.0] to 16-bit PCM integer bytes
  const bytesPerSample = 2;
  const dataSize = targetLength * numChannels * bytesPerSample;
  const bufferLength = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Write RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // Write 'fmt ' chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size for PCM
  view.setUint16(20, 1, true);  // AudioFormat 1 = PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, targetSampleRate, true);
  view.setUint32(28, targetSampleRate * numChannels * bytesPerSample, true); // ByteRate
  view.setUint16(32, numChannels * bytesPerSample, true); // BlockAlign
  view.setUint16(34, bytesPerSample * 8, true); // BitsPerSample = 16

  // Write 'data' chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < targetLength; i++) {
    // Clamp sample between -1 and 1
    const s = Math.max(-1, Math.min(1, resampledData[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
