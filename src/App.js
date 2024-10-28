import React, { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import JUH_logo from './juh_logo.png'
import { parseExcel } from './excelLoader';

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [questionCatalog, setQuestionCatalog] = useState([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
    // Fragen aus der Excel-Datei laden und parsen
    const loadQuestions = async () => {
      try {
        const questions = await parseExcel();
        if (questions && questions.length > 0) {
          setQuestionCatalog(questions);
        } else {
          console.error("Fehler: Keine Fragen im Fragenkatalog gefunden.");
        }
      } catch (error) {
        console.error("Fehler beim Laden der Fragen: ", error);
      }
    };
    loadQuestions();
  }, []);

  const handleAnswer = (index) => {
    if (questionCatalog[currentQuestionIndex]) {
      const correctOptionIndex = questionCatalog[currentQuestionIndex].correctOptionIndex;
      const isCorrect = index === correctOptionIndex;
      setUserAnswers([...userAnswers, isCorrect]);
      if (isCorrect) {
        setScore(score + 1);
        setFeedback("RICHTIG");
      } else {
        setFeedback("Leider falsch");
        setShowCorrectAnswer(true);
      }
      setTimeout(() => {
        setFeedback(null);
        setShowCorrectAnswer(false);
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questionCatalog.length) {
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          setShowSummary(true);
        }
      }, 4000);
    }
  };

  const startQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowSummary(false);
    setUserAnswers([]);
    setFeedback(null);
    setShowCorrectAnswer(false);
  };

  return (
    <div className="App">
      {questionCatalog.length === 0 ? (
        <div className="loading">
          <h1>Laden der Fragen...</h1>
        </div>
      ) : showSummary ? (
        <div className="summary">
          <h2>Zusammenfassung</h2>
          <p className="score">Punkte: {score} / {questionCatalog.length}</p>
          <ul>
            {questionCatalog.map((question, index) => (
              <li key={index}>
                {question.question} - {userAnswers[index] ? "Richtig gelöst" : "Falsch getippt"}
              </li>
            ))}
          </ul>
          <button onClick={startQuiz}>Erneut starten</button>
        </div>
      ) : currentQuestionIndex === -1 ? (
        <div className="start-page">
          <img src={JUH_logo} alt="JUH Erste-Hilfe-Quiz Logo" className="logo img-responsive" />
          <h1>Willkommen zum Erste-Hilfe-Quiz!</h1>
          <p>Es werden {questionCatalog.length} Fragen gestellt.</p>
          <button onClick={startQuiz}>Start</button>
          <footer className="footer">
            Quiz zum Erste-Hilfe-Kurs bei der Johanniter-Unfall-Hilfe - (C) Digital Evangelists, Hamburg - V1.1 Okt 2024
          </footer>
        </div>
      ) : (
        <div className="question-page">
          <h2>Frage {currentQuestionIndex + 1} von {questionCatalog.length}:</h2>
          {questionCatalog[currentQuestionIndex] && (
            <>
              <p>{questionCatalog[currentQuestionIndex].question}</p>
              <div className="options">
                {questionCatalog[currentQuestionIndex].options.map((option, index) => (
                  <button key={index} onClick={() => handleAnswer(index)} className={`option-button ${showCorrectAnswer && index === questionCatalog[currentQuestionIndex].correctOptionIndex ? 'correct-answer' : ''}`} disabled={feedback !== null}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {feedback && <p className={`feedback ${feedback === "RICHTIG" ? "feedback-correct" : "feedback-wrong"}`}>{feedback}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;