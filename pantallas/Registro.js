import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Registro = () => {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>Registro</Text>
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

export default Registro;
