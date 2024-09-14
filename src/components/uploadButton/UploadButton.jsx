import React from "react";
import { useDropzone } from "react-dropzone";
import { useUploadTrackMutation } from "../../services/apiSlice";
import "./UploadButton.css";

const UploadButton = ({ onSuccess }) => {
  const [uploadTrack, { data, error, isLoading }] = useUploadTrackMutation();

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        await uploadTrack(file).unwrap();
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "audio/*",
  });

  return (
    <div className="upload-button-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? "active" : ""}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop track</p> : <p>Upload track</p>}
      </div>
      {isLoading && <p className="uploading">Uploading...</p>}
      {error && <p className="error">Error: {error.message}</p>}
      {data && <p className="success">Track uploaded successfully!</p>}
    </div>
  );
};

export default UploadButton;
