# Datos de Prueba CMMS Somacor

Este directorio contiene un script para cargar datos de prueba en el sistema CMMS Somacor.

## Script de Datos de Prueba

### `load_sample_data.py`

Script que crea datos de prueba realistas para el sistema CMMS, incluyendo:

- 5 órdenes de trabajo de ejemplo (preventivas y correctivas)
- 5 eventos de agenda sincronizados con las órdenes
- Usuario sistema para gestión de eventos
- Datos distribuidos en diferentes estados y prioridades

### Uso

```bash
# Desde el directorio backend
cd somacor_cmms/backend

# Ejecutar el script
python manage.py shell < load_sample_data.py
```

### Datos Creados

#### Órdenes de Trabajo:
1. **Mantenimiento preventivo 10,000 km** - Camioneta Chevrolet D-Max
2. **Inspección de frenos** - Camioneta Ford Ranger  
3. **Reparación sistema hidráulico** - Camioneta Ford Ranger
4. **Cambio de neumático** - Camioneta Toyota Hilux
5. **Mantenimiento de motor** - Camioneta Toyota Hilux

#### Estados Distribuidos:
- **Abierta:** 3 órdenes
- **En Progreso:** 1 orden
- **Completada:** 1 orden

#### Prioridades:
- **Alta:** 2 órdenes
- **Media:** 3 órdenes

### Requisitos Previos

- Base de datos inicializada con migraciones
- Usuarios básicos creados (admin, operador_reportes, Tecnico1)
- Equipos y catálogos básicos cargados

### Notas

- El script verifica duplicados antes de crear datos
- Los eventos de agenda se sincronizan automáticamente
- Las fechas se calculan relativamente a la fecha actual
- Compatible con cualquier entorno (desarrollo, testing, producción)
