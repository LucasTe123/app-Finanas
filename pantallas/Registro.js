import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, ScrollView,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { interpretarTextoConIA } from '../logica/interpretador';
import { guardarRegistro } from '../base_datos/baseDatos';
import colores from '../estilos/colores';

const Registro = () => {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  // ── LÓGICA ORIGINAL — sin tocar ─────────────────────────
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

  const alConfirmarRegistro = () => {
    if (!resultado) return;
    if (!resultado.precio || resultado.precio <= 0) {
      Alert.alert('Precio no detectado', '¿Cuánto fue el monto? Editá el texto e incluí el precio.');
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

  const alCancelarRegistro = () => setResultado(null);

  const cambiarTipo = () => {
    setResultado(prev => ({
      ...prev,
      tipo: prev.tipo === 'gasto' ? 'ingreso' : 'gasto',
    }));
  };
  // ─────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={estilos.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <Text style={estilos.titulo}>Nuevo Registro</Text>
        <Text style={estilos.subtitulo}>Describí qué compraste o ganaste</Text>

        {/* ✅ Tarjeta ejemplos — Glass */}
        <View style={estilos.glassCard}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={estilos.lineaBrillo} />
          <View style={{ padding: 18, gap: 7 }}>
            <Text style={estilos.textoEjemplo}>"compré una hamburguesa de 8 dólares"</Text>
            <Text style={estilos.textoEjemplo}>"gasté 50 bs en el mercado ayer"</Text>
            <Text style={estilos.textoEjemplo}>"recibí 200 dólares de sueldo hoy"</Text>
          </View>
        </View>

        {/* ✅ Input — Glass con borde luminoso */}
        <View style={[estilos.glassCard, { marginBottom: 20 }]}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={estilos.lineaBrillo} />
          <TextInput
            style={estilos.input}
            placeholder="Escribí aquí tu registro..."
            placeholderTextColor="rgba(255,255,255,0.28)"
            value={texto}
            onChangeText={setTexto}
            multiline
            numberOfLines={3}
            color={colores.textoBlanco}
            autoCorrect={false}
            selectionColor="#0A84FF"
          />
        </View>

        {/* ✅ Botón Interpretar — Liquid Glass con Outer Glow */}
        {!resultado && (
          <View style={estilos.botonWrapper}>
            <View style={estilos.outerGlow} />
            <TouchableOpacity onPress={alInterpretarTexto} disabled={cargando} activeOpacity={0.85}>
              <LinearGradient
                colors={['#2E9BFF', '#0A84FF', '#0060D0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={estilos.botonInterpretar}
              >
                <View style={estilos.botonHighlight} />
                {cargando ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={estilos.textoBoton}>  Interpretando...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="flash" size={20} color="#fff" />
                    <Text style={estilos.textoBoton}>Interpretar</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Resultado interpretado — Glass card con TUS campos */}
        {resultado && (
          <View style={[estilos.glassCard, { marginTop: 16 }]}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={['rgba(255,255,255,0.09)', 'rgba(255,255,255,0.03)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={estilos.lineaBrillo} />
            <View style={{ padding: 20, gap: 14 }}>

              <Text style={estilos.tituloResultado}>ESTO ES LO QUE ENTENDÍ:</Text>

              {/* Objeto */}
              <View style={estilos.filaResultado}>
                <Text style={estilos.etiqueta}>Concepto</Text>
                <Text style={estilos.valor}>{resultado.objeto}</Text>
              </View>

              {/* Precio */}
              <View style={estilos.filaResultado}>
                <Text style={estilos.etiqueta}>Monto</Text>
                <Text style={[estilos.valor, { color: resultado.tipo === 'gasto' ? '#FF453A' : '#30D158' }]}>
                  {resultado.precio > 0 ? `Bs ${resultado.precio}` : 'No detectado'}
                </Text>
              </View>

              {/* Tipo — tocable para cambiar */}
              <View style={estilos.filaResultado}>
                <Text style={estilos.etiqueta}>Tipo</Text>
                <TouchableOpacity
                  onPress={cambiarTipo}
                  style={[
                    estilos.chipTipo,
                    resultado.tipo === 'gasto' ? estilos.chipGasto : estilos.chipIngreso
                  ]}
                >
                  <Text style={[
                    estilos.textoChip,
                    { color: resultado.tipo === 'gasto' ? '#FF453A' : '#30D158' }
                  ]}>
                    {resultado.tipo === 'gasto' ? 'Gasto  ↕' : 'Ingreso  ↕'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Fecha */}
              <View style={estilos.filaResultado}>
                <Text style={estilos.etiqueta}>Fecha</Text>
                <Text style={estilos.valor}>{resultado.fecha}</Text>
              </View>

              {/* Confianza */}
              <View style={estilos.filaResultado}>
                <Text style={estilos.etiqueta}>Confianza</Text>
                <Text style={[
                  estilos.valor,
                  resultado.confianza === 'alta' && { color: '#30D158' },
                  resultado.confianza === 'media' && { color: '#FFD60A' },
                  resultado.confianza === 'baja' && { color: '#FF453A' },
                ]}>
                  {resultado.confianza}
                </Text>
              </View>

              {/* Botones */}
              <View style={estilos.botonesAccion}>
                <TouchableOpacity style={estilos.botonEditar} onPress={alCancelarRegistro}>
                  <Text style={estilos.textoBotonEditar}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={alConfirmarRegistro} activeOpacity={0.85} style={{ flex: 2 }}>
                  <LinearGradient
                    colors={['#34C759', '#28A745']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={estilos.botonConfirmar}
                  >
                    <Ionicons name="checkmark" size={18} color="#fff" />
                    <Text style={estilos.textoBoton}>Confirmar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        )}

        {/* Mensaje guardado */}
        {guardado && (
          <View style={estilos.mensajeExito}>
            <Ionicons name="checkmark-circle" size={20} color="#30D158" />
            <Text style={estilos.textoExito}>Registro guardado correctamente</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitulo: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 24,
  },

  // ── BASE GLASS CARD ──────────────────────────────
  glassCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 0.8,
    borderColor: 'rgba(255,255,255,0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  // Línea de luz superior (Specular Highlight)
  lineaBrillo: {
    position: 'absolute',
    top: 0,
    left: 14,
    right: 14,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
    zIndex: 10,
  },

  textoEjemplo: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },

  input: {
    padding: 18,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // ── BOTÓN INTERPRETAR ────────────────────────────
  botonWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  outerGlow: {
    position: 'absolute',
    top: 6,
    left: 24,
    right: 24,
    height: '100%',
    borderRadius: 18,
    backgroundColor: '#0A84FF',
    opacity: 0.30,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 22,
  },
  botonInterpretar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    gap: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.22)',
    overflow: 'hidden',
  },
  botonHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.40)',
  },
  textoBoton: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },

  // ── RESULTADO ────────────────────────────────────
  tituloResultado: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
  },
  filaResultado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etiqueta: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  valor: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  chipTipo: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
  },
  chipGasto: {
    backgroundColor: 'rgba(255,69,58,0.18)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,69,58,0.4)',
  },
  chipIngreso: {
    backgroundColor: 'rgba(48,209,88,0.18)',
    borderWidth: 0.5,
    borderColor: 'rgba(48,209,88,0.4)',
  },
  textoChip: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  botonesAccion: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  botonEditar: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  textoBotonEditar: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  botonConfirmar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  mensajeExito: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(48,209,88,0.1)',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(48,209,88,0.3)',
  },
  textoExito: {
    color: '#30D158',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});

export default Registro;
