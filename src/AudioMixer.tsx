import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { ModeToggle } from '@/components/ui/mode-toggle';
import { Upload, Play, Pause, Volume2, VolumeX, Loader2, FastForward, Rewind, Music } from 'lucide-react';
import { useAudioStore } from './audioStore';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const VITE_TUNESPLIT_API_URL = import.meta.env.VITE_TUNESPLIT_API_URL;

export default function AudioMixer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [file, setFile] = useState<File>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [masterVolume, setMasterVolume] = useState(100);
  const audioContextRef = useRef<AudioContext>();
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const masterGainNodeRef = useRef<GainNode | null>(null);

  const { songs, addSong, getSong } = useAudioStore();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContextRef.current = new AudioContext();
    masterGainNodeRef.current = audioContextRef.current.createGain();
    masterGainNodeRef.current.connect(audioContextRef.current.destination);
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      if (audioElementsRef.current.length > 0) {
        const currentAudio = audioElementsRef.current[0];
        setCurrentTime(currentAudio.currentTime);
        setDuration(currentAudio.duration);
      }
    };

    const intervalId = setInterval(updateProgress, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // validar file size if size > 10 MB
    if (selectedFile.size > 10000000) {
      alert('El archivo es demasiado grande, por favor selecciona un archivo más pequeño');
      return;
    }
    setFile(selectedFile);
    setIsProcessing(true);
    setProgress(0);
    console.log(file);
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
      const newSong = {
        id: uuidv4(),
        name: selectedFile.name,
        tracks: data.instruments,
      };

      addSong(newSong);
      setCurrentSongId(newSong.id);
      setTracks(newSong.tracks);

      createAudioNodes(newSong.tracks);
      setProgress(100);

    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const createAudioNodes = (songTracks: any[]) => {
    audioElementsRef.current = songTracks.map((instrument: any) => {
      const audio = new Audio(`${VITE_TUNESPLIT_API_URL}${instrument.file}`);
      audio.crossOrigin = "anonymous";
      audio.loop = true;
      return audio;
    });

    gainNodesRef.current = audioElementsRef.current.map(audio => {
      if (!audioContextRef.current || !masterGainNodeRef.current) return null;
      const gainNode = audioContextRef.current.createGain();
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(gainNode).connect(masterGainNodeRef.current);
      return gainNode;
    }).filter(gainNode => gainNode !== null) as GainNode[];
  };

  const togglePlay = async () => {
    if (audioContextRef?.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioElementsRef.current.forEach(audio => audio.pause());
    } else {
      audioElementsRef.current.forEach(audio => audio.play());
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (index: number, value: number[]) => {
    const newTracks = [...tracks];
    newTracks[index].volume = value[0];
    setTracks(newTracks);

    const gainNode = gainNodesRef.current[index];
    if (gainNode) {
      gainNode.gain.setValueAtTime(value[0] / 100, audioContextRef?.current?.currentTime || 0);
    }
  };

  const handleMasterVolumeChange = (value: number[]) => {
    setMasterVolume(value[0]);
    if (masterGainNodeRef.current && audioContextRef.current) {
      masterGainNodeRef.current.gain.setValueAtTime(value[0] / 100, audioContextRef.current.currentTime);
    }
  };

  const loadSong = async (songId: string) => {
    setIsLoading(true);
    setIsPlaying(false);
    audioElementsRef.current.forEach(audio => audio.pause());

    try {
      const song = getSong(songId);
      if (song) {
        setCurrentSongId(songId);
        setTracks(song.tracks);
        await createAudioNodes(song.tracks);
      }
    } catch (error) {
      console.error('Error loading song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    audioElementsRef.current.forEach(audio => {
      audio.currentTime = newTime;
    });
    setCurrentTime(newTime);
  };

  const handleFastForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    audioElementsRef.current.forEach(audio => {
      audio.currentTime = newTime;
    });
    setCurrentTime(newTime);
  };

  const handleRewind = () => {
    const newTime = Math.max(currentTime - 10, 0);
    audioElementsRef.current.forEach(audio => {
      audio.currentTime = newTime;
    });
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground grid grid-cols-[1fr_300px]">
      <div className='flex flex-col'>
        <header className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">TuneSplit</h1>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cargar Archivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-card/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-primary" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">MP3, WAV up to 10MB</p>
                  </div>
                  <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange}/>
                </label>
              </div>
            </CardContent>
          </Card>
          {(isProcessing || isLoading) && (
            <Card className="mb-4 md:mb-6">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isProcessing ? 'Analizando la canción...' : 'Cargando la canción...'}</span>
                </div>
                {isProcessing && <Progress value={progress} className="w-full" />}
              </CardContent>
            </Card>
          )}
          {!isProcessing && !isLoading && tracks.length > 0 && (
            <>
              <Card className="mb-4 md:mb-6">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Reproductor</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center mb-6">
                    <p className="text-muted-foreground">Visualización de forma de onda</p>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-4">
                      <Button onClick={handleRewind} aria-label="Retroceder 10 segundos">
                        <Rewind className="h-4 w-4" />
                      </Button>
                      <Button onClick={togglePlay}>
                        {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      </Button>
                      <Button onClick={handleFastForward} aria-label="Adelantar 10 segundos">
                        <FastForward className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-full flex items-center space-x-2">
                      <span className="text-sm">{formatTime(currentTime)}</span>
                      <Slider
                        value={[currentTime]}
                        max={duration}
                        step={0.1}
                        className="flex-grow"
                        onValueChange={(value) => handleSeek(value)}
                      />
                      <span className="text-sm">{formatTime(duration)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl">Mezclador</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-36 font-semibold">Volumen General</div>
                      <Slider
                        value={[masterVolume]}
                        max={100}
                        step={1}
                        className="flex-grow"
                        onValueChange={handleMasterVolumeChange}
                      />
                      <div className="w-12 text-right">{Math.round(masterVolume)}%</div>
                      <Button variant="ghost" size="icon" onClick={() => handleMasterVolumeChange([0])}>
                        {masterVolume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      </Button>
                    </div>
                    {tracks.map((track, index) => (
                      <div key={track.name} className="flex items-center space-x-4">
                        <div className="w-36 truncate">{track.name}</div>
                        <Slider
                          value={[track.volume]}
                          max={100}
                          step={1}
                          className="flex-grow"
                          onValueChange={(value) => handleVolumeChange(index, value)}
                        />
                        <div className="w-12 text-right">{Math.round(track.volume)}%</div>
                        <Button variant="ghost" size="icon" onClick={() => handleVolumeChange(index, [0])}>
                          {track.volume > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
        <footer>
          <div className="p-4 text-center text-muted-foreground text-sm">
            &copy; 2024 TuneSplit. Todos los derechos reservados.
          </div>
        </footer>
      </div>
      <aside className="bg-muted p-4 overflow-hidden flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Canciones procesadas</h2>
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-4">
            {songs.map((song) => (
              <Button
                key={song.id}
                onClick={() => loadSong(song.id)}
                variant={currentSongId === song.id ? "default" : "outline"}
                className="w-full justify-start"
              >
                <Music className="mr-2 h-4 w-4" />
                {song.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
