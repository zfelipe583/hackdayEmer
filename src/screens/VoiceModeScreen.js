import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function VoiceModeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>🎙️ Modo Voz Activo</Text>
      <Text style={styles.subtexto}>Desliza para elegir trámite: Vehicular o Civil</Text>
      
      <TouchableOpacity 
        style={styles.botonRegresar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoBoton}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827', // Fondo oscuro para alto contraste
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtexto: {
    color: '#9CA3AF',
    fontSize: 18,
    marginBottom: 40,
  },
  botonRegresar: {
    backgroundColor: '#374151',
    padding: 15,
    borderRadius: 10,
  },
  textoBoton: {
    color: '#FFF',
    fontSize: 16,
  }
});