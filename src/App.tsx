import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Upload, Play, Pause, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { Progress } from "@/components/ui/progress"

const VITE_TUNESPLIT_API_URL = import.meta.env.VITE_TUNESPLIT_API_URL;

export default function AudioMixer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [file, setFile] = useState<File>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext>();
  const audioElementsRef = useRef<any[]>([]);
  const gainNodesRef = useRef<any[]>([]);

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleFileChange = async (event: any) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('audioFile', selectedFile);
      setProgress(10);

      const response = await fetch(`${VITE_TUNESPLIT_API_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      setProgress(80);
      if (!response.ok) {
        throw new Error('Error analyzing file');
      }

      const data = await response.json();
      setTracks(data.instruments);

      // Crear elementos de audio y nodos de ganancia para cada pista
      audioElementsRef.current = data.instruments.map((instrument: any) => {
        const audio = new Audio(`${VITE_TUNESPLIT_API_URL}${instrument.file}`);
        audio.crossOrigin = "anonymous";
        audio.loop = true;
        return audio;
      });

      gainNodesRef.current = audioElementsRef.current.map(audio => {
        if (!audioContextRef.current) return null;
        const gainNode = audioContextRef?.current?.createGain();
        const source = audioContextRef?.current?.createMediaElementSource(audio);
        source.connect(gainNode).connect(audioContextRef.current.destination);
        return gainNode;
      });
      setProgress(100);

    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlay = async () => {
    if (audioContextRef?.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioElementsRef.current.forEach(audio => audio.pause());
    } else {
      audioElementsRef.current.forEach(audio => {
        audio.currentTime = 0;  // Asegura que todas las pistas comiencen desde el mismo punto
        audio.play();
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (index: number, value: any) => {
    const newTracks = [...tracks];
    newTracks[index].volume = value[0];  // Actualiza el volumen para la pista específica
    setTracks(newTracks);

    // Ajustar el volumen del instrumento específico
    const gainNode = gainNodesRef.current[index];
    if (gainNode) {
      gainNode.gain.setValueAtTime(value[0] / 100, audioContextRef?.current?.currentTime);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Mezclador de Audio Inteligente</h1>
      <div className="flex justify-center">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex items-center justify-center w-64 h-32 border-2 border-dashed rounded-lg hover:bg-muted/50">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="flex text-sm text-muted-foreground">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                  <span>Cargar un archivo</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="audio/*" />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                {file ? file.name : 'MP3, WAV hasta 10MB'}
              </p>
            </div>
          </div>
        </label>
      </div>

      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Analizando la canción...</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {!isProcessing && tracks.length > 0 && (
        <>
          <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Visualización de forma de onda</p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </Button>
          </div>

          <div className="space-y-4">
            {
            tracks.map((track, index) => (
              <div key={track.name} className="flex items-center space-x-4">
                <div className="w-36 truncate">{track.name}</div>
                <Slider
                  value={[track.volume]}
                  max={100}
                  step={1}
                  className="flex-grow"
                  onValueChange={(value) => handleVolumeChange(index, value)}
                />
                <div className="w-8 text-right">{Math.round(track.volume)}%</div>
                <Button variant="ghost" size="icon" onClick={() => handleVolumeChange(index, [0])}>
                  {track.volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
