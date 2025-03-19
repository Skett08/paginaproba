// Carga de datos y creación de gráficos
document.addEventListener('DOMContentLoaded', () => {
    fetch('datos.json')
    .then(r => r.json())
    .then(data => {
        // Procesar datos mensuales
        const monthlyForecast = {
            Mexico: holtWintersForecast(data.monthly.Mexico, 0.7, 0.6, 0.8, 12, 12),
            Texas: holtWintersForecast(data.monthly.Texas, 0.7, 0.6, 0.8, 12, 12),
            California: holtWintersForecast(data.monthly.California, 0.7, 0.6, 0.8, 12, 12)
        };

        // Procesar datos horarios
        const hourlyData = {
            Mexico: Object.values(data.hourly.Mexico),
            Texas: Object.values(data.hourly.Texas),
            California: Object.values(data.hourly.California)
        };
        
        const hourlyForecast = {
            Mexico: holtWintersForecast(hourlyData.Mexico, 0.8, 0.5, 0.9, 24, 24),
            Texas: holtWintersForecast(hourlyData.Texas, 0.8, 0.5, 0.9, 24, 24),
            California: holtWintersForecast(hourlyData.California, 0.8, 0.5, 0.9, 24, 24)
        };

        // Crear gráficos
        createChart(
            'annualChart',
            'monthly',
            data.monthly.labels,  // Etiquetas
            data.monthly,         // Datos históricos
            monthlyForecast,      // Pronóstico
            ['Mexico', 'Texas', 'California'],
            ['#FF6384', '#36A2EB', '#FFCE56']
        );
        
        createChart(
            'hourlyChart',
            'hourly',
            Object.keys(data.hourly.Mexico),  // Etiquetas horarias
            hourlyData,          // Datos históricos
            hourlyForecast,      // Pronóstico
            ['Mexico', 'Texas', 'California'],
            ['#FF9F40', '#4BC0C0', '#9966FF']
        );
    })
    .catch(error => console.error('Error:', error));
});

// Funciones de pronóstico mejoradas
function holtWintersForecast(data, alpha = 0.8, beta = 0.8, gamma = 0.8, seasonLength = 24, periods = 24) {
    if (data.length < seasonLength) return new Array(periods).fill(0); // Ajuste para mínimos datos
    
    // Inicialización mejorada
    const seasons = Math.ceil(data.length / seasonLength);
    const seasonalIndices = Array.from({length: seasonLength}, (_, i) => {
        const seasonVals = [];
        for (let j = 0; j < seasons; j++) {
            const idx = j * seasonLength + i;
            if (idx < data.length) seasonVals.push(data[idx]);
        }
        return seasonVals.length > 0 ? seasonVals.reduce((a, b) => a + b, 0) / seasonVals.length : 1;
    });

    let level = data[0];
    let trend = data.length > seasonLength ? (data[seasonLength] - data[0]) / seasonLength : 0;

    // Suavizado
    for (let t = 0; t < data.length; t++) {
        const seasonIndex = t % seasonLength;
        const prevLevel = level;
        level = alpha * (data[t] - seasonalIndices[seasonIndex]) + (1 - alpha) * (level + trend);
        trend = beta * (level - prevLevel) + (1 - beta) * trend;
        seasonalIndices[seasonIndex] = gamma * (data[t] - level) + (1 - gamma) * seasonalIndices[seasonIndex];
    }

    // Pronóstico
    return Array.from({length: periods}, (_, i) => {
        const seasonIndex = (data.length + i) % seasonLength;
        return Math.round(level + (i + 1) * trend + seasonalIndices[seasonIndex]);
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
        const date = new Date(startYear, startMonth + i + 1, 1);
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
function createChart(containerId, type, labels, historicalData, forecastData, regions, colors) {
    const forecastLabels = type === 'monthly'
        ? generateForecastLabels(labels.slice(-1)[0])
        : generateHourlyForecastLabels(labels.slice(-1)[0]);

    const fullLabels = [...labels, ...forecastLabels];

    const traces = regions.flatMap((region, i) => {
        const historicalValues = historicalData[region];
        const forecastValues = forecastData[region];
        
        return [
            {
                name: region,
                x: fullLabels,
                y: [...historicalValues, ...new Array(forecastLabels.length).fill(null)],
                mode: 'lines+markers',
                line: {color: colors[i], width: 2},
                marker: {size: 4}
            },
            {
                name: `${region} (Pronóstico)`,
                x: fullLabels,
                y: [...new Array(historicalValues.length).fill(null), ...forecastValues],
                mode: 'lines+markers',
                line: {color: colors[i], width: 2, dash: 'dot'},
                marker: {symbol: 'triangle-right', size: 5}
            }
        ];
    });

    const layout = {
        title: `Demanda ${type === 'monthly' ? 'Mensual' : 'Horaria'}`,
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

