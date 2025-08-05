
import React from 'react';

export const OfflineIndicator: React.FC = () => {
    return (
        <div className="bg-yellow-500 text-white text-center py-2 text-sm font-semibold fixed top-0 left-64 right-0 z-50 animate-fade-in-down">
            Estás trabajando en modo offline. Los cambios se guardan localmente.
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};
