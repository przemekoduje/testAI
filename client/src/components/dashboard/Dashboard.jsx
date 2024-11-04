import React, { useState, useEffect } from "react";
import NoteThumbnail from "../noteThumbnail/NoteThumbnail";
import NoteEditor from "../noteEditor/NoteEditor";
import "./dashboard.scss";
import NoteViewer from "../noteViewer/NoteViewer";

function Dashboard({ uploadedFiles }) {
  const [notes, setNotes] = useState([]); // Stan na wszystkie notatki
  const [showEditor, setShowEditor] = useState(false); // Kontrola widoczności edytora
  const [editingNote, setEditingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null); 

  // Funkcja zapisu do localStorage
  const saveNotesToLocalStorage = (notes) => {
    localStorage.setItem("savedNotes", JSON.stringify(notes));
  };

  // Funkcja ładująca notatki z localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("savedNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes)); // Ładowanie notatek z localStorage
    }
  }, []);

  // Funkcja obsługująca zapis nowej notatki
  const handleSaveNote = (newNote) => {
    if (editingNote) {
      const updatedNotes = notes.map((note) =>
        note.id === editingNote.id ? { ...newNote, id: editingNote.id } : note
      );
      setNotes(updatedNotes); // Aktualizujemy stan notatek
      saveNotesToLocalStorage(updatedNotes); // Zapisujemy do localStorage
    } else {
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes); // Dodajemy nową notatkę do stanu
      saveNotesToLocalStorage(updatedNotes); // Zapisujemy do localStorage
    }

    setShowEditor(false); // Zamyka edytor po zapisaniu notatki
    setEditingNote(null); // Resetujemy stan edytowanej notatki
  };

  // Funkcja usuwania notatki
  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes); // Aktualizujemy stan
    saveNotesToLocalStorage(updatedNotes); // Zapisujemy do localStorage
  };

  // Funkcja edycji notatki
  const handleEditNote = (note) => {
    setEditingNote(note); // Ustawiamy notatkę do edycji
    setShowEditor(true); // Pokazujemy edytor
    setViewingNote(null);
  };

  // Funkcja przeglądania notatki
  const handleViewNote = (note) => {
    setViewingNote(note); // Ustawiamy notatkę do przeglądania
    setShowEditor(false); // Ukrywamy edytor
  };

  return (
    <div className="dashboard">
      {/* Przycisk "+" */}
      {!showEditor && (
        <button className="add-note-button" onClick={() => setShowEditor(true)}>
          +
        </button>
      )}

      {/* Edytor notatek */}
      {showEditor && (
        <div className="editor-section">
          <NoteEditor
            onSaveNote={handleSaveNote}
            uploadedFiles={uploadedFiles}
            initialNote={editingNote} // Przekazujemy notatkę do edycji, jeśli istnieje
            onClose={() => {
                setShowEditor(false)
                setEditingNote(null);
            }}
          />
        </div>
      )}

      {/* Przeglądarka notatek */}
      {viewingNote && (
        <NoteViewer
          note={viewingNote}
          onClose={() => setViewingNote(null)} // Powrót do listy notatek
        />
      )}

      {/* Notatki */}
      <div
        className="notes-grid"
        style={{ gridTemplateColumns: `repeat(${2}, 1fr)` }}
      >
        {notes.map((note) => (
          <NoteThumbnail
            key={note.id}
            title={note.title}
            content={note.content}
            pdfLink={note.pdfLink}
            onDelete={() => handleDeleteNote(note.id)}
            onEdit={() => handleEditNote(note)} 
            onView={() => handleViewNote(note)} // Funkcja do przeglądania
          />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
