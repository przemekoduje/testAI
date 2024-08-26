import React, { useState } from "react";
import "./imageToText.scss";
import ImageSelectorPopup from "../components/ImageSelectorPopup";
import model from "../lib/gemini";
import { ClipLoader } from "react-spinners";
import { franc } from "franc"; // Importowanie franc do detekcji języka
import Drawer from "../components/drawe/Drawer";
// import DifferenceDisplay from "../components/DiffMatchPatch/DiffMatchPatch";

const ImageToText = () => {
  const [result, setResult] = useState("");
  const [imageSrc, setImageSrc] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);

  const [currentResult, setCurrentResult] = useState("");
  const [previousResult, setPreviousResult] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prompt || !imageSrc) return;

    setLoading(true);

    // Wykrywanie języka zapytania
    const detectedLanguage = franc(prompt);

    const imagePart = {
      inlineData: {
        data: imageSrc.split(",")[1], // Pobierz tylko dane Base64, bez prefiksu
        mimeType: "image/jpeg",
      },
    };

    // Tworzenie historii konwersacji
    const conversationHistory = promptHistory
      .map((item) => `User: ${item.prompt}\n AI: ${item.result}\n`)
      .join("\n");

    console.log(conversationHistory);

    const fullPrompt = `(Odpowiedź w języku: ${detectedLanguage}) ${conversationHistory}\nUser: ${prompt}\n(Please format the response using HTML tags such as <h1>, <h2>, <p>, <blockquote>, <a>, etc.) `;

    try {
      const result = await model.generateContent([fullPrompt, imagePart]);

      const responseText = await result.response.text();
      setResult(responseText);

      // Dodajemy prompt i result do historii
      setPromptHistory((prevHistory) => [
        ...prevHistory,
        { prompt, result: responseText, previousResult, currentResult },
      ]);

      console.log(promptHistory);

      // setPreviousResult(currentResult); // Zapisz poprzedni wynik
      setCurrentResult(responseText); // Ustaw aktualny wynik

    } catch (error) {
      console.error("Error generating content:", error);
    }

    setPrompt("");
    setLoading(false);
  };

  console.log(previousResult);
  console.log(currentResult);

  const handleRemovePrompt = (indexToRemove) => {
    setPromptHistory((prevHistory) =>
      prevHistory.filter((_, index) => index !== indexToRemove)
    );
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setResult("");
  };

  return (
    <div className="imagetotext">
      <form onSubmit={handleSubmit}>
        <textarea
          className="promptInput"
          type="text"
          value={prompt}
          onChange={handleInputChange}
          placeholder="Enter your prompt here"
          rows="3"
        />
        <div className="buttons">
          <div className="fileInputWrapper">
            <button type="button" onClick={openPopup}>
              Choose Image
            </button>
          </div>
          <button type="submit" className="button1">
            Generate
          </button>
        </div>
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
            currentResult && (
              <div dangerouslySetInnerHTML={{ __html: currentResult }} />
            )
          )}
        </div>
      </div>
      {isPopupOpen && (
        <ImageSelectorPopup
          onClose={closePopup}
          onFileSelect={handleFileSelect}
          onUrlSelect={handleUrlSelect}
        />
      )}
      {currentResult && (
        <Drawer
        promptHistory={promptHistory}
        setCurrentResult={setCurrentResult}
        setPreviousResult={setPreviousResult} // Przekazujemy funkcję do Drawer
        currentResult={currentResult} // Przekazujemy aktualny wynik do Drawer
        handleRemovePrompt={handleRemovePrompt}
        />
      )}

      {/* {previousResult && currentResult && (
        <DifferenceDisplay 
        oldText={previousResult} newText={currentResult} 
        />
      )} */}
    </div>
  );
};

export default ImageToText;
