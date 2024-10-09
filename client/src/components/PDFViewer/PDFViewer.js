import { useState } from "react";
import { Document, Page } from "react-pdf";
// import pdf from "../../AIFuture.pdf";
import "./pdfViewer.scss";
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdfjs/pdf.worker.min.mjs`;

function PDFViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [showAllPages, setShowAllPages] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function goToNextPage() {
    setPageNumber((prevPageNumber) =>
      prevPageNumber < numPages ? prevPageNumber + 1 : prevPageNumber
    );
  }

  function goToPreviousPage() {
    setPageNumber((prevPageNumber) =>
      prevPageNumber > 1 ? prevPageNumber - 1 : prevPageNumber
    );
  }

  // function goToNextFile() {
  //   setCurrentFileIndex((prevIndex) =>
  //     prevIndex < fileUris.length - 1 ? prevIndex + 1 : prevIndex
  //   );
  //   setPageNumber(1); // Zresetuj numer strony dla nowego pliku
  // }

  // function goToPreviousFile() {
  //   setCurrentFileIndex((prevIndex) =>
  //     prevIndex > 0 ? prevIndex - 1 : prevIndex
  //   );
  //   setPageNumber(1); // Zresetuj numer strony dla nowego pliku
  // }

  return (
    <div className="pdfviewer">
      {/* Przełącznik trybu wyświetlania */}
      <div className="toggle-container">
        <label className="toggle-label">Display mode:</label>
        <div className="toggle-switch">
          <input
            type="checkbox"
            id="toggle"
            checked={showAllPages}
            onChange={() => setShowAllPages(!showAllPages)}
          />
          <label htmlFor="toggle" className="toggle-slider"></label>
        </div>
        <span>{showAllPages ? "Show All Pages" : "Single Page"}</span>
      </div>

      <div className="pdf-page">
            
        <Document file={file}  onLoadSuccess={onDocumentLoadSuccess}>
          {showAllPages
            ? Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              ))
            : (
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            )}
        </Document>
      </div>

      {/* Sterowanie stronami */}
      {!showAllPages && (
        <div className="pdf-controls">
          <p>
            Page {pageNumber} of {numPages}
          </p>
          <button onClick={goToPreviousPage} disabled={pageNumber === 1}>
            Previous Page
          </button>
          <button onClick={goToNextPage} disabled={pageNumber === numPages}>
            Next Page
          </button>
        </div>
      )}

      {/* Sterowanie plikami PDF */}
      {/* <div className="pdf-controls">
        <button onClick={goToPreviousFile} disabled={currentFileIndex === 0}>
          Previous PDF
        </button>
        <button onClick={goToNextFile} disabled={currentFileIndex === fileUris.length - 1}>
          Next PDF
        </button>
      </div> */}
    </div>
  );
}


export default PDFViewer;
