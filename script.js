document.addEventListener("DOMContentLoaded", () => {
    const calcularBtn = document.getElementById("calcular");
    const inputNumeros = document.getElementById("numeros");
    const resultados = document.querySelector(".resultados");
    const resultadosTitulo = document.querySelector(".resultados-titulo");

    function calcularResultados() {
        const numeros = inputNumeros.value.split(" ").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));

        if (numeros.length === 0) {
            alert("Por favor, ingresa números válidos.");
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
        document.getElementById("sesgo").textContent = sesgo.toFixed(2);  // Mostrar sesgo
        document.getElementById("curtosis").textContent = curtosis.toFixed(2);  // Mostrar curtosis

        resultados.style.display = "block";
        resultadosTitulo.style.display = "block";
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
