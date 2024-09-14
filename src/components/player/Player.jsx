import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playTrack,
  pauseTrack,
  stopTrack,
  nextTrackThunk,
  prevTrackThunk,
  setCurrentTimeThunk,
  setVolumeThunk,
} from "../../store/thunks/playerThunks";
import "./Player.css";

const Player = () => {
  const dispatch = useDispatch();
  const { isPlaying, duration, track, currentTime, volume } = useSelector(
    (state) => state.player
  );

  const handlePlayPause = () => {
    if (isPlaying) {
      dispatch(pauseTrack());
    } else {
      dispatch(playTrack());
    }
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    dispatch(setVolumeThunk(newVolume));
  };

  const handleSeek = (event) => {
    const seekTime = parseFloat(event.target.value);
    dispatch(setCurrentTimeThunk(seekTime));
  };

  const handleStop = () => {
    dispatch(stopTrack());
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleNextTrack = () => {
    dispatch(nextTrackThunk());
  };

  const handlePrevTrack = () => {
    dispatch(prevTrackThunk());
  };

  return (
    <div className="player">
      <div className="player-controls">
        <button className="control-button" onClick={handlePrevTrack}>
          &#9664;
        </button>
        <button className="control-button" onClick={handlePlayPause}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button className="control-button" onClick={handleStop}>
          Stop
        </button>
        <button className="control-button" onClick={handleNextTrack}>
          &#9654;
        </button>
      </div>
      <div className="track-info">
        <p>{track?.id3?.title || "Hm.."}</p>
        <div className="time-controls">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="seek-slider"
          />
          <span>{formatTime(duration)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
        />
      </div>
    </div>
  );
};

export default Player;
