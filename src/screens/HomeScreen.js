import React from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* ZONA DE VOZ - Ocupa la mayor parte de la pantalla */}
      <Pressable 
        style={styles.zonaAccesibilidad} 
        onPress={() => navigation.navigate('VoiceModeScreen')}
        accessibilityLabel="Modo de voz. Toca cualquier parte de esta área para iniciar."
        accessibilityRole="button"
      >
        <View style={styles.textoContainer}>
          <Text style={styles.titulo}>Guanajuato Digital</Text>
          <Text style={styles.subtitulo}>Asistente Ciudadano</Text>
          
          <Text style={styles.instruccionVoz}>
            Toca en cualquier lugar de la pantalla para iniciar la navegación por voz.
          </Text>
        </View>
      </Pressable>

      {/* ZONA MODO NORMAL - Botón anclado abajo */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.botonNormal}
          onPress={() => navigation.navigate('ChatModeScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.textoBoton}>Continuar con modo normal</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  zonaAccesibilidad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoContainer: {
    alignItems: 'center',
  },
  titulo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#004A98', // Azul institucional
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 22,
    color: '#4B5563',
    marginBottom: 40,
    textAlign: 'center',
  },
  instruccionVoz: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40, 
    backgroundColor: '#FFFFFF',
  },
  botonNormal: {
    backgroundColor: '#004A98', 
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4, 
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  }
});