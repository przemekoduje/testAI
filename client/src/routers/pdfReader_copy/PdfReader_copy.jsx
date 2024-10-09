import { useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "./pdfReader_copy.scss";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import axios from "axios";
import PDFViewer from "../../components/PDFViewer/PDFViewer.js";
import { pdfjs } from "react-pdf";

// Ustawienie worker'a z lokalnej ścieżki
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdfjs/pdf.worker.min.mjs`;




function PdfReader_copy() {
  const [fileUris, setFileUris] = useState([]);
  const [uploadedFileNames, setUploadedFileNames] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [numPages, setNumPages] = useState(null);

  const hiddenFileInput = useRef(null);

  useEffect(() => {
    const rightPanel = document.querySelector(".right");
    const centerContainer = document.querySelector(".center_container");
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
      });

      rightPanel.addEventListener("mouseleave", () => {
        centerContainer.style.width = "calc(100% * 2 / 6)";
        rightPanel.style.width = "calc(100% * 1 / 6)";
        a.style.width = "50%";
        ai.style.left = "50%";
        id.style.width = 0;
        d.style.width = "100%";
        d.style.left = 0;
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

      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  // Funkcja obsługująca ładowanie PDF
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages); // Ustawienie liczby stron
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
          <div className="bottom-panel">
            <button className="mini-upload-button" onClick={handleClick}>
              <AttachFileIcon />
            </button>

            <input
              type="file"
              accept="application/pdf"
              multiple
              ref={hiddenFileInput}
              style={{ display: "none" }}
              onChange={handleFileChange} />
            <button className="send">
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
                    } }
                  >
                    {fileName}
                  </button>
                ))}
              </div>
            )}
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
          <p>tekt srodkowy</p>
        </div>
      </div>

      {/* Panel prawy */}
      <div className="right">
        <div className="head">
          <div className="right_head id">I</div>
          <div className="right_head d">D</div>
        </div>
        <div className="content-container">
          <p>tekst prawy</p>
        </div>
      </div>
    </div>
  );
}

export default PdfReader_copy;
