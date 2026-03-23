import entorno from '../configuracion/entorno';

// ============================================================
// ARCHIVO: logica/interpretador.js
// QUÉ HACE: Interpreta frases en español y las convierte
// en registros estructurados (objeto, precio, tipo, fecha)
// FUNCIONA 100% OFFLINE, sin necesidad de internet
// ============================================================

// ------------------------------------------------------------
// PALABRAS CLAVE DE GASTOS
// AQUÍ AGREGAR: más palabras si querés ampliar la detección
// ------------------------------------------------------------
const PALABRAS_GASTO = [
  'compré', 'compre', 'gasté', 'gaste', 'pagué', 'pague',
  'costó', 'costo', 'cobró', 'cobro', 'comprar', 'gasto',
  'salió', 'salio', 'desembolsé', 'invertí', 'investi',
  'comí', 'comi', 'tomé', 'tome', 'pedí', 'pedi'
];

// ------------------------------------------------------------
// PALABRAS CLAVE DE INGRESOS
// AQUÍ AGREGAR: más palabras si querés ampliar la detección
// ------------------------------------------------------------
const PALABRAS_INGRESO = [
  'gané', 'gane', 'recibí', 'recibi', 'cobré', 'cobre',
  'ingresó', 'ingreso', 'entró', 'entro', 'vendí', 'vendi',
  'me pagaron', 'me dieron', 'depósito', 'deposito',
  'transferencia', 'sueldo', 'salario', 'pago recibido'
];

// ------------------------------------------------------------
// PALABRAS DE TIEMPO
// AQUÍ AGREGAR: más referencias de tiempo si querés
// ------------------------------------------------------------
const PALABRAS_TIEMPO = {
  'anteayer': -2,
  'antes de ayer': -2,
  'ayer': -1,
  'hoy': 0,
};


// ------------------------------------------------------------
// FUNCIÓN AUXILIAR: obtenerFecha
// QUÉ HACE: Calcula la fecha según la referencia de tiempo
// CORREGIDO: usa hora local en lugar de UTC para evitar
// desfase de zona horaria (Bolivia = UTC-4)
// ------------------------------------------------------------
const obtenerFecha = (diasAtras = 0) => {
  const hoy = new Date();
  
  // Crear fecha usando año, mes y día locales (evita problemas UTC)
  const fechaLocal = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    hoy.getDate() - diasAtras  // restar días correctamente
  );

  const año = fechaLocal.getFullYear();
  const mes = String(fechaLocal.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaLocal.getDate()).padStart(2, '0');

  return `${año}-${mes}-${dia}`;
};



// ------------------------------------------------------------
// FUNCIÓN AUXILIAR: extraerPrecio
// QUÉ HACE: Busca números en el texto
// Detecta: "8 dólares", "8$", "$8", "8 bs", "8.50"
// DEVUELVE: número o null si no encuentra
// ------------------------------------------------------------
const extraerPrecio = (texto) => {
  // Buscar patrones de precio con símbolo adelante: $8, $8.50
  const conSimboloAdelante = texto.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (conSimboloAdelante) return parseFloat(conSimboloAdelante[1]);

  // Buscar número seguido de moneda: 8 dólares, 8 bs, 8 bolivianos
  const conMoneda = texto.match(/(\d+(?:\.\d{1,2})?)\s*(?:dólares?|dolares?|bs\.?|bolivianos?|pesos?|\$|usd)/i);
  if (conMoneda) return parseFloat(conMoneda[1]);

  // Buscar número solo: "de 8", "por 8"
  const numeroSolo = texto.match(/(?:de|por|a)\s+(\d+(?:\.\d{1,2})?)/i);
  if (numeroSolo) return parseFloat(numeroSolo[1]);

  // Buscar cualquier número como último recurso
  const cualquierNumero = texto.match(/(\d+(?:\.\d{1,2})?)/);
  if (cualquierNumero) return parseFloat(cualquierNumero[1]);

  return null;
};

// ------------------------------------------------------------
// FUNCIÓN AUXILIAR: extraerObjeto
// QUÉ HACE: Intenta identificar qué se compró o recibió
// DEVUELVE: string con el objeto o "sin especificar"
// ------------------------------------------------------------
const extraerObjeto = (texto) => {
  // Limpiar el texto de palabras clave y números
  let textoLimpio = texto.toLowerCase();

  // Remover palabras de acción
  const todasPalabras = [...PALABRAS_GASTO, ...PALABRAS_INGRESO];
  todasPalabras.forEach(palabra => {
    textoLimpio = textoLimpio.replace(new RegExp(palabra, 'gi'), '');
  });

  // Remover números y símbolos de moneda
  textoLimpio = textoLimpio.replace(/\$?\d+(?:\.\d{1,2})?\s*(?:dólares?|dolares?|bs\.?|bolivianos?|pesos?|usd)?/gi, '');

  // Remover palabras de tiempo
  Object.keys(PALABRAS_TIEMPO).forEach(palabra => {
    textoLimpio = textoLimpio.replace(new RegExp(palabra, 'gi'), '');
  });

  // Remover palabras conectoras
  textoLimpio = textoLimpio.replace(/\b(una?|unos?|unas?|el|la|los|las|de|por|en|con|para)\b/gi, '');

  // Limpiar espacios extra
  textoLimpio = textoLimpio.replace(/\s+/g, ' ').trim();

  return textoLimpio.length > 0 ? textoLimpio : 'sin especificar';
};

// ------------------------------------------------------------
// FUNCIÓN AUXILIAR: detectarTipo
// QUÉ HACE: Determina si el texto es un gasto o ingreso
// DEVUELVE: "gasto" o "ingreso"
// AQUÍ CAMBIAR: si querés modificar cómo se clasifica
// ------------------------------------------------------------
const detectarTipo = (texto) => {
  const textoMinusculas = texto.toLowerCase();

  // Verificar si contiene palabras de ingreso primero
  const esIngreso = PALABRAS_INGRESO.some(palabra =>
    textoMinusculas.includes(palabra)
  );
  if (esIngreso) return 'ingreso';

  // Por defecto es gasto (más común en el día a día)
  return 'gasto';
};

// ------------------------------------------------------------
// FUNCIÓN AUXILIAR: detectarFecha
// QUÉ HACE: Detecta referencias de tiempo en el texto
// DEVUELVE: fecha en formato YYYY-MM-DD
// ------------------------------------------------------------
const detectarFecha = (texto) => {
  const textoMinusculas = texto.toLowerCase().trim();

  for (const [palabra, dias] of Object.entries(PALABRAS_TIEMPO)) {
    if (textoMinusculas.includes(palabra)) {
      console.log('Palabra detectada:', palabra, 'Días atrás:', dias);
      return obtenerFecha(Math.abs(dias));
    }
  }

  return obtenerFecha(0);
};
// ------------------------------------------------------------
// FUNCIÓN: detectarCategoria
// QUÉ HACE: Detecta la categoría del objeto para mostrar
// el ícono correcto en la lista de registros
// AQUÍ AGREGAR: más palabras clave por categoría
// ------------------------------------------------------------
export const detectarCategoria = (texto, tipo) => {
  const t = texto.toLowerCase();

  // Si es ingreso, siempre mostrar billete
  if (tipo === 'ingreso') return 'ingreso';

  // Comida y restaurantes
  const comida = ['hamburguesa', 'pizza', 'café', 'cafe', 'almuerzo', 'cena',
    'desayuno', 'comida', 'burger', 'sushi', 'pollo', 'sandwich',
    'empanada', 'salteña', 'restaurant', 'restaurante', 'mcdonalds',
    'subway', 'dominos', 'snack', 'helado', 'postre', 'pan', 'dulce', 'Pastilla', 'chicle',];
  if (comida.some(p => t.includes(p))) return 'comida';

  // Transporte y viajes
  const transporte = ['uber', 'yango', 'indrive', 'taxi', 'bus', 'trufi',
    'micro', 'gasolina', 'nafta', 'combustible', 'pasaje',
    'viaje', 'transporte', 'minibus', 'moto'];
  if (transporte.some(p => t.includes(p))) return 'transporte';

  // Ropa y calzado
  const ropa = ['ropa', 'camisa', 'pantalon', 'vestido', 'zapatos',
    'zapatillas', 'tenis', 'chompa', 'chaqueta', 'polo',
    'short', 'falda', 'medias', 'calzado', 'jean'];
  if (ropa.some(p => t.includes(p))) return 'ropa';

  // Cosméticos y belleza
  const cosmeticos = ['maquillaje', 'crema', 'shampoo', 'perfume',
    'labial', 'rimel', 'base', 'delineador', 'esmalte',
    'cosmetico', 'belleza', 'peluqueria', 'barberia'];
  if (cosmeticos.some(p => t.includes(p))) return 'cosmeticos';

  // Tecnología
  const tecnologia = ['celular', 'telefono', 'laptop', 'computadora',
    'auriculares', 'cable', 'cargador', 'tablet', 'teclado',
    'mouse', 'internet', 'netflix', 'spotify', 'app'];
  if (tecnologia.some(p => t.includes(p))) return 'tecnologia';

  // Supermercado y mercado
  const mercado = ['mercado', 'supermercado', 'verdura', 'fruta',
    'leche', 'huevo', 'arroz', 'aceite', 'azucar', 'sal',
    'compras', 'fideos', 'carne', 'pollo'];
  if (mercado.some(p => t.includes(p))) return 'mercado';

  // Por defecto: otros
  return 'otros';
};



// ------------------------------------------------------------
// FUNCIÓN PRINCIPAL: interpretarTexto
// QUÉ HACE: Convierte una frase en un objeto estructurado
// PARÁMETROS:
//   - texto: la frase que escribió o dictó el usuario
// DEVUELVE: objeto con { objeto, precio, tipo, fecha, confianza }
//
// EJEMPLO:
//   entrada: "compré una hamburguesa de 8 dólares hoy"
//   salida: {
//     objeto: "hamburguesa",
//     precio: 8,
//     tipo: "gasto",
//     fecha: "2026-03-22",
//     confianza: "alta"
//   }
// ------------------------------------------------------------
export const interpretarTexto = (texto) => {
  if (!texto || texto.trim().length === 0) {
    return null;
  }

  const precio = extraerPrecio(texto);
  const tipo = detectarTipo(texto);
  const fecha = detectarFecha(texto);
  const objeto = extraerObjeto(texto);

  // Determinar nivel de confianza del resultado
  // AQUÍ CAMBIAR: los criterios de confianza si querés
  let confianza = 'alta';
  if (!precio) confianza = 'baja';
  else if (objeto === 'sin especificar') confianza = 'media';

  return {
    objeto,
    precio: precio || 0,
    tipo,
    fecha,
    textoOriginal: texto,
    confianza,
  };
};

// ------------------------------------------------------------
// FUNCIÓN: interpretarTextoConIA
// QUÉ HACE: Usa IA externa si está disponible, sino offline
// FUTURO: aquí se conectará a OpenAI, Gemini, etc.
// ------------------------------------------------------------
export const interpretarTextoConIA = async (texto) => {

  console.log('tieneIA:', entorno.tieneIA);
  console.log('tiene key:', !!entorno.iaApiKey);

  if (!entorno.tieneIA || !entorno.iaApiKey) {
    return interpretarTexto(texto);
  }

  try {
    const prompt = `
Eres un asistente que interpreta frases de gastos e ingresos en español boliviano.
Analiza esta frase y devuelve SOLO un JSON sin explicación, con este formato exacto:
{
  "objeto": "nombre del producto o servicio",
  "precio": número,
  "tipo": "gasto" o "ingreso",
  "fecha": "hoy" o "ayer" o "anteayer"
}

Frase: "${texto}"
    `;

    const respuesta = await fetch(
  'https://openrouter.ai/api/v1/chat/completions',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${entorno.iaApiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
    })
  }
);

const data = await respuesta.json();
console.log('Respuesta OpenRouter:', JSON.stringify(data));

const textoRespuesta = data.choices[0].message.content;
const match = textoRespuesta.match(/\{[\s\S]*\}/);
if (!match) throw new Error('Sin JSON válido');
const resultado = JSON.parse(match[0]);


    const mapaFechas = { hoy: 0, ayer: 1, anteayer: 2 };
    const diasAtras = mapaFechas[resultado.fecha] ?? 0;

    return {
      objeto: resultado.objeto || 'sin especificar',
      precio: resultado.precio || 0,
      tipo: resultado.tipo || 'gasto',
      fecha: obtenerFecha(diasAtras),
      textoOriginal: texto,
      confianza: 'alta',
    };

  } catch (error) {
    console.error('Error con Gemini, usando offline:', error);
    return interpretarTexto(texto);
  }
};



