import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import VistaAnual from '../pantallas/VistaAnual';
import Calendario from '../pantallas/Calendario';
import Registro from '../pantallas/Registro';
import DetalleDia from '../pantallas/DetalleDia';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function StackCalendario() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'default' }}>
      <Stack.Screen name="VistaAnual" component={VistaAnual} />
      <Stack.Screen name="Calendario" component={Calendario} />
      <Stack.Screen name="DetalleDia" component={DetalleDia} />
    </Stack.Navigator>
  );
}

function TabBarPersonalizada({ state, descriptors, navigation }) {
  return (
    <View style={estilos.wrapper}>
      {/* Barra pill con efecto glass manual */}
      <View style={estilos.barra}>

        {state.routes.map((route, index) => {
          const estaActivo = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!estaActivo && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // ── BOTÓN REGISTRAR ──────────────────────────
          if (route.name === 'Registrar') {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={estilos.tabItem}
                activeOpacity={0.8}
              >
                {/* Círculo azul con glow */}
                <View style={estilos.botonRegistrar}>
                  <Ionicons name="add" size={26} color="#FFFFFF" />
                </View>
                <Text style={[estilos.labelTab, { color: estaActivo ? '#0A84FF' : '#8E8E93' }]}>
                  Registrar
                </Text>
              </TouchableOpacity>
            );
          }

          // ── BOTÓN CALENDARIOS ────────────────────────
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={estilos.tabItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name={estaActivo ? 'calendar' : 'calendar-outline'}
                size={24}
                color={estaActivo ? '#0A84FF' : '#636366'}
              />
              {/* Punto azul si está activo */}
              {estaActivo ? (
                <View style={estilos.puntoActivo} />
              ) : (
                <View style={{ height: 4 }} />
              )}
              <Text style={[estilos.labelTab, { color: estaActivo ? '#0A84FF' : '#636366' }]}>
                Calendarios
              </Text>
            </TouchableOpacity>
          );
        })}

      </View>
    </View>
  );
}

export default function Navegacion() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <TabBarPersonalizada {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Calendarios" component={StackCalendario} />
        <Tab.Screen name="Registrar" component={Registro} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const estilos = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  // La barra pill con efecto glass
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 40,

    // Efecto glass: fondo oscuro semi-transparente
    backgroundColor: 'rgba(30, 30, 32, 0.88)',

    // Borde brillante tipo Apple
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.18)',

    // Sombra para que "flote"
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 2,
  },

  labelTab: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },

  puntoActivo: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0A84FF',
    marginTop: 2,
  },

  // Botón circular azul de Registrar
  botonRegistrar: {
    width: 35,
    height: 35,
    borderRadius: 23,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,

    // Glow azul
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 10,
  },
});
