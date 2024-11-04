import React from "react";
import LanguageIcon from "@mui/icons-material/Language";
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import "./noteThumbnail.scss";

function NoteThumbnail({ title, content, pdfLink, onDelete, onEdit, onView  }) {
  const getSnippetLength = (text) => {
    if (text.length <= 500) return 30;
    if (text.length <= 1000) return 60;
    if (text.length <= 5000) return 150;
    return 200;
  };

  const snippetLength = getSnippetLength(content);
  const snippet =
    content.length > snippetLength
      ? `${content.substring(0, snippetLength)}...`
      : content;

  return (
    <div className="note-thumbnail" onClick={onView}>
      {/* Górne pole */}
      <div className="note-thumbnail-header">
        <h3>{title}</h3>
        <p>{snippet}</p>
      </div>

      {/* Dolne pole */}
      {pdfLink && (
        <div className="note-thumbnail-footer">
          <a href={pdfLink} target="_blank" rel="noopener noreferrer">
            <LanguageIcon className="pdf-icon" />
            Otwórz PDF
          </a>
        </div>
      )}
      {/* Przycisk usunięcia */}
      <button className="delete-note-button" onClick={onDelete}>
        x
      </button>

      {/* Przycisk edycji */}
      <button className="edit-note-button" onClick={onEdit}>
        <ModeEditIcon/>
      </button>
    </div>
  );
}

export default NoteThumbnail;
