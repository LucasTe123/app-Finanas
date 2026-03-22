import React from 'react';
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

// Stack para la sección calendario (Anual → Mes → Día)
function StackCalendario() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'default', // animación nativa de Apple
      }}
    >
      <Stack.Screen name="VistaAnual" component={VistaAnual} />
      <Stack.Screen name="Calendario" component={Calendario} />
      <Stack.Screen name="DetalleDia" component={DetalleDia} />
    </Stack.Navigator>
  );
}

export default function Navegacion() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1C1C1E',
            borderTopColor: '#2C2C2E',
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#555',
          tabBarIcon: ({ color, size }) => {
            const iconos = {
              Calendarios: 'calendar',
              Registrar: 'add-circle',
            };
            return <Ionicons name={iconos[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Calendarios" component={StackCalendario} />
        <Tab.Screen
          name="Registrar"
          component={Registro}
          options={{ tabBarLabel: 'Registrar' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
