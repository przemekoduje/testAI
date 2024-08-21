import React, { useState } from "react";
import "./cameraCapture.scss";
import CameraSelectorPopup from "../../components/CameraSelectorPopup";
import model from "../../lib/gemini";
import { ClipLoader } from "react-spinners";
import { franc } from 'franc'; // Importowanie franc do detekcji języka

const CameraCapture = () => {
  const [result, setResult] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleFileSelect = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSelect = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        setImageSrc(reader.result); // Obraz w formacie Base64
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Failed to fetch the image from URL", error);
    }
  };

  const handleCameraCapture = (imageSrc) => {
    setImageSrc(imageSrc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageSrc) {
      setLoading(true);

      // Wykrywanie języka zapytania
      const detectedLanguage = franc(prompt);

      const imagePart = {
        inlineData: {
          data: imageSrc.split(",")[1], // Pobierz tylko dane Base64, bez prefiksu
          mimeType: "image/jpeg",
        },
      };

      const languageAwarePrompt = `${prompt} (Odpowiedź w języku: ${detectedLanguage})`;

      try {
        const result = await model.generateContent([languageAwarePrompt, imagePart]);
        const responseText = await result.response.text();
        setResult(responseText);
      } catch (error) {
        console.error("Error generating content:", error);
      }

      setPrompt("");
      setLoading(false);
    }
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="imagetotext">
      <form onSubmit={handleSubmit}>
        <input
          className="promptInput"
          type="text"
          value={prompt}
          onChange={handleInputChange}
          placeholder="Enter your prompt here"
        />
        <div className="fileInputWrapper">
          <button type="button" onClick={openPopup}>
            Choose Image
          </button>
        </div>
        <button type="submit" className="button1">
          Generate
        </button>
      </form>
      <div className="field">
        <div className="image-preview">
          {imageSrc && <img src={imageSrc} alt="Selected" />}
        </div>
        <div className="result">
          {loading ? (
            <div className={`loader ${loading ? "active" : ""}`}>
              <ClipLoader color="#36d7b7" />
            </div>
          ) : (
            result && <p>{result}</p>
          )}
        </div>
      </div>
      {isPopupOpen && (
        <CameraSelectorPopup
          onClose={closePopup}
          onFileSelect={handleFileSelect}
          onUrlSelect={handleUrlSelect}
          onCameraCapture={handleCameraCapture}
        />
      )}
    </div>
  );
};

export default CameraCapture;
