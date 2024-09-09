import React from "react";
import { useUploadTrackMutation } from "../../services/apiSlice";
import "./UploadButton.css";

const UploadButton = ({ onSuccess }) => {
  const [uploadTrack, { data, error, isLoading }] = useUploadTrackMutation();
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        await uploadTrack(file).unwrap();
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
  };

  return (
    <div className="upload-button-container">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="file-input"
      />
      {isLoading && <p className="uploading">Uploading...</p>}
      {error && <p className="error">Error: {error.message}</p>}
      {data && <p className="success">Track uploaded successfully!</p>}
    </div>
  );
};

export default UploadButton;
