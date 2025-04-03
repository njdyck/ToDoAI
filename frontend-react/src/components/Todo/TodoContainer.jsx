import React from 'react';
import TodoList from './TodoList';
import AddTodoForm from './AddTodoForm';
import TodoControls from './TodoControls';
import './Todo.css'; // Importiere die gemeinsamen Stile

function TodoContainer({
    todos,
    onAddTodo,
    onUpdateTodo,
    onDeleteTodo,
    onClearCompleted,
    onSortChange,
    onFilterChange,
    currentSort,
    currentFilter,
    loading,
    error
}) {

    const hasCompletedTodos = todos.some(todo => todo.completed);

    return (
        <div className="todo-container-react"> {/* Eindeutige Klasse für React-Komponente */} 
            <div className="todo-header">
                <div>
                    <h2>
                        {/* Optional: Icon einfügen */}
                        Deine ToDo Liste
                    </h2>
                    <p className="subtitle">Organisiere deine Aufgaben</p>
                </div>
                {/* Zeige Button nur, wenn es erledigte Todos gibt */} 
                {hasCompletedTodos && (
                    <button id="clear-completed-btn" onClick={onClearCompleted}>
                        {/* Optional: Icon einfügen */}
                        Erledigte löschen
                    </button>
                )}
            </div>

            <TodoControls 
                onSortChange={onSortChange} 
                onFilterChange={onFilterChange}
                currentSort={currentSort}
                currentFilter={currentFilter}
            />

            {/* Ladeanzeige und Fehlermeldung */} 
            {loading && <div className="loading-indicator">Lade ToDos...</div>}
            {error && <div className="error-message">{error}</div>}

            {/* Todo-Liste oder leerer Zustand - in einem gemeinsamen Container */}
            <div className="todo-content-container">
                {/* ToDo Liste */} 
                {todos.length > 0 ? (
                    <TodoList 
                        todos={todos} 
                        onUpdateTodo={onUpdateTodo} 
                        onDeleteTodo={onDeleteTodo}
                    />
                ) : !loading && (
                    <div className="empty-state">
                        {/* Optional: SVG Icon */} 
                        <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" style={{ opacity: 0.7 }}>
                            <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
                        </svg>
                        <h3>Keine Aufgaben gefunden</h3>
                        <p>{currentFilter !== 'all' ? 'Versuche einen anderen Filter.' : 'Füge deine erste Aufgabe hinzu!'}</p>
                    </div>
                )}
            </div>

            {/* Formular zum Hinzufügen */} 
            <AddTodoForm onAddTodo={onAddTodo} />
        </div>
    );
}

export default TodoContainer; 