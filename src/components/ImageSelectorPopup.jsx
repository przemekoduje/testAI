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

        <h2>Select Image</h2>
        <div className="popup-options">
          <div className="file-upload">
            <label className="custom-file-upload">
              Choose File
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
          <p>- or -</p>
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
