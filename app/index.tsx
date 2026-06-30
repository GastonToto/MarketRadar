import { Stack, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// Importamos AsyncStorage para recordar el estado de la sesión
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const router = useRouter();
  
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // NUEVO: Al recargar la página, comprueba si el usuario ya inició sesión antes
  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const sesionActiva = await AsyncStorage.getItem("@sesion_usuario");
        if (sesionActiva === "Inversor") {
          // Si ya estaba logueado, lo mandamos directo al portfolio sin pedir credenciales
          router.replace("/(tabs)/portfolio");
        }
      } catch (e) {
        console.error("Error al verificar la sesión", e);
      }
    };
    verificarSesion();
  }, []);

  const handleLogin = async () => {
    setError("");

    if (usuario.trim() === "Inversor" && password === "1234") {
      try {
        // NUEVO: Guardamos en memoria que la sesión está activa antes de redirigir
        await AsyncStorage.setItem("@sesion_usuario", "Inversor");
        router.replace("/(tabs)/portfolio");
      } catch (e) {
        console.error("Error al guardar la sesión", e);
      }
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>MarketRadar v1.0</Text>

        <TextInput 
          placeholder="Usuario: Inversor" 
          placeholderTextColor="#7d8fb3" 
          style={styles.input}
          value={usuario}
          onChangeText={(text) => {
            setUsuario(text);
            if (error) setError("");
          }}
          autoCapitalize="none"
        />
        <TextInput 
          placeholder="Contraseña: 1234" 
          placeholderTextColor="#7d8fb3" 
          secureTextEntry={true} 
          style={styles.input}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (error) setError("");
          }}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity 
          style={[styles.button, error ? { marginTop: 10 } : { marginTop: 20 }]} 
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1324",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#121c33",
    padding: 25,
    borderRadius: 14,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#7d8fb3",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1b2a4a",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: "#fff",
  },
  errorText: {
    color: "#ff5252",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#00c389",
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});