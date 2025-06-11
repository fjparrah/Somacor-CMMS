import React from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    // El fondo oscuro que cubre toda la pantalla.
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose} // Cierra el modal al hacer clic en el fondo.
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-full overflow-y-auto transform transition-all duration-300 scale-95"
                onClick={e => e.stopPropagation()} // Evita que el modal se cierre al hacer clic dentro de él.
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        &times;
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;