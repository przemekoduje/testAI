import React, { useState } from "react";
import "./imageSelectorPopup.scss";

const ImageSelectorPopup = ({ onClose, onFileSelect, onUrlSelect }) => {
  const [url, setUrl] = useState("");

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

  return (
    <div className="popup">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Select Image</h2>
        <div className="popup-options">
          <div className="file-upload">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div className="url-upload">
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter image URL"
            />
            <button onClick={handleUrlSubmit}>Submit URL</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSelectorPopup;
