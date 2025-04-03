// Testfunktion zum Extrahieren von Todos aus einer Nachricht
function extractTodosFromMessage(message) {
  const todos = [];
  
  console.log("Zu analysierende Nachricht:", message);
  
  // Suche nach Mustern wie "Tag X:" oder "- Aufgabe" oder "• Aufgabe"
  const lines = message.split(/\n|\\n/); // Aufteilen bei normalen oder escaped Zeilenumbrüchen
  let currentDate = null;
  let currentPriority = 'medium';
  
  console.log("Zeilen:", lines.length);
  
  lines.forEach((line, index) => {
    // Trimme die Zeile
    const trimmedLine = line.trim();
    console.log(`Zeile ${index}:`, trimmedLine);
    
    // Überprüfe auf Datumsangaben mit Markdown-Formatierung
    // **Tag X: Beschreibung** oder Tag X: Beschreibung
    const dateMatch = trimmedLine.match(/^\*\*?(Tag\s+\d+)[:\s].*\*\*?$|^(Tag\s+\d+):/i);
    
    if (dateMatch) {
      // Day kann entweder in Gruppe 1 oder 2 sein, je nach Match
      const dayText = dateMatch[1] || dateMatch[2];
      console.log("Gefundenes Datum:", dayText);
      
      // Setze das aktuelle Datum basierend auf dem Tag
      const today = new Date();
      
      // Extrahiere die Tagesnummer
      const dayMatch = dayText.match(/\d+/);
      if (dayMatch) {
        const dayNumber = parseInt(dayMatch[0], 10);
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + dayNumber - 1);
        currentDate = futureDate.toISOString().split('T')[0];
        console.log("Berechnetes Datum für Tag", dayNumber, ":", currentDate);
      }
      
      // Aufgaben mit Datum erhalten höhere Priorität
      currentPriority = 'high';
    } 
    // Überprüfe auf Aufgaben (mit Punkten oder Bindestrichen)
    else if (trimmedLine.match(/^[-•*]\s+(.+)$/)) {
      const taskText = trimmedLine.match(/^[-•*]\s+(.+)$/)[1];
      console.log("Gefundene Aufgabe:", taskText);
      
      // Filtere leere Aufgaben
      if (taskText && taskText.trim().length > 0) {
        // Füge die Aufgabe mit dem aktuellen Datum und Priorität hinzu
        todos.push({
          text: taskText,
          date: currentDate,
          priority: currentPriority
        });
      }
    }
  });
  
  return todos;
}

// Testen mit der Roadmap - mit expliziten Zeilenumbrüchen
const roadmapText = `Natürlich! Hier ist eine Roadmap für die Gründung eines Unternehmens für Hundefutter in einer Woche: 
**Tag 1: Forschung und Planung** 
- Recherchiere den Markt für Hundefutter und identifiziere Zielgruppen. 
- Erstelle ein Businessplan mit Geschäftsmodell, Zielsetzungen und Kostenkalkulation. 
**Tag 2: Namensfindung und Domainregistrierung** 
- Brainstorme und wähle einen passenden Namen für dein Unternehmen. 
- Registriere die Domain für deine Unternehmenswebsite. 
**Tag 3: Lieferanten und Produktbeschaffung** 
- Suche nach Lieferanten für hochwertiges Hundefutter. 
- Kläre Liefer- und Zahlungskonditionen mit den Lieferanten. 
**Tag 4: Markenaufbau und Design** 
- Entwickle ein Logo und ein Branding-Konzept für dein Unternehmen. 
- Designe Verpackungen und Etiketten für dein Hundefutter. 
**Tag 5: Gesetzliche Anforderungen und Genehmigungen** 
- Informiere dich über die gesetzlichen Vorschriften für die Herstellung und den Verkauf von Hundefutter. 
- Beantrage die erforderlichen Genehmigungen und Zertifizierungen. 
**Tag 6: Website-Erstellung und Marketing** 
- Baue eine Website für dein Unternehmen auf und füge Produktinformationen hinzu. 
- Entwickle eine Marketingstrategie für den Launch deines Unternehmens. 
**Tag 7: Soft Launch und Vorbereitung auf den Verkauf** 
- Führe einen Soft Launch durch, um Feedback von potenziellen Kunden zu erhalten. 
- Bereite Inventar, Versand und Kundensupport für den offiziellen Start vor. 
Viel Erfolg bei der Gründung deines Unternehmens für Hundefutter!`;

// Extrahiere die Todos
const extractedTodos = extractTodosFromMessage(roadmapText);

// Gib das Ergebnis aus
console.log("Extrahierte Todos:", JSON.stringify(extractedTodos, null, 2)); 