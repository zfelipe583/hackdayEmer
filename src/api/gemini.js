import { GoogleGenerativeAI } from '@google/generative-ai';
import tramitesData from '../constants/tramites.json';

// OJO: Para el hackatón pon tu llave aquí directo, 
// pero recuerda NO subir este archivo a un repositorio público (GitHub).
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

// Usamos 2.5 Flash porque es el modelo más rápido, ideal para cumplir tu meta de <10s
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `Eres un asistente virtual del Gobierno del Estado de Guanajuato. Tu objetivo es la inclusión digital.
Hablas con ciudadanos (muchos de ellos de zonas rurales o adultos mayores) que te cuentan su historia o problema.
Eres extremadamente paciente, claro, empático y usas lenguaje sencillo, cero burocrático.

Este es tu catálogo de trámites oficiales:
${JSON.stringify(tramitesData)}

INSTRUCCIONES DE RESPUESTA:
1. Escucha la historia del usuario.
2. Identifica cuál de los trámites del catálogo necesita.
3. Responde PRIMERO con un mensaje empático y conversacional (máximo 3 líneas).
4. LUEGO, agrega EXACTAMENTE este separador: |||
5. FINALMENTE, devuelve ÚNICAMENTE el objeto JSON del trámite correspondiente. Si no estás seguro, devuelve un JSON vacío {}.

EJEMPLO DE RESPUESTA:
¡Hola! Entiendo lo frustrante que es perder los papeles. No te preocupes, para reponer tu documento oficial necesitas este trámite, es muy rápido:
|||
{
  "id": 1,
  "categoria": "Civil",
  "nombre": "Certificación acta nacimiento",
  "costo": "$130.00"
  // ... resto de los datos del trámite
}`
});

export const consultarTramiteIA = async (historiaUsuario) => {
  try {
    const result = await model.generateContent(historiaUsuario);
    const responseText = result.response.text();
    
    // Separamos el texto empático de los datos puros
    const partes = responseText.split('|||');
    const mensajeEmpatico = partes[0].trim();
    let datosTramite = null;

    if (partes.length > 1) {
      try {
        datosTramite = JSON.parse(partes[1].trim());
      } catch (e) {
        console.log("Error parseando el JSON de Gemini:", e);
      }
    }

    return { mensajeEmpatico, datosTramite };
  } catch (error) {
    console.error("Error consultando a Gemini:", error);
    return { 
      mensajeEmpatico: "Tuvimos un pequeño problema de conexión. ¿Podrías volver a contarme qué trámite buscas?", 
      datosTramite: null 
    };
  }
};