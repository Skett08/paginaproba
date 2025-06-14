document.addEventListener('DOMContentLoaded', function () {
    const randomBtn = document.getElementById('random-btn');
    const statsBtn = document.getElementById('stats-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultadoSection = document.getElementById('resultado-section');
    const resultadoElement = document.getElementById('resultado');
    const experimentalProbabilities = document.getElementById('experimental-probabilities');
    const resultGraph = document.getElementById('result-graph');
    const experimentalBody = document.getElementById('experimental-body');
    
    // Nuevo elemento para mostrar la distribución seleccionada
    const distribucionInfo = document.createElement('div');
    distribucionInfo.id = 'distribucion-info';
    distribucionInfo.style.margin = '15px 0';
    distribucionInfo.style.fontWeight = 'bold';
    distribucionInfo.style.color = '#1a2a6c';
    distribucionInfo.innerHTML = 'Distribución seleccionada: <span id="dist-seleccionada">Ninguna</span>';
    resultadoSection.parentNode.insertBefore(distribucionInfo, resultadoSection);

    let datos = [];
    let distribucionActual = null;

    // Funciones globales para los botones - SOLO SELECCIONAN LA DISTRIBUCIÓN
    window.generarBernoulli = function() {
        distribucionActual = 'bernoulli';
        actualizarDistribucionSeleccionada('Bernoulli');
    };
    
    window.generarBinomial = function() {
        distribucionActual = 'binomial';
        actualizarDistribucionSeleccionada('Binomial');
    };
    
    window.generarBinomialNegativa = function() {
        distribucionActual = 'binomial_negativa';
        actualizarDistribucionSeleccionada('Binomial Negativa');
    };
    
    window.generarGamma = function() {
        distribucionActual = 'gamma';
        actualizarDistribucionSeleccionada('Gamma');
    };
    
    window.generarPoisson = function() {
        distribucionActual = 'poisson';
        actualizarDistribucionSeleccionada('Poisson');
    };
    
    window.generarGeometrica = function() {
        distribucionActual = 'geometrica';
        actualizarDistribucionSeleccionada('Geométrica');
    };
    
    window.generarHipergeometrica = function() {
        distribucionActual = 'hipergeometrica';
        actualizarDistribucionSeleccionada('Hipergeométrica');
    };

    // Función para actualizar la visualización de la distribución seleccionada
    function actualizarDistribucionSeleccionada(nombre) {
        document.getElementById('dist-seleccionada').textContent = nombre;
        
        // Resaltar el botón seleccionado
        document.querySelectorAll('.btn-dist').forEach(btn => {
            btn.style.opacity = '0.7';
            btn.style.transform = 'none';
        });
        
        // Resaltar el botón actual
        event.currentTarget.style.opacity = '1';
        event.currentTarget.style.transform = 'scale(1.05)';
    }

    // Botón "Generar números" - ÚNICO PUNTO DE GENERACIÓN
    randomBtn.addEventListener('click', () => {
        if (!distribucionActual) {
            alert('Por favor, seleccione una distribución primero');
            return;
        }
        
        generarNumeros();
    });

    // Botón "Ver estadísticas"
    statsBtn.addEventListener('click', () => {
        if (datos.length === 0) {
            alert('Primero debe generar números aleatorios');
            return;
        }
        
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
        document.getElementById('dist-seleccionada').textContent = 'Ninguna';
        
        // Restaurar estilo de botones
        document.querySelectorAll('.btn-dist').forEach(btn => {
            btn.style.opacity = '1';
            btn.style.transform = 'none';
        });
    });

    // Función de generación principal
    function generarNumeros() {
        if (!distribucionActual) return;
        
        datos = [];
        for (let i = 0; i < 100; i++) {
            switch (distribucionActual) {
                case 'bernoulli':
                    datos.push(Math.random() < 0.3 ? 1 : 0);
                    break;
                case 'binomial':
                    datos.push(generarBinomial(10, 0.5));
                    break;
                case 'binomial_negativa':
                    datos.push(generarBinomialNegativa(5, 0.5));
                    break;
                case 'gamma':
                    datos.push(generarGamma(2, 2));
                    break;
                case 'poisson':
                    datos.push(generarPoisson(3));
                    break;
                case 'geometrica':
                    datos.push(generarGeometrica(0.2));
                    break;
                case 'hipergeometrica':
                    datos.push(generarHipergeometrica(30, 10, 5));
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

    // Calcular frecuencias
    const freq = {};
    datos.forEach(v => freq[v] = (freq[v] || 0) + 1);

    // Calcular media y varianza
    const media = datos.reduce((a, b) => a + b, 0) / datos.length;
    const varianza = datos.reduce((a, b) => a + Math.pow(b - media, 2), 0) / datos.length;

    // Calcular probabilidades teóricas
    const probTeoricas = calcularProbabilidadesTeoricas(distribucionActual);

    // Mostrar tabla
    experimentalBody.innerHTML = '';
    for (const [valor, conteo] of Object.entries(freq)) {
        const row = document.createElement('tr');

        const tdValor = document.createElement('td');
        const tdFrecuencia = document.createElement('td');
        const tdProbExp = document.createElement('td');
        const tdProbTeo = document.createElement('td');
        const tdError = document.createElement('td');

        const probExperimental = (conteo / datos.length) * 100;
        const probTeorica = (probTeoricas[valor] || 0) * 100;
        const error = Math.abs(probExperimental - probTeorica);

        tdValor.textContent = valor;
        tdFrecuencia.textContent = conteo;
        tdProbExp.textContent = probExperimental.toFixed(1) + '%';
        tdProbTeo.textContent = probTeorica.toFixed(1) + '%';
        tdError.textContent = error.toFixed(1) + '%';

        row.appendChild(tdValor);
        row.appendChild(tdFrecuencia);
        row.appendChild(tdProbExp);
        row.appendChild(tdProbTeo);
        row.appendChild(tdError);
        experimentalBody.appendChild(row);
    }

    // Agregar media y varianza
    const statsRow = document.createElement('tr');
    statsRow.innerHTML = `<td colspan="5"><strong>Media:</strong> ${media.toFixed(2)} | <strong>Varianza:</strong> ${varianza.toFixed(2)}</td>`;
    experimentalBody.appendChild(statsRow);

    experimentalProbabilities.style.display = 'block';

    // Graficar
    graficar(freq, probTeoricas);
}

// Nueva función para calcular probabilidades teóricas
function calcularProbabilidadesTeoricas(distribucion) {
    const probs = {};
    
    switch(distribucion) {
        case 'bernoulli':
            probs['0'] = 0.7;  // P(X=0)
            probs['1'] = 0.3;  // P(X=1)
            break;
            
        case 'binomial':
            // Binomial(10, 0.5)
            for(let i = 0; i <= 10; i++) {
                const comb = factorial(10) / (factorial(i) * factorial(10 - i));
                probs[i] = comb * Math.pow(0.5, i) * Math.pow(0.5, 10 - i);
            }
            break;
            
        case 'binomial_negativa':
            // Binomial negativa(5, 0.5)
            for(let i = 5; i <= 30; i++) { // Valores posibles desde r hasta un límite razonable
                const comb = factorial(i - 1) / (factorial(5 - 1) * factorial(i - 5));
                probs[i] = comb * Math.pow(0.5, 5) * Math.pow(0.5, i - 5);
            }
            break;
            
        case 'poisson':
            // Poisson(λ=3)
            for(let i = 0; i <= 15; i++) { // Valores desde 0 hasta 15
                probs[i] = (Math.pow(3, i) * Math.exp(-3)) / factorial(i);
            }
            break;
            
        case 'geometrica':
            // Geométrica(p=0.2)
            for(let i = 1; i <= 20; i++) { // Valores desde 1 hasta 20
                probs[i] = Math.pow(1 - 0.2, i - 1) * 0.2;
            }
            break;
            
        case 'hipergeometrica':
            // Hipergeométrica(N=30, K=10, n=5)
            for(let i = 0; i <= 5; i++) { // Valores desde 0 hasta n=5
                const num = combinacion(10, i) * combinacion(20, 5 - i);
                const den = combinacion(30, 5);
                probs[i] = num / den;
            }
            break;
            
        // Agregar otros casos según sea necesario
    }
    
    return probs;
}

// Funciones auxiliares para cálculos combinatorios
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function combinacion(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    return factorial(n) / (factorial(k) * factorial(n - k));
}

// Modificar función de graficar para mostrar ambas distribuciones
function graficar(frecuencias, probTeoricas) {
    const valores = Object.keys(frecuencias).map(Number).sort((a, b) => a - b);
    
    // Datos experimentales
    const expData = {
        x: valores,
        y: valores.map(v => (frecuencias[v] / datos.length) * 100),
        name: 'Experimental',
        type: 'bar',
        marker: {color: '#7b68ee'},
        text: valores.map(v => ((frecuencias[v] / datos.length) * 100).toFixed(1) + '%'),
        textposition: 'auto'
    };
    
    // Datos teóricos
    const teoData = {
        x: valores,
        y: valores.map(v => (probTeoricas[v] || 0) * 100),
        name: 'Teórica',
        type: 'scatter',
        mode: 'lines+markers',
        line: {color: '#ff6347', width: 3},
        marker: {size: 8}
    };
    
    const layout = {
        title: 'Distribución de Frecuencias',
        width: 700,
        height: 450,
        yaxis: {title: 'Probabilidad (%)'},
        xaxis: {title: 'Valor'},
        barmode: 'group',
        legend: {orientation: 'h', y: -0.2}
    };

    Plotly.newPlot('probability-graph', [expData, teoData], layout);
    resultGraph.style.display = 'block';
}

    // Funciones de generación (sin cambios)
    function generarBinomial(n, p) {
        let x = 0;
        for (let i = 0; i < n; i++) {
            if (Math.random() < p) x++;
        }
        return x;
    }

    function generarBinomialNegativa(r, p) {
        let x = 0, éxitos = 0;
        while (éxitos < r) {
            if (Math.random() < p) {
                éxitos++;
            }
            x++;
        }
        return x;
    }

    function generarGamma(k, theta) {
        // Método de Marsaglia y Tsang para k > 1
        if (k < 1) {
            const u = Math.random();
            return generarGamma(1 + k, theta) * Math.pow(u, 1 / k);
        }

        const d = k - 1 / 3;
        const c = 1 / Math.sqrt(9 * d);
        let x, v, u;

        while (true) {
            do {
                x = normalRandom();
                v = 1 + c * x;
            } while (v <= 0);
            v = v * v * v;
            u = Math.random();
            if (u < 1 - 0.0331 * x * x * x * x) return d * v * theta;
            if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v * theta;
        }
    }

    function generarPoisson(lambda) {
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
            k++;
            p *= Math.random();
        } while (p > L);
        return k - 1;
    }

    function generarGeometrica(p) {
        return Math.ceil(Math.log(1 - Math.random()) / Math.log(1 - p));
    }

    function generarHipergeometrica(N, K, n) {
        // N: total población, K: éxitos en población, n: tamaño muestra
        let x = 0;
        let k = K;
        let nRest = n;
        let Nrest = N;

        for (let i = 0; i < n; i++) {
            if (Math.random() < k / Nrest) {
                x++;
                k--;
            }
            Nrest--;
        }
        return x;
    }

    function normalRandom() {
        // Box-Muller
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }
});