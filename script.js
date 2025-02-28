document.addEventListener("DOMContentLoaded", () => {
    const calcularBtn = document.getElementById("calcular");
    const inputNumeros = document.getElementById("numeros");
    const resultados = document.querySelector(".resultados");
    const resultadosTitulo = document.querySelector(".resultados-titulo");
    const tipoGraficaSelect = document.getElementById("tipoGrafica");

    function calcularResultados() {
        const numeros = inputNumeros.value.split(" ")
            .map(num => parseFloat(num.trim()))
            .filter(num => !isNaN(num));

        if (numeros.length === 0) {
            alert("¡Solamente se admiten números!");
            return;
        }

        numeros.sort((a, b) => a - b);

        const media = numeros.reduce((a, b) => a + b, 0) / numeros.length;
        const mediana = calcularMediana(numeros);
        const moda = calcularModa(numeros);
        const varianza = calcularVarianza(numeros, media);
        const desviacion = Math.sqrt(varianza);
        const q1 = calcularCuartil(numeros, 0.25);
        const q2 = mediana;
        const q3 = calcularCuartil(numeros, 0.75);
        const sesgo = calcularSesgo(numeros, media, desviacion);
        const curtosis = calcularCurtosis(numeros, media, desviacion);

        document.getElementById("media").textContent = media.toFixed(2);
        document.getElementById("moda").textContent = moda;
        document.getElementById("mediana").textContent = mediana;
        document.getElementById("varianza").textContent = varianza.toFixed(2);
        document.getElementById("desviacion").textContent = desviacion.toFixed(2);
        document.getElementById("q1").textContent = q1.toFixed(2);
        document.getElementById("q2").textContent = q2.toFixed(2);
        document.getElementById("q3").textContent = q3.toFixed(2);
        document.getElementById("sesgo").textContent = sesgo.toFixed(2);
        document.getElementById("curtosis").textContent = curtosis.toFixed(2);

        resultados.style.display = "block";
        resultadosTitulo.style.display = "block";

        const tipoGrafica = tipoGraficaSelect.value;

        // Seleccionar la función de Plotly según la opción elegida
        if (tipoGrafica === "caja y bigote") {
            generarBoxPlotPlotly(numeros);
        } else if (tipoGrafica === "histograma") {
            generarHistogramaPlotly(numeros);
        } else if (tipoGrafica === "xy") {
            generarXYPlotly(numeros);
        } else if (tipoGrafica === "tendencia") {
            generarTendenciaPlotly(numeros);
        } else {
            alert("Opción no válida. Inténtalo de nuevo.");
        }
    }

    if (calcularBtn) {
        calcularBtn.addEventListener("click", calcularResultados);
    }

    inputNumeros.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            calcularResultados();
        }
    });
});

// Funciones de cálculo estadístico (se mantienen igual)
function calcularMediana(arr) {
    const mitad = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mitad - 1] + arr[mitad]) / 2 : arr[mitad];
}

function calcularModa(arr) {
    const frecuencia = {};
    arr.forEach(num => frecuencia[num] = (frecuencia[num] || 0) + 1);
    const maxFrecuencia = Math.max(...Object.values(frecuencia));
    const modas = Object.keys(frecuencia).filter(num => frecuencia[num] === maxFrecuencia);
    return modas.length === arr.length ? "No hay moda" : modas.join(", ");
}

function calcularVarianza(arr, media) {
    return arr.reduce((sum, num) => sum + Math.pow(num - media, 2), 0) / arr.length;
}

function calcularCuartil(arr, percentil) {
    const posicion = percentil * (arr.length - 1);
    const base = Math.floor(posicion);
    const resto = posicion - base;
    if (base + 1 < arr.length) {
        return arr[base] + resto * (arr[base + 1] - arr[base]);
    } else {
        return arr[base];
    }
}

function calcularSesgo(arr, media, desviacion) {
    const n = arr.length;
    const sesgo = arr.reduce((sum, num) => sum + Math.pow((num - media) / desviacion, 3), 0) *
        (n / ((n - 1) * (n - 2)));
    return sesgo;
}

function calcularCurtosis(arr, media, desviacion) {
    const n = arr.length;
    const curtosis = arr.reduce((sum, num) => sum + Math.pow((num - media) / desviacion, 4), 0) *
        (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) -
        (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    return curtosis;
}

// Gráfica de Caja y Bigote con Plotly
function generarBoxPlotPlotly(datos) {
    var trace = {
        y: datos,
        type: 'box',
        name: 'Datos',
        marker: { color: 'rgba(255,99,132,0.6)' }
    };

    var layout = {
        title: 'Gráfica de Caja y Bigote',
        autosize: true,
        width: 600,
        height: 400,
        margin: { l: 50, r: 50, b: 50, t: 50 }
    };

    Plotly.newPlot('grafico', [trace], layout);
}

// Gráfica de Histograma con Plotly
function generarHistogramaPlotly(datos) {
    var trace = {
        x: datos,
        type: 'histogram',
        marker: { color: 'rgba(75,192,192,0.6)' }
    };

    var layout = {
        title: 'Histograma',
        autosize: true,
        width: 600,
        height: 400,
        margin: { l: 50, r: 50, b: 50, t: 50 }
    };

    Plotly.newPlot('grafico', [trace], layout);
}

// Gráfica XY (Scatter) con Plotly
function generarXYPlotly(datos) {
    const indices = datos.map((_, index) => index + 1);
    var trace = {
        x: indices,
        y: datos,
        mode: 'markers',
        type: 'scatter',
        marker: { color: 'rgba(54,162,235,0.6)', size: 8 },
        name: 'Datos'
    };

    var layout = {
        title: 'Gráfico XY',
        xaxis: { title: 'Índice' },
        yaxis: { title: 'Valor' },
        autosize: true,
        width: 600,
        height: 400,
        margin: { l: 50, r: 50, b: 50, t: 50 }
    };

    Plotly.newPlot('grafico', [trace], layout);
}

// Gráfica de Tendencia (Línea) con Plotly
function generarTendenciaPlotly(datos) {
    const indices = datos.map((_, index) => index + 1);
    var trace = {
        x: indices,
        y: datos,
        mode: 'lines+markers',
        type: 'scatter',
        line: { color: 'rgba(255,206,86,1)' },
        marker: { color: 'rgba(255,206,86,0.6)', size: 8 },
        name: 'Tendencia'
    };

    var layout = {
        title: 'Tendencia',
        xaxis: { title: 'Índice' },
        yaxis: { title: 'Valor' },
        autosize: true,
        width: 600,
        height: 400,
        margin: { l: 50, r: 50, b: 50, t: 50 }
    };

    Plotly.newPlot('grafico', [trace], layout);
}
