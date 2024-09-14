import {
  play,
  pause,
  stop,
  setTrack,
  setCurrentTime,
  setDuration,
  setPlaylist,
  setVolume,
  setActivePlaylist,
} from "../reducers/playerReducer";

const BASE_URL = "http://player.node.ed.asmer.org.ua/";
const audio = new Audio();

const handleTrackEnd = (dispatch, getState) => {
  const { playlist, playlistIndex } = getState().player;
  if (playlist.length > 0) {
    const nextIndex = (playlistIndex + 1) % playlist.length;
    const nextTrack = playlist[nextIndex];
    dispatch(setTrackThunk({ track: nextTrack, index: nextIndex }));
  }
};

export const playTrack = () => (dispatch, getState) => {
  const { track, currentTime, volume } = getState().player;

  if (track) {
    if (audio.src !== `${BASE_URL}${track.url}`) {
      audio.src = `${BASE_URL}${track.url}`;
      audio.load();
    }
    audio.currentTime = currentTime;
    audio.volume = volume;
    audio
      .play()
      .then(() => {
        dispatch(play());
        audio.ontimeupdate = () => {
          dispatch(setCurrentTime(audio.currentTime));
        };
        audio.onended = () => {
          handleTrackEnd(dispatch, getState);
        };
      })
      .catch((error) => console.error("Playback error:", error));
  }
};

export const pauseTrack = () => (dispatch) => {
  dispatch(setCurrentTime(audio.currentTime));
  audio.pause();
  dispatch(pause());
};

export const stopTrack = () => (dispatch) => {
  audio.pause();
  audio.src = "";
  audio.currentTime = 0;
  dispatch(stop());
};

export const setTrackThunk =
  ({ track, index }) =>
  (dispatch, getState) => {
    const { playlist } = getState().player;

    if (playlist && playlist.length > 0) {
      dispatch(setCurrentTime(0));
      dispatch(setTrack({ track, index }));

      const tempAudio = new Audio(`${BASE_URL}${track.url}`);
      tempAudio.onerror = () => {
        dispatch(stopTrack());
        alert("Track not working");
      };

      tempAudio.onloadedmetadata = () => {
        dispatch(setDuration(tempAudio.duration));
        dispatch(playTrack());
      };
    }
  };

export const changeTrack = (index) => (dispatch, getState) => {
  const { playlist } = getState().player;
  if (playlist && playlist[index]) {
    const track = playlist[index];
    dispatch(setTrackThunk({ track, index }));
  }
};

export const setPlaylistThunk = (tracks) => (dispatch) => {
  dispatch(setPlaylist([]));
  dispatch(setPlaylist(tracks));
};

export const nextTrackThunk = () => (dispatch, getState) => {
  const { playlist, playlistIndex } = getState().player;
  if (playlist.length > 0) {
    const newIndex = (playlistIndex + 1) % playlist.length;
    const nextTrack = playlist[newIndex];
    dispatch(setTrackThunk({ track: nextTrack, index: newIndex }));
  }
};

export const prevTrackThunk = () => (dispatch, getState) => {
  const { playlist, playlistIndex } = getState().player;
  if (playlist.length > 0) {
    const newIndex = (playlistIndex - 1 + playlist.length) % playlist.length;
    const prevTrack = playlist[newIndex];
    dispatch(setTrackThunk({ track: prevTrack, index: newIndex }));
  }
};

export const setCurrentTimeThunk = (time) => (dispatch) => {
  audio.currentTime = time;
  dispatch(setCurrentTime(time));
};

export const setVolumeThunk = (volume) => (dispatch) => {
  audio.volume = volume;
  dispatch(setVolume(volume));
};

export const setActivePlaylistThunk = (playlist) => (dispatch) => {
  dispatch(setActivePlaylist(playlist));
};
