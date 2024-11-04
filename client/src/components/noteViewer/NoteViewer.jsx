import React from "react";
import LanguageIcon from "@mui/icons-material/Language";
import "./noteViewer.scss";

function NoteViewer({ note, onClose }) {
  return (
    <div className="note-viewer">
      <button className="close-viewer-button" onClick={onClose}>
        Zamknij
      </button>
      <h2>{note.title}</h2>
      <div className="note-viewer-content" dangerouslySetInnerHTML={{ __html: note.content }} />
      {note.pdfLink && (
        <div className="pdf-link">
          <a href={note.pdfLink} target="_blank" rel="noopener noreferrer">
          <LanguageIcon className="pdf-icon" />
            Otwórz PDF
          </a>
        </div>
      )}
    </div>
  );
}

export default NoteViewer;
