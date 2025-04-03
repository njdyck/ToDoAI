import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // Importiere die DND-Bibliothek
import TodoItem from './TodoItem';

// Hilfsfunktion zum Neuordnen (Beispiel)
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

function TodoList({ todos, onUpdateTodo, onDeleteTodo }) {

  // Hinweis: Die onDragEnd-Funktion muss im Parent (App.jsx)
  // implementiert werden, um den State (todos) zu aktualisieren.
  // Hier wird sie nur als Platzhalter benötigt.
  const handleDragEnd = (result) => {
    if (!result.destination) {
      return; // Nicht außerhalb der Liste gedroppt
    }
    // TODO: Implementiere Logik in App.jsx, um die Todos neu anzuordnen
    // const items = reorder(
    //   todos,
    //   result.source.index,
    //   result.destination.index
    // );
    // setTodos(items); // Aufruf der State-Update-Funktion aus App.jsx
    console.log('Drag ended, implement reordering logic in App.jsx', result);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}> 
      <Droppable droppableId="todoListDroppable"> 
        {(provided) => (
          <ul 
            className="todo-list" 
            {...provided.droppableProps} 
            ref={provided.innerRef}
          >
            {todos.map((todo, index) => (
               <Draggable key={todo.id.toString()} draggableId={todo.id.toString()} index={index}>
                 {(providedDraggable, snapshot) => (
                    <TodoItem 
                        todo={todo} 
                        onUpdateTodo={onUpdateTodo} 
                        onDeleteTodo={onDeleteTodo}
                        provided={providedDraggable} // Übergebe DND-Props
                        snapshot={snapshot} // Übergebe Snapshot für Styling
                    />
                 )}
               </Draggable>
            ))}
            {provided.placeholder} {/* Platzhalter für DND */} 
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default TodoList; 