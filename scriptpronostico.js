// Carga de datos y creación de gráficos
document.addEventListener('DOMContentLoaded', () => {
    fetch('datos.json')
    .then(r => r.json())
    .then(data => {
        // Guardar todos los datos globalmente para acceder a las series diarias
        window.allData = data;

        // Procesar datos mensuales y calcular pronósticos
        const monthlyForecast = {
            Mexico: holtWintersForecast(data.monthly.Mexico, 0.7, 0.6, 0.8, 12, 12),
            Texas: holtWintersForecast(data.monthly.Texas, 0.7, 0.6, 0.8, 12, 12),
            California: holtWintersForecast(data.monthly.California, 0.7, 0.6, 0.8, 12, 12)
        };

        // Guardar datos en variables globales para reutilizarlos en el filtro
        window.forecastData = monthlyForecast;
        window.historicalData = data.monthly;
        window.regions = ['Mexico', 'Texas', 'California'];
        window.colors = ['#FF6384', '#36A2EB', '#FFCE56'];

        // Poblar el menú desplegable con las etiquetas de meses
        populateMonthFilter(data.monthly.labels);

        // Crear la gráfica anual por defecto
        createChart(
            'annualChart',
            data.monthly.labels,
            data.monthly,
            monthlyForecast,
            window.regions,
            window.colors
        );
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('excelFileInput').addEventListener('change', handleFileSelect);

const datasets = []; // Aquí almacenaremos los datos de cada archivo

function populateMonthFilter(labels) {
    const select = document.getElementById('monthFilter');
    // Limpia opciones previas (si las hubiera)
    select.innerHTML = '<option value="all">Todos los meses</option>';
    labels.forEach((label, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = label;
        select.appendChild(option);
    });
}

document.getElementById('monthFilter').addEventListener('change', (e) => {
    const value = e.target.value;
    if (value === "all") {
        // Mostrar vista anual con datos mensuales y pronóstico mensual
        createChart(
            'annualChart',
            window.historicalData.labels,
            window.historicalData,
            window.forecastData,
            window.regions,
            window.colors
        );
    } else {
        // Mostrar vista diaria con pronóstico para el mes seleccionado
        createMonthlyChart(
            'annualChart',
            window.historicalData.labels,
            window.historicalData,
            window.regions,
            window.colors,
            parseInt(value)
        );
    }
});

function handleFileSelect(event) {
    const files = event.target.files;
    const promises = [];

    for (let i = 0; i < files.length && i < 2; i++) {
        promises.push(readExcelFile(files[i]));
    }

    Promise.all(promises)
        .then(results => {
            datasets.length = 0;
            results.forEach(result => datasets.push(result));

            // Filtrar archivos horarios
            const hourlyDatasets = results.filter(result => 
                result.isHourly || 
                (result.fechas[0] && String(result.fechas[0]).includes(':'))
            );

            if (hourlyDatasets.length > 0) {
                createHourlyChart('annualChart', hourlyDatasets.slice(0, 2));
            } else {
                createComparativeChart(datasets);
            }
        })
        .catch(error => console.error('Error al leer los archivos Excel:', error));
}


function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: "binary", cellDates: true, raw: false });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

            if (!jsonData || jsonData.length === 0) {
                return reject("No se encontraron datos en el archivo");
            }

            // Determinar si son datos horarios
            const firstDate = jsonData[0].Fecha;
            let isHourly = false;

            // Caso 1: Fecha es número (Excel)
            if (typeof firstDate === 'number') {
                isHourly = firstDate < 1; // Números <1 son horas (ej: 0.5 = 12:00)
            }
            // Caso 2: Fecha es texto con formato HH:MM
            else if (typeof firstDate === 'string' && firstDate.includes(':')) {
                isHourly = true;
            }
            // Caso 3: Fecha es objeto Date (ej: 1899-12-31 01:00)
            else if (firstDate instanceof Date) {
                const year = firstDate.getFullYear();
                isHourly = year === 1899 || year === 1900; // Fechas antiguas son horas
            }

            // Convertir fechas
            const fechas = jsonData.map(row => {
                const fecha = row.Fecha;

                // Caso 1: Hora como número (ej: 0.041666666666666664 = 01:00)
                if (typeof fecha === 'number') {
                    if (isHourly) {
                        const hours = Math.floor(fecha * 24);
                        const minutes = Math.round((fecha * 24 - hours) * 60);
                        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    } else {
                        const date = XLSX.SSF.parse_date_code(fecha);
                        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        return `${monthNames[date.m - 1]} ${date.y}`;
                    }
                }
                // Caso 2: Fecha como objeto Date
                else if (fecha instanceof Date) {
                    if (isHourly) {
                        return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
                    } else {
                        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        return `${monthNames[fecha.getMonth()]} ${fecha.getFullYear()}`;
                    }
                }
                // Caso 3: Fecha como string
                else {
                    return isHourly 
                        ? String(fecha).split(' ')[1] // Extraer solo la hora (ej: "1899-12-31 01:00" → "01:00")
                        : String(fecha); // Mantener texto completo para meses
                }
            });

            // Filtrar demandas válidas
            const demandas = jsonData.map(row => Number(row.Demanda)).filter(d => !isNaN(d));

            resolve({ fechas, demandas, fileName: file.name, isHourly });
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsBinaryString(file);
    });
}

function createComparativeChart(datasets) {
    const traces = datasets.flatMap((dataSet, index) => {
        const fechas = dataSet.fechas;
        const demandas = dataSet.demandas.filter(d => d !== null); // Filtrar nulls
        const color = `hsl(${index * 120}, 70%, 50%)`;

        // Validar datos antes de pronosticar
        if (demandas.length < 2) return []; // No hay suficientes datos

        const forecastValues = holtWintersForecast(demandas, 0.7, 0.6, 0.8, 12, 3);
        const forecastLabels = generateForecastLabels(fechas[fechas.length - 1], 3);

        // Conectar histórico y pronóstico
        const connectedFechas = [fechas[fechas.length - 1], ...forecastLabels];
        const connectedDemandas = [demandas[demandas.length - 1], ...forecastValues];

        return [
            {
                name: `${dataSet.fileName} (Histórico)`,
                x: fechas,
                y: demandas,
                mode: 'lines+markers',
                line: { color: color, width: 2 },
                marker: { size: 6 }
            },
            {
                name: `${dataSet.fileName} (Pronóstico)`,
                x: connectedFechas,
                y: connectedDemandas,
                mode: 'lines+markers',
                line: { color: color, width: 2, dash: 'dot' },
                marker: { symbol: 'triangle-right', size: 6 }
            }
        ];
    });

    const layout = {
        title: 'Comparación de Demanda Mensual con Pronóstico',
        xaxis: { 
            title: 'Fecha',
            tickangle: -45,
            type: 'category',
            automargin: true
        },
        yaxis: { title: 'MW/h' },
        legend: { orientation: 'h', y: -0.3 },
        margin: { t: 40, b: 100 }
    };

    Plotly.newPlot('annualChart', traces, layout);
}

// Funciones de pronóstico mejoradas
function holtWintersForecast(data, alpha = 0.7, beta = 0.6, gamma = 0.8, seasonLength = 12, periods = 3) {
    if (data.length === 0) return [];
    seasonLength = Math.min(seasonLength, data.length);
    
    // Inicializar nivel y tendencia
    let level = data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
    let trend = seasonLength > 1 ? (data[seasonLength - 1] - data[0]) / (seasonLength - 1) : 0;
    
    const seasonalIndices = data.slice(0, seasonLength).map((val, i) => val / (level + (i * trend)));

    // Suavizar componentes
    for (let t = 0; t < data.length; t++) {
        const seasonIndex = t % seasonLength;
        const prevLevel = level;
        level = alpha * (data[t] / seasonalIndices[seasonIndex]) + (1 - alpha) * (level + trend);
        trend = beta * (level - prevLevel) + (1 - beta) * trend;
        seasonalIndices[seasonIndex] = gamma * (data[t] / (prevLevel + trend)) + (1 - gamma) * seasonalIndices[seasonIndex];
    }
    
    // Generar pronóstico
    return Array.from({length: periods}, (_, i) => {
        const seasonIndex = (data.length + i) % seasonLength;
        return Math.round((level + (i + 1) * trend) * seasonalIndices[seasonIndex]);
    });
}

function generateForecastLabels(lastLabel, periods = 3) {
    const [monthStr, yearStr] = lastLabel.split(' ');
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const startMonth = months.indexOf(monthStr);
    const startYear = parseInt(yearStr);
    
    return Array.from({length: periods}, (_, i) => {
        const date = new Date(startYear, startMonth + i + 1, 1);
        // Manejar cambio de año
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    });
}


// Generación de etiquetas para pronósticos horarios
function generateHourlyForecastLabels(lastHour, forecastCount) {
    const [lastH, lastM] = lastHour.split(':').map(Number);
    let currentHour = lastH;
    let currentMinute = lastM;
    
    return Array.from({length: forecastCount}, () => {
        currentHour += 1;
        if (currentHour >= 24) {
            currentHour = 0; // Reiniciar a 00 después de las 23:00
        }
        return `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    });
}


function createHourlyChart(containerId, datasets) {
    const traces = [];
    const colors = ['#36A2EB', '#FF6384']; // Colores distintos para cada archivo

    datasets.forEach((dataSet, index) => {
        const hours = dataSet.fechas;
        const values = dataSet.demandas;
        const currentHours = hours.length;
        const forecastHorizon = 24 - currentHours;

        // Datos históricos
        traces.push({
            name: `${dataSet.fileName} (Histórico)`,
            x: hours,
            y: values,
            mode: 'lines+markers',
            line: { color: colors[index], width: 2 },
            marker: { size: 6 }
        });

        // Traza de pronóstico (si hay horas faltantes)
        if (forecastHorizon > 0) {
            const seasonLength = currentHours < 24 ? currentHours : 24;
            const forecastValues = holtWintersForecast(values, 0.8, 0.5, 0.9, seasonLength, forecastHorizon);
            const forecastHours = generateHourlyForecastLabels(hours[hours.length - 1], forecastHorizon);

            // Conectar el último punto histórico con el primer pronóstico
            const connectedForecastHours = [hours[hours.length - 1], ...forecastHours];
            const connectedForecastValues = [values[values.length - 1], ...forecastValues];

            traces.push({
                name: `${dataSet.fileName} (Pronóstico)`,
                x: connectedForecastHours,
                y: connectedForecastValues,
                mode: 'lines+markers',
                line: { color: colors[index], width: 2, dash: 'dot' },
                marker: { symbol: 'triangle-right', size: 6 }
            });
        }
    });

    const layout = {
        title: `Comparación de demanda horaria${datasets.length > 1 ? ' - 2 archivos' : ''}`,
        xaxis: {
            title: 'Hora del día',
            range: ['00:00', '23:59'],
            tickmode: 'array',
            tickvals: Array.from({length: 24}, (_, i) => `${i.toString().padStart(2, '0')}:00`)
        },
        yaxis: { title: 'MW/h' },
        showlegend: true,
        legend: { orientation: 'h', y: -0.3 }
    };

    Plotly.newPlot(containerId, traces, layout);
}

// Configuración común para gráficos
const chartConfig = {
    monthly: {
        alpha: 0.7,  // Nivel
        beta: 0.6,   // Tendencia
        gamma: 0.8,  // Estacionalidad
        colors: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)']
    },
    hourly: {
        alpha: 0.8,  // Más reactivo a cambios recientes
        beta: 0.5,   // Tendencia menos pronunciada
        gamma: 0.9,  // Alta sensibilidad estacional
        colors: ['rgb(255, 140, 102)', 'rgb(68, 114, 196)', 'rgb(112, 173, 71)']
    }
};

function createContinuousTraces(name, historicalData, forecastData, color, labels, forecastLabels) {
    const fullLabels = [...labels, ...forecastLabels];
    const fullHistorical = [...historicalData, ...new Array(forecastLabels.length).fill(null)];
    const fullForecast = [...new Array(labels.length).fill(null), ...forecastData];

    return [
        {
            name: name,
            x: fullLabels,
            y: fullHistorical,
            mode: 'lines+markers',
            line: {color: color, width: 2},
            marker: {size: 4}
        },
        {
            name: `${name} (Pronóstico)`,
            x: fullLabels,
            y: fullForecast,
            mode: 'lines+markers',
            line: {color: color, width: 2, dash: 'dot'},
            marker: {size: 4, symbol: 'triangle-right'}
        }
    ];
}

// Función para crear gráficos
function createChart(containerId, labels, historicalData, forecastData, regions, colors) {
    const forecastLabels = generateForecastLabels(labels.slice(-1)[0]);
    const traces = regions.flatMap((region, i) => {
        const historicalValues = historicalData[region];
        const forecastValues = forecastData[region];
        const lastHistoricalValue = historicalValues[historicalValues.length - 1];
        return [
            {
                name: region,
                x: labels,
                y: historicalValues,
                mode: 'lines+markers',
                line: {color: colors[i], width: 2},
                marker: {size: 6}
            },
            {
                name: `${region} (Pronóstico)`,
                x: [labels[labels.length - 1], ...forecastLabels],
                y: [lastHistoricalValue, ...forecastValues],
                mode: 'lines+markers',
                line: {color: colors[i], width: 2, dash: 'dot'},
                marker: {symbol: 'triangle-right', size: 6}
            }
        ];
    });

    const layout = {
        title: 'Demanda Mensual',
        xaxis: {
            type: 'category',
            tickangle: -45,
            automargin: true
        },
        yaxis: {title: 'MW/h'},
        legend: {orientation: 'h', y: -0.2},
        margin: {t: 40, b: 100},
        showlegend: true
    };

    Plotly.newPlot(containerId, traces, layout);
}

function createMonthlyChart(containerId, labels, historicalData, regions, colors, monthIndex) {
    // Obtiene la etiqueta del mes seleccionado (ej. "Marzo 2024")
    const selectedLabel = labels[monthIndex];
    // Calcula el total de días en el mes
    const totalDaysInMonth = getDaysInMonth(selectedLabel);
    const traces = [];
    
    regions.forEach((region, i) => {
        // Se asume que los datos diarios están en "Diario <region>"
        const dailyKey = "Diario " + region;
        const dailyData = window.allData[dailyKey] ? window.allData[dailyKey][selectedLabel] : [];
        if (!dailyData || dailyData.length === 0) return; // Si no hay datos, salta la región
        
        const currentDays = dailyData.length; // Días históricos disponibles
        const historicalDays = Array.from({ length: currentDays }, (_, j) => j + 1);
        
        // Determina cuántos días faltan en el mes
        const forecastHorizon = totalDaysInMonth - currentDays;
        let forecastDays = [];
        let forecastValues = [];
        
        if (forecastHorizon > 0) {
            // Se pronostica solo para los días que faltan (sin duplicar el último histórico)
            const seasonLength = 7;  // Estacionalidad semanal
            forecastValues = holtWintersForecast(dailyData, 0.7, 0.6, 0.8, seasonLength, forecastHorizon);
            forecastDays = Array.from({ length: forecastHorizon }, (_, j) => currentDays + j + 1);
        }
        
        // Traza de datos históricos
        traces.push({
            name: region + " (Histórico)",
            x: historicalDays,
            y: dailyData,
            mode: 'lines+markers',
            line: { color: colors[i], width: 2 },
            marker: { size: 6 }
        });
        
        // Traza del pronóstico (solo si hay días faltantes)
        if (forecastHorizon > 0) {
            traces.push({
                name: region + " (Pronóstico)",
                x: forecastDays,
                y: forecastValues,
                mode: 'lines+markers',
                line: { color: colors[i], width: 2, dash: 'dot' },
                marker: { symbol: 'triangle-right', size: 6 }
            });
        }
    });
    
    const layout = {
        title: `Demanda diaria y pronóstico para ${selectedLabel}`,
        xaxis: {
            title: 'Día del mes',
            dtick: 1,
            range: [1, totalDaysInMonth]
        },
        yaxis: { title: 'MW/h' },
        showlegend: true
    };
    
    Plotly.newPlot(containerId, traces, layout);
}

const createTraces = (name, data, forecast, color, isHourly) => {
    const rgbaColor = color.replace(')', ', 0.1)').replace('rgb', 'rgba');
    return [
        {
            name: name,
            x: labels,
            y: [...data, ...new Array(forecastLength).fill(null)],
            mode: 'lines',
            line: {color: color, width: 2},
            fill: isHourly ? 'tonexty' : 'tozeroy',
            fillcolor: rgbaColor
        },
        {
            name: `${name} (Pronóstico)`,
            x: forecastLabels,
            y: [...new Array(data.length).fill(null), ...forecast],
            mode: 'lines',
            line: {color: color, width: 2, dash: 'dot'}
        }
    ];
};

function getDaysInMonth(label) {
    const [monthStr, yearStr] = label.split(' ');
    const months = {
       'Enero': 0,
       'Febrero': 1,
       'Marzo': 2,
       'Abril': 3,
       'Mayo': 4,
       'Junio': 5,
       'Julio': 6,
       'Agosto': 7,
       'Septiembre': 8,
       'Octubre': 9,
       'Noviembre': 10,
       'Diciembre': 11
    };
    const month = months[monthStr];
    const year = parseInt(yearStr);
    return new Date(year, month + 1, 0).getDate();
}