import React, { useState, useRef } from 'react'; // 1. Añadimos useRef
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { consultarTramiteIA } from '../api/gemini';

export default function ChatModeScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null); // 2. Referencia para el scroll

  const [mensajes, setMensajes] = useState([
    {
      id: '1',
      emisor: 'bot',
      texto: '¡Hola! Para ayudarte mejor, cuéntame un poco de la historia de lo que deseas hacer o qué problema tienes hoy.',
      tramite: null
    }
  ]);

  const enviarMensaje = async () => {
    if (inputText.trim() === '') return;

    const nuevoMensajeUsuario = { id: Date.now().toString(), emisor: 'user', texto: inputText, tramite: null };
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    
    // 3. Hacer scroll al final después de enviar
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const textoAEnviar = inputText;
    setInputText('');
    setIsLoading(true);

    const { mensajeEmpatico, datosTramite } = await consultarTramiteIA(textoAEnviar);

    const respuestaBot = {
      id: (Date.now() + 1).toString(),
      emisor: 'bot',
      texto: mensajeEmpatico,
      tramite: datosTramite
    };

    setMensajes((prev) => [...prev, respuestaBot]);
    setIsLoading(false);
    
    // Scroll de nuevo cuando llega la respuesta
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ... (TarjetaTramite y renderMensaje se mantienen igual)
  const TarjetaTramite = ({ tramite }) => {
    if (!tramite || Object.keys(tramite).length === 0) return null;
    return (
      <View style={styles.tarjeta}>
        <Text style={styles.tarjetaTitulo}>{tramite.nombre}</Text>
        <Text style={styles.tarjetaDato}>🏢 <Text style={styles.bold}>Dependencia:</Text> {tramite.dependencia}</Text>
        <Text style={styles.tarjetaDato}>💰 <Text style={styles.bold}>Costo:</Text> {tramite.costo}</Text>
        <Text style={styles.tarjetaDato}>💻 <Text style={styles.bold}>Modalidad:</Text> {tramite.modalidad}</Text>
        <Text style={[styles.tarjetaDato, styles.bold, { marginTop: 10 }]}>📋 Requisitos:</Text>
        {tramite.requisitos && tramite.requisitos.map((req, index) => (
          <Text key={index} style={styles.requisitoItem}>• {req}</Text>
        ))}
        <TouchableOpacity style={styles.botonTramite}>
          <Text style={styles.textoBotonTramite}>Iniciar Trámite</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMensaje = ({ item }) => {
    const isBot = item.emisor === 'bot';
    return (
      <View style={[styles.burbujaContenedor, isBot ? styles.burbujaBot : styles.burbujaUsuario]}>
        <Text style={[styles.textoMensaje, isBot ? styles.textoBot : styles.textoUsuario]}>
          {item.texto}
        </Text>
        {isBot && item.tramite && <TarjetaTramite tramite={item.tramite} />}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      // 4. Mejoramos el behavior y el offset
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} 
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnVolver}>
          <Text style={styles.txtVolver}>⬅ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Chat de Ayuda</Text>
      </View>

      <FlatList
        ref={flatListRef} // 5. Asignamos la referencia
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={renderMensaje}
        contentContainerStyle={styles.listaMensajes}
        // 6. Asegura que el contenido se empuje hacia arriba
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#004A98" />
          <Text style={styles.loadingText}>El asistente está escribiendo...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu situación aquí..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={styles.btnEnviar} 
          onPress={enviarMensaje} 
          disabled={isLoading}
        >
          <Text style={styles.txtEnviar}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 15, paddingTop: 50,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  btnVolver: { marginRight: 15 },
  txtVolver: { color: '#004A98', fontSize: 16, fontWeight: 'bold' },
  headerTitulo: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  listaMensajes: { padding: 15, paddingBottom: 20 }, // Ajustado padding
  burbujaContenedor: { maxWidth: '85%', padding: 15, borderRadius: 15, marginBottom: 15 },
  burbujaBot: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  burbujaUsuario: { backgroundColor: '#004A98', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  textoMensaje: { fontSize: 16, lineHeight: 24 },
  textoBot: { color: '#1F2937' },
  textoUsuario: { color: '#FFFFFF' },
  tarjeta: { 
    marginTop: 15, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 15, 
    borderWidth: 1, borderColor: '#E5E7EB' 
  },
  tarjetaTitulo: { fontSize: 18, fontWeight: 'bold', color: '#004A98', marginBottom: 10 },
  tarjetaDato: { fontSize: 14, color: '#4B5563', marginBottom: 5 },
  bold: { fontWeight: 'bold', color: '#111827' },
  requisitoItem: { fontSize: 14, color: '#4B5563', marginLeft: 10, marginTop: 2 },
  botonTramite: { 
    backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 
  },
  textoBotonTramite: { color: '#FFF', fontWeight: 'bold' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  loadingText: { marginLeft: 10, color: '#6B7280', fontStyle: 'italic' },
  inputContainer: { 
    flexDirection: 'row', padding: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB',
    marginBottom: Platform.OS === 'ios' ? 20 : 0 // Espacio extra para el home indicator de iOS
  },
  input: { 
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, 
    maxHeight: 100, fontSize: 16 
  },
  btnEnviar: { 
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#004A98', borderRadius: 20, 
    paddingHorizontal: 20, marginLeft: 10 
  },
  txtEnviar: { color: '#FFFFFF', fontWeight: 'bold' }
});