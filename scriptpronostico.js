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
        // Mostrar vista anual
        createChart(
            'annualChart',
            window.historicalData.labels,
            window.historicalData,
            window.forecastData,
            window.regions,
            window.colors
        );
    } else {
        // Mostrar vista diaria para el mes seleccionado
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

    for (let i = 0; i < files.length; i++) {
        promises.push(readExcelFile(files[i]));
    }

    Promise.all(promises)
      .then(results => {
          // Aquí results es un arreglo con los datos extraídos de cada archivo
          // Suponiendo que cada Excel tenga columnas, por ejemplo, "Fecha" y "Demanda"
          results.forEach(result => datasets.push(result));

          // Puedes combinar o comparar los datos y luego llamar a tu función para crear la gráfica
          // Por ejemplo, podrías crear una gráfica para cada archivo o una única gráfica con varias trazas.
          createComparativeChart(datasets);
      })
      .catch(error => console.error('Error al leer los archivos Excel:', error));
}

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            // Asumamos que los datos están en la primera hoja
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // Convertir la hoja a JSON (cada objeto corresponde a una fila)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
            // Se espera que el Excel tenga columnas "Fecha" y "Demanda"
            // Puedes hacer ajustes según el formato de tus archivos
            const fechas = jsonData.map(row => row.Fecha);
            const demandas = jsonData.map(row => row.Demanda);
            resolve({ fechas, demandas, fileName: file.name });
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsBinaryString(file);
    });
}

function createComparativeChart(datasets) {
    // Para cada dataset, se creará una traza en la gráfica
    const traces = datasets.map((dataSet, index) => {
        return {
            name: dataSet.fileName,
            x: dataSet.fechas, // Si las fechas están en formato mes, se usarán como etiquetas
            y: dataSet.demandas,
            mode: 'lines+markers',
            line: { width: 2 },
            marker: { size: 6 }
        };
    });

    const layout = {
        title: 'Comparación de Demanda Eléctrica',
        xaxis: {
            title: 'Fecha',
            tickangle: -45,
            type: 'category'
        },
        yaxis: { title: 'MW/h' },
        legend: { orientation: 'h', y: -0.2 },
        margin: { t: 40, b: 100 }
    };

    Plotly.newPlot('annualChart', traces, layout);
}

// Funciones de pronóstico mejoradas
function holtWintersForecast(data, alpha = 0.7, beta = 0.6, gamma = 0.8, seasonLength = 12, periods = 12) {
    if (data.length < seasonLength) return new Array(periods).fill(0);
    
    const initialLevel = data.slice(0, seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
    const initialTrend = (data[seasonLength - 1] - data[0]) / (seasonLength - 1);
    let level = initialLevel;
    let trend = initialTrend;
    
    const seasonalIndices = data.slice(0, seasonLength).map((val, i) => {
        return val / (level + (i * trend));
    });
    
    for (let t = 0; t < data.length; t++) {
        const seasonIndex = t % seasonLength;
        const prevLevel = level;
        level = alpha * (data[t] / seasonalIndices[seasonIndex]) + (1 - alpha) * (level + trend);
        trend = beta * (level - prevLevel) + (1 - beta) * trend;
        seasonalIndices[seasonIndex] = gamma * (data[t] / (prevLevel + trend)) + (1 - gamma) * seasonalIndices[seasonIndex];
    }
    
    return Array.from({length: periods}, (_, i) => {
        const seasonIndex = (data.length + i) % seasonLength;
        return Math.round((level + (i + 1) * trend) * seasonalIndices[seasonIndex]);
    });
}

function generateForecastLabels(lastLabel) {
    const [monthStr, yearStr] = lastLabel.split(' ');
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const startMonth = months.indexOf(monthStr);
    const startYear = parseInt(yearStr);
    
    return Array.from({length: 12}, (_, i) => {
        const date = new Date(startYear, startMonth + i, 1);
        return `${months[date.getMonth()]} ${date.getFullYear()}`;
    });
}


// Generación de etiquetas para pronósticos horarios
function generateHourlyForecastLabels(lastHour) {
    const [lastH] = lastHour.split(':');
    let currentHour = parseInt(lastH);
    return Array.from({length: 24}, (_, i) => {
        currentHour = (currentHour % 24) + 1;
        return `${currentHour.toString().padStart(2, '0')}:00`;
    });
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
    // Se obtiene la etiqueta del mes seleccionado
    const selectedLabel = labels[monthIndex];
    
    // Crear trazas usando los datos diarios almacenados en window.allData
    const traces = regions.map((region, i) => {
        // Se asume que en el JSON, los datos diarios están en la clave "Diario <region>"
        const dailyKey = "Diario " + region;
        const dailyData = window.allData[dailyKey] ? window.allData[dailyKey][selectedLabel] : [];
        
        // Generar etiquetas para cada día (1, 2, 3, ... según la longitud del array)
        const days = dailyData.map((_, j) => j + 1);
        
        return {
            name: region,
            x: days,
            y: dailyData,
            mode: 'lines+markers',
            line: { color: colors[i], width: 2 },
            marker: { size: 6 }
        };
    });
    
    const layout = {
        title: `Demanda diaria para ${selectedLabel}`,
        xaxis: { title: 'Día del mes' },
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

