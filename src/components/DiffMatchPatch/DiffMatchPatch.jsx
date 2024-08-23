import React from 'react';
import DiffMatchPatch from 'diff-match-patch';

// Inicjalizacja instancji DiffMatchPatch
const dmp = new DiffMatchPatch();

// Funkcja porównująca dwa teksty
const getTextDifferences = (oldText, newText) => {
  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);
  return dmp.diff_prettyHtml(diffs);
};

const DifferenceDisplay = ({ oldText, newText }) => {
  const differences = getTextDifferences(oldText, newText);

  return (
    <div className="difference-display">
      <h2>Differences:</h2>
      <div dangerouslySetInnerHTML={{ __html: differences }} />
    </div>
  );
};

export default DifferenceDisplay;
