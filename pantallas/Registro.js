// ============================================================
// ARCHIVO: pantallas/Registro.js
// QUÉ HACE: Pantalla para registrar gastos e ingresos
// El usuario escribe o dicta una frase y la app la interpreta
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { interpretarTextoConIA } from '../logica/interpretador';
import { guardarRegistro } from '../base_datos/baseDatos';
import colores from '../estilos/colores';

const Registro = () => {
  // Estado del texto que escribe el usuario
  const [texto, setTexto] = useState('');
  // Estado del resultado interpretado (preview)
  const [resultado, setResultado] = useState(null);
  // Estado de carga mientras interpreta
  const [cargando, setCargando] = useState(false);
  // Estado de confirmación guardado
  const [guardado, setGuardado] = useState(false);

  // ----------------------------------------------------------
  // FUNCIÓN: alInterpretarTexto
  // QUÉ HACE: Toma el texto y lo interpreta con la IA offline
  // Muestra un preview antes de confirmar el guardado
  // ----------------------------------------------------------
 const alInterpretarTexto = () => {
  if (!texto.trim()) {
    Alert.alert('Texto vacío', 'Escribí algo para registrar');
    return;
  }
  setCargando(true);
  setGuardado(false);
 interpretarTextoConIA(texto).then((interpretacion) => {
  setResultado(interpretacion);
  setCargando(false);
});
};

  // ----------------------------------------------------------
  // FUNCIÓN: alConfirmarRegistro
  // QUÉ HACE: Guarda el registro interpretado en SQLite
  // Solo se llama cuando el usuario confirma el preview
  // ----------------------------------------------------------
const alConfirmarRegistro = () => {
  if (!resultado) return;

  // Validar que tenga precio real
  if (!resultado.precio || resultado.precio <= 0) {
    Alert.alert(
      'Precio no detectado',
      '¿Cuánto fue el monto? Editá el texto e incluí el precio.'
    );
    return;
  }

  try {
    guardarRegistro(
      resultado.objeto,
      resultado.precio,
      resultado.tipo,
      resultado.fecha,
      resultado.textoOriginal
    );

    setTexto('');
    setResultado(null);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  } catch (e) {
    Alert.alert('Error', 'No se pudo guardar el registro. Intentá de nuevo.');
  }
};


  // ----------------------------------------------------------
  // FUNCIÓN: alCancelarRegistro
  // QUÉ HACE: Descarta el resultado y vuelve al input
  // ----------------------------------------------------------
  const alCancelarRegistro = () => {
    setResultado(null);
  };

  // ----------------------------------------------------------
  // FUNCIÓN: alEditarResultado
  // QUÉ HACE: Permite cambiar tipo manualmente (gasto/ingreso)
  // ----------------------------------------------------------
  const cambiarTipo = () => {
    setResultado(prev => ({
      ...prev,
      tipo: prev.tipo === 'gasto' ? 'ingreso' : 'gasto',
    }));
  };

  return (
    <SafeAreaView style={estilos.contenedor}>
      <ScrollView
        contentContainerStyle={estilos.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Título de la pantalla */}
        <Text style={estilos.titulo}>Nuevo Registro</Text>
        <Text style={estilos.subtitulo}>
          Describí qué compraste o ganaste
        </Text>

        {/* Ejemplos de uso */}
        <View style={estilos.tarjetaEjemplos}>
          <Text style={estilos.textoEjemplo}>
            "compré una hamburguesa de 8 dólares"
          </Text>
          <Text style={estilos.textoEjemplo}>
            "gasté 50 bs en el mercado ayer"
          </Text>
          <Text style={estilos.textoEjemplo}>
            "recibí 200 dólares de sueldo hoy"
          </Text>
        </View>

        {/* Input de texto */}
        <View style={estilos.contenedorInput}>
          <TextInput
            style={estilos.input}
            placeholder="Escribí aquí tu registro..."
            // AQUÍ CAMBIAR: color del placeholder
            placeholderTextColor={colores.textoGris}
            value={texto}
            onChangeText={setTexto}
            multiline
            numberOfLines={3}
            // AQUÍ CAMBIAR: color del texto escrito
            color={colores.textoBlanco}
            autoCorrect={false}
          />
        </View>

        {/* Botón interpretar */}
        {!resultado && (
          <TouchableOpacity
            style={estilos.botonInterpretar}
            onPress={alInterpretarTexto}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color={colores.textoBlanco} />
            ) : (
              <>
                <Ionicons name="flash" size={20} color={colores.textoBlanco} />
                <Text style={estilos.textoBoton}>Interpretar</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Preview del resultado interpretado */}
        {resultado && (
          <View style={estilos.tarjetaResultado}>
            <Text style={estilos.tituloResultado}>Resultado interpretado</Text>

            {/* Fila: objeto */}
            <View style={estilos.filaResultado}>
              <Text style={estilos.etiqueta}>Objeto</Text>
              <Text style={estilos.valor}>{resultado.objeto}</Text>
            </View>

            {/* Fila: precio */}
            <View style={estilos.filaResultado}>
              <Text style={estilos.etiqueta}>Precio</Text>
              <Text style={estilos.valor}>
               {resultado.precio > 0 ? `Bs ${resultado.precio}` : 'No detectado'}
              </Text>
            </View>

            {/* Fila: tipo con botón para cambiar */}
            <View style={estilos.filaResultado}>
              <Text style={estilos.etiqueta}>Tipo</Text>
              <TouchableOpacity onPress={cambiarTipo} style={[
                estilos.etiquetaTipo,
                resultado.tipo === 'gasto' ? estilos.tipoGasto : estilos.tipoIngreso
              ]}>
                <Text style={estilos.textoTipo}>
                  {resultado.tipo === 'gasto' ? 'Gasto' : 'Ingreso'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Fila: fecha */}
            <View style={estilos.filaResultado}>
              <Text style={estilos.etiqueta}>Fecha</Text>
              <Text style={estilos.valor}>{resultado.fecha}</Text>
            </View>

            {/* Fila: confianza */}
            <View style={estilos.filaResultado}>
              <Text style={estilos.etiqueta}>Confianza</Text>
              <Text style={[
                estilos.valor,
                resultado.confianza === 'alta' && { color: colores.positivo },
                resultado.confianza === 'media' && { color: '#FFD60A' },
                resultado.confianza === 'baja' && { color: colores.negativo },
              ]}>
                {resultado.confianza}
              </Text>
            </View>

            {/* Botones confirmar / cancelar */}
            <View style={estilos.botonesAccion}>
              <TouchableOpacity
                style={estilos.botonCancelar}
                onPress={alCancelarRegistro}
              >
                <Text style={estilos.textoBotonCancelar}>Editar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={estilos.botonConfirmar}
                onPress={alConfirmarRegistro}
              >
                <Ionicons name="checkmark" size={20} color={colores.textoBlanco} />
                <Text style={estilos.textoBoton}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Mensaje de éxito */}
        {guardado && (
          <View style={estilos.mensajeExito}>
            <Ionicons name="checkmark-circle" size={20} color={colores.positivo} />
            <Text style={estilos.textoExito}>Registro guardado correctamente</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

// ------------------------------------------------------------
// ESTILOS
// AQUÍ CAMBIAR: todo el diseño visual del registro
// ------------------------------------------------------------
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colores.fondoPrincipal,
  },
  scroll: {
    padding: 20,
  },
 titulo: {
  color: colores.textoBlanco,
  fontSize: 28,
  fontFamily: 'Inter_700Bold',
  marginBottom: 6,
},
 subtitulo: {
  color: colores.textoGris,
  fontSize: 15,
  fontFamily: 'Inter_400Regular',
  marginBottom: 20,
},

  // Tarjeta de ejemplos
  tarjetaEjemplos: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    gap: 6,
  },
  textoEjemplo: {
    color: colores.textoGris,
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Input
  contenedorInput: {
    backgroundColor: colores.fondoInput,
    borderRadius: 14,
    marginBottom: 16,
  },
  input: {
    padding: 16,
    fontSize: 16,
    minHeight: 90,
    textAlignVertical: 'top',
  },

  // Botón interpretar
  botonInterpretar: {
    backgroundColor: colores.acento,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
 textoBoton: {
  color: colores.textoBlanco,
  fontSize: 16,
  fontFamily: 'Inter_600SemiBold',
},

  // Tarjeta resultado
  tarjetaResultado: {
    backgroundColor: colores.fondoTarjeta,
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  tituloResultado: {
    color: colores.textoGris,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  filaResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etiqueta: {
    color: colores.textoGris,
    fontSize: 15,
  },
  valor: {
    color: colores.textoBlanco,
    fontSize: 15,
    fontWeight: '500',
  },
  etiquetaTipo: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tipoGasto: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  tipoIngreso: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  textoTipo: {
    color: colores.textoBlanco,
    fontSize: 14,
    fontWeight: '500',
  },

  // Botones de acción
  botonesAccion: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  botonCancelar: {
    flex: 1,
    backgroundColor: colores.fondoInput,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  textoBotonCancelar: {
    color: colores.textoGris,
    fontSize: 15,
    fontWeight: '500',
  },
  botonConfirmar: {
    flex: 2,
    backgroundColor: colores.acento,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  // Mensaje de éxito
  mensajeExito: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    borderRadius: 12,
  },
  textoExito: {
    color: colores.positivo,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default Registro;
