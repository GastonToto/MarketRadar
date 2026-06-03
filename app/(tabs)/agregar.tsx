import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { actualizarInversiones } from '../global';
import { Picker } from '@react-native-picker/picker';

export default function ExploreScreen() {
  const [activo, setActivo] = useState('');
  const [monto, setMonto] = useState(''); // Representa la CANTIDAD de monedas (ej: 0.5)
  const [precio, setPrecio] = useState(''); // Representa el PRECIO UNITARIO (ej: 50000)
  const router = useRouter();
  const [categoria, setCategoria] = useState('acciones'); // Estado para la categoría

  const guardarInversion = () => {
    if (!activo || !monto || !precio) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    if (isNaN(parseFloat(monto)) || isNaN(parseFloat(precio))) {
      Alert.alert("Error", "Cantidad y Precio deben ser valores numéricos");
      return;
    }

    const valorTotal = parseFloat(monto) * parseFloat(precio);

    actualizarInversiones(activo, monto, valorTotal, categoria);

    Alert.alert("¡Éxito!", `Cartera actualizada: ${activo.toUpperCase()}`);

    setActivo('');
    setMonto('');
    setPrecio('');
    setCategoria('acciones');

    router.replace('/portfolio');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Inversión</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Activo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: BTC o AAPL"
          placeholderTextColor="#666"
          value={activo}
          onChangeText={setActivo}
        />

        <Text style={styles.label}>Categoría:</Text>
        <View style={styles.categorySelector}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              categoria === 'acciones' && styles.categoryButtonActive,
            ]}
            onPress={() => setCategoria('acciones')}
          >
            <Text
              style={[
                styles.categoryButtonText,
                categoria === 'acciones' && styles.categoryButtonTextActive,
              ]}
            >
              Acciones
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryButton,
              categoria === 'criptos' && styles.categoryButtonActive,
            ]}
            onPress={() => setCategoria('criptos')}
          >
            <Text
              style={[
                styles.categoryButtonText,
                categoria === 'criptos' && styles.categoryButtonTextActive,
              ]}
            >
              Criptos
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Cantidad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 0.5"
          keyboardType="numeric"
          placeholderTextColor="#666"
          value={monto}
          onChangeText={setMonto}
        />

        <Text style={styles.label}>Precio de Compra (USD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 50000"
          keyboardType="numeric"
          placeholderTextColor="#666"
          value={precio}
          onChangeText={setPrecio}
        />

        <TouchableOpacity style={styles.button} onPress={guardarInversion}>
          <Text style={styles.buttonText}>Agregar a mi Portfolio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090f1d',
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 15,
  },
  label: {
    color: '#9ca3af',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00d094',
    padding: 18,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#090f1d',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  
  categoryButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    paddingVertical: 14,
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
  },
  
  categoryButtonTextActive: {
    color: '#090f1d',
    fontWeight: 'bold',
  },
});