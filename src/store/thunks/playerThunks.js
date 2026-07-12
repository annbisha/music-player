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

const audio = new Audio();

const getTrackUrl = (track) => track?.url || "";

const getAbsoluteTrackUrl = (trackUrl) =>
  new URL(trackUrl, window.location.origin).href;

const handleTrackEnd = (dispatch, getState) => {
  const { playlist, playlistIndex } = getState().player;

  if (!playlist?.length) {
    return;
  }

  const nextIndex = (playlistIndex + 1) % playlist.length;
  const nextTrack = playlist[nextIndex];

  dispatch(
    setTrackThunk({
      track: nextTrack,
      index: nextIndex,
    })
  );
};

export const playTrack = () => async (dispatch, getState) => {
  const { track, currentTime, volume } = getState().player;
  const trackUrl = getTrackUrl(track);

  if (!trackUrl) {
    return;
  }

  const absoluteTrackUrl = getAbsoluteTrackUrl(trackUrl);

  if (audio.src !== absoluteTrackUrl) {
    audio.src = trackUrl;
    audio.load();
  }

  audio.currentTime = currentTime || 0;
  audio.volume = volume ?? 1;

  audio.ontimeupdate = () => {
    dispatch(setCurrentTime(audio.currentTime || 0));
  };

  audio.onended = () => {
    handleTrackEnd(dispatch, getState);
  };

  try {
    await audio.play();
    dispatch(play());
  } catch (error) {
    console.error("Playback error:", error);
  }
};

export const pauseTrack = () => (dispatch) => {
  audio.pause();

  dispatch(setCurrentTime(audio.currentTime || 0));
  dispatch(pause());
};

export const stopTrack = () => (dispatch) => {
  audio.pause();
  audio.currentTime = 0;

  dispatch(setCurrentTime(0));
  dispatch(stop());
};

export const setTrackThunk =
  ({ track, index }) =>
  (dispatch) => {
    const trackUrl = getTrackUrl(track);

    if (!trackUrl) {
      return;
    }

    audio.pause();
    audio.src = trackUrl;
    audio.currentTime = 0;
    audio.load();

    dispatch(setCurrentTime(0));
    dispatch(setTrack({ track, index }));

    audio.onerror = () => {
      console.error("Track could not be loaded:", trackUrl);
      dispatch(stopTrack());
    };

    audio.onloadedmetadata = () => {
      const trackDuration = Number.isFinite(audio.duration)
        ? audio.duration
        : 0;

      dispatch(setDuration(trackDuration));
      dispatch(playTrack());
    };

    audio.ontimeupdate = () => {
      dispatch(setCurrentTime(audio.currentTime || 0));
    };
  };

export const changeTrack = (index) => (dispatch, getState) => {
  const { playlist } = getState().player;

  if (!playlist?.length || !playlist[index]) {
    return;
  }

  dispatch(
    setTrackThunk({
      track: playlist[index],
      index,
    })
  );
};

export const setPlaylistThunk = (tracks) => (dispatch) => {
  dispatch(setPlaylist(tracks || []));
};

export const nextTrackThunk = () => (dispatch, getState) => {
  const { playlist, playlistIndex } = getState().player;

  if (!playlist?.length) {
    return;
  }

  const nextIndex = (playlistIndex + 1) % playlist.length;
  const nextTrack = playlist[nextIndex];

  dispatch(
    setTrackThunk({
      track: nextTrack,
      index: nextIndex,
    })
  );
};

export const prevTrackThunk = () => (dispatch, getState) => {
  const { playlist, playlistIndex } = getState().player;

  if (!playlist?.length) {
    return;
  }

  const prevIndex = (playlistIndex - 1 + playlist.length) % playlist.length;
  const previousTrack = playlist[prevIndex];

  dispatch(
    setTrackThunk({
      track: previousTrack,
      index: prevIndex,
    })
  );
};

export const setCurrentTimeThunk = (time) => (dispatch) => {
  const safeTime = Number.isFinite(time) ? time : 0;

  if (audio.src && Number.isFinite(audio.duration)) {
    audio.currentTime = Math.min(safeTime, audio.duration);
  }

  dispatch(setCurrentTime(safeTime));
};

export const setVolumeThunk = (volume) => (dispatch) => {
  const safeVolume = Math.min(1, Math.max(0, Number(volume)));

  audio.volume = safeVolume;
  dispatch(setVolume(safeVolume));
};

export const setActivePlaylistThunk = (playlist) => (dispatch) => {
  dispatch(setActivePlaylist(playlist));
};
