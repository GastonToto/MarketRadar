import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { actualizarPreciosEnTiempoReal, misInversiones } from '../global'; // Asegúrate de importar la función

export default function HomeScreen() {
  const [datosActuales, setDatosActuales] = useState([...misInversiones]);
  const [cargandoPrecios, setCargandoPrecios] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // 1. Cargamos instantáneamente lo que haya en memoria para que no se vea vacío
      setDatosActuales([...misInversiones]);
      
      // 2. Traemos los precios frescos de la API en segundo plano
      const obtenerPreciosVivos = async () => {
        setCargandoPrecios(true);
        const datosNuevos = await actualizarPreciosEnTiempoReal();
        setDatosActuales([...datosNuevos]);
        setCargandoPrecios(false);
      };

      obtenerPreciosVivos();
    }, [])
  );

  const totalBalance = datosActuales.reduce((sum, inv) => sum + inv.valor, 0);

  return (
    <ScrollView style={styles.container}> 
      <View style={styles.header}>
        <Text style={styles.subtitle}>BALANCE TOTAL</Text>
        <Text style={styles.balance}>${totalBalance.toFixed(2)}</Text>
        
        {/* Indicador visual por si la API tarda un cachito en responder */}
        {cargandoPrecios ? (
          <ActivityIndicator size="small" color="#10B981" style={{ marginBottom: 6 }} />
        ) : (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Precios en vivo</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus Inversiones</Text>
        
        {datosActuales.map((inv) => {
          const gananciaUsd = inv.valor - inv.costo;
          const rendimientoPct = inv.costo > 0 ? (gananciaUsd / inv.costo) * 100 : 0;
          const esPositivo = gananciaUsd >= 0;

          // CÁLCULO DEL PRECIO UNITARIO ACTUAL
          const precioUnitario = inv.cantidad > 0 ? inv.valor / inv.cantidad : 0;

          return (
            <View key={inv.id} style={styles.card}>
              {/* Columna Izquierda */}
              <View style={{ flex: 1.5 }}>
                <Text style={styles.cardName}>{inv.nombre}</Text>
                <Text style={styles.cardQty}>{inv.cantidad.toFixed(4)} {inv.nombre}</Text>
                
                {/* NUEVO: Precio unitario actual de la crypto */}
                <Text style={styles.cardUnitPrice}>
                  Precio u.: ${precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Columna Derecha */}
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.cardValue}>${inv.valor.toFixed(2)}</Text>
                <Text style={[styles.rendimiento, { color: esPositivo ? '#10B981' : '#EF4444' }]}>
                  {esPositivo ? '+' : ''}{gananciaUsd.toFixed(2)} ({rendimientoPct.toFixed(2)}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  subtitle: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  balance: { color: '#F8FAFC', fontSize: 40, fontWeight: 'bold', marginVertical: 8 },
  badge: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
  badgeText: { color: '#10B981', fontWeight: '700', fontSize: 12 },
  section: { paddingHorizontal: 20 },
  sectionTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  cardName: { color: '#CBD5E1', fontSize: 16, fontWeight: 'bold' },
  cardValue: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  rendimiento: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  cardQty: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  card: { 
    backgroundColor: '#1E293B', 
    padding: 16, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155'
  },
  cardUnitPrice: {
    color: '#64748B', // Un gris más oscuro (slate-500) para darle jerarquía
    fontSize: 11,
    marginTop: 4,
    fontStyle: 'italic',
  },
});