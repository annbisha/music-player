import React, { useEffect, useState, useCallback } from "react";
import UploadButton from "../../components/uploadButton/UploadButton";
import TrackList from "../../components/trackList/TrackList";
import { useDispatch, useSelector } from "react-redux";
import { useGetTracksQuery } from "../../services/apiSlice";
import {
  setPlaylistThunk,
  setTrackThunk,
} from "../../store/thunks/playerThunks";
import "./Home.css";

const Home = () => {
  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.player.track);
  const playlist = useSelector((state) => state.player.playlist);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("new");
  const [page, setPage] = useState(0);
  const [tracks, setTracks] = useState([]);

  const {
    data = [],
    error,
    isLoading,
    refetch,
  } = useGetTracksQuery({
    searchTerm,
    sortOrder,
    limit: 10,
    skip: page * 10,
  });

  useEffect(() => {
    if (page === 0) {
      setTracks(data);
    } else if (data.length > 0) {
      setTracks((prevTracks) => [
        ...prevTracks.filter((track) => !data.some((t) => t._id === track._id)),
        ...data,
      ]);
    }
  }, [data, page]);

  useEffect(() => {
    if (tracks.length > 0) {
      dispatch(setPlaylistThunk(tracks));
    }
  }, [tracks, dispatch]);

  const loadMoreTracks = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  const handleSortChange = useCallback(() => {
    setSortOrder((prevSortOrder) => (prevSortOrder === "new" ? "old" : "new"));
    setPage(0);
  }, []);

  const handlePlay = (track) => {
    const trackIndex = playlist.findIndex((t) => t._id === track._id);
    dispatch(setTrackThunk({ track, index: trackIndex }));
  };

  const handleRefetch = async () => {
    try {
      await refetch();
      dispatch(setPlaylistThunk(tracks));
    } catch (error) {
      console.error("Refetch error:", error);
    }
  };

  if (isLoading && page === 0) {
    return <p className="loading">Loading tracks...</p>;
  }

  if (error) {
    return <p className="error">Error fetching tracks: {error.message}</p>;
  }
  const handleReorder = (reorderedTracks) => {
    setTracks(reorderedTracks);
  };

  return (
    <div className="home">
      <div className="upload-button-container">
        <UploadButton onSuccess={handleRefetch} />
      </div>

      <div className="track-list-container">
        <TrackList
          tracks={tracks}
          currentTrack={currentTrack}
          onPlay={handlePlay}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          sortOrder={sortOrder}
          onSort={handleSortChange}
          onReorder={handleReorder}
        />
      </div>
      <button
        onClick={loadMoreTracks}
        disabled={isLoading}
        className="load-more-button"
      >
        {isLoading ? "Loading..." : "Load More Tracks"}
      </button>
    </div>
  );
};

export default Home;
