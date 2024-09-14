import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetPlaylistsQuery,
  useGetTracksQuery,
  usePlaylistUpsertMutation,
} from "../../services/apiSlice";
import {
  setTrackThunk,
  setActivePlaylistThunk,
  setPlaylistThunk,
} from "../../store/thunks/playerThunks";
import TrackList from "../../components/trackList/TrackList";
import "./Playlists.css";
import CreatePlaylist from "../../components/createPlaylist/CreatePlaylist";

const Playlists = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("new");
  const [sortOrderTrack, setSortOrderTrack] = useState("new");
  const [playlistSearchTerms, setPlaylistSearchTerms] = useState({});
  const [page, setPage] = useState(0);
  const [playlists, setPlaylists] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTrackModalOpen, setIsAddTrackModalOpen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);
  const [trackSearchTerm, setTrackSearchTerm] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [trackPage, setTrackPage] = useState(1);

  const dispatch = useDispatch();
  const currentTrack = useSelector((state) => state.player.track);
  const activePlaylist = useSelector((state) => state.player.activePlaylist);

  const {
    data: fetchedPlaylists = [],
    error: playlistsError,
    isLoading: playlistsLoading,
    isLoadingTrack: isTracksLoading,
    refetch,
  } = useGetPlaylistsQuery({
    searchTerm,
    sortOrder,
    limit: 10,
    skip: page * 10,
  });

  const { data: tracks = [], refetch: refetchTracks } = useGetTracksQuery({
    searchTerm: trackSearchTerm,
    sortOrder: sortOrderTrack,
    limit: trackPage * 10,
  });

  const [upsertPlaylist] = usePlaylistUpsertMutation();

  const loadInitialPlaylists = useCallback(() => {
    refetch().then(() => {
      if (fetchedPlaylists.length > 0) {
        setPlaylists((prevPlaylists) => {
          const existingIds = new Set(prevPlaylists.map((p) => p._id));
          const uniquePlaylists = fetchedPlaylists.filter(
            (p) => !existingIds.has(p._id)
          );
          setInitialLoadComplete(true);
          return [...prevPlaylists, ...uniquePlaylists];
        });
        setShowLoadMore(true);
      }
    });
  }, [fetchedPlaylists, refetch]);

  useEffect(() => {
    if (initialLoadComplete) {
      refetch().then(() => {
        if (fetchedPlaylists.length > 0) {
          setPlaylists((prevPlaylists) => {
            const existingIds = new Set(prevPlaylists.map((p) => p._id));
            const uniquePlaylists = fetchedPlaylists.filter(
              (p) => !existingIds.has(p._id)
            );
            return [...prevPlaylists, ...uniquePlaylists];
          });
        }
      });
    }
  }, [page, initialLoadComplete, refetch, fetchedPlaylists]);

  useEffect(() => {
    setPlaylists([]);
    setPage(0);
    setInitialLoadComplete(false);
    setShowLoadMore(false);
  }, [searchTerm, sortOrder]);

  const loadMorePlaylists = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openAddTrackModal = (playlist) => {
    setSelectedPlaylist(playlist);
    setIsAddTrackModalOpen(true);
    setTrackPage(1);
    refetchTracks().then(() => {
      console.log("Tracks fetched:", tracks);
    });
  };
  const loadMoreTracks = () => {
    setTrackPage((prevPage) => {
      const newPage = prevPage + 1;
      refetchTracks({ limit: newPage * 10 });
      return newPage;
    });
  };

  const closeAddTrackModal = () => {
    setIsAddTrackModalOpen(false);
    setSelectedPlaylist(null);
    setSelectedTrackIds([]);
  };

  const handlePlaylistClick = (playlist) => {
    dispatch(setPlaylistThunk([]));
    dispatch(setTrackThunk(0));
    dispatch(setActivePlaylistThunk(playlist));
    if (playlist.tracks.length > 0) {
      dispatch(setPlaylistThunk(playlist.tracks));
      dispatch(setTrackThunk({ track: playlist.tracks[0], index: 0 }));
    }
  };
  useEffect(() => {
    if (activePlaylist) {
      dispatch(setPlaylistThunk(activePlaylist.tracks));
    }
  }, [activePlaylist, dispatch]);
  const handlePlay = (track, index) => {
    const trackIndex = activePlaylist.tracks.findIndex(
      (t) => t._id === track._id
    );
    dispatch(setTrackThunk({ track, index: trackIndex }));
  };

  const handlePlaylistSearch = (playlistId, searchTerm) => {
    setPlaylistSearchTerms((prev) => ({ ...prev, [playlistId]: searchTerm }));
  };

  const handleSortOrderChange = () => {
    setSortOrder((prevOrder) => (prevOrder === "new" ? "old" : "new"));
  };
  const handleSortOrderTrackChange = () => {
    setSortOrderTrack((prevOrder) => (prevOrder === "new" ? "old" : "new"));
  };

  const handleTrackSelect = (track) => {
    setSelectedTrackIds((prevSelected) =>
      prevSelected.includes(track._id)
        ? prevSelected.filter((id) => id !== track._id)
        : [...prevSelected, track._id]
    );
  };

  const handleAddTracksToPlaylist = async () => {
    if (!selectedPlaylist) return;

    try {
      const existingPlaylist = playlists.find(
        (p) => p._id === selectedPlaylist._id
      );
      const existingTrackIds =
        existingPlaylist?.tracks.map((track) => track._id) || [];

      const updatedTrackIds = [
        ...new Set([...existingTrackIds, ...selectedTrackIds]),
      ];

      await upsertPlaylist({
        _id: selectedPlaylist._id,
        tracks: updatedTrackIds.map((id) => ({ _id: id })),
      }).unwrap();

      alert("Tracks added to playlist successfully!");
      closeAddTrackModal();
      loadInitialPlaylists();
    } catch (error) {
      console.error("Failed to add tracks to playlist:", error);
    }
  };

  if (playlistsLoading && !initialLoadComplete) {
    return <p className="loading">Loading playlists...</p>;
  }

  if (playlistsError) {
    return (
      <p className="error">
        Error fetching playlists: {playlistsError.message}
      </p>
    );
  }
  const handleReorder = (reorderedTracks) => {
    setSelectedTrackIds(reorderedTracks);
  };

  const sortedPlaylists = playlists.slice().sort((a, b) => {
    if (sortOrder === "new") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  const filteredPlaylists = sortedPlaylists.filter((playlist) => {
    const name = playlist.name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const filteredTracks = tracks.filter((track) =>
    (track.id3?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="playlists">
      <div className="playlists-controls">
        <button onClick={openCreateModal}>Create Playlist</button>
        <input
          type="text"
          placeholder="Search by playlist name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value || "")}
        />
        <button onClick={handleSortOrderChange}>
          Sort by name {sortOrder === "new" ? "Oldest" : "Newest"}
        </button>
      </div>
      {activePlaylist && (
        <div className="active-playlist">
          <h2 className="active-title">Now Playing</h2>
          <h2>{activePlaylist.name || "Unnamed Playlist"}</h2>
          <p>{activePlaylist.description || "No description"}</p>{" "}
          <button onClick={() => openAddTrackModal(activePlaylist)}>
            Add Track
          </button>
          <TrackList
            tracks={activePlaylist.tracks || []}
            currentTrack={currentTrack}
            onPlay={handlePlay}
            searchTerm={playlistSearchTerms[activePlaylist._id] || ""}
            onSearch={(term) => handlePlaylistSearch(activePlaylist._id, term)}
            sortOrder="none"
            onSort={() => {}}
            onReorder={handleReorder}
          />
        </div>
      )}
      {filteredPlaylists.length === 0 ? (
        <p>Please Load</p>
      ) : (
        filteredPlaylists.map((playlist) => (
          <div
            key={playlist._id}
            className={`playlist-item ${
              activePlaylist?._id === playlist._id ? "active" : ""
            }`}
          >
            <h2>{playlist.name || "Unnamed Playlist"}</h2>
            <p>{playlist.description || "No description"}</p>
            <button onClick={() => handlePlaylistClick(playlist)}>Play</button>
            <button onClick={() => openAddTrackModal(playlist)}>
              Add Track
            </button>
          </div>
        ))
      )}
      {!initialLoadComplete ? (
        <button onClick={loadInitialPlaylists} className="load-initial">
          Load Playlists
        </button>
      ) : (
        showLoadMore && (
          <button onClick={loadMorePlaylists} className="load-more">
            Load More
          </button>
        )
      )}
      {isCreateModalOpen && (
        <CreatePlaylist
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onPlaylistCreated={loadInitialPlaylists}
        />
      )}
      {isAddTrackModalOpen && (
        <div className="add-track-modal">
          <div className="modal-content">
            {" "}
            <button className="modal-close" onClick={closeAddTrackModal}>
              ×
            </button>
            <h2>Add Tracks to Playlist</h2>
            <div className="navigation">
              <input
                type="text"
                placeholder="Search for tracks..."
                value={trackSearchTerm}
                onChange={(e) => setTrackSearchTerm(e.target.value || "")}
              />
              <button
                type="button"
                onClick={() =>
                  handleSortOrderTrackChange(
                    sortOrder === "new" ? "old" : "new"
                  )
                }
              >
                Sort by {sortOrder === "new" ? "Oldest" : "Newest"}
              </button>
            </div>
            <div className="track-list track-list-modal">
              <h3>Select Tracks</h3>
              {isTracksLoading ? (
                <p>Loading tracks...</p>
              ) : (
                filteredTracks.map((track) => (
                  <div
                    key={track._id}
                    className={`track-item ${
                      selectedTrackIds.includes(track._id) ? "selected" : ""
                    }`}
                    onClick={() => handleTrackSelect(track)}
                  >
                    <p>
                      <strong>Artist:</strong> {track.id3?.artist || "Unknown"}
                    </p>
                    <p>
                      <strong>Title:</strong> {track.id3?.title || "Unknown"}
                    </p>
                    <p>
                      <strong>Year:</strong> {track.id3?.year || "Unknown"}
                    </p>
                  </div>
                ))
              )}
              <button
                type="button"
                onClick={loadMoreTracks}
                disabled={isTracksLoading}
              >
                Load More Tracks
              </button>
            </div>
            <div className="navigation">
              <button onClick={handleAddTracksToPlaylist}>
                Add Selected Tracks
              </button>
              <button onClick={closeAddTrackModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Playlists;
