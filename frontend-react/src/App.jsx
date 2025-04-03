import React, { useState, useEffect, useCallback } from 'react';
import * as api from './services/api'; // Importiere den API-Service
// Importiere die Komponenten (werden gleich erstellt)
import ChatContainer from './components/Chat/ChatContainer';
import TodoContainer from './components/Todo/TodoContainer';
// Importiere DND-spezifische Teile direkt in App.jsx
import { DragDropContext } from '@hello-pangea/dnd'; 
import './App.css'; // Wir verwenden erstmal die Haupt-CSS-Datei

// Definiere den System-Prompt hier oder lade ihn ggf. dynamisch
const SYSTEM_PROMPT = "Du bist ein KI Agent um ToDo's zu erstellen. Erstelle präzise und gut formulierte ToDo's und sortiere diese zeitlich (per Datum) und mit Prioritäten, um dem Nutzer die Arbeit zu erleichtern.";

// Hilfsfunktion zum Neuordnen
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

function App() {
  const [todos, setTodos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState(null);
  // State für Filter und Sortierung
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // --- Daten laden (angepasst für Sortierung nach Position) ---
  const loadTodos = useCallback(async () => {
    setLoadingTodos(true);
    setError(null);
    try {
      let fetchedTodos = await api.fetchTodos();
      if (fetchedTodos) {
        // Sortiere initial nach der Position, falls vorhanden
        fetchedTodos.sort((a, b) => {
            const posA = typeof a.position === 'number' ? a.position : Infinity;
            const posB = typeof b.position === 'number' ? b.position : Infinity;
            return posA - posB;
        });
        setTodos(fetchedTodos);
      } else {
         setTodos([]);
      }
    } catch (err) {
      setError('Fehler beim Laden der ToDos.');
      console.error(err);
      setTodos([]); // Fallback
    } finally {
      setLoadingTodos(false);
    }
  }, []);

  useEffect(() => {
    loadTodos(); // Initiales Laden der ToDos
    setMessages([
      { id: Date.now(), sender: 'agent', text: 'Hallo! Beschreibe die Aufgabe und ich erstelle eine ToDo-Liste für dich.' }
    ]);
  }, [loadTodos]);

  // --- Chat Handler ---
  const handleSendMessage = async (messageText, model) => {
    if (!messageText.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setLoadingChat(true);
    setError(null);

    try {
      // Direkt an OpenAI senden, kein System-Prompt nötig, da es in API-Call integriert ist
      const response = await api.sendMessage(messageText, model);

      const newAgentMessage = {
        id: Date.now() + 1, // leicht anderer Key
        sender: 'agent',
        text: response.agent_reply || 'Keine Antwort erhalten.',
      };
      setMessages(prevMessages => [...prevMessages, newAgentMessage]);

      // Wenn neue Todos aus der Antwort extrahiert wurden, füge sie direkt hinzu
      if (response.todos && response.todos.length > 0) {
        // Für jedes neue Todo eine API-Anfrage senden, um es zu speichern
        const todoPromises = response.todos.map(todoData => api.addTodo(todoData));
        
        try {
          const newTodos = await Promise.all(todoPromises);
          // Füge neue Todos direkt zum State hinzu
          setTodos(prevTodos => [...prevTodos, ...newTodos]);
        } catch (todoError) {
          console.error("Fehler beim Hinzufügen der ToDos:", todoError);
          setError('Fehler beim Hinzufügen der ToDos.');
          // Neu laden als Fallback
          await loadTodos();
        }
      }

    } catch (err) {
      console.error("Chat API Error:", err);
      const errorMessage = err.message || 'Fehler beim Senden der Nachricht.';
      setError(errorMessage);
      const errorAgentMessage = {
        id: Date.now() + 1,
        sender: 'agent',
        text: `Fehler: ${errorMessage}`,
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorAgentMessage]);
    } finally {
      setLoadingChat(false);
    }
  };

  // --- ToDo Handlers ---
  const handleAddTodo = async (todoData) => {
    setLoadingTodos(true);
    setError(null);
    try {
      const newTodo = await api.addTodo(todoData);
      if (newTodo) {
        setTodos(prevTodos => [...prevTodos, newTodo]);
      }
    } catch (err) {
      setError('Fehler beim Hinzufügen des ToDos.');
      console.error(err);
    } finally {
      setLoadingTodos(false);
    }
  };

  const handleUpdateTodo = async (id, updates) => {
    // Optimistisches Update (optional, für bessere UX)
    const originalTodos = [...todos];
    setTodos(prevTodos => prevTodos.map(t => t.id === id ? { ...t, ...updates } : t));

    // Kein erneutes setLoadingTodos, da es meist eine schnelle Aktion ist
    // setError(null);
    try {
      await api.updateTodo(id, updates);
      // Kein erneutes Laden nötig, wenn optimistisches Update erfolgreich war
      // Wenn das Backend das aktualisierte Todo zurückgibt, könnte man es hier nochmals setzen:
      // const updatedTodo = await api.updateTodo(id, updates);
      // setTodos(prevTodos => prevTodos.map(t => t.id === id ? updatedTodo : t));
    } catch (err) {
      setError('Fehler beim Aktualisieren des ToDos.');
      console.error(err);
      setTodos(originalTodos); // Rollback bei Fehler
    }
  };

  const handleDeleteTodo = async (id) => {
    const originalTodos = [...todos];
    setTodos(prevTodos => prevTodos.filter(t => t.id !== id));
    // setError(null);
    try {
      await api.deleteTodo(id);
    } catch (err) {
      setError('Fehler beim Löschen des ToDos.');
      console.error(err);
      setTodos(originalTodos); // Rollback
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    if (completedTodos.length === 0) return; // Nichts zu tun

    const originalTodos = [...todos];
    // Optimistisches Update: Entferne erledigte sofort aus dem UI
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
    setLoadingTodos(true); // Zeige kurz Ladezustand
    setError(null);

    try {
      await api.clearCompletedTodos();
      // Kein Neuladen nötig, da optimistisches Update
    } catch (err) {
      setError('Fehler beim Löschen erledigter ToDos.');
      console.error(err);
      setTodos(originalTodos); // Rollback bei Fehler
    } finally {
        setLoadingTodos(false);
    }
  };

  // --- Drag & Drop Handler (angepasst) ---
  const onDragEnd = async (result) => { // Mache die Funktion async
    if (!result.destination) {
      return;
    }

    const items = reorder(
      todos, // Wichtig: Verwende den *unsortierten/ungefilterten* State für die Neuordnung
      result.source.index, // Index bezieht sich auf die *gerenderte* Liste (filteredAndSortedTodos)
      result.destination.index
    );
    
    // Korrektur: `reorder` muss auf der Liste basieren, die auch gerendert wurde!
    const reorderedFilteredList = reorder(
        filteredAndSortedTodos, // Die Liste, die DND sieht
        result.source.index,
        result.destination.index
    );

    // Finde die neue globale Reihenfolge basierend auf der neu sortierten gefilterten Liste
    const newGlobalOrderMap = new Map(reorderedFilteredList.map((item, index) => [item.id, index]));
    const newGlobalTodos = [...todos].sort((a, b) => {
        const indexA = newGlobalOrderMap.has(a.id) ? newGlobalOrderMap.get(a.id) : Infinity;
        const indexB = newGlobalOrderMap.has(b.id) ? newGlobalOrderMap.get(b.id) : Infinity;
        // Wenn ein Element nicht in der gefilterten Liste war, behält es seine relative Position zu anderen nicht gefilterten
        if (indexA === Infinity && indexB === Infinity) {
             const originalIndexA = todos.findIndex(t => t.id === a.id);
             const originalIndexB = todos.findIndex(t => t.id === b.id);
             return originalIndexA - originalIndexB;
        }
        return indexA - indexB;
    });

    setTodos(newGlobalTodos); // Aktualisiere den globalen State

    // Sende die neue Reihenfolge (nur die IDs) ans Backend
    const orderedIds = newGlobalTodos.map(item => item.id);
    try {
        await api.updateTodoOrder(orderedIds);
    } catch (err) {
        setError("Fehler beim Speichern der Reihenfolge.");
        // Optional: Rollback zum vorherigen State (`todos` vor dem `setTodos` oben)
        console.error(err);
    }
  };

  // --- Sortierung und Filterung (Client-seitig für Einfachheit) ---
  // Diese Logik könnte auch im Backend implementiert werden
  const getFilteredAndSortedTodos = useCallback(() => {
      // Kopie erstellen, um den Originalstate nicht zu mutieren
      let processedTodos = [...todos];

      // Filtern
      if (filterPriority !== 'all') {
          processedTodos = processedTodos.filter(todo => todo.priority === filterPriority);
      }

      // Sortieren
      if (sortBy === 'date') {
          processedTodos.sort((a, b) => {
              const dateA = a.date ? new Date(a.date).getTime() : 0; // Zeitstempel für Vergleich
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              // Ungültige oder fehlende Daten ans Ende
              if (!dateA && !dateB) return 0;
              if (!dateA) return 1; 
              if (!dateB) return -1;
              return dateA - dateB;
          });
      } else if (sortBy === 'priority') {
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          processedTodos.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
      }
      // 'default' behält die durch Drag & Drop oder Laden festgelegte Reihenfolge
      // wenn Drag & Drop aktiv ist, sollte 'default' die manuell sortierte Liste sein
      
      return processedTodos;
  }, [todos, filterPriority, sortBy]); // Abhängigkeiten für useCallback

  const filteredAndSortedTodos = getFilteredAndSortedTodos();

  return (
    // Wrap main content with DragDropContext
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="app-container">
            {/* <header> Optionaler Header </header> */}
            <main className="main-container">
                <div className="chat-area">
                    <ChatContainer
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        loading={loadingChat}
                        error={error}
                    />
                </div>
                <div className="todo-area">
                    <TodoContainer
                        // Wichtig: Übergebe die *originalen* Todos an den Container,
                        // damit die Indizes für DND korrekt sind.
                        // Die Darstellung der gefilterten/sortierten Liste
                        // passiert *innerhalb* des TodoContainer oder TodoList.
                        // Korrektur: Übergabe der gefilterten/sortierten Liste ist ok,
                        // DND braucht nur konsistente IDs und Indizes *innerhalb der gerenderten Liste*.
                        todos={filteredAndSortedTodos}
                        onAddTodo={handleAddTodo}
                        onUpdateTodo={handleUpdateTodo}
                        onDeleteTodo={handleDeleteTodo}
                        onClearCompleted={handleClearCompleted}
                        onSortChange={setSortBy}
                        onFilterChange={setFilterPriority}
                        currentSort={sortBy}
                        currentFilter={filterPriority}
                        loading={loadingTodos}
                        error={error}
                    />
                </div>
            </main>
            {/* <footer> Optionaler Footer </footer> */}
        </div>
    </DragDropContext>
  );
}

export default App;
