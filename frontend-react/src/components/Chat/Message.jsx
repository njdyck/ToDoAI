import React from 'react';

function Message({ message }) {
    const { sender, text, isError } = message;
    const messageClass = sender === 'user' ? 'user-message' : 'agent-message';
    const errorClass = isError ? 'error-message-content' : ''; // Zusätzliche Klasse für Fehlernachrichten

    // TODO: Markdown-Unterstützung für Agenten-Nachrichten hinzufügen (z.B. mit react-markdown)
    
    return (
        <div className={`message ${messageClass} ${errorClass}`}>
            {/* 
              Einfache Textanzeige. Wenn der Text HTML enthält, 
              muss er sanitized werden! Wenn er Markdown ist, braucht er einen Parser. 
            */}
            {text}
        </div>
    );
}

export default Message; 