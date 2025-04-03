// Diese Datei wird später die Interaktionslogik enthalten
console.log("Script geladen.");

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const todoList = document.getElementById('todo-list');
    const newTodoTextInput = document.getElementById('new-todo-text');
    const newTodoDateInput = document.getElementById('new-todo-date');
    const newTodoPriorityInput = document.getElementById('new-todo-priority');
    const addTodoButton = document.getElementById('add-todo-btn');
    const filterPrioritySelect = document.getElementById('filter-priority');
    const sortBySelect = document.getElementById('sort-by');
    const clearCompletedButton = document.getElementById('clear-completed-btn');
    const aiModelSelect = document.getElementById('ai-model');

    // --- System Prompt ---
    const SYSTEM_PROMPT = "Du bist ein KI Agent um ToDo's zu erstellen. Erstelle präzise und gut formulierte ToDo's und sortiere diese zeitlich (per Datum) und mit Prioritäten, um dem Nutzer die Arbeit zu erleichtern.";

    // --- State ---
    let todos = []; // Leere Liste starten, wird vom Server gefüllt
    let currentFilter = 'all';
    let currentSort = 'default';

    // --- Initial Render ---
    loadTodosFromServer(); // ToDos vom Server laden
    initializeSortable();

    // --- Functions ---

    // ToDos vom Server laden
    async function loadTodosFromServer() {
        try {
            const response = await fetch('/todos');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            todos = data || [];
            renderTodos();
        } catch (error) {
            console.error('Fehler beim Laden der ToDos vom Server:', error);
            // Fallback: Lokale ToDos laden, falls der Server-Aufruf fehlschlägt
            todos = loadTodosFromLocalStorage();
            renderTodos();
        }
    }

    // Load Todos from Local Storage (als Fallback)
    function loadTodosFromLocalStorage() {
        const storedTodos = localStorage.getItem('todos');
        return storedTodos ? JSON.parse(storedTodos) : [];
    }

    // Save Todos to Local Storage (als Fallback)
    function saveTodosToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Render the ToDo list
    function renderTodos() {
        const emptyState = document.getElementById('empty-state');
        todoList.innerHTML = ''; // Clear existing list

        // Apply filtering
        let filteredTodos = todos.filter(todo => {
            if (currentFilter === 'all') return true;
            return todo.priority === currentFilter;
        });

        // Apply sorting
        let sortedTodos = [...filteredTodos]; // Create a copy to sort
        if (currentSort === 'date') {
            sortedTodos.sort((a, b) => {
                // Handle cases where date might be empty
                const dateA = a.date ? new Date(a.date) : new Date(0); // Early date if empty
                const dateB = b.date ? new Date(b.date) : new Date(0);
                return dateA - dateB;
            });
        } else if (currentSort === 'priority') {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            sortedTodos.sort((a, b) => (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4));
        }
        // 'default' sort uses the order from the todos array

        // Zeige leeren Zustand wenn keine Todos
        if (sortedTodos.length === 0) {
            emptyState.style.display = 'flex';
            todoList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            todoList.style.display = 'flex';
            
            // Render each todo item
            sortedTodos.forEach(todo => {
                const li = createTodoElement(todo);
                todoList.appendChild(li);
            });
        }
    }

    // Create HTML element for a single ToDo item
    function createTodoElement(todo) {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.dataset.id = todo.id;
        li.draggable = true; // Necessary for SortableJS
        if (todo.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <input type="checkbox" class="todo-complete" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHTML(todo.text)}</span>
            <input type="date" class="todo-date" value="${todo.date || ''}">
            <select class="todo-priority">
                <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Niedrig</option>
                <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Mittel</option>
                <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>Hoch</option>
            </select>
            <button class="delete-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;

        // Add specific class based on priority for easier styling/selection if needed
        li.classList.add(`priority-${todo.priority}`);

        return li;
    }

    // Add a new ToDo item
    async function addTodo(text, date = '', priority = 'medium', fromAgent = false) {
        if (!text.trim()) return; // Do not add empty todos

        const newTodo = {
            text: text.trim(),
            completed: false,
            date: date,
            priority: priority
        };

        try {
            // Sende das neue Todo an den Server
            const response = await fetch('/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTodo)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const savedTodo = await response.json();
            
            // Wenn erfolgreich gespeichert, füge es dem lokalen Array hinzu
            if (savedTodo && savedTodo.length > 0) {
                todos.push(savedTodo[0]);
            } else {
                // Fallback: ohne ID zum lokalen Array hinzufügen
                newTodo.id = Date.now(); // Simple unique ID generation
                todos.push(newTodo);
                saveTodosToLocalStorage(); // Lokal speichern als Fallback
            }
        } catch (error) {
            console.error('Fehler beim Speichern des ToDo:', error);
            // Fallback: zum lokalen Array hinzufügen
            newTodo.id = Date.now();
            todos.push(newTodo);
            saveTodosToLocalStorage();
        }

        renderTodos(); // Re-render the list

        // Clear input fields only if added manually
        if (!fromAgent) {
             newTodoTextInput.value = '';
             newTodoDateInput.value = ''; // Optionally reset date/priority too
             newTodoPriorityInput.value = 'medium';
        }
    }

    // Delete a ToDo item
    async function deleteTodo(id) {
        try {
            // Vom Server löschen
            const response = await fetch(`/todos/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Aus dem lokalen Array entfernen
            todos = todos.filter(todo => todo.id !== id);
        } catch (error) {
            console.error('Fehler beim Löschen des ToDo:', error);
            // Fallback: Nur aus lokalem Array entfernen
            todos = todos.filter(todo => todo.id !== id);
            saveTodosToLocalStorage();
        }
        
        renderTodos();
    }

    // Toggle completed status of a ToDo item
    async function toggleComplete(id) {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        
        const updatedCompleted = !todo.completed;
        
        try {
            // Server aktualisieren
            const response = await fetch(`/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: updatedCompleted })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Lokales Objekt aktualisieren
            todo.completed = updatedCompleted;
        } catch (error) {
            console.error('Fehler beim Aktualisieren des ToDo:', error);
            // Fallback: nur lokales Objekt aktualisieren
            todo.completed = updatedCompleted;
            saveTodosToLocalStorage();
        }
        
        renderTodos();
    }

    // Update date or priority of a ToDo item
    async function updateTodo(id, key, value) {
        const todo = todos.find(todo => todo.id === id);
        if (!todo) return;
        
        try {
            // Server aktualisieren
            const response = await fetch(`/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Lokales Objekt aktualisieren
            todo[key] = value;
        } catch (error) {
            console.error('Fehler beim Aktualisieren des ToDo:', error);
            // Fallback: nur lokales Objekt aktualisieren
            todo[key] = value;
            saveTodosToLocalStorage();
        }
        
        renderTodos();
    }

    // Clear all completed ToDos
    async function clearCompletedTodos() {
        const completedTodos = todos.filter(todo => todo.completed);
        
        try {
            // Alle abgeschlossenen ToDos nacheinander löschen
            for (const todo of completedTodos) {
                await fetch(`/todos/${todo.id}`, {
                    method: 'DELETE'
                });
            }
            
            // Lokale Liste aktualisieren
            todos = todos.filter(todo => !todo.completed);
        } catch (error) {
            console.error('Fehler beim Löschen der erledigten ToDos:', error);
            // Fallback: nur lokale Liste aktualisieren
            todos = todos.filter(todo => !todo.completed);
            saveTodosToLocalStorage();
        }
        
        renderTodos();
    }

    // Add a message to the chat box
    function addChatMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
    }

    // Send message to backend API
    async function sendMessageToAgent(message) {
        if (!message.trim()) return;
        addChatMessage(message, 'user');
        userInput.value = ''; // Clear input field

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `${SYSTEM_PROMPT}\n\n${message}`, // Prepend system prompt
                    model: aiModelSelect.value // Send selected model to backend
                 }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log('Antwort vom /chat Endpunkt:', data); // Hinzugefügt für Debugging

            // Add agent's reply to chat
            if (data.agent_reply) {
                addChatMessage(data.agent_reply, 'agent');
            }

            // Die Server-Antwort enthält bereits gespeicherte ToDos mit IDs
            if (data.todos && Array.isArray(data.todos)) {
                // ToDos aktualisieren und neu rendern
                await loadTodosFromServer(); 
            }

        } catch (error) {
            console.error('Error sending message:', error);
            addChatMessage('Entschuldigung, es gab ein Problem mit der Verbindung zum Agenten.', 'agent');
        }
    }

    // Initialize SortableJS for Drag & Drop
    function initializeSortable() {
        if (window.Sortable) {
            new Sortable(todoList, {
                animation: 150,
                ghostClass: 'sortable-ghost', // Class for the drop placeholder
                onEnd: function (evt) {
                    // evt.oldIndex and evt.newIndex are the original and new positions
                    const movedItem = todos.splice(evt.oldIndex, 1)[0];
                    todos.splice(evt.newIndex, 0, movedItem);
                    saveTodosToLocalStorage(); // Save the new order
                    // No need to re-render here, SortableJS handles the DOM update visually
                }
            });
        } else {
            console.error("SortableJS not loaded!");
        }
    }

    // Helper to escape HTML to prevent XSS
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // --- Event Listeners ---

    // Send message when send button is clicked
    sendButton.addEventListener('click', () => {
        const message = userInput.value;
        if (message.trim()) {
            addChatMessage(message, 'user');
            sendMessageToAgent(message);
            userInput.value = ''; // Clear input after sending
        }
    });

    // Send message when Enter is pressed in input field
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    // Add todo when add button is clicked
    addTodoButton.addEventListener('click', () => {
        const text = newTodoTextInput.value;
        const date = newTodoDateInput.value;
        const priority = newTodoPriorityInput.value;
        addTodo(text, date, priority, false); // false indicates it's not from the agent
    });

    // Add todo when Enter is pressed in the new todo text input
    newTodoTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodoButton.click();
        }
    });

    // Update filter when priority filter changes
    filterPrioritySelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderTodos();
    });

    // Update sort when sort select changes
    sortBySelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTodos();
    });

    // Clear completed todos when button is clicked
    clearCompletedButton.addEventListener('click', () => {
        clearCompletedTodos();
    });

    // Handle actions within the ToDo list (Complete, Delete, Update)
    todoList.addEventListener('click', (e) => {
        const target = e.target;
        const listItem = target.closest('.todo-item');
        if (!listItem) return; // Click was not inside a todo item

        const todoId = parseInt(listItem.dataset.id, 10);

        // Toggle complete status
        if (target.classList.contains('todo-complete')) {
            toggleComplete(todoId);
        }

        // Delete todo item
        if (target.closest('.delete-btn')) { // Check if the click was on the delete button or its SVG icon
            deleteTodo(todoId);
        }
    });

    // Handle direct edits (date, priority) within the ToDo list
    todoList.addEventListener('change', (e) => {
        const target = e.target;
        const listItem = target.closest('.todo-item');
        if (!listItem) return;

        const todoId = parseInt(listItem.dataset.id, 10);

        // Update date
        if (target.classList.contains('todo-date')) {
            updateTodo(todoId, 'date', target.value);
        }

        // Update priority
        if (target.classList.contains('todo-priority')) {
            updateTodo(todoId, 'priority', target.value);
            // Update class on list item for styling consistency
            listItem.className = 'todo-item'; // Reset priority classes
            if (todos.find(t => t.id === todoId)?.completed) {
                listItem.classList.add('completed');
            }
            listItem.classList.add(`priority-${target.value}`);
        }
    });

});
