import { useEffect, useState } from "react";
import "./App.scss";
import model from "./lib/gemini";
import { ClipLoader } from "react-spinners";

function App() {
  const [subject, setSubject] = useState("");
  // const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [showText, setShowText] = useState(false);
  const [entries, setEntries] = useState([])
  // const [chatResponse, setChatResponse] = useState("");

  
  

  useEffect(() => {
    // Zapisuje aktualną tablicę entries do localStorage za każdym razem, gdy się zmieni
    localStorage.setItem('chatEntries', JSON.stringify(entries));
  }, [entries]); // Efekt ten będzie uruchamiany, gdy stan entries się zmieni
  

  //GENEROWANIE RANDOMOWEGO PRZEDMIOTU
  const generateRandomItem = async () => {
    if (subject) return;

    const promptSubject =
      "Wygeneruj nazwę przedmiotu codziennego użytku. Nazwa własna tego przedmiotu mozee składać się z maksymalnie dwóch słów. Wpisz tylko samą nazwę";
    const resultSubject = await model.generateContent(promptSubject);
    const responseSubject = await resultSubject.response;
    const textSubject = await responseSubject.text();
    setSubject(textSubject.trim());
  };

  useEffect(() => {
    generateRandomItem();
  }, []);






  useEffect(() => {
    if (subject) {
      const timer = setTimeout(() => {
        generateContent(subject);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [subject]);

  
  const generateContent = async () => {
    try {
      setLoading(true);
      setShowText(false);

      // Użycie wylosowanego przedmiotu w zapytaniu
      const prompt = `Opis kreatywnie przedmiot "${subject}" w max 4 słowach. Po podaniu opisu zawsze napisz sformułowanie które zaprosi uytkownika do podania swojej propozycji opisu, np: Twoja kolej, Twój pomysł, etc. 
      `;
      const result = await model.generateContent(prompt);
      const aiResponse = await result.response;
      const description = await aiResponse.text();
      setAnswer(description);

      setLoading(false);

      setEntries((prevEntries) => [...prevEntries, { text: description, type: 'ai' }]);

      console.log(entries)

      // Po krótkim czasie pokazuje tekst
      setTimeout(() => {
        setShowText(true);
      }, 500); // czas synchronizacji z animacją
    } catch (error) {
      console.error("Error fetching chat response:", error);
    }
  };





  const handleSubmit = async (e) => {
    e.preventDefault();

    const inputText = e.target.intext.value;
    if (!inputText) return;

    setUserAnswer(inputText);

    setEntries((prevEntries) => [...prevEntries, { text: inputText, type: 'user' }]); // Dodaj wpis użytkownika do entries
    generateContent(subject); // Resetowanie odpowiedzi przed nowym wpisem
  };


  useEffect(() => {
    const savedEntries = localStorage.getItem('chatEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []); 


  return (
    <div className="App">
      <div className="wrapper">
        <form className="newForm" onSubmit={handleSubmit}>
          <input type="text" name="intext" placeholder="ask me sth..." />
          <button>Send</button>
        </form>

        <div className={`loader ${loading ? "active" : ""}`}>
          <ClipLoader color="#36d7b7" />
        </div>
        <div className="text2">
          <p className="subject">{subject}</p>
          {entries.map((entry, index) => (
          <div
            key={index}
            className={`answer ${entry.type}`}
          >
            {entry.text}
          </div>
        ))}
          {/* {showText && <div className="answer">{answer}</div>}
          {userAnswer && <div className="answer user">{userAnswer}</div>} */}
        </div>
      </div>
    </div>
  );
}

export default App;
