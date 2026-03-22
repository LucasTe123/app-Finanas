import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetalleDia = () => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>Detalle del dia</Text>
    </View>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default DetalleDia;
