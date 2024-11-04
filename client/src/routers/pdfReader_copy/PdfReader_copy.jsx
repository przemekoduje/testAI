import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "./pdfReader_copy.scss";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import axios from "axios";
import PDFViewer from "../../components/PDFViewer/PDFViewer.js";
import { pdfjs } from "react-pdf";
import Dashboard from "../../components/dashboard/Dashboard.jsx";

// Ustawienie worker'a z lokalnej ścieżki
pdfjs.GlobalWorkerOptions.workerSrc = "./pdf.worker.min.mjs";

function PdfReader_copy() {
  const [fileUris, setFileUris] = useState([]);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [numPages, setNumPages] = useState(null);
  const [summary, setSummary] = useState("");
  const [sections, setSections] = useState([]); // Dynamiczna lista sekcji
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0); // Zmiana: przechowujemy indeks wybranej sekcji
  const [selectedSection, setSelectedSection] = useState("section1");
  const [question, setQuestion] = useState(""); // Dodany stan dla pytania
  const [aiResponse, setAiResponse] = useState(""); // Dodany stan dla odpowiedzi od AI
  const [numColumns, setNumColumns] = useState(1);

  const hiddenFileInput = useRef(null);

  useEffect(() => {
    const rightPanel = document.querySelector(".right");
    const centerContainer = document.querySelector(".center_container");
    const dashboard = document.querySelector(".dashboard");
    const contentContainer = document.querySelector(".content-container-right");

    const a = document.querySelector(".a");
    const ai = document.querySelector(".ai");
    const id = document.querySelector(".id");
    const d = document.querySelector(".d");

    if (rightPanel && centerContainer) {
      // Funkcja na hover dla elementu "right"
      rightPanel.addEventListener("mouseenter", () => {
        centerContainer.style.width = "calc(100% * 1 / 6)";
        rightPanel.style.width = "calc(100% * 2 / 6)";
        a.style.width = "100%";
        ai.style.left = "100%";
        id.style.width = "50%";
        d.style.width = "50%";
        d.style.left = "50%";
        contentContainer.style.width =  "100%";
        setNumColumns(2);
      });

      rightPanel.addEventListener("mouseleave", () => {
        centerContainer.style.width = "calc(100% * 2 / 6)";
        rightPanel.style.width = "calc(100% * 1 / 6)";
        a.style.width = "50%";
        ai.style.left = "50%";
        id.style.width = 0;
        d.style.width = "100%";
        d.style.left = 0;
        setNumColumns(1);;
      });

      return () => {
        rightPanel.removeEventListener("mouseenter", null);
        rightPanel.removeEventListener("mouseleave", null);
      };
    }
  }, []);

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFilesArray = Array.from(e.target.files);
    setSelectedFiles(selectedFilesArray);

    // Automatyczne wysłanie plików po ich wyborze
    handleUpload(selectedFilesArray);
  };

  const handleUpload = async (filesToUpload) => {
    if (filesToUpload.length === 0) {
      alert("No files selected");
      return;
    }

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append("files", file));

    try {
      const response = await axios.post(
        "http://localhost:8800/api/uploads",
        formData
      );

      if (response.status !== 200) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = response.data;
      console.log("Odpowiedź serwera:", result);

      setFileUris((prevUris) => [
        ...prevUris,
        ...result.files.map((file) => file.fileUri),
      ]);
      setUploadedFileNames((prevNames) => [
        ...prevNames,
        ...result.files.map((file) => file.fileName),
      ]);

      // Automatyczne wywołanie analizy po przesłaniu plików
      await handleAnalyze(result.files.map((file) => file.fileUri));

      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  // Funkcja do analizy dokumentu za pomocą AI
  const handleAnalyze = async (fileUris) => {
    // setLoadingSummary(true); // Ustawiamy stan ładowania

    try {
      const response = await fetch("http://localhost:8800/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUris, // Przekazujemy URI plików PDF
          prompt:
            "Przeanalizuj dokument, dzieląc odpowiedź na kilka logicznych fragmentów, które przedstawiają główne idee i kluczowe aspekty dokumentu. Ostatni fragment ma zawierać pytania pomocne do dalszej, głębszej analizy. Każdy fragment zamknij w znaczniki HTML <section>, przy czym żaden z fragmentów nie powinien przekraczać 300 znaków. Nie używaj w odpowiedzi zwrotów wskazujących na strukturę, takich jak: 'sekcja', 'opis', czy 'podsumowanie'. W sekcji z pytaniami uzyj znaczników html <ul></ul> <li></li> ", // Hardkodowany prompt
        }),
      });

      const result = await response.json();

      console.log("Odpowiedź z serwera:", result);

      // Sprawdzamy czy odpowiedź z serwera była poprawna
      if (response.ok) {
        setSections(result.sections); // Ustawiamy dynamiczną liczbę sekcji
        setSelectedSectionIndex(0);
      } else {
        console.error("Błąd w generowaniu podsumowania:", result.error);
      }
    } catch (error) {
      console.error("Błąd w komunikacji z API:", error);
    } finally {
      // setLoadingSummary(false); // Wyłączamy stan ładowania po zakończeniu
    }
  };

  // Funkcja do wysyłania pytania do AI i uzyskiwania odpowiedzi
  const handleAskAi = async () => {
    if (!question) {
      alert("Proszę wpisać pytanie.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8800/api/ask", {
        fileUris, // Możemy przekazać pliki, jeśli to konieczne
        question, // Pytanie zadane przez użytkownika
      });

      if (response.status === 200) {
        setAiResponse(response.data.answer); // Zapisujemy odpowiedź z AI
      } else {
        console.error("Błąd w uzyskiwaniu odpowiedzi:", response.data.error);
      }
    } catch (error) {
      console.error("Błąd w komunikacji z API:", error);
    }
  };

  return (
    <div className="reader-container">
      <div className="left">
        <div className="head">
          <div className="left_head t">T</div>
          <div className="left_head e">E</div>
          <div className="left_head x">X</div>
        </div>
        <div className="content-container">
          <div className="contenet-top">
            {sections.length > 0 && (
              <div className="summary-analize">
                {/* Radiobuttony do wyboru sekcji */}
                <div className="section-selector">
                  {sections.map((_, index) => (
                    <label key={index} className="custom-radio-label">
                      <input
                        type="radio"
                        value={index}
                        checked={selectedSectionIndex === index}
                        onChange={() => setSelectedSectionIndex(index)}
                        className="custom-radio-input"
                      />
                      <span className="custom-radio-button"></span>
                    </label>
                  ))}
                </div>

                {/* Wyświetlanie wybranej sekcji */}
                <div className="analysis-summary">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sections[selectedSectionIndex],
                    }}
                  />
                </div>
              </div>
            )}

            <div className="bottom-panel">
              <button className="mini-upload-button" onClick={handleClick}>
                <AttachFileIcon style={{ transform: "rotate(45deg)" }} />
              </button>

              <input
                type="file"
                accept="application/pdf"
                multiple
                ref={hiddenFileInput}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask for details"
                rows="2"
              />
              <button className="send" onClick={handleAskAi}>
                <ArrowUpwardIcon />
              </button>

              {uploadedFileNames.length > 0 && (
                <div className="file-links">
                  {uploadedFileNames.map((fileName, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        console.log("Selected PDF URL:", fileUris[index]);
                        setSelectedPdf(fileUris[index]);
                      }}
                    >
                      {fileName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pdf-viewer-container">
            {selectedPdf ? (
              <PDFViewer file={selectedPdf} />
            ) : (
              <p>Wybierz plik PDF, aby go wyświetlić</p>
            )}
          </div>
        </div>
      </div>

      {/* Panel centralny */}
      <div className="center_container">
        <div className="center">
          <div className="head">
            <div className="center_head a">A</div>
            <div className="center_head ai">I</div>
          </div>
        </div>
        <div className="content-container">
          <div className="ai-response">
            <div dangerouslySetInnerHTML={{ __html: aiResponse }} />
          </div>
        </div>
      </div>

      {/* Panel prawy */}
      <div className="right">
        <div className="head">
          <div className="right_head id">I</div>
          <div className="right_head d">D</div>
        </div>
        <div className="content-container-right">
          <Dashboard numColumns={numColumns} />
        </div>
      </div>
    </div>
  );
}

export default PdfReader_copy;
