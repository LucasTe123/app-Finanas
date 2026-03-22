// ============================================================
// ARCHIVO: App.js
// QUÉ HACE: Punto de entrada principal de la app
// Inicializa la base de datos y carga la navegación
// ============================================================

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Navegacion from './configuracion/navegacion';

import { inicializarBaseDatos } from './base_datos/baseDatos';

export default function App() {

  // ----------------------------------------------------------
  // Inicializar la base de datos al abrir la app
  // Solo crea las tablas si no existen, no borra datos
  // ----------------------------------------------------------
  useEffect(() => {
    inicializarBaseDatos();
  }, []);

  return (
    <>
      {/* AQUÍ CAMBIAR: "light" o "dark" según el tema */}
      <StatusBar style="light" />
      <Navegacion />
    </>
  );
}
