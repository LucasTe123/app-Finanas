import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Calendario from '../pantallas/Calendario';
import Registro from '../pantallas/Registro';
import DetalleDia from '../pantallas/DetalleDia';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const COLORES = {
  fondoTab: '#111111',
  iconoActivo: '#FFFFFF',
  iconoInactivo: '#555555',
  borde: '#222222',
};

// Stack del calendario (incluye pantalla de detalle)
const StackCalendario = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarioPrincipal" component={Calendario} />
      <Stack.Screen name="DetalleDia" component={DetalleDia} />
    </Stack.Navigator>
  );
};

const Navegacion = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let nombreIcono;
            if (route.name === 'CalendarioTab') {
              nombreIcono = focused ? 'calendar' : 'calendar-outline';
            } else if (route.name === 'RegistroTab') {
              nombreIcono = focused ? 'add-circle' : 'add-circle-outline';
            }
            return <Ionicons name={nombreIcono} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORES.iconoActivo,
          tabBarInactiveTintColor: COLORES.iconoInactivo,
          tabBarStyle: {
            backgroundColor: COLORES.fondoTab,
            borderTopColor: COLORES.borde,
            borderTopWidth: 1,
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="CalendarioTab" component={StackCalendario} options={{ tabBarLabel: 'Calendario' }} />
        <Tab.Screen name="RegistroTab" component={Registro} options={{ tabBarLabel: 'Registrar' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navegacion;
