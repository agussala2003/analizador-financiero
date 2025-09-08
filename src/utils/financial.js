// src/utils/financial.js

// Pega aquí tu objeto indicatorConfig completo

export const indicatorConfig = {
  // ——— Valoración
  PER: {
    label: 'PER',
    apiFields: ['pe', 'peRatioTTM', 'priceEarningsRatioTTM'],
    compute: (raw) => {
      const ey = raw.earningsYieldTTM ?? raw.earningsYield ?? null;
      const n = (ey === null || ey === undefined || ey === '' || ey === 'None') ? null : Number(ey);
      return (n && Number.isFinite(n) && n !== 0) ? (1 / n) : null;
    },
    lowerIsBetter: true, green: 15, yellow: 25,
    explanation: 'Mide cuántos años de beneficios se necesitarían para recuperar el precio de la acción. Un número bajo sugiere que puede estar barata. Más Info: Un PER "bueno" depende del sector. Una empresa tecnológica en crecimiento puede tener un PER de 40 y ser normal, mientras que un banco con un PER de 15 podría considerarse caro. Es clave compararlo con sus competidores.',
  },
  priceToBook: {
    label: 'Price to Book',
    apiFields: ['priceToBookRatioTTM', 'pbRatioTTM', 'priceToBook'],
    lowerIsBetter: true, green: 1.5, yellow: 3,
    explanation: 'Compara el precio de la acción con el valor "en libros" de la empresa. Si es menor a 1.5, podrías estar pagando menos de lo que valen sus activos netos. Más Info: Es especialmente útil en industrias con muchos activos físicos (bancos, fábricas). Un valor muy por encima de 1 significa que el mercado valora mucho los activos intangibles de la empresa, como la marca o las patentes, y su potencial de crecimiento futuro.',
  },
  priceToSales: {
    label: 'Price to Sales',
    apiFields: ['priceToSalesRatioTTM', 'psTTM', 'priceToSales'],
    lowerIsBetter: true, green: 2, yellow: 4,
    explanation: 'Compara el precio de la acción con sus ventas. Muy útil para empresas que aún no tienen ganancias. Un valor bajo es mejor. Más Info: Ideal para valorar empresas jóvenes en fase de crecimiento o compañías en industrias cíclicas (como la automotriz) que pueden tener pérdidas temporales. Es una medida difícil de manipular.',
  },
  pfc_ratio: {
    label: 'Price/FCF',
    apiFields: ['priceToFreeCashFlowsRatioTTM', 'pfcRatioTTM'],
    lowerIsBetter: true, green: 15, yellow: 25,
    explanation: 'Similar al PER, pero usa el "flujo de caja libre" (el dinero real que genera la empresa). Mide qué tan cara es la acción respecto al efectivo que produce. Más Info: Muchos inversores lo prefieren al PER porque el flujo de caja es más difícil de "maquillar" contablemente que los beneficios. Refleja la salud financiera real de la compañía para pagar deudas, dividendos o reinvertir.',
  },
  evToEbitda: {
    label: 'EV/EBITDA',
    apiFields: ['enterpriseValueOverEBITDATTM', 'evToEBITDATTM', 'evToEBITDA'],
    lowerIsBetter: true, green: 10, yellow: 15,
    explanation: 'Compara el valor total de la empresa (incluyendo su deuda) con sus ganancias brutas. Es una medida de valoración más completa y un número bajo es mejor. Más Info: Al incluir la deuda, permite comparar de forma más justa a dos empresas aunque una se financie con préstamos y la otra con capital propio. Es la métrica favorita en fusiones y adquisiciones.',
  },
  evToSales: {
    label: 'EV/Ventas',
    apiFields: ['evToSalesTTM', 'enterpriseValueToSalesTTM'],
    lowerIsBetter: true, green: 3, yellow: 5,
    explanation: 'Compara el valor total de la empresa (incluyendo deuda) con sus ventas. Sirve para comparar empresas de forma más justa, sin importar sus deudas o márgenes. Más Info: Es una excelente herramienta para tener una visión rápida del valor de una compañía sin verse afectado por su estructura de deuda, impuestos o decisiones contables sobre la depreciación.',
  },
  grahamNumber: {
    label: 'Nº de Graham',
    apiFields: ['grahamNumberTTM'],
    lowerIsBetter: false, // Better if price is below this number
    green: 1, yellow: 1, // Color logic would be custom: green if price < grahamNumber
    explanation: 'Calcula un valor intrínseco teórico de la acción. Según Benjamin Graham, si el precio de mercado está por debajo de este número, la acción podría estar infravalorada para un inversor conservador.',
  },
  earningsYield: {
    label: 'Rdto. Ganancias (%)',
    apiFields: ['earningsYieldTTM'],
    lowerIsBetter: false, green: 8, yellow: 5, asPercent: true,
    explanation: 'Es el inverso del PER (Ganancias por Acción / Precio). Muestra las ganancias como un porcentaje del precio de la acción, permitiendo compararlo con el rendimiento de los bonos.',
  },

  // ——— Rentabilidad
  grossMargin: {
    label: 'Margen Bruto (%)',
    apiFields: ['grossProfitMarginTTM', 'grossMarginTTM'],
    lowerIsBetter: false, green: 0.40, yellow: 0.20, asPercent: true,
    explanation: 'De cada $100 que vende, ¿cuánto le queda después de pagar el costo de los productos? Más del 40% es una señal de un negocio muy rentable. Más Info: Un margen bruto alto y estable en el tiempo puede indicar que la empresa tiene una gran ventaja competitiva (una "barrera de entrada" o moat), como una marca muy fuerte que le permite fijar precios altos.',
  },
  operatingMargin: {
    label: 'Margen Op. (%)',
    apiFields: ['operatingMarginTTM', 'operatingIncomeMarginTTM'],
    lowerIsBetter: false, green: 0.15, yellow: 0.05, asPercent: true,
    explanation: 'De cada $100 que vende, ¿cuánto gana la empresa con su negocio principal? Un margen alto (>15%) indica eficiencia y un negocio sólido. Más Info: Este margen refleja la calidad de la gestión del negocio en su día a día. Si crece con el tiempo, significa que la empresa se está volviendo más eficiente a medida que aumenta su tamaño.',
  },
  roe: {
    label: 'ROE (%)',
    apiFields: ['returnOnEquityTTM', 'roeTTM'],
    lowerIsBetter: false, green: 0.15, yellow: 0.10, asPercent: true,
    explanation: 'Mide la rentabilidad que la empresa genera sobre el dinero invertido por los accionistas. Más del 15% se considera excelente. Más Info: ¡Cuidado! Un ROE muy alto puede ser engañoso. A veces se logra no por ser muy rentable, sino por tener mucha deuda. Siempre es bueno mirar este indicador junto con el nivel de endeudamiento (Debt/Equity).',
  },
  roa: {
    label: 'ROA (%)',
    apiFields: ['returnOnAssetsTTM', 'roaTTM'],
    lowerIsBetter: false, green: 0.05, yellow: 0.02, asPercent: true,
    explanation: 'Mide qué tan eficientemente la empresa usa sus activos (maquinaria, oficinas, etc.) para generar ganancias. Más del 5% es saludable. Más Info: Es perfecto para comparar la eficiencia operativa entre empresas del mismo sector. Por ejemplo, si dos aerolíneas tienen flotas de aviones similares, el ROA te dice cuál de ellas está generando más beneficios con esos activos.',
  },
  roic: {
    label: 'ROIC (%)',
    apiFields: ['returnOnInvestedCapitalTTM', 'roicTTM'],
    lowerIsBetter: false, green: 0.10, yellow: 0.07, asPercent: true,
    explanation: 'Es el retorno sobre TODO el capital invertido (de accionistas y de deuda). Un ROIC alto (>10%) sugiere que la empresa crea valor de forma sostenible. Más Info: Para muchos, es el indicador de rentabilidad más importante. Si el ROIC es consistentemente mayor que el costo de obtener ese capital, la empresa está creando verdadero valor para sus dueños.',
  },
  rdToRevenue: {
    label: 'I+D / Ingresos (%)',
    apiFields: ['researchAndDevelopementToRevenueTTM'],
    lowerIsBetter: false, green: 0.1, yellow: 0.05, asPercent: true,
    explanation: 'Porcentaje de los ingresos que se reinvierte en Investigación y Desarrollo. Crucial para empresas de tecnología e innovación.',
  },

  // ——— Salud financiera
  debtToEquity: {
    label: 'Debt/Equity',
    apiFields: ['debtToEquityTTM', 'debtToEquity'],
    lowerIsBetter: true, green: 0.5, yellow: 1.0,
    explanation: 'Compara la deuda de la empresa con el capital de sus dueños. Un valor bajo (menor a 0.5) indica poco endeudamiento y menor riesgo. Más Info: Un nivel de deuda "aceptable" varía por industria. Empresas con ingresos muy estables y predecibles (como las de servicios públicos) pueden operar con más deuda de forma segura.',
  },
  netDebtToEBITDA: {
    label: 'Deuda Neta/EBITDA',
    apiFields: ['netDebtToEBITDATTM', 'netDebtToEBITDA'],
    lowerIsBetter: true, green: 1.5, yellow: 3.0,
    explanation: 'Indica cuántos años tardaría la empresa en pagar toda su deuda con las ganancias que genera. Menos de 3 años se considera un nivel seguro. Más Info: Usa la "deuda neta" (deuda total menos el efectivo disponible), lo que da una imagen más precisa de la capacidad de pago real de la empresa. Es un indicador clave para las agencias de calificación de riesgo.',
  },
  debt_to_assets: {
    label: 'Deuda/Activos (%)',
    apiFields: ['debtToAssetsTTM', 'debtToAssets'],
    lowerIsBetter: true, green: 0.4, yellow: 0.6, asPercent: true,
    explanation: 'Qué porcentaje de los activos de la empresa se ha financiado con deuda. Menos del 40% se considera conservador y seguro. Más Info: Este ratio muestra el riesgo de solvencia. En caso de quiebra, los acreedores (los que prestaron el dinero) cobran primero. Un ratio alto significa que quedaría menos para los accionistas.',
  },
  currentRatio: {
    label: 'Current Ratio',
    apiFields: ['currentRatioTTM', 'currentRatio'],
    lowerIsBetter: false, green: 2.0, yellow: 1.0,
    explanation: 'Mide si la empresa tiene suficiente efectivo y activos fáciles de vender para pagar sus deudas de corto plazo. Un valor mayor a 1 es fundamental. Más Info: Aunque es clave que sea superior a 1, un ratio excesivamente alto (ej: 4 o 5) podría indicar que la empresa no está utilizando su dinero de forma eficiente y lo tiene "parado" en lugar de reinvertirlo.',
  },
  cashConversionCycle: {
    label: 'CCC (días)',
    apiFields: ['cashConversionCycleTTM', 'cashConversionCycle'],
    lowerIsBetter: true, green: 0, yellow: 20,
    explanation: 'El tiempo (en días) que tarda la empresa en convertir sus productos en dinero. Un número bajo o negativo es excelente: significa que cobra antes de pagar. Más Info: Un CCC negativo es una ventaja competitiva enorme. Empresas como Amazon o Mercado Libre cobran a sus clientes al instante, pero pagan a sus proveedores semanas después, usando el dinero de otros para financiar sus operaciones.',
  },
  dso: {
    label: 'DSO (días)',
    apiFields: ['daysOfSalesOutstandingTTM'],
    lowerIsBetter: true, green: 40, yellow: 60,
    explanation: 'Días de Ventas Pendientes de Cobro. El número promedio de días que tarda una empresa en cobrar sus facturas. Un número bajo es mejor.',
  },
  dio: {
    label: 'DIO (días)',
    apiFields: ['daysOfInventoryOutstandingTTM'],
    lowerIsBetter: true, green: 30, yellow: 60,
    explanation: 'Días de Inventario Pendiente. El número promedio de días que el inventario permanece en el almacén antes de venderse. Refleja la eficiencia de la cadena de suministro.',
  },
  incomeQualityTTM: {
    label: 'Calidad Ingresos (%)',
    apiFields: ['incomeQualityTTM', 'incomeQuality'],
    lowerIsBetter: false, green: 1.0, yellow: 0.8, asPercent: true,
    explanation: 'Compara el flujo de caja operativo con las ganancias reportadas. Un valor cercano a 1 indica que las ganancias son "reales" y sostenibles. Más Info: Si este ratio es consistentemente bajo (<0.8), podría ser una señal de alerta. Podría indicar que la empresa está teniendo dificultades para convertir sus ventas en efectivo real, lo que puede afectar su capacidad para pagar deudas o dividendos.',
  },

  // ——— Dividendos / Flujos
  dividendYield: {
    label: 'Rend. Dividendo (%)',
    apiFields: ['dividendYieldTTM', 'dividendYield'],
    compute: (raw) => {
      const price = Number(raw.price);
      const div = Number(raw.lastDividend);
      if (Number.isFinite(price) && price > 0 && Number.isFinite(div) && div >= 0) return (div / price); // Quitamos * 100 para que asPercent funcione
      return null;
    },
    lowerIsBetter: false, green: 0.03, yellow: 0.01, asPercent: true,
    explanation: 'Es el porcentaje de tu inversión que la empresa te devuelve cada año como dividendos. Funciona como un "alquiler" por tener la acción. Más Info: Es muy atractivo para inversores que buscan ingresos regulares. Sin embargo, un rendimiento altísimo puede ser una señal de alerta, ya que podría deberse a una caída brusca del precio de la acción por problemas en la empresa.',
  },
  dividendPerShare: {
    label: 'Dividendo Anual (USD)',
    apiFields: ['lastDividend'],
    lowerIsBetter: false, green: 2, yellow: 0.5,
    explanation: 'El monto total en dólares que la empresa paga por cada acción en un año. Es el valor absoluto del dividendo, útil para calcular ingresos.',
  },
  payout_ratio: {
    label: 'Payout Ratio (%)',
    apiFields: ['payoutRatioTTM', 'payoutRatio'],
    lowerIsBetter: true, green: 0.60, yellow: 0.80, asPercent: true,
    explanation: 'Qué porcentaje de sus ganancias reparte la empresa como dividendos. Si es muy alto (>80%), podría ser difícil de mantener en el futuro. Más Info: En empresas jóvenes y en crecimiento, un payout bajo es bueno, porque significa que reinvierten el dinero para crecer más rápido. En empresas maduras y estables, se espera un payout más alto.',
  },
  fcfYield: {
    label: 'FCF Yield (%)',
    apiFields: ['freeCashFlowYieldTTM', 'fcfYieldTTM'],
    lowerIsBetter: false, green: 0.05, yellow: 0.02, asPercent: true,
    compute: (raw) => {
      const pfc = Number(raw.priceToFreeCashFlowsRatioTTM);
      return (Number.isFinite(pfc) && pfc > 0) ? (1 / pfc) : null;
    },
    explanation: 'Compara el dinero real que genera la empresa con el precio de la acción. Un rendimiento alto significa que estás comprando una gran capacidad de generar efectivo. Más Info: Muestra la capacidad potencial de la empresa para aumentar dividendos, recomprar acciones o pagar deuda. Para muchos, es una medida más pura del retorno real que la empresa genera para el inversor.',
  },

  // ——— Riesgo / Tamaño
  beta: {
    label: 'Beta',
    apiFields: ['beta'],
    lowerIsBetter: true, green: 0.8, yellow: 1.2,
    explanation: 'Mide la volatilidad de la acción comparada con el mercado. Si es 1, se mueve igual que el mercado. Menor a 1 es menos volátil (más conservadora). Más Info: Por ejemplo, si el mercado (como el S&P 500) sube un 10%, se esperaría que una acción con Beta de 1.2 suba un 12%. Pero si el mercado cae un 10%, también caería un 12%.',
  },
  marketCap: {
    label: 'Capitalización (USD)',
    apiFields: ['marketCap'],
    lowerIsBetter: false, green: 1e12, yellow: 1e11, isLargeNumber: true,
    explanation: 'Es el valor total de todas las acciones de la empresa en el mercado. Simplemente, te dice qué tan grande es la compañía. Más Info: Las empresas se suelen clasificar por tamaño (Large-Cap, Mid-Cap, Small-Cap). Las grandes suelen ser más estables, mientras que las pequeñas tienen mayor potencial de crecimiento, pero también más riesgo.',
  },
  relativeVolume: {
    label: 'Volumen Relativo',
    apiFields: [], // Es calculado
    compute: (raw) => {
      const vol = Number(raw.volume);
      const avgVol = Number(raw.averageVolume);
      return (avgVol > 0 && Number.isFinite(vol)) ? (vol / avgVol) : null;
    },
    lowerIsBetter: false, green: 2, yellow: 1.5,
    explanation: 'Compara el volumen de hoy con el promedio. Un valor > 1.5 indica un interés inusual en la acción, a menudo por noticias importantes.',
  },

  // --- Momentum: ¿Cuál es la tendencia del precio? ---
  rsi14: {
    label: 'RSI (14)',
    apiFields: [],
    lowerIsBetter: false, green: 70, yellow: 50,
    explanation: 'Un "termómetro" de la acción. Si está por encima de 70, se dice que está "sobrecomprada" (quizás cara); por debajo de 30, "sobrevendida" (quizás barata). Más Info: No es una garantía, sino una señal. Los traders lo usan para identificar posibles puntos de giro en el precio, pero siempre en conjunto con otros indicadores.',
  },
  sma50: {
    label: 'SMA 50',
    apiFields: [],
    lowerIsBetter: false, green: 0, yellow: 0,
    explanation: 'El precio promedio de la acción durante los últimos 50 días. Ayuda a ver la tendencia de corto plazo. Más Info: Muchos operadores consideran que si el precio está por encima de la SMA 50, la tendencia a corto plazo es alcista, y si está por debajo, es bajista.',
  },
  sma200: {
    label: 'SMA 200',
    apiFields: [],
    lowerIsBetter: false, green: 0, yellow: 0,
    explanation: 'El precio promedio de la acción durante los últimos 200 días. Muestra la tendencia de largo plazo. Más Info: Es una de las líneas de tendencia más seguidas. Una acción que cotiza por encima de su SMA 200 se considera que está en una tendencia alcista a largo plazo.',
  },
  smaSignal: {
    label: 'Señal SMA 50/200',
    apiFields: [],
    lowerIsBetter: false, green: 1, yellow: 0,
    explanation: 'Una señal de tendencia: si la media de 50 días está por encima de la de 200, se considera una señal alcista. Más Info: El cruce de la SMA 50 por encima de la SMA 200 se conoce como "Cruce Dorado" (Golden Cross) y es una fuerte señal alcista. El cruce por debajo se llama "Cruce de la Muerte" (Death Cross) y es una señal bajista.',
  },
  dist52wHigh: {
    label: 'Dist. a Máx 52w (%)',
    apiFields: [],
    lowerIsBetter: true, green: 10, yellow: 25, asPercent: true,
    explanation: 'Qué tan lejos está el precio actual de su punto más alto del último año. Poca distancia puede indicar que la acción tiene un buen momento. Más Info: Algunos inversores de momentum buscan acciones que estén cerca de sus máximos como señal de fortaleza. Otros lo ven como un posible punto de resistencia donde el precio podría detenerse.',
  },
  dist52wLow: {
    label: 'Dist. a Mín 52w (%)',
    apiFields: [],
    lowerIsBetter: false, green: 50, yellow: 25, asPercent: true,
    explanation: 'Cuánto ha subido el precio desde su punto más bajo del último año. Un valor alto muestra una fuerte recuperación. Más Info: Este indicador es útil para encontrar acciones que han sido castigadas por el mercado pero que están mostrando signos de recuperación. Un aumento sostenido desde el mínimo puede indicar un cambio de tendencia.',
  },
};

export const RISK_FREE_RATE = 0.02

export const calculateMean = (data) => data.reduce((a, b) => a + b, 0) / data.length;

export const calculateStdDev = (data) => {
  if (data.length < 2) return 0;
  const mean = calculateMean(data);
  const variance = data.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (data.length - 1);
  return Math.sqrt(variance);
};

export const calculateSharpeRatio = (returns) => {
  if (returns.length < 2) return 'N/A';
  const meanReturn = calculateMean(returns);
  const stdDevReturns = calculateStdDev(returns);
  if (stdDevReturns === 0) return 'N/A';
  const annualizedReturn = meanReturn * 252;
  const annualizedVolatility = stdDevReturns * Math.sqrt(252);
  const sharpe = (annualizedReturn - RISK_FREE_RATE) / annualizedVolatility;
  return sharpe;
};

export const calculateCovariance = (returns1, returns2) => {
  const mean1 = calculateMean(returns1);
  const mean2 = calculateMean(returns2);
  let covariance = 0;
  for (let i = 0; i < returns1.length; i++) {
    covariance += (returns1[i] - mean1) * (returns2[i] - mean2);
  }
  return covariance / (returns1.length - 1);
};

export const calculateCorrelation = (returns1, returns2) => {
  const cov = calculateCovariance(returns1, returns2);
  const stdDev1 = calculateStdDev(returns1);
  const stdDev2 = calculateStdDev(returns2);
  if (stdDev1 === 0 || stdDev2 === 0) return 0;
  return cov / (stdDev1 * stdDev2);
};

export const getCorrelationColor = (correlation) => {
  const hue = (correlation + 1) * 60;
  const textColor = '#1f2937';
  return { backgroundColor: `hsl(${hue}, 80%, 75%)`, color: textColor };
};

export const getVisibleIndicators = (assetsData) => {
  if (assetsData.length === 0) return {};
  const visible = {};
  Object.keys(indicatorConfig).forEach(key => {
    if (assetsData.some(a => a.data[key] !== 'N/A' && a.data[key] !== null && a.data[key] !== undefined)) {
      visible[key] = indicatorConfig[key];
    }
  });
  return visible;
};

export const getTrafficLightColor = (key, value) => {
  const config = indicatorConfig[key];
  if (!config || typeof value !== 'number') return 'bg-gray-600';
  const { green, yellow, lowerIsBetter } = config;
  if (lowerIsBetter) {
    if (value <= green) return 'traffic-light-green';
    if (value <= yellow) return 'traffic-light-yellow';
    return 'traffic-light-red';
  } else {
    if (value >= green) return 'traffic-light-green';
    if (value >= yellow) return 'traffic-light-yellow';
    return 'traffic-light-red';
  }
};

export const formatLargeNumber = (num) => {
  if (Math.abs(num) >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (Math.abs(num) >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (Math.abs(num) >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  return num.toLocaleString('es-AR');
};

export const meanArr = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

export const stdDevArr = (arr) => {
  if (arr.length < 2) return 0;
  const m = meanArr(arr);
  const v = arr.map(x => (x - m) ** 2).reduce((a, b) => a + b, 0) / (arr.length - 1);
  return Math.sqrt(v);
};

export const sharpeFromReturns = (returns) => {
  if (returns.length < 2) return 'N/A';
  const m = meanArr(returns);
  const s = stdDevArr(returns);
  if (!s) return 'N/A';
  const annualR = m * 252;
  const annualVol = s * Math.sqrt(252);
  return (annualR - RISK_FREE_RATE) / annualVol;
};

export const toNumber = (v) => (v === null || v === undefined || v === '' || v === 'None') ? null : Number(v);

export const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);

export const computeStdDevPct = (returns) => {
  // returns esperados en proporción (ej.: 0.01 = 1%)
  if (!Array.isArray(returns) || returns.length < 2) return null;
  const m = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, r) => acc + Math.pow(r - m, 2), 0) / (returns.length - 1);
  const sd = Math.sqrt(variance); // proporción
  return sd * 100; // a %
};

export const computeSharpe = (returns, riskFreeAnnual = (typeof RISK_FREE_RATE === 'number' ? RISK_FREE_RATE : 0.02)) => {
  if (!Array.isArray(returns) || returns.length < 2) return null;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const sdPct = computeStdDevPct(returns);
  if (!isFiniteNum(sdPct) || sdPct === 0) return null;

  const sdDaily = sdPct / 100;
  const meanAnnual = mean * 252;
  const sdAnnual = sdDaily * Math.sqrt(252);
  return (sdAnnual > 0) ? (meanAnnual - riskFreeAnnual) / sdAnnual : null;
};

export const findCloseByDate = (historyAsc, targetDateISO) => {
  const t = new Date(targetDateISO).getTime();
  for (let i = historyAsc.length - 1; i >= 0; i--) {
    const ti = new Date(historyAsc[i].date).getTime();
    if (ti <= t && isFiniteNum(historyAsc[i].close)) return historyAsc[i].close;
  }
  return null;
};

export const getFirstPresent = (obj, fields = []) => {
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(obj, f)) {
      const num = toNumber(obj[f]);
      if (num !== null && Number.isFinite(num)) return num;
    }
  }
  return null;
};

export function pct(v) {
  if (typeof v !== "number") return "—";
  return `${v.toFixed(2)}%`;
}
export function fmtDate(d) {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
}