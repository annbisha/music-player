import React, { useEffect, useState } from "react";
import {
  useGetTracksQuery,
  usePlaylistUpsertMutation,
} from "../../services/apiSlice";
import "./CreatePlaylist.css";

const CreatePlaylist = ({ isOpen, onClose, onPlaylistCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("new");
  const [page, setPage] = useState(1);

  const {
    data: tracks = [],
    isLoading: isTracksLoading,
    refetch,
  } = useGetTracksQuery({
    searchTerm,
    sortOrder,
    limit: page * 10,
  });

  const [upsertPlaylist, { isLoading, isError, isSuccess }] =
    usePlaylistUpsertMutation();

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, searchTerm, sortOrder, page, refetch]);

  const handleTrackSelect = (track) => {
    setSelectedTrackIds((prevSelected) =>
      prevSelected.includes(track._id)
        ? prevSelected.filter((id) => id !== track._id)
        : [...prevSelected, track._id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const tracksForMutation = selectedTrackIds.map((id) => ({ _id: id }));
      await upsertPlaylist({
        name,
        description,
        tracks: tracksForMutation,
      }).unwrap();
      alert("Playlist created/updated successfully!");
      onClose();
      onPlaylistCreated();
    } catch (error) {
      console.error("Failed to create/update playlist:", error);
    }
  };

  if (!isOpen) return null;

  const filteredTracks = tracks.filter((track) =>
    (track.id3?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Create Playlist</h2>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Playlist Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Description:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <div className="navigation">
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === "new" ? "old" : "new")}
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
            )}{" "}
            <div className="navigation">
              <button
                type="button"
                onClick={() => setPage((prevPage) => prevPage + 1)}
                disabled={isTracksLoading}
              >
                Load More
              </button>
              <button onClick={onClose}>Cancel</button>
            </div>{" "}
            <button type="submit" disabled={isLoading} className="save">
              {isLoading ? "Saving..." : "Save Playlist"}
            </button>
            {isError && <p>Error occurred while saving playlist.</p>}
            {isSuccess && (
              <p className="success">Playlist saved successfully!</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylist;
