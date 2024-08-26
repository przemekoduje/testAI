import React, { useEffect, useState } from "react";
import "./drawer.scss";
import DiffMatchPatch from 'diff-match-patch';


export default function Drawer({
  promptHistory,
  setCurrentResult,
  setPreviousResult,
  currentResult,
  handleRemovePrompt,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldTease, setShouldTease] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(null);

  const [hoveredItemIndex, setHoveredItemIndex] = useState(null);
  const [differences, setDifferences] = useState(null);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setShouldTease(false);
  };

  // Funkcja do uruchamiania animacji teaser
  const startTeasing = () => {
    setShouldTease(true);
    setTimeout(() => setShouldTease(false), 1000); // Czas trwania animacji teaser (1 sekunda)
  };

  useEffect(() => {
    let intervalId;

    if (!isOpen) {
      // Jeśli drawer jest zamknięty, ustaw cykliczny interwał
      const setupTeasingInterval = () => {
        startTeasing(); // Uruchom animację teaser na początku

        // Losowy czas przed następnym uruchomieniem animacji teaser
        const minInterval = 5000; // 5 seconds
        const maxInterval = 20000; // 20 seconds
        const randomInterval =
          Math.floor(Math.random() * (maxInterval - minInterval + 1)) +
          minInterval;

        intervalId = setInterval(startTeasing, randomInterval); // Ustawienie cyklicznego interwału
      };

      setupTeasingInterval();

      // Cleanup function
      return () => clearInterval(intervalId);
    } else {
      // Jeśli drawer jest otwarty, wyczyść interwał
      clearInterval(intervalId);
    }
  }, [isOpen]); // Efekt uruchamia się na podstawie stanu `isOpen`

  const handlePromptClick = (result, index) => {
    // Ustaw `currentResult` na wybrany wynik
    setCurrentResult(result);

    // Jeśli istnieje poprzedni element w historii, ustaw go jako `previousResult`
    if (index > 0) {
      setPreviousResult(promptHistory[index - 1].result);
    } else {
      // Jeśli wybrany element jest pierwszym w historii, `previousResult` powinno być puste
      setPreviousResult("");
    }

    // Ustaw aktualny indeks, aby zaznaczyć aktywny element
    setCurrentIndex(index);
  };

  useEffect(() => {
    // Jeśli dodano nowy element, ustaw go jako aktywny
    if (promptHistory.length > 0) {
      setCurrentIndex(promptHistory.length - 1);
    }
  }, [promptHistory]); // Efekt uruchamia się przy zmianie długości historii



  // Inicjalizacja instancji DiffMatchPatch
  const dmp = new DiffMatchPatch();

  // Funkcja porównująca dwa teksty
  const getTextDifferences = (oldText, newText) => {
    const diffs = dmp.diff_main(oldText, newText);
    dmp.diff_cleanupSemantic(diffs);
    return Array.isArray(diffs) ? diffs : [];
  };

  // const DifferenceDisplay = ({ oldText, newText }) => {
  //   const differences = getTextDifferences(oldText, newText);

  // Funkcja do obsługi najechania na element historii
  const handleMouseEnter = (index) => {
    if (index > 0) {
      const prevResult = promptHistory[index - 1].result;
      const currentResult = promptHistory[index].result;
      const diff = getTextDifferences(prevResult, currentResult);


      // Generowanie HTML dla różnic
      const html = diff
        .map((part) => {
          if (part[0] === 1) {
            return `<span style="color: green;">${part[1]}</span>`;
          } else if (part[0] === -1) {
            return `<span style="color: red; text-decoration: line-through;">${part[1]}</span>`;
          } else {
            return "";
          }
        })
        .join("");

      setDifferences(html);
    } else {
      setDifferences("");
    }

    setHoveredItemIndex(index);
  };

  // Funkcja do obsługi wyjścia kursora z elementu historii
  const handleMouseLeave = () => {
    setHoveredItemIndex(null);
    setDifferences(null);
  };

  return (
    <div className={`drawer ${isOpen ? "open" : ""}`}>
      <button
        className={`openbutton ${shouldTease ? "tease" : ""}`}
        onClick={toggleDrawer}
        style={{
          animationIterationCount: shouldTease ? 3 : "initial",
        }}
      >
        ♠
      </button>
      <div className="prompt-history1">
        {promptHistory.map((item, index) => (
          <div
            key={index}
            className="prompt-item"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <button className="x" onClick={() => handleRemovePrompt(index)}>
              x
            </button>
            <a
              href="#"
              onClick={() => handlePromptClick(item.result, index)}
              className={currentIndex === index ? "active-link" : ""}
              style={{
                color: currentIndex === index ? "green" : "initial",
              }}
            >
              {item.prompt}
            </a>
            {hoveredItemIndex === index && differences && (
              <div
                className="tooltip"
                dangerouslySetInnerHTML={{ __html: differences }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
