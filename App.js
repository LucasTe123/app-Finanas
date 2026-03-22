// ============================================================
// ARCHIVO: App.js
// QUÉ HACE: Punto de entrada principal de la app
// Carga la tipografía, inicializa la base de datos
// ============================================================

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import Navegacion from './configuracion/navegacion';
import { inicializarBaseDatos } from './base_datos/baseDatos';

export default function App() {
  // Cargar fuentes Inter
  const [fontsCargadas] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    inicializarBaseDatos();
  }, []);

  // Mostrar pantalla de carga mientras cargan las fuentes
  if (!fontsCargadas) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#0A84FF" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Navegacion />
    </>
  );
}
