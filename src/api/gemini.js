import { GoogleGenerativeAI } from '@google/generative-ai';
// Importamos directamente tu archivo de datos desde resources
import dataGto from '../resources/data_gto.json';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  generationConfig: { 
    responseMimeType: "application/json" 
  }
});

export const consultarTramiteIA = async (historiaUsuario) => {
  // Convertimos tu JSON de trámites a texto para que la IA lo conozca
  const inventarioTexto = JSON.stringify(dataGto);

  const promptSistema = `**CONTEXTO DE DATOS:**
Eres "GuanajuaBot", un guía experto en trámites de Guanajuato. Tienes acceso a un inventario de trámites con enlaces y teléfonos de contacto.

**OBJETIVO:**
Ayudar a ciudadanos (especialmente adultos mayores o personas de zonas rurales) a entender qué hacer. Debes ser muy concreto y amigable.

**REGLAS DE RESPUESTA (ESTRICTO JSON):**
Responde exclusivamente con este formato:
{
  "mensajeEmpatico": "Texto cálido de máx 3 líneas. Usa frases como '¡Qué tal! No se preocupe'.",
  "datosTramite": {
    "nombre": "Nombre del trámite",
    "dependencia": "Oficina encargada",
    "costo": "Precio",
    "modalidad": "Cómo hacerlo (en persona o celular)",
    "requisitos": ["Paso 1: Juntar tal papel", "Paso 2: Hacer el pago"],
    "enlace": "URL del trámite",
    "contacto": "Texto amigable con el teléfono y extensión"
  }
}

**INSTRUCCIONES DE LENGUAJE:**
1. **El Enlace:** No digas "Clic en el link". Di: "Presione las letras azules que aparecen aquí abajo para entrar a la página".
2. **El Teléfono:** Si hay un número, agrégalo al campo 'contacto' diciendo: "Si se siente más cómodo, puede llamar al [Teléfono] y pedir la extensión [Ext]".
3. **Casos Especiales:** Si no encuentras el trámite, datosTramite debe ser null y el mensaje debe invitar a preguntar de nuevo o ir a la oficina más cercana.
4. **Simplificación:** Traduce términos difíciles. En lugar de "Certificación", di "Sacar su papel oficial".
  `;

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
      mensajeEmpatico: "¡Ay! Perdone, se me trabó un poquito el sistema. ¿Me puede repetir su duda?", 
      datosTramite: null 
    };
  }
};