from django.db import models
from django.contrib.auth.models import User


class Roles(models.Model):
    idrol = models.AutoField(db_column='IDRol', primary_key=True)
    nombrerol = models.CharField(db_column='NombreRol', unique=True, max_length=50)
    descripcionrol = models.CharField(db_column='DescripcionRol', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombrerol
    class Meta:
        db_table = 'roles'


class Especialidades(models.Model):
    idespecialidad = models.AutoField(db_column='IDEspecialidad', primary_key=True)
    nombreespecialidad = models.CharField(db_column='NombreEspecialidad', unique=True, max_length=100)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombreespecialidad
    class Meta:
        db_table = 'especialidades'


class Faenas(models.Model):
    idfaena = models.AutoField(db_column='IDFaena', primary_key=True)
    nombrefaena = models.CharField(db_column='NombreFaena', unique=True, max_length=100)
    ubicacion = models.CharField(db_column='Ubicacion', max_length=255, blank=True, null=True)
    contacto = models.CharField(db_column='Contacto', max_length=100, blank=True, null=True)
    telefono = models.CharField(db_column='Telefono', max_length=20, blank=True, null=True)
    activa = models.BooleanField(db_column='Activa', default=True)

    def __str__(self):
        return self.nombrefaena
    class Meta:
        db_table = 'faenas'


class TiposEquipo(models.Model):
    idtipoequipo = models.AutoField(db_column='IDTipoEquipo', primary_key=True)
    nombretipo = models.CharField(db_column='NombreTipo', unique=True, max_length=100)
    descripciontipo = models.CharField(db_column='DescripcionTipo', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombretipo
    class Meta:
        db_table = 'tiposequipo'


class EstadosEquipo(models.Model):
    idestadoequipo = models.AutoField(db_column='IDEstadoEquipo', primary_key=True)
    nombreestado = models.CharField(db_column='NombreEstado', unique=True, max_length=50)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)
    colorindicador = models.CharField(db_column='ColorIndicador', max_length=7, blank=True, null=True)

    def __str__(self):
        return self.nombreestado
    class Meta:
        db_table = 'estadosequipo'


class TiposTarea(models.Model):
    idtipotarea = models.AutoField(db_column='IDTipoTarea', primary_key=True)
    nombretipotarea = models.CharField(db_column='NombreTipoTarea', unique=True, max_length=100)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombretipotarea
    class Meta:
        db_table = 'tipostarea'


class TiposMantenimientoOT(models.Model):
    idtipomantenimientoot = models.AutoField(db_column='IDTipoMantenimientoOT', primary_key=True)
    nombretipomantenimientoot = models.CharField(db_column='NombreTipoMantenimientoOT', unique=True, max_length=50)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombretipomantenimientoot
    class Meta:
        db_table = 'tiposmantenimientoot'


class EstadosOrdenTrabajo(models.Model):
    idestadoot = models.AutoField(db_column='IDEstadoOT', primary_key=True)
    nombreestadoot = models.CharField(db_column='NombreEstadoOT', unique=True, max_length=50)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombreestadoot
    class Meta:
        db_table = 'estadosordentrabajo'

# --- Modelo de Usuarios (Extiende el User de Django) ---

class Usuarios(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column='IDUsuario')
    idrol = models.ForeignKey(Roles, on_delete=models.PROTECT, db_column='IDRol')
    idespecialidad = models.ForeignKey(Especialidades, on_delete=models.SET_NULL, db_column='IDEspecialidad', blank=True, null=True)
    telefono = models.CharField(db_column='Telefono', max_length=20, blank=True, null=True)
    activo = models.BooleanField(db_column='Activo', default=True)
    fechacreacion = models.DateTimeField(db_column='FechaCreacion', auto_now_add=True)
    fechaultactualizacion = models.DateTimeField(db_column='FechaUltActualizacion', auto_now=True)
    ultimoacceso = models.DateTimeField(db_column='UltimoAcceso', blank=True, null=True)

    def __str__(self):
        return self.user.username
    class Meta:
        db_table = 'usuarios'

# --- Modelos Principales del Negocio ---

class Repuestos(models.Model):
    idrepuesto = models.AutoField(db_column='IDRepuesto', primary_key=True)
    codigorepuesto = models.CharField(db_column='CodigoRepuesto', unique=True, max_length=50)
    descripcionrepuesto = models.CharField(db_column='DescripcionRepuesto', max_length=255)
    numeropartefabricante = models.CharField(db_column='NumeroParteFabricante', max_length=100, blank=True, null=True)
    # Suponiendo que 'Marcas' y 'Proveedores' serían modelos separados en el futuro.
    idmarcarepuesto = models.IntegerField(db_column='IDMarcaRepuesto', blank=True, null=True)
    idproveedorpreferido = models.IntegerField(db_column='IDProveedorPreferido', blank=True, null=True)
    unidadmedida = models.CharField(db_column='UnidadMedida', max_length=20)
    stockactual = models.DecimalField(db_column='StockActual', max_digits=10, decimal_places=2, default=0.00)
    stockminimo = models.DecimalField(db_column='StockMinimo', max_digits=10, decimal_places=2, default=0.00)
    stockmaximo = models.DecimalField(db_column='StockMaximo', max_digits=10, decimal_places=2, blank=True, null=True)
    ubicacionbodega = models.CharField(db_column='UbicacionBodega', max_length=100, blank=True, null=True)
    costounitariopromedio = models.DecimalField(db_column='CostoUnitarioPromedio', max_digits=12, decimal_places=2, blank=True, null=True)
    activo = models.BooleanField(db_column='Activo', default=True)

    def __str__(self):
        return self.descripcionrepuesto
    class Meta:
        db_table = 'repuestos'


class Equipos(models.Model):
    idequipo = models.AutoField(db_column='IDEquipo', primary_key=True)
    codigointerno = models.CharField(db_column='CodigoInterno', unique=True, max_length=50)
    nombreequipo = models.CharField(db_column='NombreEquipo', max_length=150)
    idtipoequipo = models.ForeignKey(TiposEquipo, on_delete=models.PROTECT, db_column='IDTipoEquipo')
    marca = models.CharField(db_column='Marca', max_length=100, blank=True, null=True)
    modelo = models.CharField(db_column='Modelo', max_length=100, blank=True, null=True)
    aniofabricacion = models.IntegerField(db_column='AnioFabricacion', blank=True, null=True)
    fechaadquisicion = models.DateField(db_column='FechaAdquisicion', blank=True, null=True)
    idfaenaactual = models.ForeignKey(Faenas, on_delete=models.SET_NULL, db_column='IDFaenaActual', blank=True, null=True)
    horometroactual = models.IntegerField(db_column='HorometroActual', default=0)
    fechaultactualizacionhorometro = models.DateTimeField(db_column='FechaUltActualizacionHorometro', blank=True, null=True)
    idestadoactual = models.ForeignKey(EstadosEquipo, on_delete=models.PROTECT, db_column='IDEstadoActual')
    idoperarioasignadopredeterminado = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDOperarioAsignadoPredeterminado', blank=True, null=True)
    imagenurl = models.CharField(db_column='ImagenURL', max_length=255, blank=True, null=True)
    observaciones = models.TextField(db_column='Observaciones', blank=True, null=True)
    activo = models.BooleanField(db_column='Activo', default=True)

    def __str__(self):
        return f"{self.nombreequipo} ({self.codigointerno})"
    class Meta:
        db_table = 'equipos'


class TareasEstandar(models.Model):
    idtareaestandar = models.AutoField(db_column='IDTareaEstandar', primary_key=True)
    codigotarea = models.CharField(db_column='CodigoTarea', unique=True, max_length=20)
    descripciontarea = models.TextField(db_column='DescripcionTarea')
    idtipotarea = models.ForeignKey(TiposTarea, on_delete=models.PROTECT, db_column='IDTipoTarea')
    idespecialidadrequerida = models.ForeignKey(Especialidades, on_delete=models.SET_NULL, db_column='IDEspecialidadRequerida', blank=True, null=True)
    duracionestimadaminutos = models.IntegerField(db_column='DuracionEstimadaMinutos', blank=True, null=True)
    instruccionesdetalladas = models.TextField(db_column='InstruccionesDetalladas', blank=True, null=True)
    materialessugeridos = models.TextField(db_column='MaterialesSugeridos', blank=True, null=True)
    requiereparadaequipo = models.BooleanField(db_column='RequiereParadaEquipo', default=True)
    activa = models.BooleanField(db_column='Activa', default=True)

    def __str__(self):
        return f"{self.codigotarea}: {self.descripciontarea[:50]}"
    class Meta:
        db_table = 'tareasestandar'


class PlanesMantenimiento(models.Model):
    idplanmantenimiento = models.AutoField(db_column='IDPlanMantenimiento', primary_key=True)
    idequipo = models.ForeignKey(Equipos, on_delete=models.CASCADE, db_column='IDEquipo')
    nombreplan = models.CharField(db_column='NombrePlan', max_length=150)
    descripcionplan = models.TextField(db_column='DescripcionPlan', blank=True, null=True)
    fechacreacion = models.DateTimeField(db_column='FechaCreacion', auto_now_add=True)
    idusuariocreador = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDUsuarioCreador', blank=True, null=True)
    activo = models.BooleanField(db_column='Activo', default=True)
    version = models.IntegerField(db_column='Version', default=1)

    def __str__(self):
        return self.nombreplan
    class Meta:
        db_table = 'planesmantenimiento'
        unique_together = (('idequipo', 'nombreplan'),)


class DetallesPlanMantenimiento(models.Model):
    iddetalleplan = models.AutoField(db_column='IDDetallePlan', primary_key=True)
    idplanmantenimiento = models.ForeignKey(PlanesMantenimiento, on_delete=models.CASCADE, db_column='IDPlanMantenimiento')
    idtareaestandar = models.ForeignKey(TareasEstandar, on_delete=models.PROTECT, db_column='IDTareaEstandar')
    puntomantenimiento = models.CharField(db_column='PuntoMantenimiento', max_length=20, blank=True, null=True)
    intervalohorasoperacion = models.IntegerField(db_column='IntervaloHorasOperacion', blank=True, null=True)
    intervalodiascalendario = models.IntegerField(db_column='IntervaloDiasCalendario', blank=True, null=True)
    tipointervalopredominante = models.CharField(db_column='TipoIntervaloPredominante', max_length=5, blank=True, null=True) # Podría ser un ChoicesField
    toleranciahoras = models.IntegerField(db_column='ToleranciaHoras', blank=True, null=True)
    toleranciadiana = models.IntegerField(db_column='ToleranciaDias', blank=True, null=True)
    proximoserviciohorometro = models.IntegerField(db_column='ProximoServicioHorometro', blank=True, null=True)
    proximoserviciofecha = models.DateField(db_column='ProximoServicioFecha', blank=True, null=True)
    ultimoserviciohorometro = models.IntegerField(db_column='UltimoServicioHorometro', blank=True, null=True)
    ultimoserviciofecha = models.DateField(db_column='UltimoServicioFecha', blank=True, null=True)
    activoenplan = models.BooleanField(db_column='ActivoEnPlan', default=True)

    class Meta:
        db_table = 'detallesplanmantenimiento'
        unique_together = (('idplanmantenimiento', 'idtareaestandar', 'intervalohorasoperacion', 'intervalodiascalendario'),)


class OrdenesTrabajo(models.Model):
    PRIORIDAD_CHOICES = [('Baja', 'Baja'), ('Media', 'Media'), ('Alta', 'Alta'), ('Urgente', 'Urgente')]
    
    idordentrabajo = models.AutoField(db_column='IDOrdenTrabajo', primary_key=True)
    numeroot = models.CharField(db_column='NumeroOT', unique=True, max_length=20)
    idequipo = models.ForeignKey(Equipos, on_delete=models.PROTECT, db_column='IDEquipo')
    idtipomantenimientoot = models.ForeignKey(TiposMantenimientoOT, on_delete=models.PROTECT, db_column='IDTipoMantenimientoOT')
    idplanmantenimientoasociado = models.ForeignKey(PlanesMantenimiento, on_delete=models.SET_NULL, db_column='IDPlanMantenimientoAsociado', blank=True, null=True)
    iddetalleplanmantenimientoorigen = models.ForeignKey(DetallesPlanMantenimiento, on_delete=models.SET_NULL, db_column='IDDetallePlanMantenimientoOrigen', blank=True, null=True)
    fechacreacionot = models.DateTimeField(db_column='FechaCreacionOT', auto_now_add=True)
    fechareportefalla = models.DateTimeField(db_column='FechaReporteFalla', blank=True, null=True)
    idsolicitante = models.ForeignKey(Usuarios, on_delete=models.PROTECT, db_column='IDSolicitante', related_name='ots_solicitadas')
    idreportadopor = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDReportadoPor', blank=True, null=True, related_name='ots_reportadas')
    fechaprogramadainicio = models.DateTimeField(db_column='FechaProgramadaInicio', blank=True, null=True)
    fechaprogramadafin = models.DateTimeField(db_column='FechaProgramadaFin', blank=True, null=True)
    fechaejecucioninicioreal = models.DateTimeField(db_column='FechaEjecucionInicioReal', blank=True, null=True)
    fechaejecucionfinreal = models.DateTimeField(db_column='FechaEjecucionFinReal', blank=True, null=True)
    idtecnicoasignadoprincipal = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDTecnicoAsignadoPrincipal', blank=True, null=True, related_name='ots_asignadas')
    horometroequipoingreso = models.IntegerField(db_column='HorometroEquipoIngreso', blank=True, null=True)
    horometroequiposalida = models.IntegerField(db_column='HorometroEquipoSalida', blank=True, null=True)
    descripcionproblemareportado = models.TextField(db_column='DescripcionProblemaReportado', blank=True, null=True)
    diagnosticotecnico = models.TextField(db_column='DiagnosticoTecnico', blank=True, null=True)
    causaraizfalla = models.TextField(db_column='CausaRaizFalla', blank=True, null=True)
    solucionaplicada = models.TextField(db_column='SolucionAplicada', blank=True, null=True)
    observacionesot = models.TextField(db_column='ObservacionesOT', blank=True, null=True)
    idestadoot = models.ForeignKey(EstadosOrdenTrabajo, on_delete=models.PROTECT, db_column='IDEstadoOT')
    prioridad = models.CharField(db_column='Prioridad', max_length=7, choices=PRIORIDAD_CHOICES, default='Media')
    requieretrasladotaller = models.BooleanField(db_column='RequiereTrasladoTaller', default=False)
    ubicacionrealizacion = models.CharField(db_column='UbicacionRealizacion', max_length=100, blank=True, null=True)
    costoestimadomanoobra = models.DecimalField(db_column='CostoEstimadoManoObra', max_digits=10, decimal_places=2, blank=True, null=True)
    costoestimadorepuestos = models.DecimalField(db_column='CostoEstimadoRepuestos', max_digits=10, decimal_places=2, blank=True, null=True)
    costorealamanoobra = models.DecimalField(db_column='CostoRealManoObra', max_digits=10, decimal_places=2, blank=True, null=True)
    costorealrepuestos = models.DecimalField(db_column='CostoRealRepuestos', max_digits=10, decimal_places=2, blank=True, null=True)
    tiempoinactividadequipohoras = models.DecimalField(db_column='TiempoInactividadEquipoHoras', max_digits=8, decimal_places=2, blank=True, null=True)
    completadapor = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='CompletadaPor', blank=True, null=True, related_name='ots_completadas')
    fechacompletada = models.DateTimeField(db_column='FechaCompletada', blank=True, null=True)
    verificadapor = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='VerificadaPor', blank=True, null=True, related_name='ots_verificadas')
    fechaverificada = models.DateTimeField(db_column='FechaVerificada', blank=True, null=True)

    def __str__(self):
        return self.numeroot
    class Meta:
        db_table = 'ordenestrabajo'


class ActividadesOrdenTrabajo(models.Model):
    idactividadot = models.AutoField(db_column='IDActividadOT', primary_key=True)
    idordentrabajo = models.ForeignKey(OrdenesTrabajo, on_delete=models.CASCADE, db_column='IDOrdenTrabajo')
    idtareaestandar = models.ForeignKey(TareasEstandar, on_delete=models.SET_NULL, db_column='IDTareaEstandar', blank=True, null=True)
    secuencia = models.IntegerField(db_column='Secuencia', blank=True, null=True)
    descripcionactividad = models.TextField(db_column='DescripcionActividad')
    idtecnicoejecutor = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDTecnicoEjecutor', blank=True, null=True)
    fechainicioactividad = models.DateTimeField(db_column='FechaInicioActividad', blank=True, null=True)
    fechafinactividad = models.DateTimeField(db_column='FechaFinActividad', blank=True, null=True)
    tiempoestimadominutos = models.IntegerField(db_column='TiempoEstimadoMinutos', blank=True, null=True)
    tiemporealminutos = models.IntegerField(db_column='TiempoRealMinutos', blank=True, null=True)
    observacionesactividad = models.TextField(db_column='ObservacionesActividad', blank=True, null=True)
    completada = models.BooleanField(db_column='Completada', default=False)
    resultadoinspeccion = models.CharField(db_column='ResultadoInspeccion', max_length=50, blank=True, null=True)
    medicionvalor = models.DecimalField(db_column='MedicionValor', max_digits=10, decimal_places=2, blank=True, null=True)
    unidadmedicion = models.CharField(db_column='UnidadMedicion', max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'actividadesordentrabajo'


class UsoRepuestosActividadOT(models.Model):
    idusorepuesto = models.AutoField(db_column='IDUsoRepuesto', primary_key=True)
    idactividadot = models.ForeignKey(ActividadesOrdenTrabajo, on_delete=models.CASCADE, db_column='IDActividadOT')
    idrepuesto = models.ForeignKey(Repuestos, on_delete=models.PROTECT, db_column='IDRepuesto')
    cantidadusada = models.DecimalField(db_column='CantidadUsada', max_digits=10, decimal_places=2)
    fechauso = models.DateTimeField(db_column='FechaUso', auto_now_add=True)
    costoalmomentodeuso = models.DecimalField(db_column='CostoAlMomentoDeUso', max_digits=12, decimal_places=2, blank=True, null=True)
    idusuarioregistra = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDUsuarioRegistra', blank=True, null=True)

    class Meta:
        db_table = 'usorepuestosactividadot'


class HistorialHorometros(models.Model):
    idhistorialhorometro = models.AutoField(db_column='IDHistorialHorometro', primary_key=True)
    idequipo = models.ForeignKey(Equipos, on_delete=models.CASCADE, db_column='IDEquipo')
    fechalectura = models.DateTimeField(db_column='FechaLectura', auto_now_add=True)
    valorhorometro = models.IntegerField(db_column='ValorHorometro')
    idusuarioregistra = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDUsuarioRegistra', blank=True, null=True)
    idordentrabajoasociada = models.ForeignKey(OrdenesTrabajo, on_delete=models.SET_NULL, db_column='IDOrdenTrabajoAsociada', blank=True, null=True)
    fuentelectura = models.CharField(db_column='FuenteLectura', max_length=50, blank=True, null=True)
    observaciones = models.TextField(db_column='Observaciones', blank=True, null=True)

    class Meta:
        db_table = 'historialhorometros'


class HistorialEstadosEquipo(models.Model):
    idhistorialestado = models.AutoField(db_column='IDHistorialEstado', primary_key=True)
    idequipo = models.ForeignKey(Equipos, on_delete=models.CASCADE, db_column='IDEquipo')
    idestadoequipoanterior = models.ForeignKey(EstadosEquipo, on_delete=models.SET_NULL, db_column='IDEstadoEquipoAnterior', blank=True, null=True, related_name='historiales_como_anterior')
    idestadoequiponuevo = models.ForeignKey(EstadosEquipo, on_delete=models.PROTECT, db_column='IDEstadoEquipoNuevo', related_name='historiales_como_nuevo')
    fechacambioestado = models.DateTimeField(db_column='FechaCambioEstado', auto_now_add=True)
    idusuarioresponsable = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDUsuarioResponsable', blank=True, null=True)
    idordentrabajorelacionada = models.ForeignKey(OrdenesTrabajo, on_delete=models.SET_NULL, db_column='IDOrdenTrabajoRelacionada', blank=True, null=True)
    motivocambio = models.CharField(db_column='MotivoCambio', max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'historialestadosequipo'


class Agendas(models.Model):
    idagenda = models.AutoField(db_column='IDAgenda', primary_key=True)
    idordentrabajo = models.ForeignKey(OrdenesTrabajo, on_delete=models.CASCADE, db_column='IDOrdenTrabajo', blank=True, null=True)
    idplanmantenimiento = models.ForeignKey(PlanesMantenimiento, on_delete=models.CASCADE, db_column='IDPlanMantenimiento', blank=True, null=True)
    idequipo = models.ForeignKey(Equipos, on_delete=models.CASCADE, db_column='IDEquipo', blank=True, null=True)
    tituloevento = models.CharField(db_column='TituloEvento', max_length=255)
    fechahorainicio = models.DateTimeField(db_column='FechaHoraInicio')
    fechahorafin = models.DateTimeField(db_column='FechaHoraFin')
    descripcionevento = models.TextField(db_column='DescripcionEvento', blank=True, null=True)
    idusuarioasignado = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDUsuarioAsignado', blank=True, null=True, related_name='eventos_asignados')
    tipoevento = models.CharField(db_column='TipoEvento', max_length=50, blank=True, null=True)
    colorevento = models.CharField(db_column='ColorEvento', max_length=7, blank=True, null=True)
    esdiacompleto = models.BooleanField(db_column='EsDiaCompleto', default=False)
    recursivo = models.BooleanField(db_column='Recursivo', default=False)
    reglarecursividad = models.CharField(db_column='ReglaRecursividad', max_length=255, blank=True, null=True)
    idusuariocreador = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDUsuarioCreador', blank=True, null=True, related_name='eventos_creados')
    fechacreacionevento = models.DateTimeField(db_column='FechaCreacionEvento', auto_now_add=True)

    class Meta:
        db_table = 'agendas'


class DocumentosAdjuntos(models.Model):
    iddocumento = models.AutoField(db_column='IDDocumento', primary_key=True)
    nombrearchivooriginal = models.CharField(db_column='NombreArchivoOriginal', max_length=255)
    patharchivoservidor = models.CharField(db_column='PathArchivoServidor', max_length=500)
    tipomime = models.CharField(db_column='TipoMIME', max_length=100, blank=True, null=True)
    tamanobytes = models.BigIntegerField(db_column='TamanoBytes', blank=True, null=True)
    descripcionadjunto = models.CharField(db_column='DescripcionAdjunto', max_length=255, blank=True, null=True)
    fechasubida = models.DateTimeField(db_column='FechaSubida', auto_now_add=True)
    idusuariosube = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDUsuarioSube', blank=True, null=True)
    entidadasociada = models.CharField(db_column='EntidadAsociada', max_length=50) # p. ej. 'OrdenTrabajo', 'Equipo'
    identidadasociada = models.IntegerField(db_column='IDEntidadAsociada')

    class Meta:
        db_table = 'documentosadjuntos'


class Notificaciones(models.Model):
    PRIORIDAD_CHOICES = [('Baja', 'Baja'), ('Media', 'Media'), ('Alta', 'Alta')]

    idnotificacion = models.AutoField(db_column='IDNotificacion', primary_key=True)
    idusuariodestino = models.ForeignKey(Usuarios, on_delete=models.CASCADE, db_column='IDUsuarioDestino')
    mensaje = models.TextField(db_column='Mensaje')
    tiponotificacion = models.CharField(db_column='TipoNotificacion', max_length=50, blank=True, null=True)
    fechacreacion = models.DateTimeField(db_column='FechaCreacion', auto_now_add=True)
    fechalectura = models.DateTimeField(db_column='FechaLectura', blank=True, null=True)
    leida = models.BooleanField(db_column='Leida', default=False)
    prioridad = models.CharField(db_column='Prioridad', max_length=5, choices=PRIORIDAD_CHOICES, default='Media')
    urlrelacionada = models.CharField(db_column='URLRelacionada', max_length=255, blank=True, null=True)
    identidadrelacionada = models.IntegerField(db_column='IDEntidadRelacionada', blank=True, null=True)
    tipoentidadrelacionada = models.CharField(db_column='TipoEntidadRelacionada', max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'notificaciones'