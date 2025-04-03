import React, { useEffect, useRef } from 'react';
import Message from './Message';

function MessageList({ messages }) {
    const messagesEndRef = useRef(null); // Referenz zum letzten Element

    // Automatisch nach unten scrollen, wenn neue Nachrichten hinzukommen
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Effekt ausführen, wenn sich Nachrichten ändern

    return (
        <div id="chat-box"> {/* ID beibehalten für Styling */} 
            {messages.map(msg => (
                <Message key={msg.id} message={msg} />
            ))}
            {/* Leeres div am Ende als Scroll-Anker */} 
            <div ref={messagesEndRef} /> 
        </div>
    );
}

export default MessageList; 