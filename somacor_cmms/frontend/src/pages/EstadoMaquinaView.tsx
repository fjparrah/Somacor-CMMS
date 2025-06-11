import React, { useState } from 'react';

// Componente para una caja de estado individual en el diagrama
const StateBox = ({ label, color = 'bg-white', textColor = 'text-gray-800', borderColor = 'border-gray-400' }) => (
    <div className={`p-3 text-center rounded-md shadow-md border-2 ${borderColor} ${color} ${textColor} font-semibold`}>
        {label}
    </div>
);

// Componente principal para la vista "Estado de la Máquina"
const EstadoMaquinaView = () => {
    const [selectedMachine, setSelectedMachine] = useState('Cargador Frontal 966 GC');
    
    // Datos de ejemplo para la cabecera
    const machineData = {
        'Cargador Frontal 966 GC': { ubicacion: 'Faena 1', chofer: 'Juan Pérez', cliente: 'Cliente XYZ' },
        'Retroexcavadora 3157TR': { ubicacion: 'Faena 2', chofer: 'Pedro Gómez', cliente: 'Cliente ABC' },
    };

    const currentData = machineData[selectedMachine] || { ubicacion: '', chofer: '', cliente: '' };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Estado de la Máquina</h1>

            {/* Cabecera con filtros */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Seleccionar Máquina</label>
                        <select 
                            value={selectedMachine} 
                            onChange={e => setSelectedMachine(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="Cargador Frontal 966 GC">Cargador Frontal 966 GC</option>
                            <option value="Retroexcavadora 3157TR">Retroexcavadora 3157TR</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ubicación Actual</label>
                        <input type="text" value={currentData.ubicacion} readOnly className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                        <input type="date" className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre del Chofer</label>
                        <input type="text" value={currentData.chofer} readOnly className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                    </div>
                     <div className="md:col-span-2 lg:col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Nombre del Cliente</label>
                        <input type="text" value={currentData.cliente} readOnly className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                    </div>
                </div>
            </div>

            {/* Diagrama de Estados */}
            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-center text-gray-700 mb-8">Diagrama de Estados de la Máquina</h2>
                <div className="relative flex flex-col items-center space-y-12">
                    {/* Líneas de conexión (simuladas con divs) */}
                    <div className="absolute top-0 h-full w-0.5 bg-gray-300" style={{left: '50%'}}></div>

                    {/* Estados */}
                    <StateBox label="ACTIVA" />
                    <StateBox label="ASIGNADA" />
                    <StateBox label="OPERANDO" borderColor="border-blue-500" />
                    
                    <div className="relative w-full flex justify-center space-x-16">
                         {/* Líneas horizontales */}
                         <div className="absolute top-1/2 w-1/2 h-0.5 bg-gray-300" style={{left: '25%', transform: 'translateY(-50%)'}}></div>
                         <StateBox label="MANTENCIÓN PRG" borderColor="border-green-500" />
                         <StateBox label="MANTENCIÓN NO PRG" />
                    </div>

                    <StateBox label="DETENIDA" color="bg-red-500" textColor="text-white" borderColor="border-red-700" />
                    <StateBox label="INACTIVA" />
                </div>
            </div>
        </div>
    );
};

export default EstadoMaquinaView;