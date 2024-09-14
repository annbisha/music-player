import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isPlaying: false,
  isStopped: true,
  duration: 0,
  track: null,
  playlist: [],
  playlistIndex: 0,
  currentTime: 0,
  volume: 1.0,
  activePlaylist: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    play(state) {
      state.isPlaying = true;
      state.isStopped = false;
    },
    pause(state) {
      state.isPlaying = false;
    },
    stop(state) {
      state.isPlaying = false;
      state.isStopped = true;
      state.currentTime = 0;
    },
    setTrack(state, action) {
      const { track, index } = action.payload;
      state.track = track;
      state.playlistIndex = index;
    },
    setPlaylist(state, action) {
      state.playlist = action.payload;
    },
    setActivePlaylist(state, action) {
      state.activePlaylist = action.payload;
    },

    setCurrentTime(state, action) {
      state.currentTime = action.payload;
    },
    setDuration(state, action) {
      state.duration = action.payload;
    },
    setVolume(state, action) {
      state.volume = action.payload;
    },
    resetPlayer(state) {
      return initialState;
    },
  },
});

export const {
  play,
  pause,
  stop,
  setTrack,
  setPlaylist,
  setActivePlaylist,
  setCurrentTime,
  setVolume,
  setDuration,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
