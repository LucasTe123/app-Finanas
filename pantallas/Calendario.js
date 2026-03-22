// ============================================================
// ARCHIVO: pantallas/Calendario.js
// QUÉ HACE: Pantalla principal con calendario mensual
// Muestra puntos de color por día según balance
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerTodosDias } from '../base_datos/baseDatos';
import colores from '../estilos/colores';

// ------------------------------------------------------------
// CONSTANTES DEL CALENDARIO
// AQUÍ CAMBIAR: nombres de días y meses en otro idioma
// ------------------------------------------------------------
const NOMBRES_DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Calendario = ({ navigation }) => {
  // Estado: fecha actual navegada (mes/año)
  const [fechaActual, setFechaActual] = useState(new Date());
  // Estado: días con registros { "2026-03-22": "positivo", ... }
  const [diasConRegistros, setDiasConRegistros] = useState({});

  // ----------------------------------------------------------
  // Cargar datos cada vez que la pantalla está en foco
  // Así se actualiza al volver desde la pantalla de registro
  // ----------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      cargarDias();
    }, [])
  );

  // ----------------------------------------------------------
  // FUNCIÓN: cargarDias
  // QUÉ HACE: Obtiene todos los días de la base de datos
  // y los convierte en un objeto de fácil acceso
  // ----------------------------------------------------------
  const cargarDias = () => {
    const dias = obtenerTodosDias();
    const mapaDeEstados = {};
    dias.forEach(dia => {
      mapaDeEstados[dia.fecha] = dia.estado;
    });
    setDiasConRegistros(mapaDeEstados);
  };

  // ----------------------------------------------------------
  // FUNCIÓN: obtenerDiasDelMes
  // QUÉ HACE: Genera el array de días para renderizar
  // Incluye espacios vacíos al inicio según el día de semana
  // ----------------------------------------------------------
  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const totalDias = new Date(año, mes + 1, 0).getDate();

    // Espacios vacíos antes del primer día
    const espacios = Array(primerDia).fill(null);
    // Días del mes como números
    const dias = Array.from({ length: totalDias }, (_, i) => i + 1);

    return [...espacios, ...dias];
  };

  // ----------------------------------------------------------
  // FUNCIÓN: obtenerEstadoDia
  // QUÉ HACE: Devuelve el estado de un día específico
  // DEVUELVE: "positivo", "negativo", "neutro" o null
  // ----------------------------------------------------------
  const obtenerEstadoDia = (numeroDia) => {
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(numeroDia).padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;
    return diasConRegistros[fechaFormateada] || null;
  };

  // ----------------------------------------------------------
  // FUNCIÓN: alTocarDia
  // QUÉ HACE: Navega a la pantalla de detalle del día tocado
  // ----------------------------------------------------------
  const alTocarDia = (numeroDia) => {
    if (!numeroDia) return;
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(numeroDia).padStart(2, '0');
    const fechaFormateada = `${año}-${mes}-${dia}`;

    navigation.navigate('DetalleDia', { fecha: fechaFormateada });
  };

  // ----------------------------------------------------------
  // FUNCIÓN: cambiarMes
  // QUÉ HACE: Navega al mes anterior o siguiente
  // PARÁMETROS: direccion = 1 (siguiente) o -1 (anterior)
  // ----------------------------------------------------------
  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  // Verificar si un día es hoy
  const esHoy = (numeroDia) => {
    const hoy = new Date();
    return (
      numeroDia === hoy.getDate() &&
      fechaActual.getMonth() === hoy.getMonth() &&
      fechaActual.getFullYear() === hoy.getFullYear()
    );
  };

  const diasParaRenderizar = obtenerDiasDelMes();

  return (
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      {/* Encabezado con mes y año */}
      <View style={estilos.encabezado}>
        {/* Botón mes anterior */}
        <TouchableOpacity onPress={() => cambiarMes(-1)} style={estilos.botonMes}>
          <Text style={estilos.textoBotonMes}>{'‹'}</Text>
        </TouchableOpacity>

        {/* Título del mes actual */}
        <Text style={estilos.tituloMes}>
          {NOMBRES_MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
        </Text>

        {/* Botón mes siguiente */}
        <TouchableOpacity onPress={() => cambiarMes(1)} style={estilos.botonMes}>
          <Text style={estilos.textoBotonMes}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      {/* Nombres de los días de la semana */}
      <View style={estilos.filaDias}>
        {NOMBRES_DIAS.map(dia => (
          <Text key={dia} style={estilos.nombreDia}>{dia}</Text>
        ))}
      </View>

      {/* Grid del calendario */}
      <View style={estilos.gridCalendario}>
        {diasParaRenderizar.map((dia, indice) => {
          const estado = dia ? obtenerEstadoDia(dia) : null;

          return (
            <TouchableOpacity
              key={indice}
              style={[estilos.celda, esHoy(dia) && estilos.celdaHoy]}
              onPress={() => alTocarDia(dia)}
              disabled={!dia}
            >
              {/* Número del día */}
              <Text style={[
                estilos.numeroDia,
                !dia && estilos.diaVacio,
                esHoy(dia) && estilos.numeroDiaHoy,
              ]}>
                {dia || ''}
              </Text>

              {/* Punto de color según estado */}
              {/* AQUÍ CAMBIAR: tamaño del punto modificando 'punto' en estilos */}
              {estado && (
                <View style={[
                  estilos.punto,
                  estado === 'positivo' && estilos.puntoPositivo,
                  estado === 'negativo' && estilos.puntoNegativo,
                  estado === 'neutro' && estilos.puntoNeutro,
                ]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

// ------------------------------------------------------------
// ESTILOS
// AQUÍ CAMBIAR: todo el diseño visual del calendario
// ------------------------------------------------------------
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    // AQUÍ CAMBIAR: color de fondo general
    backgroundColor: colores.fondoPrincipal,
    paddingHorizontal: 16,
  },

  // Encabezado con mes/año y flechas
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
 tituloMes: {
  color: colores.textoBlanco,
  fontSize: 20,
  fontFamily: 'Inter_600SemiBold',
},
  botonMes: {
    padding: 8,
  },
  textoBotonMes: {
    color: colores.acento,
    fontSize: 28,
    fontWeight: '300',
  },

  // Fila de nombres de días
  filaDias: {
    flexDirection: 'row',
    marginBottom: 8,
  },
nombreDia: {
  flex: 1,
  textAlign: 'center',
  color: colores.textoGris,
  fontSize: 12,
  fontFamily: 'Inter_500Medium',
},

  // Grid del calendario
  gridCalendario: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celda: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // AQUÍ CAMBIAR: espaciado entre celdas
    paddingVertical: 4,
  },
  celdaHoy: {
    // AQUÍ CAMBIAR: fondo del día actual
    backgroundColor: colores.fondoTarjeta,
    borderRadius: 12,
  },
numeroDia: {
  color: colores.textoBlanco,
  fontSize: 16,
  fontFamily: 'Inter_400Regular',
},
  numeroDiaHoy: {
    // AQUÍ CAMBIAR: color del número del día actual
    color: colores.acento,
    fontWeight: '700',
  },
  diaVacio: {
    color: 'transparent',
  },

  // Punto de color debajo del número
  punto: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  puntoPositivo: {
    backgroundColor: colores.positivo,
  },
  puntoNegativo: {
    backgroundColor: colores.negativo,
  },
  puntoNeutro: {
    backgroundColor: colores.neutro,
  },
});

export default Calendario;
