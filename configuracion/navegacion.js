import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Calendario from '../pantallas/Calendario';
import Registro from '../pantallas/Registro';

const Tab = createBottomTabNavigator();

const COLORES = {
  fondoTab: '#111111',
  iconoActivo: '#FFFFFF',
  iconoInactivo: '#555555',
  borde: '#222222',
};

const Navegacion = () => {
  console.log('Calendario:', Calendario);
  console.log('Registro:', Registro);
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
        <Tab.Screen name="CalendarioTab" component={Calendario} options={{ tabBarLabel: 'Calendario' }} />
        <Tab.Screen name="RegistroTab" component={Registro} options={{ tabBarLabel: 'Registrar' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default Navegacion;
