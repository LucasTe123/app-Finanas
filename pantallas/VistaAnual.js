import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, Animated
} from 'react-native';
import { obtenerResumenMes } from '../base_datos/baseDatos';
import colores from '../estilos/colores';

const { width } = Dimensions.get('window');
const COLUMNAS = 3;
const ANCHO_MES = (width - 48) / COLUMNAS;

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Días por mes (sin años bisiestos por ahora)
const DIAS_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Obtener primer día de la semana del mes (0=dom, 1=lun...)
const primerDiaDelMes = (anio, mes) => new Date(anio, mes, 1).getDay();

const MiniCalendario = ({ anio, mesIndex, resumen, onPress, escalaAnim }) => {
  const hoy = new Date();
  const esHoy = (dia) =>
    hoy.getFullYear() === anio &&
    hoy.getMonth() === mesIndex &&
    hoy.getDate() === dia;

  const totalDias = DIAS_MES[mesIndex];
  const offset = primerDiaDelMes(anio, mesIndex);
  const celdas = Array(offset).fill(null).concat(
    Array.from({ length: totalDias }, (_, i) => i + 1)
  );

  // Puntos de color por día
  const puntoDia = (dia) => {
    const key = `${anio}-${String(mesIndex + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const info = resumen[key];
    if (!info) return null;
    if (info.ingresos > info.gastos) return colores.ingreso;
    if (info.gastos > 0) return colores.gasto;
    return null;
  };

  return (
    <TouchableOpacity
      style={estilos.tarjetaMes}
      onPress={() => onPress(mesIndex, escalaAnim)}
      activeOpacity={0.8}
    >
      <Text style={estilos.nombreMes}>{MESES[mesIndex]}</Text>

      {/* Mini grid del calendario */}
      <View style={estilos.gridMini}>
        {['D','L','M','X','J','V','S'].map((d, i) => (
          <Text key={i} style={estilos.diaSemana}>{d}</Text>
        ))}
        {celdas.map((dia, i) => (
          <View key={i} style={estilos.celdaDia}>
            {dia ? (
              <>
                <Text style={[
                  estilos.numeroDia,
                  esHoy(dia) && estilos.diaHoy
                ]}>
                  {dia}
                </Text>
                {puntoDia(dia) && (
                  <View style={[estilos.punto, { backgroundColor: puntoDia(dia) }]} />
                )}
              </>
            ) : null}
          </View>
        ))}
      </View>

      {/* Resumen del mes */}
      <ResumenMiniMes anio={anio} mes={mesIndex} />
    </TouchableOpacity>
  );
};

const ResumenMiniMes = ({ anio, mes }) => {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    obtenerResumenMes(anio, mes + 1).then(setDatos);
  }, []);

  if (!datos || (datos.ingresos === 0 && datos.gastos === 0)) return null;

  return (
    <View style={estilos.resumenMini}>
      {datos.ingresos > 0 && (
        <Text style={estilos.resumenIngreso}>+Bs {datos.ingresos.toFixed(0)}</Text>
      )}
      {datos.gastos > 0 && (
        <Text style={estilos.resumenGasto}>-Bs {datos.gastos.toFixed(0)}</Text>
      )}
    </View>
  );
};

export default function VistaAnual({ navigation }) {
  const anio = 2026;
  const [resumen, setResumen] = useState({});
  const escalas = useRef(MESES.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // Cargar todos los puntos del año
    // Se hace en DetalleDia individualmente por mes
  }, []);

  const handlePressMes = (mesIndex, escalaAnim) => {
    // Animación zoom tipo Apple
    Animated.sequence([
      Animated.spring(escalas[mesIndex], {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(escalas[mesIndex], {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start(() => {
      navigation.navigate('Calendario', { anio, mes: mesIndex });
    });
  };

  return (
    <View style={estilos.contenedor}>
      {/* Header del año */}
      <View style={estilos.header}>
        <Text style={estilos.tituloAnio}>{anio}</Text>
      </View>

      {/* Grid de 12 meses */}
      <FlatList
        data={MESES}
        keyExtractor={(_, i) => i.toString()}
        numColumns={COLUMNAS}
        contentContainerStyle={estilos.grid}
        renderItem={({ item, index }) => (
          <Animated.View style={{ transform: [{ scale: escalas[index] }] }}>
            <MiniCalendario
              anio={anio}
              mesIndex={index}
              resumen={resumen}
              onPress={handlePressMes}
              escalaAnim={escalas[index]}
            />
          </Animated.View>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tituloAnio: {
    fontSize: 34,
    fontWeight: '700',
    color: '#fff',
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  tarjetaMes: {
    width: ANCHO_MES,
    margin: 6,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 8,
  },
  nombreMes: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  gridMini: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  diaSemana: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: '#555',
    fontSize: 7,
    marginBottom: 1,
  },
  celdaDia: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    marginBottom: 1,
  },
  numeroDia: {
    color: '#aaa',
    fontSize: 7.5,
  },
  diaHoy: {
    color: '#FF3B30',
    fontWeight: '700',
  },
  punto: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginTop: 0.5,
  },
  resumenMini: {
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#2C2C2E',
    paddingTop: 4,
  },
  resumenIngreso: {
    color: '#30D158',
    fontSize: 9,
    fontWeight: '600',
  },
  resumenGasto: {
    color: '#FF3B30',
    fontSize: 9,
  },
});
