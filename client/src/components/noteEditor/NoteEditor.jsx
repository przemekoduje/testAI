import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Style dla react-quill
import "./noteEditor.scss";
import axios from "axios";

function NoteEditor({ onSaveNote, uploadedFiles, onClose, initialNote }) {
  const [title, setTitle] = useState(initialNote?.title || ""); // Tytuł notatki
  const [content, setContent] = useState(initialNote?.content || ""); // Treść notatki (HTML)
  const [addPdf, setAddPdf] = useState(initialNote?.pdfLink ? true : false); // Czy dodać PDF
  const [selectedPdf, setSelectedPdf] = useState(initialNote?.pdfLink || null); // Wybrany PDF
  const [recipientEmail, setRecipientEmail] = useState(""); // Email odbiorcy

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title);
      setContent(initialNote.content);
      setAddPdf(!!initialNote.pdfLink);
      setSelectedPdf(initialNote.pdfLink);
    }
  }, [initialNote]);

  const handleSaveNote = () => {
    if (!title || !content) {
      alert("Uzupełnij tytuł i treść notatki.");
      return;
    }

    const newNote = {
      id: initialNote?.id || Date.now(),
      title,
      content,
      pdfLink: addPdf ? selectedPdf : null,
    };

    onSaveNote(newNote); // Wywołanie funkcji zapisu notatki
    setTitle("");
    setContent("");
    setAddPdf(false);
    setSelectedPdf(null);
  };

  const handleSendEmail = () => {
    if (!recipientEmail || !title || !content) {
      alert("Uzupełnij wszystkie pola.");
      return;
    }

    const emailData = {
      recipientEmail,
      title,
      content,
      pdfLink: addPdf ? selectedPdf : null,
    };

    axios
      .post("http://localhost:8800/api/send-email", emailData)
      .then((response) => {
        alert("Notatka wysłana na maila!");
      })
      .catch((error) => {
        console.error("Błąd podczas wysyłania maila:", error);
      });
  };

  return (
    <div className="note-editor">
      {/* Input do tytułu */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tytuł notatki"
        className="note-title-input"
      />

      {/* Edytor treści notatki */}
      <ReactQuill
        value={content}
        onChange={setContent}
        className="note-content-editor"
      />

      {/* Input do dodawania PDF */}
      <div className="add-pdf">
        <label>
          <input
            type="radio"
            checked={addPdf}
            onChange={() => setAddPdf(!addPdf)}
          />
          Dodaj PDF
        </label>

        {/* Wybierz plik PDF z załadowanych plików */}
        {addPdf && (
          <select
            onChange={(e) => setSelectedPdf(e.target.value)}
            value={selectedPdf}
          >
            <option value="">Wybierz PDF</option>
            {uploadedFiles.map((file, index) => (
              <option key={index} value={file.fileUri}>
                {file.fileName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Przycisk zapisu */}
      <div className="edit-buttons">
        <button onClick={handleSaveNote} className="save-note-button">
          Zapisz Notatkę
        </button>

        {/* Nowy przycisk zamknięcia edytora */}
        <button onClick={onClose} className="close-editor-button">
          X
        </button>
      </div>

      {/* Pole do wpisania maila i wysłania notatki */}
      <div className="email-section">
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="Email odbiorcy"
          className="email-input"
        />
        <button onClick={handleSendEmail} className="send-email-button">
          Wyślij na maila
        </button>
      </div>
    </div>
  );
}

export default NoteEditor;
