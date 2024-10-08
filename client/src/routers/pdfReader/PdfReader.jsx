import React, { useState, useEffect } from "react";
import "./pdfReader.scss";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { ClipLoader } from "react-spinners";

const PdfReader = () => {
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [fileUris, setFileUris] = useState([]);
  const [summary, setSummary] = useState("");
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [suggestions, setSuggestions] = useState([]); // Sugestie dla użytkownika
  const [panelVisible, setPanelVisible] = useState(false); // Zarządzanie widocznością panelu

  const [loading, setLoading] = useState(false); // Stan do zarządzania widocznością paska postępu
  const [progress, setProgress] = useState(0); // Stan do animacji paska postępu
  const [loadingSummary, setLoadingSummary] = useState(false); // Stan ładowania wiadomości
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isGeneratedResponse, setIsGeneratedResponse] = useState(false);

  // Ukryty input dla pliku PDF, wywoływany przez przycisk "Upload PDFs"
  const hiddenFileInput = React.useRef(null);

  // Funkcja do obsługi wyboru pliku
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    handleUpload(selectedFiles); // Automatycznie uploaduj plik
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  // Automatyczne uploadowanie plików
  const handleUpload = async (selectedFiles) => {
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    setLoading(true); // Włącz pasek postępu
    setProgress(0); // Resetuj postęp

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:8800/api/upload/", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          setFileUris(result.files.map((file) => file.fileUri));
          setUploadedFileNames(result.files.map((file) => file.fileName));
          setProgress(100); // Ustaw 100% po zakończeniu
          setIsFileUploaded(true); // Plik został załadowany
          handleAnalyze(result.files.map((file) => file.fileUri)); // Analiza AI
        } else {
          console.error("Error uploading files:", xhr.statusText);
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        console.error("Network Error");
        setLoading(false);
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading files:", error);
      setLoading(false);
    }
  };

  // Funkcja do analizy dokumentu za pomocą AI
  const handleAnalyze = async (fileUris) => {
    setLoadingSummary(true); // Ustawiamy ładowanie dla `summary`
    const response = await fetch("http://localhost:8800/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileUris,
        prompt:
          "Przedstaw podsumowanie dokumentu w trzech punktach. Użyj nagłówków <h1>, <h2> do kluczowych sekcji, a także użyj <blockquote> dla cytatów, <p> dla paragrafów. Na końcu podaj 3 sugerowane pytania w formacie listy.",
      }),
    });

    const result = await response.json();
    setSummary(result.summary); // Streszczenie dokumentu
    // setSuggestions(result.suggestions || []); // Sugerowane pytania AI
    setLoadingSummary(false); // Wyłączamy ładowanie po zakończeniu generowania

    // Ustawienie popupu na widoczny
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false); // Ukrycie popupu
    setPanelVisible(true); // Otworzenie bottom-panel
  };

  const handleGenerate = async () => {
    setLoadingSummary(true); // Ustawiamy loader na czas ładowania
    const response = await fetch("http://localhost:8800/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileUris,
        prompt: `Odpowiedz na pytanie: ${prompt}. Proszę sformatować odpowiedź w HTML z użyciem <h1>, <h2>, <p>, <blockquote> oraz <ul><li> dla list.`,
      }),
    });

    const result = await response.json();
    setSummary(result.summary); // Zapisujemy odpowiedź z AI w stanie 'summary'
    setIsGeneratedResponse(true); // Ustawiamy, że odpowiedź została wygenerowana
    setLoadingSummary(false); // Wyłączamy loader po zakończeniu
  };

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <div className="pdf-reader-container">
      {/* Centralny przycisk "Upload PDFs" */}
      {!isFileUploaded && (
        <div className="upload-button-container">
          <button className="upload-button" onClick={handleClick}>
            Upload <br />
            PDF(s)
          </button>
        </div>
      )}

      {loading && (
        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`, // Nadal kontrolujemy szerokość paska za pomocą stanu
            }}
          />
        </div>
      )}

      {/* Ukryty input do wyboru pliku */}
      <input
        type="file"
        accept="application/pdf"
        multiple
        ref={hiddenFileInput}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Warunkowe renderowanie okna popup */}
      {isPopupVisible && (
        <div className="popup-container">
          <div className="popup-content">
            <h2>Initial Document Analysis</h2>
            <p dangerouslySetInnerHTML={{ __html: summary }} />
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}

      {/* Wygenerowany tekst */}
      {!isPopupVisible &&
        isGeneratedResponse &&
        (loadingSummary ? ( // Pokazujemy loader, gdy trwa ładowanie `summary`
          <div className="spinner-container">
            <ClipLoader color="#4caf50" size={50} />
          </div>
        ) : (
          summary && ( // Renderujemy tylko gdy jest zamknięty popup i mamy odpowiedź z prompta
            <div className="generated-text">
              <h2>Generated Response:</h2>
              {/* Stylizowany tekst generowany przez AI */}
              <div
                className="stylized-content"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            </div>
          )
        ))}

      {/* Dolny panel z 4 elementami */}
      {panelVisible && (
        <div className="bottom-panel">
          <button className="mini-upload-button" onClick={handleClick}>
            <AttachFileIcon />
          </button>

          <textarea
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Enter your prompt here"
            rows="2"
          />

          <button className="send" onClick={handleGenerate}>
            <ArrowUpwardIcon />
          </button>

          {uploadedFileNames.length > 0 && (
            <div className="file-links">
              {uploadedFileNames.map((fileName, index) => (
                <button
                  key={index}
                  onClick={() => window.open(fileUris[index], "_blank")}
                >
                  {fileName}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfReader;
