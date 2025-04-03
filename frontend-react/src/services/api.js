import axios from 'axios';

// Konstanten für das lokale Speichern und API-Zugriffe
const TODOS_STORAGE_KEY = 'todos';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// OpenAI API-Client-Konfiguration
const openaiClient = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
  }
});

// --- Todo API Calls mit localStorage ---
export const fetchTodos = async () => {
  try {
    // Todos aus localStorage laden
    const todosString = localStorage.getItem(TODOS_STORAGE_KEY);
    const todos = todosString ? JSON.parse(todosString) : [];
    return todos;
  } catch (error) {
    console.error('Fehler beim Abrufen der ToDos:', error);
    return [];
  }
};

export const addTodo = async (todoData) => {
  try {
    // Bestehende Todos laden
    const todos = await fetchTodos();
    
    // Neues Todo mit ID und Datum erstellen
    const newTodo = {
      ...todoData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      position: todos.length // Position am Ende
    };
    
    // Todos aktualisieren und speichern
    const updatedTodos = [...todos, newTodo];
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
    
    return newTodo;
  } catch (error) {
    console.error('Fehler beim Hinzufügen des ToDos:', error);
    throw error;
  }
};

export const updateTodo = async (id, updates) => {
  try {
    // Bestehende Todos laden
    const todos = await fetchTodos();
    
    // Todo mit der ID finden und aktualisieren
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, ...updates, updatedAt: new Date().toISOString() } : todo
    );
    
    // Aktualisierte Todos speichern
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
    
    // Das aktualisierte Todo zurückgeben
    return updatedTodos.find(todo => todo.id === id);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des ToDos:', error);
    throw error;
  }
};

export const deleteTodo = async (id) => {
  try {
    // Bestehende Todos laden
    const todos = await fetchTodos();
    
    // Todo mit der ID entfernen
    const updatedTodos = todos.filter(todo => todo.id !== id);
    
    // Aktualisierte Todos speichern
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
  } catch (error) {
    console.error('Fehler beim Löschen des ToDos:', error);
    throw error;
  }
};

export const clearCompletedTodos = async () => {
  try {
    // Bestehende Todos laden
    const todos = await fetchTodos();
    
    // Erledigte Todos entfernen
    const updatedTodos = todos.filter(todo => !todo.completed);
    
    // Aktualisierte Todos speichern
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
  } catch (error) {
    console.error('Fehler beim Löschen erledigter ToDos:', error);
    throw error;
  }
};

export const updateTodoOrder = async (orderedIds) => {
  try {
    // Bestehende Todos laden
    const todos = await fetchTodos();
    
    // Neue Positionsnummern zuweisen
    const positionMap = orderedIds.reduce((map, id, index) => {
      map[id] = index;
      return map;
    }, {});
    
    // Todos mit neuen Positionen aktualisieren
    const updatedTodos = todos.map(todo => ({
      ...todo,
      position: positionMap[todo.id] !== undefined ? positionMap[todo.id] : todo.position
    }));
    
    // Aktualisierte Todos speichern
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(updatedTodos));
  } catch (error) {
    console.error('Fehler beim Aktualisieren der ToDo-Reihenfolge:', error);
    throw error;
  }
};

// --- Chat API Call mit direktem OpenAI-Zugriff ---
export const sendMessage = async (message, model = 'openai') => {
  try {
    // Direkter Aufruf der OpenAI API
    const response = await openaiClient.post('/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Du bist ein KI Agent um ToDo's zu erstellen. Erstelle präzise und gut formulierte ToDo's und sortiere diese zeitlich (per Datum) und mit Prioritäten, um dem Nutzer die Arbeit zu erleichtern." },
        { role: "user", content: message }
      ],
      temperature: 0.7
    });
    
    // Antwort extrahieren
    const agentReply = response.data.choices[0].message.content;
    
    // Todos aus der Antwort extrahieren
    const extractedTodos = extractTodosFromMessage(agentReply);
    
    // Automatisch alle extrahierten ToDos speichern
    const savedTodos = [];
    if (extractedTodos && extractedTodos.length > 0) {
      // Für jedes extrahierte ToDo die addTodo-Funktion aufrufen
      for (const todoData of extractedTodos) {
        const savedTodo = await addTodo(todoData);
        savedTodos.push(savedTodo);
      }
    }
    
    // Erstelle eine Zusammenfassung der hinzugefügten ToDos
    let summaryText = "";
    if (savedTodos.length > 0) {
      summaryText = `\n\nIch habe ${savedTodos.length} ToDo${savedTodos.length === 1 ? '' : 's'} für dich erstellt:`;
      savedTodos.forEach((todo, index) => {
        const priorityText = todo.priority === 'high' ? 'Hohe Priorität' : 
                            todo.priority === 'medium' ? 'Mittlere Priorität' : 'Niedrige Priorität';
        const dateText = todo.date ? `(Fällig: ${todo.date})` : '';
        summaryText += `\n${index + 1}. "${todo.text}" - ${priorityText} ${dateText}`;
      });
    } else {
      summaryText = "\n\nIch konnte leider keine ToDos aus deiner Anfrage erstellen.";
    }
    
    // Zusammenfassung zur Antwort hinzufügen
    const enhancedReply = agentReply + summaryText;
    
    return {
      agent_reply: enhancedReply,
      todos: savedTodos
    };
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht:', error);
    throw error;
  }
};

// Hilfsfunktion zum Extrahieren von Todos aus KI-Antworten
function extractTodosFromMessage(message) {
  const todos = [];
  
  // Suche nach Mustern wie "Tag X:" oder "- Aufgabe" oder "• Aufgabe"
  const lines = message.split(/\n|\\n/); // Aufteilen bei normalen oder escaped Zeilenumbrüchen
  let currentDate = null;
  let currentPriority = 'medium';
  
  lines.forEach((line) => {
    // Trimme die Zeile
    const trimmedLine = line.trim();
    
    // Überprüfe auf Datumsangaben mit Markdown-Formatierung
    // **Tag X: Beschreibung** oder Tag X: Beschreibung
    const dateMatch = trimmedLine.match(/^\*\*?(Tag\s+\d+)[:\s].*\*\*?$|^(Tag\s+\d+):/i);
    
    if (dateMatch) {
      // Day kann entweder in Gruppe 1 oder 2 sein, je nach Match
      const dayText = dateMatch[1] || dateMatch[2];
      
      // Setze das aktuelle Datum basierend auf dem Tag
      const today = new Date();
      
      // Extrahiere die Tagesnummer
      const dayMatch = dayText.match(/\d+/);
      if (dayMatch) {
        const dayNumber = parseInt(dayMatch[0], 10);
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + dayNumber - 1);
        currentDate = futureDate.toISOString().split('T')[0];
      }
      
      // Aufgaben mit Datum erhalten höhere Priorität
      currentPriority = 'high';
    } 
    // Überprüfe auf Aufgaben (mit Punkten oder Bindestrichen)
    else if (trimmedLine.match(/^[-•*]\s+(.+)$/)) {
      const taskText = trimmedLine.match(/^[-•*]\s+(.+)$/)[1];
      
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