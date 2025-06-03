document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const extractBtn = document.getElementById('extract-btn');
    const extractedBallsDiv = document.getElementById('extracted-balls');
    const urna = document.getElementById('urna');
    const allBalls = document.querySelectorAll('.pelota');
    const resultGraph = document.getElementById('result-graph');
    const experimentalBody = document.getElementById('experimental-body');
    const experimentalProbs = document.getElementById('experimental-probabilities');
    
    // Variables del juego
    let extractions = 0;
    const results = {
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0
    };
    
    // Probabilidades teóricas
    const theoreticalProbabilities = {
        3: 1/6,
        4: 1/6,
        5: 1/3,
        6: 1/6,
        7: 1/6
    };
    
    // Event listener
    extractBtn.addEventListener('click', extractBalls);
    
    function extractBalls() {
        // Cambiar el texto del botón a "Intentar de nuevo" después del primer clic
        if (extractBtn.textContent === "Empezar") {
            extractBtn.textContent = "Intentar de nuevo";
        }
        
        // Deshabilitar el botón durante la extracción
        extractBtn.disabled = true;
        
        // Ocultar todas las pelotas en la urna y mostrar la animación de rotación
        allBalls.forEach(ball => {
            ball.style.visibility = 'visible';
            ball.classList.add('rolling');
        });
        
        // Seleccionar 2 pelotas al azar
        const balls = Array.from(allBalls);
        const shuffled = [...balls].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 2);
        
        // Detener la animación de rotación después de un breve período de tiempo
        setTimeout(() => {
            // Detener la animación de rotación
            allBalls.forEach(ball => {
                ball.classList.remove('rolling');
            });
            
            // Mostrar las pelotas seleccionadas
            extractedBallsDiv.innerHTML = '';
            
            selected.forEach((ball, index) => {
                setTimeout(() => {
                    const ballClone = ball.cloneNode(true);
                    ballClone.classList.add('extracted');
                    extractedBallsDiv.appendChild(ballClone);
                    
                    // Mostrar la pelota en la urna
                    ball.style.visibility = 'hidden';
                    
                    if (index === 1) {
                        // Actualizar resultados
                        const sum = parseInt(selected[0].dataset.num) + parseInt(selected[1].dataset.num);
                        results[sum]++;
                        extractions++;
                        
                        // Actualizar y mostrar el gráfico de resultados
                        updateProbabilityGraph();
                        resultGraph.style.display = 'block'; // Mostrar el contenedor del gráfico
                        
                        // Actualizar las probabilidades experimentales
                        updateExperimentalProbabilities();
                        
                        // Mostrar la sección experimental solo después de la primera extracción
                        if (extractions > 0) {
                            experimentalProbs.style.display = 'block';
                        }
                        
                        // Habilitar el botón de nuevo
                        extractBtn.disabled = false;
                    }
                }, index * 500);
            });
        }, 1000); // Tiempo en milisegundos para la animación de rotación
    }
    
    function updateProbabilityGraph() {
        const sums = Object.keys(theoreticalProbabilities).map(Number);
        const theoreticalValues = sums.map(sum => theoreticalProbabilities[sum] * 100);
        const experimentalValues = sums.map(sum => (results[sum] / (extractions || 1)) * 100);
        
        const traceTheoretical = {
            x: sums,
            y: theoreticalValues,
            type: 'bar',
            name: 'Probabilidad Teórica',
            marker: {
                color: '#3498db'
            }
        };
        
        const traceExperimental = {
            x: sums,
            y: experimentalValues,
            type: 'bar',
            name: 'Probabilidad Experimental',
            marker: {
                color: '#e74c3c'
            }
        };
        
        const data = [traceTheoretical, traceExperimental];
        
        const layout = {
            title: 'Resultado de la Extracción',
            xaxis: {
                title: 'Suma de Pelotas',
                dtick: 1
            },
            yaxis: {
                title: 'Probabilidad (%)'
            },
            barmode: 'group'
        };
        
        Plotly.newPlot('probability-graph', data, layout);
    }
    
    function updateExperimentalProbabilities() {
        experimentalBody.innerHTML = '';
        
        const sums = Object.keys(theoreticalProbabilities).map(Number);
        
        sums.forEach(sum => {
            const probability = (results[sum] / (extractions || 1)) * 100;
            const row = document.createElement('tr');
            
            const sumCell = document.createElement('td');
            sumCell.textContent = sum;
            
            const probCell = document.createElement('td');
            probCell.textContent = `${probability.toFixed(1)}% (${results[sum]} de ${extractions})`;
            
            row.appendChild(sumCell);
            row.appendChild(probCell);
            experimentalBody.appendChild(row);
        });
    }
});