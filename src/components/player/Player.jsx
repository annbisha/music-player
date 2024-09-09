import React, { useEffect, useRef, useState } from "react";
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
import { setDuration } from "../../store/reducers/playerReducer";
import "./Player.css";

const BASE_URL = "http://player.node.ed.asmer.org.ua/";

const Player = () => {
  const dispatch = useDispatch();
  const { isPlaying, duration, track, currentTime, volume } = useSelector(
    (state) => state.player
  );

  const audioRef = useRef(null);
  const [visualCurrentTime, setVisualCurrentTime] = useState(currentTime);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let intervalId;

    if (isPlaying) {
      intervalId = setInterval(() => {
        setVisualCurrentTime((prevTime) => {
          if (prevTime >= duration) {
            dispatch(nextTrackThunk());
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying, duration, dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && track) {
      audio.src = `${BASE_URL}${track.url}`;
      audio.volume = volume;
      audio.currentTime = currentTime;

      const handleLoadedMetadata = () => {
        dispatch(setDuration(audio.duration));
      };

      const handleTimeUpdate = () => {
        setVisualCurrentTime(audio.currentTime);
        dispatch(setCurrentTimeThunk(audio.currentTime));
      };

      const handleEnded = () => {
        dispatch(setCurrentTimeThunk(0));
        dispatch(nextTrackThunk());

        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
          }
        }, 100);
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
      };
    } else if (audio) {
      audio.pause();
      audio.src = "";
    }
  }, [track, dispatch]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      dispatch(setCurrentTimeThunk(seekTime));
    }
    setVisualCurrentTime(seekTime);
  };

  const handleStop = () => {
    dispatch(stopTrack());
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setVisualCurrentTime(0);
    }
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
      <audio ref={audioRef} />
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
          <span>{formatTime(visualCurrentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={visualCurrentTime}
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
