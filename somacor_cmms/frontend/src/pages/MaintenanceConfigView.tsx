import React, { useState } from 'react';

// Este componente representa la página de Configuración de Mantenimiento.
const MaintenanceConfigView = () => {
    // Estado para manejar la máquina seleccionada en el dropdown
    const [selectedMachine, setSelectedMachine] = useState('');
    
    // Estado para manejar las tareas de mantenimiento seleccionadas
    const [tasks, setTasks] = useState({
        lubricacion: false,
        comprobarNivel: false,
        reemplazarFiltro: false,
        inspeccionarCorrea: false
    });
    
    // Estado para manejar las horas programadas
    const [hours, setHours] = useState({
        pm1: '',
        pm2: '',
        pm3: ''
    });

    // Manejador para los checkboxes de tareas
    const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setTasks(prev => ({ ...prev, [name]: checked }));
    };

    // Manejador para los inputs de horas
    const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHours(prev => ({ ...prev, [name]: value }));
    };

    // Función que se ejecuta al guardar la configuración
    const handleSave = () => {
        if (!selectedMachine) {
            alert("Por favor, seleccione una máquina.");
            return;
        }
        console.log("Guardando configuración...");
        console.log("Máquina:", selectedMachine);
        console.log("Tareas:", tasks);
        console.log("Horas:", hours);
        alert("Configuración guardada. Revisa la consola para ver los datos.");
    };

    return (
         <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Configuración de Mantenimiento</h1>
            <div className="bg-white p-8 rounded-xl shadow-md space-y-8">
                {/* Selección de Máquina */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Máquina</label>
                    <select 
                        value={selectedMachine} 
                        onChange={e => setSelectedMachine(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">-- Seleccione una opción --</option>
                        <option value="Cargador Frontal 966 GC">Cargador Frontal 966 GC</option>
                        <option value="Retroexcavadora 3157TR">Retroexcavadora 3157TR</option>
                        <option value="Camión Minero 797F">Camión Minero 797F</option>
                    </select>
                </div>

                {/* Tareas de Mantenimiento */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Tareas de Mantenimiento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <label className="flex items-center space-x-3">
                            <input type="checkbox" name="lubricacion" checked={tasks.lubricacion} onChange={handleTaskChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <span>Lubricación del cojinete de soporte</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input type="checkbox" name="comprobarNivel" checked={tasks.comprobarNivel} onChange={handleTaskChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <span>Comprobar nivel de líquido del eje motriz</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input type="checkbox" name="reemplazarFiltro" checked={tasks.reemplazarFiltro} onChange={handleTaskChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <span>Reemplazar filtro de aceite hidráulico</span>
                        </label>
                        <label className="flex items-center space-x-3">
                            <input type="checkbox" name="inspeccionarCorrea" checked={tasks.inspeccionarCorrea} onChange={handleTaskChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <span>Inspeccionar la correa serpentina</span>
                        </label>
                    </div>
                </div>
                
                 {/* Horas Programadas */}
                 <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Horas Programadas</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-medium text-gray-600">PM1 (250 HRS)</label>
                            <input type="number" placeholder="Horas" name="pm1" value={hours.pm1} onChange={handleHourChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600">PM2 (500 HRS)</label>
                            <input type="number" placeholder="Horas" name="pm2" value={hours.pm2} onChange={handleHourChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-gray-600">PM3 (1000 HRS)</label>
                            <input type="number" placeholder="Horas" name="pm3" value={hours.pm3} onChange={handleHourChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                        </div>
                     </div>
                </div>

                {/* Botón de Guardar */}
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave} 
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-colors"
                    >
                        Guardar Configuración
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceConfigView;