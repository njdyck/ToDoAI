import React, { useState } from 'react';

function ChatInput({ onSendMessage, loading }) {
    const [inputValue, setInputValue] = useState('');
    const [selectedModel, setSelectedModel] = useState('openai'); // Standardmodell

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || loading) return; // Senden verhindern, wenn leer oder am Laden
        onSendMessage(inputValue, selectedModel);
        setInputValue(''); // Eingabefeld leeren
    };

    return (
        <form className="chat-input" onSubmit={handleSubmit}>
             <div className="input-row">
                <input 
                    id="user-input" 
                    type="text"
                    placeholder="Beschreibe deine Aufgabe..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={loading} // Deaktivieren während des Ladens
                    autoComplete="off"
                />
                <button 
                    id="send-button" 
                    type="submit" 
                    disabled={loading || !inputValue.trim()} // Deaktivieren, wenn leer oder am Laden
                >
                    {/* Optional: Lade-Spinner anzeigen */} 
                    {loading ? (
                        <div className="spinner"></div> /* Einfacher CSS-Spinner */
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    )}
                </button>
             </div>
             <div className="model-selection">
                 <label htmlFor="ai-model">KI-Modell:</label>
                 <select 
                    id="ai-model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={loading}
                 >
                    {/* 
                      TODO: Modellauswahl dynamisch gestalten oder 
                      basierend auf verfügbarer Backend-Logik anpassen.
                      Aktuell ist nur OpenAI im Backend gut implementiert.
                    */}
                    <option value="openai">OpenAI GPT-3.5</option> 
                    {/* <option value="google">Google (Gemini - TODO)</option> */} 
                    <option value="google" disabled>Google (Nicht impl.)</option> 
                 </select>
             </div>
        </form>
    );
}

export default ChatInput; 