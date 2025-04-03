import React from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import './Chat.css'; // Importiere die gemeinsamen Stile

function ChatContainer({ messages, onSendMessage, loading, error }) {
    return (
        <div className="chat-container-react"> {/* Eindeutige Klasse */} 
            {/* Titel und Subtitel kommen von App.jsx (außerhalb dieser Komponente) */}
             <h2>
                 {/* Optional: Icon */} 
                Chat mit KI Agent
            </h2>
            <p className="subtitle">Beschreibe deine Aufgaben und der KI Agent hilft dir</p>
            
            {/* Fehlermeldung spezifisch für Chat (optional) */} 
            {/* {error && <div className="error-message chat-error">{error}</div>} */} 
            
            <MessageList messages={messages} />
            
            <ChatInput onSendMessage={onSendMessage} loading={loading} />
        </div>
    );
}

export default ChatContainer; 