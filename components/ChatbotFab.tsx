import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ChatIcon, XMarkIcon } from './icons';

export const ChatbotFab: React.FC = () => {
    const { state, toggleChat } = useAppContext();
    const { isChatOpen } = state;

    return (
        <button
            onClick={toggleChat}
            className="fixed bottom-6 right-4 sm:right-6 md:right-8 bg-primary-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-transform duration-300 ease-out transform hover:scale-110 z-[60]"
            aria-label={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
        >
            <div className="transition-transform duration-300 ease-in-out" style={{ transform: isChatOpen ? 'rotate(180deg) scale(0)' : 'rotate(0) scale(1)', position: 'absolute' }}>
                <ChatIcon />
            </div>
            <div className="transition-transform duration-300 ease-in-out" style={{ transform: isChatOpen ? 'rotate(0) scale(1)' : 'rotate(-180deg) scale(0)', position: 'absolute' }}>
                <XMarkIcon />
            </div>
        </button>
    );
};
