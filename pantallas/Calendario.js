import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { obtenerTodosDias, obtenerResumenMes } from '../base_datos/baseDatos';
import colores from '../estilos/colores';

const NOMBRES_DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const NOMBRES_MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const Calendario = ({ navigation, route }) => {
  const mesInicial = route?.params?.mes;
  const anioInicial = route?.params?.anio;
  const fechaInicio = mesInicial !== undefined
    ? new Date(anioInicial || 2026, mesInicial, 1)
    : new Date();

  const [fechaActual, setFechaActual] = useState(fechaInicio);
  const [diasConRegistros, setDiasConRegistros] = useState({});
  const [resumenMes, setResumenMes] = useState({ ingresos: 0, gastos: 0, balance: 0 });

  useFocusEffect(useCallback(() => { cargarDias(); }, []));

  useEffect(() => {
    obtenerResumenMes(fechaActual.getFullYear(), fechaActual.getMonth() + 1)
      .then(setResumenMes);
  }, [fechaActual]);

  const cargarDias = () => {
    const dias = obtenerTodosDias();
    const mapa = {};
    dias.forEach(dia => { mapa[dia.fecha] = dia.estado; });
    setDiasConRegistros(mapa);
  };

  const obtenerDiasDelMes = () => {
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const totalDias = new Date(año, mes + 1, 0).getDate();
    return [...Array(primerDia).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];
  };

  const obtenerEstadoDia = (numeroDia) => {
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(numeroDia).padStart(2, '0');
    return diasConRegistros[`${año}-${mes}-${dia}`] || null;
  };

  const alTocarDia = (numeroDia) => {
    if (!numeroDia) return;
    const año = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(numeroDia).padStart(2, '0');
    navigation.navigate('DetalleDia', { fecha: `${año}-${mes}-${dia}` });
  };

  const cambiarMes = (dir) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + dir);
    setFechaActual(nueva);
  };

  const esHoy = (numeroDia) => {
    const hoy = new Date();
    return numeroDia === hoy.getDate() &&
      fechaActual.getMonth() === hoy.getMonth() &&
      fechaActual.getFullYear() === hoy.getFullYear();
  };

  const diasParaRenderizar = obtenerDiasDelMes();

  return (
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />

      {/* Encabezado mes/año */}
      <View style={estilos.encabezado}>
        <TouchableOpacity onPress={() => cambiarMes(-1)} style={estilos.botonMes}>
          <Text style={estilos.textoBotonMes}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={estilos.tituloMes}>
          {NOMBRES_MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => cambiarMes(1)} style={estilos.botonMes}>
          <Text style={estilos.textoBotonMes}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ RESUMEN LIQUID GLASS */}
      <View style={estilos.resumenWrapper}>
        {/* Capa blur de fondo */}
        <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />

        {/* Gradiente sutil encima del blur */}
        <LinearGradient
          colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Borde superior brillante (Specular Highlight) */}
        <View style={estilos.resumenBordeSuperior} />

        {/* Contenido */}
        <View style={estilos.resumenContenido}>
          <View style={estilos.columnaResumen}>
            <Text style={estilos.labelResumen}>INGRESOS</Text>
            <Text style={estilos.valorIngreso}>+Bs {resumenMes.ingresos.toFixed(2)}</Text>
          </View>
          <View style={estilos.separadorVertical} />
          <View style={estilos.columnaResumen}>
            <Text style={estilos.labelResumen}>GASTOS</Text>
            <Text style={estilos.valorGasto}>-Bs {resumenMes.gastos.toFixed(2)}</Text>
          </View>
          <View style={estilos.separadorVertical} />
          <View style={estilos.columnaResumen}>
            <Text style={estilos.labelResumen}>BALANCE</Text>
            <Text style={[estilos.valorBalance, { color: resumenMes.balance >= 0 ? '#30D158' : '#FF453A' }]}>
              {resumenMes.balance >= 0 ? '+' : ''}Bs {resumenMes.balance.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Nombres días semana */}
      <View style={estilos.filaDias}>
        {NOMBRES_DIAS.map(dia => (
          <Text key={dia} style={estilos.nombreDia}>{dia}</Text>
        ))}
      </View>

      {/* Grid calendario */}
      <View style={estilos.gridCalendario}>
        {diasParaRenderizar.map((dia, indice) => {
          const estado = dia ? obtenerEstadoDia(dia) : null;
          const hoy = esHoy(dia);
          return (
            <TouchableOpacity
              key={indice}
              style={[estilos.celda, hoy && estilos.celdaHoy]}
              onPress={() => alTocarDia(dia)}
              disabled={!dia}
            >
              <Text style={[
                estilos.numeroDia,
                !dia && estilos.diaVacio,
                hoy && estilos.numeroDiaHoy,
              ]}>
                {dia || ''}
              </Text>
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

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  tituloMes: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  botonMes: { padding: 8 },
  textoBotonMes: {
    color: '#0A84FF',
    fontSize: 30,
    fontWeight: '300',
  },

  // ✅ LIQUID GLASS CARD
  resumenWrapper: {
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 24,
    // Borde exterior tipo cristal
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    // Sombra que lo hace flotar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  // Línea superior brillante (simula luz reflejada en el borde del vidrio)
  resumenBordeSuperior: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
    zIndex: 10,
  },
  resumenContenido: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  columnaResumen: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  labelResumen: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
  },
  valorIngreso: {
    color: '#30D158',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  valorGasto: {
    color: '#FF453A',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  valorBalance: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  separadorVertical: {
    width: 0.5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 4,
  },

  filaDias: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  nombreDia: {
    flex: 1,
    textAlign: 'center',
    color: '#636366',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  gridCalendario: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  celda: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  celdaHoy: {
    backgroundColor: '#0A84FF',
    borderRadius: 50,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  numeroDia: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  numeroDiaHoy: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
  diaVacio: { color: 'transparent' },
  punto: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  puntoPositivo: { backgroundColor: '#30D158' },
  puntoNegativo: { backgroundColor: '#FF453A' },
  puntoNeutro: { backgroundColor: '#636366' },
});

export default Calendario;
