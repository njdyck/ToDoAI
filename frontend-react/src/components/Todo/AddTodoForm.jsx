import React, { useState } from 'react';

function AddTodoForm({ onAddTodo }) {
    const [text, setText] = useState('');
    const [date, setDate] = useState('');
    const [priority, setPriority] = useState('medium');

    const handleSubmit = (e) => {
        e.preventDefault(); // Verhindert Neuladen der Seite
        if (!text.trim()) return; // Keine leeren Todos

        onAddTodo({
            text: text,
            date: date,
            priority: priority
        });

        // Formular zurücksetzen
        setText('');
        setDate('');
        setPriority('medium');
    };

    return (
        <form className="add-todo-form" onSubmit={handleSubmit}>
            <input 
                id="new-todo-text" 
                type="text"
                placeholder="Neue Aufgabe hinzufügen..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required // Optional: Feld als erforderlich markieren
            />
            <input 
                id="new-todo-date" 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <select 
                id="new-todo-priority" 
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
            >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
            </select>
            <button id="add-todo-btn" type="submit">
                {/* Optional: Icon statt + */} 
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </form>
    );
}

export default AddTodoForm; 