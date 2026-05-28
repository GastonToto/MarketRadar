// global.js
export var misInversiones = [
  { id: '1', nombre: 'BTC', cantidad: 0.015, valor: 850.00, costo: 800.00 },
  { id: '2', nombre: 'ETH', cantidad: 0.5, valor: 650.50, costo: 700.00 }
];

/**
 * Agrega o acumula una inversión de forma manual
 */
export const actualizarInversiones = (nombreIngresado, cantidadIngresada, valorTotal) => {
  const nombreMayuscula = nombreIngresado.toUpperCase().trim();
  const nuevaCantidad = parseFloat(cantidadIngresada);
  const nuevoCosto = parseFloat(valorTotal);

  const indiceExistente = misInversiones.findIndex(
    (inv) => inv.nombre.toUpperCase() === nombreMayuscula
  );

  if (indiceExistente !== -1) {
    misInversiones[indiceExistente].cantidad += nuevaCantidad;
    misInversiones[indiceExistente].costo += nuevoCosto;
    misInversiones[indiceExistente].valor = misInversiones[indiceExistente].costo;
  } else {
    misInversiones.push({
      id: Math.random().toString(),
      nombre: nombreMayuscula,
      cantidad: nuevaCantidad,
      costo: nuevoCosto,
      valor: nuevoCosto, // Valor inicial = Costo inicial
    });
  }
};

/**
 * Busca los IDs de CoinGecko dinámicamente y actualiza los precios de CUALQUIER ticker
 */
export const actualizarPreciosEnTiempoReal = async () => {
  try {
    if (!misInversiones || misInversiones.length === 0) return misInversiones;

    // 1. Conseguimos el ID correcto de CoinGecko para cada ticker en paralelo usando /search
    const promesasIds = misInversiones.map(async (inversion) => {
      const ticker = inversion.nombre.toUpperCase().trim();
      try {
        const respuestaSearch = await fetch(`https://api.coingecko.com/api/v3/search?query=${ticker}`);
        const datosSearch = await respuestaSearch.json();
        
        // Buscamos la coincidencia exacta del símbolo/ticker
        const monedaEncontrada = datosSearch.coins?.find(
          coin => coin.symbol.toUpperCase() === ticker
        );

        return {
          ticker: ticker,
          idCoingecko: monedaEncontrada ? monedaEncontrada.id : null
        };
      } catch (err) {
        console.error(`Error buscando ID en CoinGecko para ${ticker}:`, err);
        return { ticker: ticker, idCoingecko: null };
      }
    });

    // Esperamos a que se resuelvan todas las búsquedas de IDs
    const mapeoDinamico = await Promise.all(promesasIds);

    // 2. Filtramos los IDs válidos y los unimos con comas para pedir los precios en bloque
    const idsParaApi = mapeoDinamico
      .map(item => item.idCoingecko)
      .filter(id => id)
      .join(',');

    if (!idsParaApi) return misInversiones;

    // 3. Consultamos los precios reales en USD
    const urlPrecios = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParaApi}&vs_currencies=usd`;
    const respuestaPrecios = await fetch(urlPrecios);
    const datosPrecios = await respuestaPrecios.json();

    // 4. Mapeamos y actualizamos el array global 'misInversiones' mutando el estado de forma segura
    misInversiones = misInversiones.map(inversion => {
      const ticker = inversion.nombre.toUpperCase().trim();
      
      // Buscamos qué ID le asignó el paso 1 a este ticker
      const coincidencia = mapeoDinamico.find(item => item.ticker === ticker);
      const idCoingecko = coincidencia ? coincidencia.idCoingecko : null;

      if (idCoingecko && datosPrecios[idCoingecko] && datosPrecios[idCoingecko].usd !== undefined) {
        const precioEnVivo = datosPrecios[idCoingecko].usd;
        return {
          ...inversion,
          valor: inversion.cantidad * precioEnVivo // Cantidad propia * precio actual de mercado
        };
      }
      
      // Si por alguna razón falla el fetch de esa moneda, dejamos el valor previo para evitar el NaN
      return inversion;
    });

    return misInversiones;
  } catch (error) {
    console.error("Error general en la actualización automatizada de precios:", error);
    return misInversiones;
  }
};