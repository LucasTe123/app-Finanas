// ============================================================
// ARCHIVO: pantallas/DetalleDia.js
// QUÉ HACE: Muestra todos los registros de un día específico
// Se abre al tocar un día en el calendario
// ============================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerRegistrosPorFecha } from '../base_datos/baseDatos';
import { detectarCategoria } from '../logica/interpretador';
import colores from '../estilos/colores';

// ------------------------------------------------------------
// NOMBRES DE MESES para mostrar la fecha bonita
// AQUÍ CAMBIAR: si querés otro idioma
// ------------------------------------------------------------
const NOMBRES_MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DetalleDia = ({ route, navigation }) => {
  // Recibir la fecha desde el calendario
  const { fecha } = route.params;
  // Estado con los registros del día
  const [registros, setRegistros] = useState([]);

  // ----------------------------------------------------------
  // Cargar registros cada vez que la pantalla está en foco
  // ----------------------------------------------------------
  useFocusEffect(
    useCallback(() => {
      cargarRegistros();
    }, [fecha])
  );

  // ----------------------------------------------------------
  // FUNCIÓN: cargarRegistros
  // QUÉ HACE: Obtiene los registros del día desde SQLite
  // ----------------------------------------------------------
  const cargarRegistros = () => {
    const datos = obtenerRegistrosPorFecha(fecha);
    setRegistros(datos);
  };

  // ----------------------------------------------------------
  // FUNCIÓN: formatearFecha
  // QUÉ HACE: Convierte "2026-03-22" en "22 de marzo, 2026"
  // ----------------------------------------------------------
  const formatearFecha = (fechaStr) => {
    const partes = fechaStr.split('-');
    const dia = parseInt(partes[2]);
    const mes = parseInt(partes[1]) - 1;
    const año = partes[0];
    return `${dia} de ${NOMBRES_MESES[mes]}, ${año}`;
  };

  // ----------------------------------------------------------
  // FUNCIÓN: calcularBalance
  // QUÉ HACE: Suma ingresos y gastos del día
  // ----------------------------------------------------------
  const calcularBalance = () => {
    const ingresos = registros
      .filter(r => r.tipo === 'ingreso')
      .reduce((acc, r) => acc + r.precio, 0);
    const gastos = registros
      .filter(r => r.tipo === 'gasto')
      .reduce((acc, r) => acc + r.precio, 0);
    return { ingresos, gastos, balance: ingresos - gastos };
  };

  // ------------------------------------------------------------
// MAPA DE ÍCONOS POR CATEGORÍA
// AQUÍ CAMBIAR: íconos de cada categoría (usar Ionicons)
// Ver todos los íconos en: icons.expo.fyi
// ------------------------------------------------------------
const ICONOS_CATEGORIA = {
  ingreso:     { nombre: 'cash',              color: '#30D158' },
  comida:      { nombre: 'fast-food',         color: '#FF9F0A' },
  transporte:  { nombre: 'car',               color: '#0A84FF' },
  ropa:        { nombre: 'shirt',             color: '#BF5AF2' },
  cosmeticos:  { nombre: 'color-palette',     color: '#FF375F' },
  tecnologia:  { nombre: 'hardware-chip',     color: '#64D2FF' },
  mercado:     { nombre: 'basket',            color: '#30D158' },
  otros:       { nombre: 'cube',              color: '#8E8E93' },
};

const TarjetaRegistro = ({ item }) => {
  // Detectar categoría para elegir ícono
  const categoria = detectarCategoria(
    item.texto_original || item.objeto,
    item.tipo
  );
  const icono = ICONOS_CATEGORIA[categoria] || ICONOS_CATEGORIA.otros;

  return (
    <View style={estilos.tarjeta}>
      {/* Ícono de categoría */}
      <View style={[
        estilos.iconoContenedor,
        { backgroundColor: `${icono.color}22` }
      ]}>
        <Ionicons
          name={icono.nombre}
          size={20}
          color={icono.color}
        />
      </View>

      {/* Información del registro */}
      <View style={estilos.infoRegistro}>
        <Text style={estilos.nombreObjeto}>{item.objeto}</Text>
        <Text style={estilos.textoOriginal} numberOfLines={1}>
          {item.texto_original}
        </Text>
      </View>

      {/* Precio en Bs */}
      <Text style={[
        estilos.precio,
        item.tipo === 'gasto' ? estilos.precioGasto : estilos.precioIngreso
      ]}>
        {item.tipo === 'gasto' ? '-' : '+'}Bs {item.precio}
      </Text>
    </View>
  );
};


  const { ingresos, gastos, balance } = calcularBalance();

  return (
    <SafeAreaView style={estilos.contenedor}>

      {/* Encabezado con botón volver */}
      <View style={estilos.encabezado}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={estilos.botonVolver}
        >
          <Ionicons name="chevron-back" size={24} color={colores.acento} />
        </TouchableOpacity>
        <Text style={estilos.tituloFecha}>{formatearFecha(fecha)}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Resumen del día */}
      <View style={estilos.resumen}>
        <View style={estilos.itemResumen}>
          <Text style={estilos.etiquetaResumen}>Ingresos</Text>
          <Text style={[estilos.valorResumen, { color: colores.positivo }]}>
            +Bs{ingresos.toFixed(2)}
          </Text>
        </View>

        {/* Separador vertical */}
        <View style={estilos.separadorVertical} />

        <View style={estilos.itemResumen}>
          <Text style={estilos.etiquetaResumen}>Gastos</Text>
          <Text style={[estilos.valorResumen, { color: colores.negativo }]}>
            -Bs{gastos.toFixed(2)}
          </Text>
        </View>

        {/* Separador vertical */}
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

      {/* Lista de registros */}
      {registros.length === 0 ? (
        // Pantalla vacía si no hay registros
        <View style={estilos.contenedorVacio}>
          <Ionicons name="document-outline" size={48} color={colores.textoGris} />
          <Text style={estilos.textoVacio}>Sin registros este día</Text>
          <Text style={estilos.subtextoVacio}>
            Andá a Registrar para agregar uno
          </Text>
        </View>
      ) : (
        <FlatList
          data={registros}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <TarjetaRegistro item={item} />}
          contentContainerStyle={estilos.lista}
          ItemSeparatorComponent={() => <View style={estilos.separador} />}
        />
      )}

    </SafeAreaView>
  );
};

// ------------------------------------------------------------
// ESTILOS
// AQUÍ CAMBIAR: todo el diseño visual del detalle del día
// ------------------------------------------------------------
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondoPrincipal,
  },

  // Encabezado
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

  // Resumen del día
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

  // Lista de registros
  lista: {
    paddingHorizontal: 16,
  },
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconoContenedor: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoGasto: {
    // AQUÍ CAMBIAR: fondo del ícono de gasto
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
  },
  iconoIngreso: {
    // AQUÍ CAMBIAR: fondo del ícono de ingreso
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
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

  // Estado vacío
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
});

export default DetalleDia;
