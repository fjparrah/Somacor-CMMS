import React from 'react';
import GenericCRUD from '../components/shared/GenericCRUD';

const FaenasView = () => {
    // Define las columnas que se mostrarán en la tabla de faenas
    const columns = [
        { header: 'ID', accessor: 'idfaena' },
        { header: 'Nombre', accessor: 'nombrefaena' },
        { header: 'Ubicación', accessor: 'ubicacion' },
        { header: 'Contacto', accessor: 'contacto' },
        { header: 'Activa', accessor: 'activa' },
    ];

    // Define los campos que aparecerán en el formulario de creación/edición
    const formFields = [
        { name: 'nombrefaena', label: 'Nombre de la Faena' },
        { name: 'ubicacion', label: 'Ubicación', required: false },
        { name: 'contacto', label: 'Contacto', required: false },
        { name: 'telefono', label: 'Teléfono', required: false },
        { name: 'activa', label: 'Activa', type: 'checkbox', defaultValue: true },
    ];

    return (
        <GenericCRUD
            title="Gestión de Faenas"
            apiEndpoint="/faenas/"
            columns={columns}
            formFields={formFields}
            idAccessor="idfaena"
        />
    );
};

export default FaenasView;