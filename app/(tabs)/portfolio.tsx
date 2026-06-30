import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { actualizarPreciosEnTiempoReal, misInversiones } from '../global'; // Asegúrate de importar la función

export default function HomeScreen() {
  const [datosActuales, setDatosActuales] = useState([...misInversiones]);
  const [cargandoPrecios, setCargandoPrecios] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');
  useFocusEffect(
    useCallback(() => {
      setDatosActuales([...misInversiones]);

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
  const totalCosto = datosActuales.reduce((sum, inv) => sum + inv.costo, 0);
  const totalGananciaPct = totalCosto > 0 ? ((totalBalance - totalCosto) / totalCosto) * 100 : 0;

  // Filtrar inversiones según la categoría seleccionada
  const inversionesFiltradas = categoriaSeleccionada === 'todos'
    ? datosActuales
    : datosActuales.filter((inv) => inv.categoria === categoriaSeleccionada);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>BALANCE TOTAL</Text>
        <Text style={styles.balance}>${totalBalance.toFixed(2)}</Text>

        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: totalGananciaPct >= 0 ? '#10B981' : '#EF4444' }]}>
            {totalGananciaPct >= 0 ? '+' : ''}{totalGananciaPct.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* Selector de categoría */}
      <Text style={styles.filterLabel}>
        Filtrar por categoría:
      </Text>

      <View style={styles.categorySelector}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            categoriaSeleccionada === 'todos' &&
            styles.categoryButtonActive,
          ]}
          onPress={() => setCategoriaSeleccionada('todos')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              categoriaSeleccionada === 'todos' &&
              styles.categoryButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            categoriaSeleccionada === 'acciones' &&
            styles.categoryButtonActive,
          ]}
          onPress={() => setCategoriaSeleccionada('acciones')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              categoriaSeleccionada === 'acciones' &&
              styles.categoryButtonTextActive,
            ]}
          >
            Acciones
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.categoryButton,
            categoriaSeleccionada === 'criptos' &&
            styles.categoryButtonActive,
          ]}
          onPress={() => setCategoriaSeleccionada('criptos')}
        >
          <Text
            style={[
              styles.categoryButtonText,
              categoriaSeleccionada === 'criptos' &&
              styles.categoryButtonTextActive,
            ]}
          >
            Criptos
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribución por activo</Text>

        {inversionesFiltradas.length === 0 ? (
          <Text style={styles.emptyText}>Agrega inversiones para ver el gráfico.</Text>
        ) : (
          <View style={styles.chartContainer}>
            {inversionesFiltradas.map((inv) => {
              const porcentaje = totalBalance > 0 ? (inv.valor / totalBalance) * 100 : 0;
              const chartColor = inv.categoria === 'criptos' ? '#7C3AED' : '#22C55E';

              return (
                <View key={`chart-${inv.id}`} style={styles.chartRow}>
                  <View style={styles.chartLabelRow}>
                    <Text style={styles.chartLabel}>{inv.nombre}</Text>
                    <Text style={styles.chartLabelValue}>${inv.valor.toFixed(2)}</Text>
                  </View>
                  <View style={styles.chartBarBackground}>
                    <View
                      style={[
                        styles.chartBar,
                        { width: `${Math.max(porcentaje, 3)}%`, backgroundColor: chartColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartPercentage}>{porcentaje.toFixed(1)}%</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tus Inversiones</Text>

        {inversionesFiltradas.map((inv) => {
          const gananciaUsd = inv.valor - inv.costo;
          const rendimientoPct = inv.costo > 0 ? (gananciaUsd / inv.costo) * 100 : 0;
          const esPositivo = gananciaUsd >= 0;
          const precioUnitario = inv.cantidad > 0 ? inv.valor / inv.cantidad : 0;

          return (
            <View key={inv.id} style={styles.card}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.cardName}>{inv.nombre}</Text>
                <Text style={styles.cardQty}>{inv.cantidad.toFixed(4)} {inv.nombre}</Text>
                <Text style={styles.cardValue}>
                  ${precioUnitario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
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
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },

  categoryButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },

  categoryButtonActive: {
    backgroundColor: '#00d094',
    borderColor: '#00d094',
  },

  categoryButtonText: {
    color: '#9ca3af',
    fontWeight: '600',
    fontSize: 13,
  },

  categoryButtonTextActive: {
    color: '#090f1d',
    fontWeight: 'bold',
  },

  chartContainer: {
    gap: 12,
    marginBottom: 24,
  },

  chartRow: {
    gap: 8,
  },

  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  chartLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },

  chartLabelValue: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },

  chartBarBackground: {
    backgroundColor: '#111827',
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
  },

  chartBar: {
    height: '100%',
    borderRadius: 999,
  },

  chartPercentage: {
    color: '#939BA7',
    fontSize: 12,
    marginTop: 6,
  },

  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 14,
  },

  filterLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 20,
  },  
});