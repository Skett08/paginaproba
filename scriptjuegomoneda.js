document.addEventListener('DOMContentLoaded', function() {
    const flipBtn = document.getElementById('flip-btn');
        const randomBtn = document.getElementById('random-btn');
    const statsBtn = document.getElementById('stats-btn');
    const resetBtn = document.getElementById('reset-btn');
    const moneda = document.getElementById('moneda');
    const resultadoSection = document.getElementById('resultado-section');
    const resultadoElement = document.getElementById('resultado');
    const experimentalProbabilities = document.getElementById('experimental-probabilities');
    const resultGraph = document.getElementById('result-graph');
    
    // Variables para estadísticas
    let estadisticas = {
        cara: 0,
        cruz: 0,
        total: 0
    };
    
    // Función para lanzar la moneda
flipBtn.addEventListener('click', function() {
    // Simulación de una variable de Bernoulli (0 o 1)
    const esCara = Math.random() < 0.5;
    
    // Mostrar el resultado
    if (esCara) {
        resultadoElement.textContent = 'Resultado: Cara';
        estadisticas.cara++;
    } else {
        resultadoElement.textContent = 'Resultado: Cruz';
        estadisticas.cruz++;
    }
    
    // Actualizar el contador total
    estadisticas.total++;
    
    // Mostrar el resultado
    resultadoSection.style.display = 'block';
    
    // Actualizar las estadísticas
    actualizarEstadisticas();
    
    // Agregar animación de rotación
    moneda.classList.add('flipping');
    
    // Reiniciar la animación para el próximo lanzamiento
    setTimeout(() => {
        moneda.classList.remove('flipping');
    }, 1000);
    });
    
    // Función para actualizar las estadísticas
    function actualizarEstadisticas() {
        // Actualizar la tabla de distribución experimental
        const experimentalBody = document.getElementById('experimental-body');
        experimentalBody.innerHTML = '';
        
        // Crear una fila para Cara
        const caraRow = document.createElement('tr');
        const caraRes = document.createElement('td');
        const caraFreq = document.createElement('td');
        const caraProb = document.createElement('td');
        
        caraRes.textContent = 'Cara';
        caraFreq.textContent = estadisticas.cara;
        caraProb.textContent = (estadisticas.total > 0) ? 
            ((estadisticas.cara / estadisticas.total) * 100).toFixed(1) + '%' : '0%';
        
        caraRow.appendChild(caraRes);
        caraRow.appendChild(caraFreq);
        caraRow.appendChild(caraProb);
        experimentalBody.appendChild(caraRow);
        
        // Crear una fila para Cruz
        const cruzRow = document.createElement('tr');
        const cruzRes = document.createElement('td');
        const cruzFreq = document.createElement('td');
        const cruzProb = document.createElement('td');
        
        cruzRes.textContent = 'Cruz';
        cruzFreq.textContent = estadisticas.cruz;
        cruzProb.textContent = (estadisticas.total > 0) ? 
            ((estadisticas.cruz / estadisticas.total) * 100).toFixed(1) + '%' : '0%';
        
        cruzRow.appendChild(cruzRes);
        cruzRow.appendChild(cruzFreq);
        cruzRow.appendChild(cruzProb);
        experimentalBody.appendChild(cruzRow);
        
        // Mostrar la sección de probabilidades experimentales
        experimentalProbabilities.style.display = 'block';
        
        // Actualizar el gráfico
        actualizarGrafico();
    }
    
 randomBtn.addEventListener('click', function() {
        // Reiniciar estadísticas actuales
        estadisticas = {
            cara: 0,
            cruz: 0,
            total: 0
        };
        
        // Generar 100 intentos
        for (let i = 0; i < 100; i++) {
            const esCara = Math.random() < 0.5;
            
            if (esCara) {
                estadisticas.cara++;
            } else {
                estadisticas.cruz++;
            }
            
            estadisticas.total++;
        }
        
        // Mostrar el resultado
        resultadoElement.textContent = 'Resultado: Generados 100 intentos aleatorios';
        resultadoSection.style.display = 'block';
        
        // Actualizar las estadísticas y el gráfico
        actualizarEstadisticas();
    });


    // Función para actualizar el gráfico
    function actualizarGrafico() {
        // Preparar los datos
        const labels = ['Cara', 'Cruz'];
        const values = [estadisticas.cara, estadisticas.cruz];
        const probabilities = values.map(value => (value / (estadisticas.total || 1)) * 100);
        
        // Crear los datos para el gráfico de barras
        const barData = {
            x: labels,
            y: probabilities,
            type: 'bar',
            marker: {
                color: ['#7b68ee', '#4b0082']
            },
            text: probabilities.map(prob => `${prob.toFixed(1)}%`),
            textposition: 'auto'
        };
        
        // Layout del gráfico
        const layout = {
            title: 'Distribución de Resultados',
            width: 600,
            height: 400,
            yaxis: {
                title: 'Probabilidad (%)'
            },
            xaxis: {
                title: 'Resultado'
            }
        };
        
        // Mostrar el gráfico
        Plotly.newPlot('probability-graph', [barData], layout);
        resultGraph.style.display = 'block';
    }
    
    // Función para mostrar/ocultar estadísticas
    statsBtn.addEventListener('click', function() {
        experimentalProbabilities.style.display = 
            experimentalProbabilities.style.display === 'none' ? 'block' : 'none';
        resultGraph.style.display = 
            resultGraph.style.display === 'none' ? 'block' : 'none';
    });
    
    // Función para resetear el juego
    resetBtn.addEventListener('click', function() {
        // Reiniciar estadísticas
        estadisticas = {
            cara: 0,
            cruz: 0,
            total: 0
        };
        
        // Ocultar el resultado
        resultadoSection.style.display = 'none';
        
        // Ocultar las estadísticas y el gráfico
        experimentalProbabilities.style.display = 'none';
        resultGraph.style.display = 'none';
        
        // Actualizar la tabla y el gráfico
        actualizarEstadisticas();
    });
});