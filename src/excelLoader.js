import * as XLSX from 'xlsx';

export async function parseExcel() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/erste-hilfe-quiz-fragen-carsten-v1.xlsx`);
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }

    console.log("Excel-Datei erfolgreich geladen");

    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    console.log("Parsed JSON-Daten:", jsonData);

    // Die Daten aus der Tabelle in ein passendes Format umwandeln
    const questions = jsonData.map((row, index) => {
      console.log(`Verarbeite Frage ${index + 1}: `, row);

      // Fehlerbehandlung: Überprüfen, ob alle notwendigen Spalten vorhanden sind
      if (!row["Frage"] || !row["Option 1"] || !row["Option 2"] || !row["Option 3"] || !row["Option 4"] || row["Richtige Option"] == null) {
        console.error(`Fehlende Daten in der Zeile ${index + 1}: `, row);
        return null;
      }

      // Sicherstellen, dass "Richtige Option" eine Zahl ist und korrekt interpretiert wird
      let correctOptionIndex = parseInt(row["Richtige Option"], 10);
      if (isNaN(correctOptionIndex) || correctOptionIndex < 1 || correctOptionIndex > 4) {
        console.error(`Ungültiger Wert für 'Richtige Option' in der Zeile ${index + 1}: `, row);
        return null;
      }
      correctOptionIndex -= 1; // Umwandeln in 0-basierten Index

      return {
        question: row["Frage"],
        options: [row["Option 1"], row["Option 2"], row["Option 3"], row["Option 4"]],
        correctOptionIndex: correctOptionIndex
      };
    }).filter((question) => question !== null); // Entfernen von ungültigen Fragen

    console.log("Verarbeitete Fragen: ", questions);

    return questions;
  } catch (error) {
    console.error("Fehler beim Verarbeiten der Excel-Datei: ", error);
    return [];
  }
}