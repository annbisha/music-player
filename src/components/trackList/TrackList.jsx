import React, { useState } from "react";
import "./TrackList.css";

const TrackList = ({
  tracks,
  currentTrack,
  onPlay,
  searchTerm,
  onSearch,
  sortOrder,
  onSort,
  onReorder,
}) => {
  const [draggedTrackIndex, setDraggedTrackIndex] = useState(null);

  const filteredTracks = tracks.filter((track) => {
    const title = track.id3?.title || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDragStart = (index) => {
    setDraggedTrackIndex(index);
  };

  const handleDrop = (index) => {
    const updatedTracks = [...filteredTracks];
    const [removedTrack] = updatedTracks.splice(draggedTrackIndex, 1);
    updatedTracks.splice(index, 0, removedTrack);
    onReorder(updatedTracks);
    setDraggedTrackIndex(null);
  };

  return (
    <div className="track-list">
      <div className="navigation">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
        />
        {sortOrder !== "none" && (
          <button className="sort-button" onClick={onSort}>
            Sort by {sortOrder === "new" ? "Oldest" : "Newest"}
          </button>
        )}
      </div>
      {filteredTracks.length > 0 ? (
        filteredTracks.map((track, index) => (
          <div
            key={track._id}
            className={`track-item ${
              track._id === currentTrack?._id ? "active" : ""
            }`}
            onClick={() => onPlay(track, index)}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(index)}
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
            {track._id === currentTrack?._id && (
              <p className="now-playing">Now Playing</p>
            )}
          </div>
        ))
      ) : (
        <p>No tracks available.</p>
      )}
    </div>
  );
};

export default TrackList;
