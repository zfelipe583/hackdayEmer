import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importamos las vistas
import HomeScreen from '../screens/HomeScreen';
import VoiceModeScreen from '../screens/VoiceModeScreen';
import ChatModeScreen from '../screens/ChatModeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="HomeScreen"
        screenOptions={{ 
          headerShown: false, // Quitamos la barra superior para mantener tu diseño limpio
          animation: 'slide_from_right' 
        }}
      >
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        
        {/* Usamos una animación de 'fade' para la vista de voz para que sea más sutil */}
        <Stack.Screen 
          name="VoiceModeScreen" 
          component={VoiceModeScreen} 
          options={{ animation: 'fade' }} 
        />
        
        <Stack.Screen name="ChatModeScreen" component={ChatModeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}