import { GoogleGenerativeAI } from '@google/generative-ai';
import dataGto from '../resources/data_gto.json';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite-preview", // Actualizado a la versión estable más reciente
  generationConfig: { 
    responseMimeType: "application/json" 
  }
});

export const consultarTramiteIA = async (historiaUsuario) => {
  const inventarioTexto = JSON.stringify(dataGto);

  const promptSistema = `**CONTEXTO DE DATOS:**
Eres "GuanajuaBot", un guía experto en trámites de Guanajuato. Tienes acceso a este inventario: ${inventarioTexto}

**OBJETIVO:**
Ayudar a ciudadanos a entender qué hacer. Sé concreto y amigable.

**REGLAS DE RESPUESTA (ESTRICTO JSON):**
{
  "mensajeEmpatico": "Texto cálido",
  "datosTramite": {
    "nombre": "Nombre",
    "dependencia": "Oficina",
    "costo": "Precio",
    "modalidad": "Cómo hacerlo",
    "requisitos": ["Paso 1", "Paso 2"],
    "enlace": "URL real que viene en el JSON",
    "contacto": "Teléfono"
  }
}`;

  try {
    const result = await model.generateContent([
      promptSistema, 
      `Pregunta del ciudadano: ${historiaUsuario}`
    ]);
    
    const responseText = result.response.text();
    const jsonFinal = JSON.parse(responseText);

    return { 
      mensajeEmpatico: jsonFinal.mensajeEmpatico, 
      datosTramite: jsonFinal.datosTramite 
    };

  } catch (error) {
    console.error("Error en GuanajuaBot:", error);
    return { 
      mensajeEmpatico: "¡Ay! Perdone, se me trabó un poquito el sistema.", 
      datosTramite: null 
    };
  }
};