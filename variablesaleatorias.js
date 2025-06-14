document.addEventListener('DOMContentLoaded', function () {
    const randomBtn = document.getElementById('random-btn');
    const statsBtn = document.getElementById('stats-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultadoSection = document.getElementById('resultado-section');
    const resultadoElement = document.getElementById('resultado');
    const experimentalProbabilities = document.getElementById('experimental-probabilities');
    const resultGraph = document.getElementById('result-graph');
    const experimentalBody = document.getElementById('experimental-body');

    let datos = [];
    let distribucionActual = null;

    // Funciones globales para los botones
    window.generarUniforme = function() {
        distribucionActual = 'uniforme';
    };
    
    window.generarGaussiana = function() {
        distribucionActual = 'gaussiana';
    };
    
    window.generarExponencial = function() {
        distribucionActual = 'exponencial';
    };

    // Botón "Generar números"
    randomBtn.addEventListener('click', () => {
        if (distribucionActual) {
            generarNumeros();
        }
    });

    // Botón "Ver estadísticas"
    statsBtn.addEventListener('click', () => {
        experimentalProbabilities.style.display = 
            experimentalProbabilities.style.display === 'none' ? 'block' : 'none';
        resultGraph.style.display = 
            resultGraph.style.display === 'none' ? 'block' : 'none';
    });

    // Botón "Reiniciar"
    resetBtn.addEventListener('click', () => {
        datos = [];
        distribucionActual = null;
        resultadoSection.style.display = 'none';
        experimentalProbabilities.style.display = 'none';
        resultGraph.style.display = 'none';
        experimentalBody.innerHTML = '';
    });

    // Función de generación principal
    function generarNumeros() {
        if (!distribucionActual) return;
        
        datos = [];
        for (let i = 0; i < 100; i++) {
            switch (distribucionActual) {
                case 'uniforme':
                    datos.push(generarUniforme(0, 10));  // Uniforme entre 0 y 10
                    break;
                case 'gaussiana':
                    datos.push(generarGaussiana(5, 2));  // Media=5, Desv=2
                    break;
                case 'exponencial':
                    datos.push(generarExponencial(0.5)); // Lambda=0.5
                    break;
                default:
                    datos.push(0);
            }
        }
        mostrarResultados();
    }

// Función para mostrar resultados y estadísticas
function mostrarResultados() {
    resultadoElement.textContent = 'Números generados';
    resultadoSection.style.display = 'block';

    const media = datos.reduce((a, b) => a + b, 0) / datos.length;
    const varianza = datos.reduce((a, b) => a + Math.pow(b - media, 2), 0) / datos.length;
    
    const numBins = 10;
    const min = Math.min(...datos);
    const max = Math.max(...datos);
    const binWidth = (max - min) / numBins;
    
    const bins = Array(numBins).fill(0);
    const binRanges = [];
    
    for (let i = 0; i < numBins; i++) {
        binRanges.push({
            start: min + i * binWidth,
            end: min + (i + 1) * binWidth
        });
    }
    
    datos.forEach(valor => {
        for (let i = 0; i < numBins; i++) {
            if (valor >= binRanges[i].start && valor < binRanges[i].end) {
                bins[i]++;
                break;
            }
            if (i === numBins - 1 && valor >= binRanges[i].end) {
                bins[i]++;
            }
        }
    });

    // Calcular densidad de probabilidad teórica
    const densidadesTeoricas = calcularDensidadTeorica(distribucionActual, binRanges);
    
    // Mostrar tabla
    experimentalBody.innerHTML = '';
    for (let i = 0; i < numBins; i++) {
        const row = document.createElement('tr');

        const tdIntervalo = document.createElement('td');
        const tdFrecuencia = document.createElement('td');
        const tdProbExp = document.createElement('td');
        const tdProbTeo = document.createElement('td');
        const tdError = document.createElement('td');

        const probExperimental = (bins[i] / datos.length) * 100;
        const probTeorica = densidadesTeoricas[i] * 100;
        const error = Math.abs(probExperimental - probTeorica);

        const start = binRanges[i].start.toFixed(2);
        const end = binRanges[i].end.toFixed(2);
        
        tdIntervalo.textContent = `[${start}, ${end})`;
        tdFrecuencia.textContent = bins[i];
        tdProbExp.textContent = probExperimental.toFixed(1) + '%';
        tdProbTeo.textContent = probTeorica.toFixed(1) + '%';
        tdError.textContent = error.toFixed(1) + '%';

        row.appendChild(tdIntervalo);
        row.appendChild(tdFrecuencia);
        row.appendChild(tdProbExp);
        row.appendChild(tdProbTeo);
        row.appendChild(tdError);
        experimentalBody.appendChild(row);
    }

    const statsRow = document.createElement('tr');
    statsRow.innerHTML = `<td colspan="5"><strong>Media:</strong> ${media.toFixed(2)} | <strong>Varianza:</strong> ${varianza.toFixed(2)}</td>`;
    experimentalBody.appendChild(statsRow);

    experimentalProbabilities.style.display = 'block';

    // Graficar con comparativa teórica
    graficar(binRanges, bins, densidadesTeoricas);
}

// Función para calcular densidad teórica
function calcularDensidadTeorica(distribucion, bins) {
    const densidades = [];
    
    switch(distribucion) {
        case 'uniforme':
            // Uniforme(0, 10) - densidad constante
            const densidadUnif = 1 / (10 - 0);
            bins.forEach(() => densidades.push(densidadUnif * (bins[0].end - bins[0].start)));
            break;
            
        case 'gaussiana':
            // Gaussiana(μ=5, σ=2)
            bins.forEach(bin => {
                // Aproximar probabilidad con la regla del trapecio
                const prob = normalCDF(bin.end, 5, 2) - normalCDF(bin.start, 5, 2);
                densidades.push(prob);
            });
            break;
            
        case 'exponencial':
            // Exponencial(λ=0.5)
            bins.forEach(bin => {
                const prob = exponencialCDF(bin.end, 0.5) - exponencialCDF(bin.start, 0.5);
                densidades.push(prob);
            });
            break;
    }
    
    return densidades;
}

// Funciones auxiliares para distribuciones continuas
function normalCDF(x, mean = 0, std = 1) {
    return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
}

function erf(x) {
    // Aproximación de la función error
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = (x >= 0) ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

function exponencialCDF(x, lambda) {
    return 1 - Math.exp(-lambda * x);
}

// Modificar función de graficar para mostrar comparativa
function graficar(binRanges, bins, densidadesTeoricas) {
    const binCenters = binRanges.map(bin => (bin.start + bin.end) / 2);
    const binLabels = binRanges.map(bin => `[${bin.start.toFixed(2)}-${bin.end.toFixed(2)})`);
    
    // Frecuencias experimentales (%)
    const expFreq = bins.map(count => (count / datos.length) * 100);
    
    // Densidades teóricas (%)
    const teoDens = densidadesTeoricas.map(d => d * 100);
    
    const expData = {
        x: binLabels,
        y: expFreq,
        name: 'Experimental',
        type: 'bar',
        marker: {color: '#1f77b4'}
    };
    
    const teoData = {
        x: binLabels,
        y: teoDens,
        name: 'Teórica',
        type: 'scatter',
        mode: 'lines+markers',
        line: {color: '#ff7f0e', width: 3},
        marker: {size: 8}
    };
    
    const layout = {
        title: 'Distribución de Frecuencias',
        width: 800,
        height: 500,
        yaxis: {title: 'Probabilidad (%)'},
        xaxis: {title: 'Intervalo', tickangle: -45},
        barmode: 'group',
        legend: {orientation: 'h', y: -0.2}
    };

    Plotly.newPlot('probability-graph', [expData, teoData], layout);
    resultGraph.style.display = 'block';
}

    // Funciones de generación

    function generarUniforme(min, max) {
        return Math.random() * (max - min) + min;
    }

    function generarGaussiana(media, desviacion) {
        // Método de Box-Muller
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return media + desviacion * normal;
    }

    function generarExponencial(lambda) {
        return -Math.log(1.0 - Math.random()) / lambda;
    }
});