import React, { useState } from "react";
import { useApi } from "../../hooks/UseApi";
import { doctorService } from "../../services/doctorService";
import { citasService } from "../../services/citaService";

const CitasDoctor = () => {
  const {
    data: responseData,
    loading,
    error,
    refetch,
  } = useApi(() => doctorService.getCitasDoctor());

  const [activeFilter, setActiveFilter] = useState("todas");
  const [message, setMessage] = useState("");
  const [rechazoMotivo, setRechazoMotivo] = useState("");
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [showModalConfirmar, setShowModalConfirmar] = useState(false);
  const [showModalRechazar, setShowModalRechazar] = useState(false);

  console.log("🟡 ResponseData completa:", responseData);

  // Obtener datos del backend (defensivo)
  const backendData = responseData?.data || responseData || {};

  // ✅ PROCESAR LAS CITAS CON LA NUEVA ESTRUCTURA
  let citas = [];
  let estadisticasBackend = {};

  if (backendData.todasCitas && Array.isArray(backendData.todasCitas)) {
    citas = backendData.todasCitas;
    console.log("✅ Citas cargadas desde todasCitas:", citas.length);
  } else {
    // ✅ FALLBACK: estructura anterior
    citas = [...(backendData.citasHoy || [])];
    if (
      backendData.proximaCita &&
      !citas.some((cita) => cita.id === backendData.proximaCita.id)
    ) {
      citas.push(backendData.proximaCita);
    }
    console.log("⚠️ Citas cargadas desde estructura anterior:", citas.length);
  }

  // ✅ USAR ESTADÍSTICAS DEL BACKEND
  estadisticasBackend = {
    total: backendData.totalCitas || 0,
    hoy: backendData.citasHoy?.length || 0,
    programadas: backendData.citasProgramadas || backendData.citasPendientes || 0,
    confirmadas: backendData.citasConfirmadas || 0,
    completadas: backendData.citasCompletadas || 0,
    canceladas: backendData.citasCanceladas || 0,
    reprogramadas: backendData.citasReprogramadas || 0,
    // ✅ NUEVO: Contar citas pendientes
    pendientes: citas.filter(c => c.estado === "PENDIENTE").length,
    // ✅ CORREGIDO: Incluir tanto PROGRAMADAS como CONFIRMADAS
    proximas: citas.filter(
      (c) =>
        c &&
        c.fechaHora &&
        new Date(c.fechaHora) > new Date() &&
        (c.estado === "PROGRAMADA" || c.estado === "CONFIRMADA")
    ).length,
  };

  console.log("📊 Estadísticas del backend:", estadisticasBackend);
  console.log("🔍 Próximas citas calculadas:", estadisticasBackend.proximas);

  console.log("🟢 Total de citas procesadas:", citas.length);
  console.log("🟢 Citas:", citas);

  // ✅ NUEVO: Función para confirmar cita
  const handleConfirmarCita = async (citaId) => {
    try {
      console.log(`✅ Confirmando cita ${citaId}`);
      const response = await citasService.confirmarCita(citaId);
      
      if (response.success) {
        setMessage('✅ Cita confirmada exitosamente. El paciente será notificado.');
        setShowModalConfirmar(false);
        await refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error("🔴 Error al confirmar cita:", error);
      setMessage(
        "❌ Error al confirmar cita: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // ✅ NUEVO: Función para rechazar cita
  const handleRechazarCita = async (citaId, motivo) => {
    try {
      console.log(`❌ Rechazando cita ${citaId}`);
      const response = await citasService.rechazarCita(citaId, motivo);
      
      if (response.success) {
        setMessage('✅ Cita rechazada exitosamente. El paciente será notificado.');
        setShowModalRechazar(false);
        setRechazoMotivo('');
        setCitaSeleccionada(null);
        await refetch();
      } else {
        setMessage('❌ Error: ' + response.message);
      }
    } catch (error) {
      console.error("🔴 Error al rechazar cita:", error);
      setMessage(
        "❌ Error al rechazar cita: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // ✅ Función para actualizar estado (mantener para otros estados)
  const handleActualizarEstado = async (citaId, nuevoEstado) => {
    try {
      console.log(`🔄 Actualizando cita ${citaId} a estado: ${nuevoEstado}`);

      const response = await citasService.actualizarEstado(citaId, nuevoEstado);

      if (response.success) {
        setMessage(`✅ Cita ${nuevoEstado.toLowerCase()} exitosamente`);
        await refetch();
      } else {
        setMessage("❌ Error: " + response.message);
      }
    } catch (error) {
      console.error("🔴 Error al actualizar cita:", error);
      setMessage(
        "❌ Error al actualizar cita: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error al cargar citas: {error}
      </div>
    );

  if (!responseData?.success) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No se pudieron cargar las citas: {responseData?.message}
      </div>
    );
  }

  // ✅ Filtrado de citas - AGREGAR PENDIENTES
  const citasFiltradas = citas.filter((cita) => {
    if (!cita || !cita.fechaHora) return false;

    const hoy = new Date();
    const citaDate = new Date(cita.fechaHora);

    switch (activeFilter) {
      case "hoy":
        return citaDate.toDateString() === hoy.toDateString();
      case "pendientes":
        return cita.estado === "PENDIENTE"; // ✅ NUEVO FILTRO
      case "programadas":
        return cita.estado === "PROGRAMADA";
      case "confirmadas":
        return cita.estado === "CONFIRMADA";
      case "completadas":
        return cita.estado === "COMPLETADA";
      case "canceladas":
        return cita.estado === "CANCELADA";
      case "rechazadas":
        return cita.estado === "RECHAZADA"; // ✅ NUEVO FILTRO
      case "proximas":
        return citaDate > hoy && (cita.estado === "PROGRAMADA" || cita.estado === "CONFIRMADA");
      default:
        return true; // 'todas'
    }
  });

  console.log("🔍 Filtro activo:", activeFilter);
  console.log("🔍 Citas filtradas:", citasFiltradas);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "PENDIENTE": // ✅ NUEVO
        return "bg-yellow-100 text-yellow-800";
      case "PROGRAMADA":
        return "bg-green-100 text-green-800";
      case "CONFIRMADA":
        return "bg-blue-100 text-blue-800";
      case "COMPLETADA":
        return "bg-gray-100 text-gray-800";
      case "CANCELADA":
        return "bg-red-100 text-red-800";
      case "RECHAZADA": // ✅ NUEVO
        return "bg-red-100 text-red-800 border border-red-300";
      case "REPROGRAMADA":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      PENDIENTE: { 
        texto: '⏳ Pendiente', 
        mensaje: 'Esperando tu confirmación',
        color: 'bg-yellow-100 text-yellow-800'
      },
      CONFIRMADA: { 
        texto: '✅ Confirmada', 
        mensaje: 'Cita confirmada por ti',
        color: 'bg-blue-100 text-blue-800'
      },
      PROGRAMADA: { 
        texto: '📅 Programada', 
        mensaje: 'Cita programada',
        color: 'bg-green-100 text-green-800'
      },
      RECHAZADA: { 
        texto: '❌ Rechazada', 
        mensaje: 'Cita rechazada por ti',
        color: 'bg-red-100 text-red-800'
      }
    };
    return estados[estado] || { texto: estado, mensaje: '', color: 'bg-gray-100 text-gray-800' };
  };

  const getProximaCita = () => {
    return citas.find(
      (cita) =>
        cita &&
        cita.fechaHora &&
        new Date(cita.fechaHora) > new Date() &&
        (cita.estado === "PROGRAMADA" || cita.estado === "CONFIRMADA")
    );
  };

  const proximaCita = getProximaCita();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes("❌")
              ? "bg-red-100 border border-red-400 text-red-700"
              : "bg-green-100 border border-green-400 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Información de debug MEJORADA */}
      

      {/* Estadísticas y próxima cita */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Próxima cita */}
        {proximaCita && (
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Próxima Cita</h2>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {proximaCita.paciente?.nombre}
                </p>
                <p className="text-gray-600 mt-1">
                  {new Date(proximaCita.fechaHora).toLocaleString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {proximaCita.motivo}
                </p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(
                    proximaCita.estado
                  )}`}
                >
                  {proximaCita.estado}
                </span>
              </div>
              <div className="flex flex-col space-y-2">
                {proximaCita.estado === "PROGRAMADA" && (
                  <>
                    <button
                      onClick={() =>
                        handleActualizarEstado(proximaCita.id, "CONFIRMADA")
                      }
                      className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() =>
                        handleActualizarEstado(proximaCita.id, "CANCELADA")
                      }
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {proximaCita.estado === "CONFIRMADA" && (
                  <>
                    <button
                      onClick={() =>
                        handleActualizarEstado(proximaCita.id, "COMPLETADA")
                      }
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      Marcar Completada
                    </button>
                    <button
                      onClick={() =>
                        handleActualizarEstado(proximaCita.id, "CANCELADA")
                      }
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas MEJORADAS - AGREGAR PENDIENTES */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">
              {estadisticasBackend.total}
            </div>
            <div className="text-sm text-gray-600">Total Citas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {estadisticasBackend.pendientes}
            </div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">
              {estadisticasBackend.hoy}
            </div>
            <div className="text-sm text-gray-600">Citas Hoy</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">
              {estadisticasBackend.proximas}
            </div>
            <div className="text-sm text-gray-600">Próximas</div>
          </div>
        </div>
      </div>

      {/* Filtros MEJORADOS - AGREGAR PENDIENTES Y RECHAZADAS */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex space-x-2 flex-wrap gap-2">
          {[
            { id: "todas", label: `Todas (${estadisticasBackend.total})` },
            { id: "pendientes", label: `Pendientes (${estadisticasBackend.pendientes})` },
            { id: "hoy", label: `Hoy (${estadisticasBackend.hoy})` },
            {
              id: "programadas",
              label: `Programadas (${estadisticasBackend.programadas})`,
            },
            {
              id: "confirmadas",
              label: `Confirmadas (${estadisticasBackend.confirmadas})`,
            },
            {
              id: "completadas",
              label: `Completadas (${estadisticasBackend.completadas})`,
            },
            {
              id: "canceladas",
              label: `Canceladas (${estadisticasBackend.canceladas})`,
            },
            {
              id: "rechazadas",
              label: `Rechazadas (${citas.filter(c => c.estado === "RECHAZADA").length})`,
            },
            {
              id: "proximas",
              label: `Próximas (${estadisticasBackend.proximas})`,
            },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de citas - MODIFICADO PARA SISTEMA DE CONFIRMACIÓN */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {citasFiltradas.length > 0 ? (
          <div className="divide-y">
            {citasFiltradas.map((cita) => {
              const estadoInfo = getEstadoInfo(cita.estado);
              return (
                <div key={cita.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cita.paciente?.nombre}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(
                            cita.estado
                          )}`}
                        >
                          {estadoInfo.texto}
                        </span>
                      </div>

                      {estadoInfo.mensaje && (
                        <p className="text-sm text-gray-600 mb-3">
                          {estadoInfo.mensaje}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Fecha y Hora:</span>
                          <p className="mt-1">
                            {new Date(cita.fechaHora).toLocaleString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium">Motivo:</span>
                          <p className="mt-1">{cita.motivo}</p>
                        </div>

                        <div>
                          <span className="font-medium">Contacto:</span>
                          <p className="mt-1">
                            {cita.paciente?.telefono ||
                              cita.paciente?.email ||
                              "No disponible"}
                          </p>
                        </div>

                        <div>
                          <span className="font-medium">Estado:</span>
                          <p className="mt-1">{cita.estado}</p>
                        </div>
                      </div>

                      {cita.notas && (
                        <div className="mt-3">
                          <span className="font-medium text-sm text-gray-700">
                            Notas:
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {cita.notas}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      {/* ✅ BOTONES PARA CITAS PENDIENTES (NUEVO SISTEMA) */}
                      {cita.estado === "PENDIENTE" && (
                        <>
                          <button
                            onClick={() => {
                              setCitaSeleccionada(cita);
                              setShowModalConfirmar(true);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 whitespace-nowrap"
                          >
                            ✅ Confirmar Cita
                          </button>
                          <button
                            onClick={() => {
                              setCitaSeleccionada(cita);
                              setShowModalRechazar(true);
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 whitespace-nowrap"
                          >
                            ❌ Rechazar Cita
                          </button>
                        </>
                      )}

                      {/* ✅ BOTONES PARA CITAS PROGRAMADAS */}
                      {cita.estado === "PROGRAMADA" && (
                        <>
                          <button
                            onClick={() =>
                              handleActualizarEstado(cita.id, "CONFIRMADA")
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 whitespace-nowrap"
                          >
                            ✅ Confirmar
                          </button>
                          <button
                            onClick={() =>
                              handleActualizarEstado(cita.id, "COMPLETADA")
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
                          >
                            ✓ Completar
                          </button>
                          <button
                            onClick={() =>
                              handleActualizarEstado(cita.id, "CANCELADA")
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 whitespace-nowrap"
                          >
                            ❌ Cancelar
                          </button>
                        </>
                      )}

                      {/* ✅ BOTONES PARA CITAS CONFIRMADAS */}
                      {cita.estado === "CONFIRMADA" && (
                        <>
                          <button
                            onClick={() =>
                              handleActualizarEstado(cita.id, "COMPLETADA")
                            }
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 whitespace-nowrap"
                          >
                            ✓ Marcar como Completada
                          </button>
                          <button
                            onClick={() =>
                              handleActualizarEstado(cita.id, "CANCELADA")
                            }
                            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 whitespace-nowrap"
                          >
                            ❌ Cancelar
                          </button>
                        </>
                      )}

                      {/* ✅ BOTONES PARA CITAS COMPLETADAS (solo ver) */}
                      {cita.estado === "COMPLETADA" && (
                        <span className="bg-gray-600 text-white px-4 py-2 rounded text-sm text-center whitespace-nowrap">
                          ✅ Completada
                        </span>
                      )}

                      {/* ✅ BOTONES PARA CITAS CANCELADAS (solo ver) */}
                      {cita.estado === "CANCELADA" && (
                        <span className="bg-red-600 text-white px-4 py-2 rounded text-sm text-center whitespace-nowrap">
                          ❌ Cancelada
                        </span>
                      )}

                      {/* ✅ BOTONES PARA CITAS RECHAZADAS (solo ver) */}
                      {cita.estado === "RECHAZADA" && (
                        <span className="bg-red-600 text-white px-4 py-2 rounded text-sm text-center whitespace-nowrap">
                          ❌ Rechazada
                        </span>
                      )}

                      {/* ✅ BOTONES QUE SIEMPRE SE MUESTRAN */}
                      <button className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 whitespace-nowrap">
                        📞 Llamar
                      </button>

                      <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 whitespace-nowrap">
                        📝 Notas
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-3">
              {activeFilter === "hoy"
                ? "📅"
                : activeFilter === "pendientes"
                ? "⏳"
                : activeFilter === "programadas"
                ? "⏳"
                : activeFilter === "confirmadas"
                ? "✅"
                : activeFilter === "completadas"
                ? "✅"
                : activeFilter === "canceladas"
                ? "❌"
                : activeFilter === "rechazadas"
                ? "❌"
                : "📋"}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeFilter === "hoy"
                ? "No hay citas para hoy"
                : activeFilter === "pendientes"
                ? "No hay citas pendientes"
                : activeFilter === "programadas"
                ? "No hay citas programadas"
                : activeFilter === "confirmadas"
                ? "No hay citas confirmadas"
                : activeFilter === "completadas"
                ? "No hay citas completadas"
                : activeFilter === "canceladas"
                ? "No hay citas canceladas"
                : activeFilter === "rechazadas"
                ? "No hay citas rechazadas"
                : "No hay citas registradas"}
            </h3>
            <p className="text-gray-500">
              {activeFilter !== "todas" && "Intenta con otro filtro o "}
              Las citas {activeFilter !== "todas" ? "de este tipo " : ""}
              aparecerán aquí.
            </p>
          </div>
        )}
      </div>

      {/* Información del total */}
      {citasFiltradas.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {citasFiltradas.length} de {citas.length} citas
          {activeFilter !== "todas" && ` (filtradas por ${activeFilter})`}
        </div>
      )}

      {/* ✅ MODAL PARA CONFIRMAR CITA */}
      {showModalConfirmar && citaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar Cita</h3>
            <p className="mb-4">
              ¿Estás seguro de que quieres confirmar la cita de{" "}
              <strong>{citaSeleccionada.paciente?.nombre}</strong>?
            </p>
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Fecha:</strong>{" "}
                {new Date(citaSeleccionada.fechaHora).toLocaleString("es-ES")}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>Motivo:</strong> {citaSeleccionada.motivo}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              El paciente recibirá una notificación de confirmación.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModalConfirmar(false);
                  setCitaSeleccionada(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleConfirmarCita(citaSeleccionada.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                ✅ Confirmar Cita
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL PARA RECHAZAR CITA */}
      {showModalRechazar && citaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rechazar Cita</h3>
            <p className="mb-4">
              ¿Estás seguro de que quieres rechazar la cita de{" "}
              <strong>{citaSeleccionada.paciente?.nombre}</strong>?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo (opcional):
              </label>
              <textarea
                value={rechazoMotivo}
                onChange={(e) => setRechazoMotivo(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Ej: No tengo disponibilidad en esa fecha, especialidad no coincide, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                El paciente verá este motivo en su notificación.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModalRechazar(false);
                  setCitaSeleccionada(null);
                  setRechazoMotivo('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRechazarCita(citaSeleccionada.id, rechazoMotivo)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ❌ Rechazar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasDoctor;