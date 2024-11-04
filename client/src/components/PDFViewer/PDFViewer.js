import { useState, useEffect } from "react";
import { Document, Page } from "react-pdf";
import "./pdfViewer.scss";

function PDFViewer({ file }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0); // Zmienna do przechowywania pozycji przewinięcia

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

  // Funkcja do przełączania trybu wyświetlania
  function toggleShowAllPages() {
    setScrollPosition(window.pageYOffset); // Zapisz pozycję przewinięcia przed zmianą trybu
    setShowAllPages((prevShowAllPages) => !prevShowAllPages);
  }

  // Przywracanie pozycji przewinięcia po renderowaniu
  useEffect(() => {
    window.scrollTo(0, scrollPosition); // Przywróć pozycję przewinięcia
  }, [showAllPages, scrollPosition]); // Reaguj na zmianę trybu wyświetlania i pozycji przewinięcia

  return (
    <div className="pdfviewer">
      {/* Przełącznik trybu wyświetlania */}
      <div className="toggle-container">
        <label className="toggle-label">Display:</label>
        <div className="toggle-switch">
          <input
            type="checkbox"
            id="toggle"
            checked={showAllPages}
            onChange={toggleShowAllPages} // Zmieniono na funkcję, która zapisuje pozycję przewinięcia
          />
          <label htmlFor="toggle" className="toggle-slider"></label>
        </div>
        <span>{showAllPages ? "All Pages" : "Single Page"}</span>
      </div>

      <div className="pdf-page">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
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
    </div>
  );
}

export default PDFViewer;
