// src/pages/ProfilesView.tsx

import React, { useState, useEffect } from 'react';
import GenericCRUD from '../components/shared/GenericCRUD';
import apiClient from '../api/apiClient';

const ProfilesView = () => {
    const [formFields, setFormFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nombre de Usuario', accessor: 'username' },
        { header: 'Nombre Completo', accessor: 'first_name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Rol', accessor: (item) => item.nombrerol || 'N/A' }, // Usar nombrerol directamente del UserSerializer
        { header: 'Activo', accessor: 'is_active' },
    ];

    useEffect(() => {
        const fetchRoles = async () => {
            setLoading(true);
            setError('');
            try {
                const rolesRes = await apiClient.get('/roles/');
                
                const fields = [
                    { name: 'username', label: 'Nombre de Usuario' },
                    { 
                        name: 'password', 
                        label: 'Contraseña', 
                        type: 'password', 
                        required: false,
                        placeholder: 'Dejar en blanco para no cambiar' 
                    },
                    { name: 'first_name', label: 'Nombre Completo' }, // Cambiado de nombre_completo a first_name
                    { name: 'email', label: 'Correo Electrónico', type: 'email' },
                    { 
                        name: 'idrol', // Cambiado de rol_id a idrol para coincidir con el serializer
                        label: 'Rol del Usuario', 
                        type: 'select',
                        options: (rolesRes.data.results || rolesRes.data).map(r => ({ value: r.idrol, label: r.nombrerol }))
                    },
                    { name: 'is_active', label: 'Activo', type: 'checkbox', defaultValue: true },
                ];
                setFormFields(fields);
            } catch (err) {
                console.error("Error fetching roles:", err);
                setError("No se pudo cargar la configuración del formulario de perfiles.");
            } finally {
                setLoading(false);
            }
        };

        fetchRoles();
    }, []);

    const transformUserDataForEdit = (user) => {
        return {
            ...user,
            // No es necesario transformar nombre_completo si el campo es first_name
            idrol: user.usuarios?.idrol, // Asegurarse de que el idrol se pase correctamente
        };
    };

    if (loading) return <p>Cargando configuración...</p>;
    if (error) return <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>;

    return (
        <GenericCRUD
            title="Gestión de Perfiles (Usuarios)"
            apiEndpoint="users/" 
            columns={columns}
            formFields={formFields}
            idAccessor="id"
            transformItemForEdit={transformUserDataForEdit}
        />
    );
};

export default ProfilesView;


