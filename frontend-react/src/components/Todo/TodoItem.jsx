import React, { useState } from 'react';

// Hilfsfunktion zum Escapen von HTML (falls Text direkt angezeigt wird)
const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};

function TodoItem({ todo, onUpdateTodo, onDeleteTodo, provided, snapshot }) {
    // State für ausklappbaren Text
    const [expanded, setExpanded] = useState(false);
    // Textlänge für Kürzung (bei Zeichen)
    const maxTextLength = 100;
    
    const isTextLong = todo.text && todo.text.length > maxTextLength;

    const handleCheckboxChange = (e) => {
        onUpdateTodo(todo.id, { completed: e.target.checked });
    };

    const handleDateChange = (e) => {
        onUpdateTodo(todo.id, { date: e.target.value });
    };

    const handlePriorityChange = (e) => {
        onUpdateTodo(todo.id, { priority: e.target.value });
    };

    // Toggle-Funktion für erweiterten Text
    const toggleExpanded = (e) => {
        e.preventDefault();
        setExpanded(!expanded);
    };

    // Dynamische Klassen basierend auf Zustand und Dragging
    const getItemStyle = (isDragging, draggableStyle) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: 'none',
        // change background colour if dragging
        background: isDragging ? 'var(--input-bg-color)' : 'var(--todo-item-bg)',
        // styles we need to apply on draggables
        ...draggableStyle,
    });

    // Funktion zum Rendern des Todo-Textes
    const renderTodoText = () => {
        if (!isTextLong || expanded) {
            return <span className="todo-text">{escapeHTML(todo.text)}</span>;
        }
        
        return (
            <div className="todo-text-container">
                <span className="todo-text">{escapeHTML(todo.text.substring(0, maxTextLength))}...</span>
                <button 
                    className="toggle-text-btn" 
                    onClick={toggleExpanded}
                >
                    Mehr lesen
                </button>
            </div>
        );
    };

    return (
        <li 
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
            ref={provided.innerRef} // Referenz für DND
            {...provided.draggableProps} // Props für DND
            {...provided.dragHandleProps} // Props für den Drag-Handle
            style={getItemStyle(
                snapshot.isDragging,
                provided.draggableProps.style
            )}
        >
            <input 
                type="checkbox" 
                className="todo-complete" 
                checked={todo.completed}
                onChange={handleCheckboxChange}
            />
            
            {/* Dynamischer Text mit Mehr/Weniger-Funktion */}
            {isTextLong ? (
                <div className="todo-text-wrapper">
                    {expanded ? (
                        <>
                            <span className="todo-text">{escapeHTML(todo.text)}</span>
                            <button 
                                className="toggle-text-btn" 
                                onClick={toggleExpanded}
                            >
                                Weniger anzeigen
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="todo-text">
                                {escapeHTML(todo.text.substring(0, maxTextLength))}...
                            </span>
                            <button 
                                className="toggle-text-btn" 
                                onClick={toggleExpanded}
                            >
                                Mehr anzeigen
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <span className="todo-text">{escapeHTML(todo.text)}</span>
            )}
            
            <input 
                type="date" 
                className="todo-date" 
                value={todo.date || ''} // Stelle sicher, dass es ein leerer String ist, wenn null/undefined
                onChange={handleDateChange}
            />
            <select 
                className="todo-priority" 
                value={todo.priority || 'medium'} 
                onChange={handlePriorityChange}
            >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
            </select>
            <button className="delete-btn" onClick={() => onDeleteTodo(todo.id)}>
                 {/* Optional: Icon statt Text/Entity */} 
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </li>
    );
}

export default TodoItem; 