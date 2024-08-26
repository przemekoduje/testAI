import React, { useState } from "react";
import CameraComponent from "./CameraComponent";

const CameraSelectorPopup = ({ onClose, onFileSelect, onUrlSelect, onCameraCapture }) => {
  const [url, setUrl] = useState("");
  const [showCamera, setShowCamera] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
      onClose();
    }
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleUrlSubmit = () => {
    if (url) {
      onUrlSelect(url);
      onClose();
    }
  };

  const handleCameraCapture = (imageSrc) => {
    onCameraCapture(imageSrc);
    onClose();
  };

  return (
    <div className="image-selector-popup">
      {!showCamera ? (
        <>
          <div>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter image URL"
            />
            <button onClick={handleUrlSubmit}>Select from URL</button>
          </div>
          <button onClick={() => setShowCamera(true)}>Use Camera</button>
          <button onClick={onClose}>Close</button>
        </>
      ) : (
        <CameraComponent onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />
      )}
    </div>
  );
};

export default CameraSelectorPopup;
