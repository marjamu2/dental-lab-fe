import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { XMarkIcon, SendIcon, ToothIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';
import { MarkdownRenderer } from './MarkdownRenderer';

export const Chatbot: React.FC = () => {
    const { state, toggleChat, sendMessageToAI } = useAppContext();
    const { isChatOpen, isChatLoading, chatMessages } = state;
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll to the latest message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isChatLoading) {
            sendMessageToAI(input.trim());
            setInput('');
        }
    };

    if (!isChatOpen) return null;

    return (
        <div className="fixed bottom-24 right-4 sm:right-6 md:right-8 w-[calc(100%-2rem)] sm:w-96 h-[70vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-primary-800 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                    <ToothIcon />
                    <h3 className="text-lg font-semibold">Asistente IA Dental</h3>
                </div>
                <button onClick={toggleChat} className="p-1 rounded-full hover:bg-primary-700">
                    <XMarkIcon />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                     {chatMessages.length === 0 && (
                        <div className="text-center text-gray-500 pt-10">
                            <p>Hola, soy tu asistente virtual.</p>
                            <p className="text-sm mt-2">Puedes preguntarme sobre órdenes de trabajo, clientes, o temas de odontología.</p>
                        </div>
                    )}
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                               <MarkdownRenderer content={msg.content} />
                            </div>
                        </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 flex items-center">
                                <LoadingSpinner size="sm" />
                                <span className="ml-2 text-sm">Pensando...</span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Escribe tu pregunta..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={1}
                        disabled={isChatLoading}
                    />
                    <button type="submit" disabled={isChatLoading || !input.trim()} className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed">
                        <SendIcon />
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
