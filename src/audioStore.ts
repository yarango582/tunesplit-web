import create from 'zustand';

interface Track {
  name: string;
  volume: number;
  file: string;
}

interface Song {
  id: string;
  name: string;
  tracks: Track[];
}

interface AudioStore {
  songs: Song[];
  addSong: (song: Song) => void;
  getSong: (id: string) => Song | undefined;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  songs: [],
  addSong: (song) => set((state) => ({ songs: [...state.songs, song] })),
  getSong: (id) => get().songs.find((song) => song.id === id),
}));