// ============================================================
// ARCHIVO: pantallas/DetalleDia.js
// ============================================================

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { obtenerRegistrosPorFecha, borrarRegistro } from '../base_datos/baseDatos';
import { detectarCategoria } from '../logica/interpretador';
import colores from '../estilos/colores';

const NOMBRES_MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const ICONOS_CATEGORIA = {
  ingreso:     { nombre: 'cash',           color: '#30D158' },
  comida:      { nombre: 'fast-food',      color: '#FF9F0A' },
  transporte:  { nombre: 'car',            color: '#0A84FF' },
  ropa:        { nombre: 'shirt',          color: '#BF5AF2' },
  cosmeticos:  { nombre: 'color-palette',  color: '#FF375F' },
  tecnologia:  { nombre: 'hardware-chip',  color: '#64D2FF' },
  mercado:     { nombre: 'basket',         color: '#30D158' },
  otros:       { nombre: 'cube',           color: '#8E8E93' },
};

// ------------------------------------------------------------
// Tarjeta con swipe para borrar (estilo iPhone)
// ------------------------------------------------------------
const TarjetaRegistro = ({ item, onBorrar }) => {
  const swipeableRef = useRef(null);
  const categoria = detectarCategoria(item.texto_original || item.objeto, item.tipo);
  const icono = ICONOS_CATEGORIA[categoria] || ICONOS_CATEGORIA.otros;

  const renderBotonBorrar = (progress, dragX) => {
    // Cuando jalas de más, el círculo se estira hacia la izquierda
    const escalaX = dragX.interpolate({
      inputRange: [-160, -80, 0],
      outputRange: [1.6, 1, 1],   // se estira cuando pasás de 80px
      extrapolate: 'clamp',
    });

    // El círculo también crece un poco verticalmente
    const escalaY = dragX.interpolate({
      inputRange: [-160, -80, 0],
      outputRange: [1.15, 1, 1],
      extrapolate: 'clamp',
    });

    // El ícono de basura se mueve con el estiramiento
    const moverIcono = dragX.interpolate({
      inputRange: [-160, -80, 0],
      outputRange: [-20, 0, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={estilos.contenedorBorrar}>
        <Animated.View style={[
          estilos.circuloBorrar,
          { transform: [{ scaleX: escalaX }, { scaleY: escalaY }] }
        ]}>
          <Animated.View style={{ transform: [{ translateX: moverIcono }] }}>
            <TouchableOpacity
              onPress={() => {
                swipeableRef.current?.close();
                onBorrar(item.id);
              }}
              style={estilos.botonInterior}
            >
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderBotonBorrar}
      overshootRight={true}       // permite jalar de más para el efecto
      overshootFriction={3}       // resistencia al jalar de más
      friction={2}
      rightThreshold={50}
    >
      <View style={estilos.tarjeta}>
        <View style={[estilos.iconoContenedor, { backgroundColor: `${icono.color}22` }]}>
          <Ionicons name={icono.nombre} size={20} color={icono.color} />
        </View>
        <View style={estilos.infoRegistro}>
          <Text style={estilos.nombreObjeto}>{item.objeto}</Text>
          <Text style={estilos.textoOriginal} numberOfLines={1}>
            {item.texto_original}
          </Text>
          {item.hora ? (
            <Text style={estilos.horaRegistro}>{item.hora}</Text>
          ) : null}
        </View>
        <Text style={[
          estilos.precio,
          item.tipo === 'gasto' ? estilos.precioGasto : estilos.precioIngreso
        ]}>
          {item.tipo === 'gasto' ? '-' : '+'}Bs {item.precio}
        </Text>
      </View>
    </Swipeable>
  );
};


// ------------------------------------------------------------
// Pantalla principal
// ------------------------------------------------------------
const DetalleDia = ({ route, navigation }) => {
  const { fecha } = route.params;
  const [registros, setRegistros] = useState([]);

  useFocusEffect(
    useCallback(() => {
      cargarRegistros();
    }, [fecha])
  );

  const cargarRegistros = () => {
    const datos = obtenerRegistrosPorFecha(fecha);
    setRegistros(datos);
  };

  const handleBorrar = (id) => {
    borrarRegistro(id, fecha);
    setRegistros(obtenerRegistrosPorFecha(fecha));
  };

  const formatearFecha = (fechaStr) => {
    const partes = fechaStr.split('-');
    const dia = parseInt(partes[2]);
    const mes = parseInt(partes[1]) - 1;
    const año = partes[0];
    return `${dia} de ${NOMBRES_MESES[mes]}, ${año}`;
  };

  const calcularBalance = () => {
    const ingresos = registros
      .filter(r => r.tipo === 'ingreso')
      .reduce((acc, r) => acc + r.precio, 0);
    const gastos = registros
      .filter(r => r.tipo === 'gasto')
      .reduce((acc, r) => acc + r.precio, 0);
    return { ingresos, gastos, balance: ingresos - gastos };
  };

  const { ingresos, gastos, balance } = calcularBalance();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={estilos.contenedor}>

        <View style={estilos.encabezado}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={estilos.botonVolver}>
            <Ionicons name="chevron-back" size={24} color={colores.acento} />
          </TouchableOpacity>
          <Text style={estilos.tituloFecha}>{formatearFecha(fecha)}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={estilos.resumen}>
          <View style={estilos.itemResumen}>
            <Text style={estilos.etiquetaResumen}>Ingresos</Text>
            <Text style={[estilos.valorResumen, { color: colores.positivo }]}>
              +Bs{ingresos.toFixed(2)}
            </Text>
          </View>
          <View style={estilos.separadorVertical} />
          <View style={estilos.itemResumen}>
            <Text style={estilos.etiquetaResumen}>Gastos</Text>
            <Text style={[estilos.valorResumen, { color: colores.negativo }]}>
              -Bs{gastos.toFixed(2)}
            </Text>
          </View>
          <View style={estilos.separadorVertical} />
          <View style={estilos.itemResumen}>
            <Text style={estilos.etiquetaResumen}>Balance</Text>
            <Text style={[
              estilos.valorResumen,
              { color: balance >= 0 ? colores.positivo : colores.negativo }
            ]}>
              {balance >= 0 ? '+' : ''}Bs{balance.toFixed(2)}
            </Text>
          </View>
        </View>

        {registros.length === 0 ? (
          <View style={estilos.contenedorVacio}>
            <Ionicons name="document-outline" size={48} color={colores.textoGris} />
            <Text style={estilos.textoVacio}>Sin registros este día</Text>
            <Text style={estilos.subtextoVacio}>Andá a Registrar para agregar uno</Text>
          </View>
        ) : (
          <FlatList
            data={registros}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <TarjetaRegistro item={item} onBorrar={handleBorrar} />
            )}
            contentContainerStyle={estilos.lista}
            ItemSeparatorComponent={() => <View style={estilos.separador} />}
          />
        )}

      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// ------------------------------------------------------------
// ESTILOS
// ------------------------------------------------------------
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondoPrincipal,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  botonVolver: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tituloFecha: {
    color: colores.textoBlanco,
    fontSize: 17,
    fontWeight: '600',
  },
  resumen: {
    flexDirection: 'row',
    backgroundColor: colores.fondoTarjeta,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  itemResumen: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  etiquetaResumen: {
    color: colores.textoGris,
    fontSize: 12,
    fontWeight: '500',
  },
  valorResumen: {
    fontSize: 17,
    fontWeight: '700',
  },
  separadorVertical: {
    width: 1,
    backgroundColor: colores.separador,
  },
  lista: {
    paddingHorizontal: 16,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colores.fondoPrincipal, // <-- clave: tapa el botón cuando está cerrado
  },
  iconoContenedor: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRegistro: {
    flex: 1,
    gap: 3,
  },
  nombreObjeto: {
    color: colores.textoBlanco,
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  textoOriginal: {
    color: colores.textoGris,
    fontSize: 13,
  },
  horaRegistro: {
    color: '#555',
    fontSize: 11,
    marginTop: 2,
  },
  precio: {
    fontSize: 16,
    fontWeight: '600',
  },
  precioGasto: {
    color: colores.negativo,
  },
  precioIngreso: {
    color: colores.positivo,
  },
  separador: {
    height: 1,
    backgroundColor: colores.separador,
  },
  contenedorVacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  textoVacio: {
    color: colores.textoBlanco,
    fontSize: 18,
    fontWeight: '600',
  },
  subtextoVacio: {
    color: colores.textoGris,
    fontSize: 14,
  },
  // Botón rojo de borrar
  // Zona donde vive el círculo (invisible, solo da espacio)
  contenedorBorrar: {
    width: 80,
    alignItems: 'flex-start',    // el círculo sale desde la derecha
    justifyContent: 'center',
    overflow: 'visible',         // permite que el círculo se expanda
  },
  // El círculo rojo animado
  circuloBorrar: {
    width: 52,
    height: 52,
    borderRadius: 26,            // perfecto círculo
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  // Área tocable dentro del círculo
  botonInterior: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

});

export default DetalleDia;
