import React, { useEffect, useState } from "react";
import "./drawer.scss";

export default function Drawer({
  promptHistory,
  setCurrentResult,
  handleRemovePrompt,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldTease, setShouldTease] = useState(true);

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
          Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;

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

  return (
    <div className={`drawer ${isOpen ? "open" : ""}`}>
      <button
        className={`openbutton ${shouldTease ? "tease" : ""}`}
        onClick={toggleDrawer}
        style={{
            animationIterationCount: shouldTease ? 3 : 'initial' // Dynamiczna liczba cykli
          }}
      >
        ♠
      </button>
      <div className="prompt-history">
        {promptHistory.map((item, index) => (
          <div key={index} className="prompt-item">
            
            <button className="x" onClick={() => handleRemovePrompt(index)}>
              x
            </button>
            
            <a href="#" onClick={() => setCurrentResult(item.result)}>
              {item.prompt}
            </a>
            
          </div>
        ))}
      </div>
    </div>
  );
}
