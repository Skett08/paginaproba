document.addEventListener("DOMContentLoaded", () => {
    const calcularBtn = document.getElementById("calcular");
    const inputNumeros = document.getElementById("numeros");
    const resultados = document.querySelector(".resultados");
    const resultadosTitulo = document.querySelector(".resultados-titulo");
    const tipoGraficaSelect = document.getElementById("tipoGrafica");
    let chartInstance = null;

    function calcularResultados() {
        const numeros = inputNumeros.value.split(" ").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));

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
        const ctx = document.getElementById("grafico").getContext("2d");

        if (chartInstance) {
            chartInstance.destroy();
        }

        switch (tipoGrafica) {
            case "histograma":
                chartInstance = generarHistograma(ctx, numeros);
                break;
            case "caja y bigote":
                chartInstance = generarBoxPlot(ctx, numeros);
                break;
            case "xy":
                chartInstance = generarXY(ctx, numeros);
                break;
            case "tendencia":
                chartInstance = generarTendencia(ctx, numeros);
                break;
            default:
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
    const sesgo = arr.reduce((sum, num) => sum + Math.pow((num - media) / desviacion, 3), 0) * (n / ((n - 1) * (n - 2)));
    return sesgo;
}

function calcularCurtosis(arr, media, desviacion) {
    const n = arr.length;
    const curtosis = arr.reduce((sum, num) => sum + Math.pow((num - media) / desviacion, 4), 0) * (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3)) - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    return curtosis;
}

function generarHistograma(ctx, datos) {
    return new Chart(ctx, {
        type: "bar",
        data: {
            labels: [...new Set(datos)].sort((a, b) => a - b),
            datasets: [{
                label: "Frecuencia",
                data: [...new Set(datos)].map(val => datos.filter(num => num === val).length),
                backgroundColor: "rgba(75, 192, 192, 0.6)"
            }]
        }
    });
}

function generarBoxPlot(ctx, datos) {
    datos.sort((a, b) => a - b);
    return new Chart(ctx, {
        type: "boxplot",
        data: {
            labels: ["Datos"],
            datasets: [{
                label: "Caja y Bigote",
                data: [{
                    min: Math.min(...datos),
                    q1: calcularCuartil(datos, 0.25),
                    median: calcularMediana(datos),
                    q3: calcularCuartil(datos, 0.75),
                    max: Math.max(...datos)
                }],
                backgroundColor: "rgba(255, 99, 132, 0.6)"
            }]
        }
    });
}

function generarXY(ctx, datos) {
    return new Chart(ctx, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Puntos XY",
                data: datos.map((num, index) => ({ x: index + 1, y: num })),
                backgroundColor: "rgba(54, 162, 235, 0.6)"
            }]
        }
    });
}

function generarTendencia(ctx, datos) {
    return new Chart(ctx, {
        type: "line",
        data: {
            labels: datos.map((_, index) => index + 1),
            datasets: [{
                label: "Tendencia",
                data: datos,
                borderColor: "rgba(255, 206, 86, 1)",
                backgroundColor: "rgba(255, 206, 86, 0.2)",
                fill: true
            }]
        }
    });
}
