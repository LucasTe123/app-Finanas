// ============================================================
// ARCHIVO: configuracion/ios_futuro.js
// QUÉ HACE: Documenta todo lo necesario para migrar a iOS
// nativo con Swift y agregar funciones del sistema
//
// ESTE ARCHIVO ES SOLO DOCUMENTACIÓN Y ESTRUCTURA BASE
// No implementa nada todavía, prepara el camino
// ============================================================

// ------------------------------------------------------------
// 1. SIRI SHORTCUTS
// ------------------------------------------------------------
// CÓMO FUNCIONA:
// Siri convierte la voz del usuario a texto
// Ese texto llega a la app como un string normal
// La app lo procesa con el interpretador offline
//
// PASOS PARA IMPLEMENTAR EN EL FUTURO:
// 1. Instalar: npx expo install expo-intent-launcher
// 2. En Swift (AppDelegate.swift) agregar:
//    func application(_ app: UIApplication,
//      continue userActivity: NSUserActivity) -> Bool {
//      // Recibir texto de Siri aquí
//    }
// 3. Crear un Siri Shortcut en Xcode con el intent:
//    "Registrar gasto en Asistente Financiero"
// 4. El texto de Siri llega al interpretador.js sin cambios
//
// NOTA: Solo funciona con build nativo (no con Expo Go)
// Comando para generar build nativo: npx expo run:ios
// ------------------------------------------------------------

// ------------------------------------------------------------
// 2. FACE ID
// ------------------------------------------------------------
// CÓMO FUNCIONA:
// El usuario debe autenticarse con Face ID al abrir la app
// Si falla, se muestra pantalla de PIN alternativo
//
// PASOS PARA IMPLEMENTAR EN EL FUTURO:
// 1. Instalar: npx expo install expo-local-authentication
// 2. Crear pantalla: pantallas/Autenticacion.js
// 3. Agregar al inicio de App.js:
//    const autenticado = await LocalAuthentication.authenticateAsync()
//    if (!autenticado.success) mostrarPantallaPIN()
//
// CÓDIGO BASE LISTO PARA USAR:
export const verificarFaceID = async () => {
  // TODO: descomentar cuando se instale expo-local-authentication
  // const LocalAuthentication = require('expo-local-authentication');
  //
  // const compatible = await LocalAuthentication.hasHardwareAsync();
  // if (!compatible) return { exito: false, razon: 'sin_hardware' };
  //
  // const resultado = await LocalAuthentication.authenticateAsync({
  //   promptMessage: 'Verificá tu identidad',
  //   fallbackLabel: 'Usar PIN',
  //   cancelLabel: 'Cancelar',
  // });
  //
  // return { exito: resultado.success };

  // Por ahora siempre retorna true (sin autenticación)
  return { exito: true };
};

// ------------------------------------------------------------
// 3. NOTIFICACIONES NATIVAS
// ------------------------------------------------------------
// CÓMO FUNCIONA:
// La app puede recordarle al usuario registrar sus gastos
// Ejemplo: "No olvidés registrar tus gastos de hoy"
//
// PASOS PARA IMPLEMENTAR EN EL FUTURO:
// 1. Instalar: npx expo install expo-notifications
// 2. Pedir permisos al usuario la primera vez
// 3. Programar notificación diaria a hora configurable
//
// CÓDIGO BASE LISTO PARA USAR:
export const configurarNotificaciones = async () => {
  // TODO: descomentar cuando se instale expo-notifications
  // const Notifications = require('expo-notifications');
  //
  // // Pedir permisos
  // const { status } = await Notifications.requestPermissionsAsync();
  // if (status !== 'granted') return;
  //
  // // Programar notificación diaria
  // // AQUÍ CAMBIAR: hora de la notificación (hora, minuto)
  // await Notifications.scheduleNotificationAsync({
  //   content: {
  //     title: 'Asistente Financiero',
  //     body: 'No olvidés registrar tus gastos de hoy',
  //   },
  //   trigger: {
  //     hour: 21,   // AQUÍ CAMBIAR: hora (21 = 9pm)
  //     minute: 0,  // AQUÍ CAMBIAR: minutos
  //     repeats: true,
  //   },
  // });

  console.log('Notificaciones: pendiente de implementar');
};

// ------------------------------------------------------------
// 4. MIGRACIÓN A SWIFT (BUILD NATIVO)
// ------------------------------------------------------------
// Cuando quieras salir de Expo Go y publicar en App Store:
//
// PASO 1: Generar proyecto nativo
//   npx expo prebuild --platform ios
//
// PASO 2: Abrir en Xcode
//   open ios/AsistenteFinanciero.xcworkspace
//
// PASO 3: Configurar en Xcode:
//   - Bundle Identifier (ej: com.tuNombre.asistenteFinanciero)
//   - Certificados de Apple Developer
//   - Capabilities: Siri, Face ID, Push Notifications
//
// PASO 4: Compilar y subir al App Store con:
//   eas build --platform ios
//   eas submit --platform ios
//
// NOTA: Necesitás cuenta de Apple Developer ($99/año)
// ------------------------------------------------------------

// ------------------------------------------------------------
// 5. CHECKLIST DE MIGRACIÓN FUTURA
// ------------------------------------------------------------
// [ ] Instalar expo-local-authentication (Face ID)
// [ ] Instalar expo-notifications (notificaciones)
// [ ] Instalar expo-intent-launcher (Siri)
// [ ] Crear pantalla de autenticación
// [ ] Configurar EAS Build
// [ ] Crear cuenta Apple Developer
// [ ] Configurar Bundle Identifier en app.json
// [ ] Generar certificados en Xcode
// [ ] Probar en dispositivo físico con build nativo
// [ ] Subir al App Store
// ------------------------------------------------------------
