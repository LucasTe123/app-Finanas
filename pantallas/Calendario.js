// ============================================================
// ARCHIVO: pantallas/Calendario.js
// QUÉ HACE: Pantalla principal con el calendario mensual
// ESTADO: archivo base, se completa en Tarea 8
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Calendario = () => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>Calendario</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  // AQUÍ CAMBIAR: color de fondo de la pantalla
  contenedor: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    // AQUÍ CAMBIAR: color del texto
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default Calendario;
