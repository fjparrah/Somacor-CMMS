import React from 'react';
import GenericCRUD from '../components/shared/GenericCRUD';

const TiposTareaView = () => {
    // Define las columnas para la tabla
    const columns = [
        { header: 'ID', accessor: 'idtipotarea' },
        { header: 'Nombre del Tipo de Tarea', accessor: 'nombretipotarea' },
        { header: 'Descripción', accessor: 'descripcion' },
    ];

    // Define los campos para el formulario
    const formFields = [
        { name: 'nombretipotarea', label: 'Nombre del Tipo de Tarea' },
        { name: 'descripcion', label: 'Descripción', required: false },
    ];

    return (
        <GenericCRUD
            title="Gestión de Tipos de Tarea"
            apiEndpoint="/tipos-tarea/"
            columns={columns}
            formFields={formFields}
            idAccessor="idtipotarea"
        />
    );
};

export default TiposTareaView;