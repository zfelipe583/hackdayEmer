import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Linking, 
  Alert 
} from 'react-native';
import { consultarTramiteIA } from '../api/gemini';

export default function ChatModeScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const [mensajes, setMensajes] = useState([
    {
      id: '1',
      emisor: 'bot',
      texto: '¡Hola! Soy GuanajuaBot. Cuéntame qué trámite necesitas para darte los pasos a seguir.',
      tramite: null
    }
  ]);

  // Función para validar si un texto es un enlace real
  const esEnlaceValido = (texto) => {
    if (!texto) return false;
    const patronUrl = new RegExp(/^(https?:\/\/)/); // Verifica que empiece con http:// o https://
    return patronUrl.test(texto);
  };

  const manejarAccionTramite = async (enlace, dependencia) => {
    if (esEnlaceValido(enlace)) {
      try {
        const supported = await Linking.canOpenURL(enlace);
        if (supported) {
          await Linking.openURL(enlace);
        } else {
          Alert.alert("Error", "No se pudo abrir el enlace en el navegador.");
        }
      } catch (error) {
        Alert.alert("Error", "Hubo un problema al intentar abrir la página.");
      }
    } else {
      // Si el enlace no es válido o es texto descriptivo, mostramos la oficina
      Alert.alert(
        "Trámite Presencial", 
        `Para este trámite debe acudir a: ${dependencia}.`
      );
    }
  };

  const enviarMensaje = async () => {
    if (inputText.trim() === '') return;

    const nuevoMensajeUsuario = { 
      id: Date.now().toString(), 
      emisor: 'user', 
      texto: inputText, 
      tramite: null 
    };
    
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
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
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const TarjetaTramite = ({ tramite }) => {
    if (!tramite || Object.keys(tramite).length === 0) return null;

    const tieneLink = esEnlaceValido(tramite.enlace);

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
        
        <TouchableOpacity 
          style={[
            styles.botonTramite, 
            !tieneLink && { backgroundColor: '#6B7280' } // Cambia a gris si no es link
          ]} 
          onPress={() => manejarAccionTramite(tramite.enlace, tramite.dependencia)}
        >
          <Text style={styles.textoBotonTramite}>
            {tieneLink ? "Iniciar Trámite" : "Ve a las oficinas"}
          </Text>
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnVolver}>
          <Text style={styles.txtVolver}>⬅ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Chat de Ayuda</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id}
        renderItem={renderMensaje}
        contentContainerStyle={styles.listaMensajes}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#004A98" />
          <Text style={styles.loadingText}>Consultando trámites...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu mensaje aquí..."
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
  listaMensajes: { padding: 15, paddingBottom: 20 },
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
    paddingBottom: Platform.OS === 'ios' ? 30 : 10
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