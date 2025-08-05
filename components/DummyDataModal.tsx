
import React from 'react';

interface DummyDataModalProps {
    onConfirm: () => void;
    onDecline: () => void;
}

export const DummyDataModal: React.FC<DummyDataModalProps> = ({ onConfirm, onDecline }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center animate-fade-in-up">
                <h3 className="text-xl font-semibold text-gray-800">Modo Offline Detectado</h3>
                <div className="mt-4 text-gray-600">
                    <p>No se pudo conectar al servidor y no se encontraron datos locales.</p>
                    <p className="mt-2">¿Desea cargar datos de ejemplo para poder utilizar la aplicación?</p>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                    <button onClick={onDecline} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300">
                        No, empezar de cero
                    </button>
                    <button onClick={onConfirm} className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700">
                        Sí, cargar datos
                    </button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
