import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, Animated, SafeAreaView
} from 'react-native';

const { width } = Dimensions.get('window');
const COLUMNAS = 3;
const ANCHO_MES = (width - 32) / COLUMNAS;

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const diasDelMes = (anio, mes) => new Date(anio, mes + 1, 0).getDate();
const primerDiaDelMes = (anio, mes) => new Date(anio, mes, 1).getDay();


const MiniCalendario = ({ anio, mesIndex, onPress }) => {
  const hoy = new Date();
  const esEsteMes =
    hoy.getFullYear() === anio && hoy.getMonth() === mesIndex;

  const esHoy = (dia) => esEsteMes && hoy.getDate() === dia;

  const totalDias = diasDelMes(anio, mesIndex);

  const offset = primerDiaDelMes(anio, mesIndex);
  const celdas = Array(offset).fill(null).concat(
    Array.from({ length: totalDias }, (_, i) => i + 1)
  );

  return (
    <TouchableOpacity
      style={[estilos.tarjetaMes, esEsteMes && estilos.tarjetaMesActual]}
      onPress={() => onPress(mesIndex)}
      activeOpacity={0.7}
    >
      {/* Nombre del mes */}
      <Text style={[estilos.nombreMes, esEsteMes && estilos.nombreMesActual]}>
        {MESES[mesIndex]}
      </Text>

      {/* Días de la semana */}
      <View style={estilos.gridMini}>
        {['D','L','M','X','J','V','S'].map((d, i) => (
          <Text key={i} style={estilos.diaSemana}>{d}</Text>
        ))}
        {celdas.map((dia, i) => (
          <View key={i} style={estilos.celdaDia}>
            {dia ? (
              <View style={[estilos.numeroDiaContenedor, esHoy(dia) && estilos.circuloHoy]}>
                <Text style={[
                  estilos.numeroDia,
                  esHoy(dia) && estilos.numeroDiaHoy,
                ]}>
                  {dia}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default function VistaAnual({ navigation }) {
  const anioHoy = new Date().getFullYear();
  const [anio, setAnio] = useState(anioHoy);
  const escalas = useRef(MESES.map(() => new Animated.Value(1))).current;

  const cambiarAnio = (direccion) => {
    // No permite ir antes del 2026
    if (anio + direccion < 2026) return;
    setAnio(anio + direccion);
  };

  const handlePressMes = (mesIndex) => {
    Animated.sequence([
      Animated.spring(escalas[mesIndex], {
        toValue: 0.93,
        useNativeDriver: true,
        speed: 60,
      }),
      Animated.spring(escalas[mesIndex], {
        toValue: 1,
        useNativeDriver: true,
        speed: 60,
      }),
    ]).start(() => {
      navigation.navigate('Calendario', { anio, mes: mesIndex });
    });
  };

  return (
    <SafeAreaView style={estilos.contenedor}>

      {/* Header del año con flechas */}
      <View style={estilos.header}>
        <TouchableOpacity
          onPress={() => cambiarAnio(-1)}
          style={estilos.botonAnio}
          disabled={anio <= 2026}
        >
          <Text style={[estilos.flechaAnio, anio <= 2026 && estilos.flechaDesactivada]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={estilos.tituloAnio}>{anio}</Text>

        <TouchableOpacity onPress={() => cambiarAnio(1)} style={estilos.botonAnio}>
          <Text style={estilos.flechaAnio}>›</Text>
        </TouchableOpacity>
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
              onPress={handlePressMes}
            />
          </Animated.View>
        )}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Header año
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tituloAnio: {
    fontSize: 38,
    fontWeight: '700',
    color: '#fff',
  },
  botonAnio: {
    padding: 8,
  },
  flechaAnio: {
    fontSize: 38,
    color: '#fff',
    fontWeight: '300',
  },
  flechaDesactivada: {
    color: '#333',
  },

  // Grid
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 32,
  },

  // Tarjeta de mes — sin borde, fondo muy sutil
  tarjetaMes: {
    width: ANCHO_MES,
    height: ANCHO_MES * 1.4,
    margin: 4,
    backgroundColor: '#111',
    borderRadius: 14,
    padding: 8,
  },
  // Mes actual tiene fondo ligeramente diferente
  tarjetaMesActual: {
    backgroundColor: '#1A1A2E',
  },

  // Nombre del mes
  nombreMes: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 5,
  },
  nombreMesActual: {
    color: '#fff',
    fontSize: 14,
  },

  // Mini grid
  gridMini: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  diaSemana: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: '#444',
    fontSize: 7,
    marginBottom: 2,
  },
  celdaDia: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    marginBottom: 2,
  },
  numeroDiaContenedor: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  circuloHoy: {
    backgroundColor: '#FF3B30',
  },
  numeroDia: {
    color: '#777',
    fontSize: 8,
  },
  numeroDiaHoy: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 8,
  },
});
