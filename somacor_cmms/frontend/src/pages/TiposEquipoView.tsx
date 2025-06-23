import React from 'react';
import GenericCRUD from '../components/shared/GenericCRUD';

const TiposEquipoView = () => {
    // Define las columnas para la tabla
    const columns = [
        { header: 'ID', accessor: 'idtipoequipo' },
        { header: 'Nombre del Tipo', accessor: 'nombretipo' },
        { header: 'Descripción', accessor: 'descripciontipo' },
    ];

    // Define los campos para el formulario
    const formFields = [
        { name: 'nombretipo', label: 'Nombre del Tipo de Equipo' },
        { name: 'descripciontipo', label: 'Descripción', required: false },
    ];

    return (
        <GenericCRUD
            title="Gestión de Tipos de Equipo"
            apiEndpoint="/tipos-equipo/"
            columns={columns}
            formFields={formFields}
            idAccessor="idtipoequipo"
            transformItemForEdit={(item) => item}
        />
    );
};

export default TiposEquipoView;