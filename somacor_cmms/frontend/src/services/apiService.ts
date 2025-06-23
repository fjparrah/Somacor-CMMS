// src/services/apiService.ts
// Servicios API centralizados para cada módulo

import apiClient from '../api/apiClient';
import type {
  ApiResponse,
  Equipo,
  TipoEquipo,
  EstadoEquipo,
  Faena,
  PlanMantenimiento,
  DetallePlanMantenimiento,
  TareaEstandar,
  TipoTarea,
  OrdenTrabajo,
  ActividadOrdenTrabajo,
  TipoMantenimientoOT,
  EstadoOrdenTrabajo,
  Agenda,
  ChecklistTemplate,
  ChecklistInstance,
  ChecklistAnswer,
  DashboardStats,
  ChecklistCompletionResponse,
  ChecklistFormData,
  OrdenTrabajoFormData,
  User
} from '../types';

// Servicio base para operaciones CRUD
class BaseService<T> {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async getAll(params?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await apiClient.get(this.endpoint, { params });
    return response.data;
  }

  async getById(id: number): Promise<T> {
    const response = await apiClient.get(`${this.endpoint}${id}/`);
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const response = await apiClient.put(`${this.endpoint}${id}/`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.endpoint}${id}/`);
  }
}

// Servicios específicos para cada módulo
export const equiposService = {
  getAll: (params?: Record<string, any>) => new BaseService<Equipo>("equipos/").getAll(params),
  getById: (id: number) => new BaseService<Equipo>("equipos/").getById(id),
  create: (data: Partial<Equipo>) => new BaseService<Equipo>("equipos/").create(data),
  update: (id: number, data: Partial<Equipo>) => new BaseService<Equipo>("equipos/").update(id, data),
  delete: (id: number) => new BaseService<Equipo>("equipos/").delete(id),
  
  async getEquiposCriticos(): Promise<Equipo[]> {
    const response = await apiClient.get("mantenimiento-workflow/equipos-criticos/");
    return response.data;
  },

  async actualizarHorometro(equipoId: number, horometro: number, observaciones?: string): Promise<void> {
    await apiClient.post("mantenimiento-workflow/actualizar-horometro/", {
      equipo_id: equipoId,
      horometro,
      observaciones
    });
  }
};

export const tiposEquipoService = new BaseService<TipoEquipo>('tipos-equipo/');
export const estadosEquipoService = new BaseService<EstadoEquipo>('estados-equipo/');
export const faenasService = new BaseService<Faena>('faenas/');

export const planesMantenimientoService = {
  getAll: (params?: Record<string, any>) => new BaseService<PlanMantenimiento>("planes-mantenimiento/").getAll(params),
  getById: (id: number) => new BaseService<PlanMantenimiento>("planes-mantenimiento/").getById(id),
  create: (data: Partial<PlanMantenimiento>) => new BaseService<PlanMantenimiento>("planes-mantenimiento/").create(data),
  update: (id: number, data: Partial<PlanMantenimiento>) => new BaseService<PlanMantenimiento>("planes-mantenimiento/").update(id, data),
  delete: (id: number) => new BaseService<PlanMantenimiento>("planes-mantenimiento/").delete(id),
  
  async generarAgenda(planId: number): Promise<void> {
    await apiClient.post(`planes-mantenimiento/${planId}/generar-agenda/`);
  },

  async getDetalles(planId: number): Promise<DetallePlanMantenimiento[]> {
    const response = await apiClient.get(`detalles-plan-mantenimiento/?idplanmantenimiento=${planId}`);
    return response.data.results || response.data;
  }
};

export const detallesPlanService = new BaseService<DetallePlanMantenimiento>('detalles-plan-mantenimiento/');
export const tareasEstandarService = new BaseService<TareaEstandar>('tareas-estandar/');
export const tiposTareaService = new BaseService<TipoTarea>('tipos-tarea/');

export const ordenesTrabajoService = {
  getAll: (params?: Record<string, any>) => new BaseService<OrdenTrabajo>("ordenes-trabajo/").getAll(params),
  getById: (id: number) => new BaseService<OrdenTrabajo>("ordenes-trabajo/").getById(id),
  create: (data: Partial<OrdenTrabajo>) => new BaseService<OrdenTrabajo>("ordenes-trabajo/").create(data),
  update: (id: number, data: Partial<OrdenTrabajo>) => new BaseService<OrdenTrabajo>("ordenes-trabajo/").update(id, data),
  delete: (id: number) => new BaseService<OrdenTrabajo>("ordenes-trabajo/").delete(id),
  
  async crearDesdeplan(data: OrdenTrabajoFormData): Promise<OrdenTrabajo> {
    const response = await apiClient.post("ordenes-trabajo/crear-desde-plan/", data);
    return response.data;
  },

  async reportarFalla(data: {
    idequipo: number;
    idsolicitante: number;
    descripcionproblemareportado: string;
    prioridad: string;
  }): Promise<OrdenTrabajo> {
    const response = await apiClient.post("ordenes-trabajo/reportar-falla/", data);
    return response.data;
  }
};

export const actividadesOTService = {
  getAll: (params?: Record<string, any>) => new BaseService<ActividadOrdenTrabajo>("actividades-ot/").getAll(params),
  getById: (id: number) => new BaseService<ActividadOrdenTrabajo>("actividades-ot/").getById(id),
  create: (data: Partial<ActividadOrdenTrabajo>) => new BaseService<ActividadOrdenTrabajo>("actividades-ot/").create(data),
  update: (id: number, data: Partial<ActividadOrdenTrabajo>) => new BaseService<ActividadOrdenTrabajo>("actividades-ot/").update(id, data),
  delete: (id: number) => new BaseService<ActividadOrdenTrabajo>("actividades-ot/").delete(id),
  
  async completarActividad(actividadId: number, data: {
    observaciones?: string;
    tiempo_real_minutos?: number;
    resultado_inspeccion?: string;
    medicion_valor?: number;
    unidad_medicion?: string;
  }): Promise<ActividadOrdenTrabajo> {
    const response = await apiClient.post("mantenimiento-workflow/completar-actividad/", {
      actividad_id: actividadId,
      ...data
    });
    return response.data;
  }
};

export const tiposMantenimientoOTService = new BaseService<TipoMantenimientoOT>('tipos-mantenimiento-ot/');
export const estadosOrdenTrabajoService = new BaseService<EstadoOrdenTrabajo>('estados-orden-trabajo/');

export const agendaService = {
  getAll: (params?: Record<string, any>) => new BaseService<Agenda>("agendas/").getAll(params),
  getById: (id: number) => new BaseService<Agenda>("agendas/").getById(id),
  create: (data: Partial<Agenda>) => new BaseService<Agenda>("agendas/").create(data),
  update: (id: number, data: Partial<Agenda>) => new BaseService<Agenda>("agendas/").update(id, data),
  delete: (id: number) => new BaseService<Agenda>("agendas/").delete(id),
  
  async getCalendario(start: string, end: string): Promise<Agenda[]> {
    const response = await apiClient.get(`agendas/calendario/?start=${start}&end=${end}`);
    return response.data;
  }
};

export const checklistService = {
  templates: new BaseService<ChecklistTemplate>('checklist-templates/'),
  instances: new BaseService<ChecklistInstance>('checklist-instances/'),
  answers: new BaseService<ChecklistAnswer>('checklist-answers/'),
  
  async getTemplatesPorEquipo(equipoId: number): Promise<ChecklistTemplate[]> {
    const response = await apiClient.get(`checklist-workflow/templates-por-equipo/${equipoId}/`);
    return response.data;
  },

  async completarChecklist(data: ChecklistFormData): Promise<ChecklistCompletionResponse> {
    const response = await apiClient.post('checklist-workflow/completar-checklist/', data);
    return response.data;
  },

  async getHistorialEquipo(equipoId: number, fechaInicio?: string, fechaFin?: string): Promise<ChecklistInstance[]> {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const response = await apiClient.get(`checklist-workflow/historial-equipo/${equipoId}/?${params}`);
    return response.data;
  },

  async getReporteConformidad(fechaInicio?: string, fechaFin?: string): Promise<any> {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const response = await apiClient.get(`checklist-workflow/reportes/conformidad/?${params}`);
    return response.data;
  },

  async getElementosMasFallidos(fechaInicio?: string, fechaFin?: string): Promise<any> {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const response = await apiClient.get(`checklist-workflow/elementos-mas-fallidos/?${params}`);
    return response.data;
  }
};

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get('mantenimiento-workflow/dashboard/');
    return response.data;
  },

  async getReporteEficiencia(fechaInicio?: string, fechaFin?: string): Promise<any> {
    const params = new URLSearchParams();
    if (fechaInicio) params.append('fecha_inicio', fechaInicio);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    
    const response = await apiClient.get(`mantenimiento-workflow/reportes/eficiencia/?${params}`);
    return response.data;
  }
};

export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: User }> {
    const response = await apiClient.post('login/', { username, password });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('logout/');
  }
};

// Servicio para usuarios
export const userService = new BaseService<User>("users/");

