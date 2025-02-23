document.addEventListener("DOMContentLoaded", () => {
    const calcularBtn = document.getElementById("calcular");
    const inputNumeros = document.getElementById("numeros");
    const resultados = document.querySelector(".resultados");
    const resultadosTitulo = document.querySelector(".resultados-titulo");

    // Función que se ejecuta al presionar el botón o Enter
    function calcularResultados() {
        const numeros = inputNumeros.value.split(" ").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));

        if (numeros.length === 0) {
            alert("Por favor, ingresa números válidos.");
            return;
        }

        // Cálculo de medidas estadísticas
        const media = numeros.reduce((a, b) => a + b, 0) / numeros.length;
        const mediana = calcularMediana(numeros);
        const moda = calcularModa(numeros);
        const varianza = calcularVarianza(numeros, media);
        const desviacion = Math.sqrt(varianza);

        // Mostrar resultados
        document.getElementById("media").textContent = media.toFixed(2);
        document.getElementById("moda").textContent = moda;
        document.getElementById("mediana").textContent = mediana;
        document.getElementById("varianza").textContent = varianza.toFixed(2);
        document.getElementById("desviacion").textContent = desviacion.toFixed(2);

        // Hacer visible el contenedor de resultados y su título
        resultados.style.display = "block";
        resultadosTitulo.style.display = "block";
    }

    // Event listener para el botón de calcular
    if (calcularBtn) {
        calcularBtn.addEventListener("click", calcularResultados);
    }

    // Event listener para la tecla Enter
    inputNumeros.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            calcularResultados();
        }
    });
});

// Función para calcular la mediana
function calcularMediana(arr) {
    arr.sort((a, b) => a - b);
    const mitad = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mitad - 1] + arr[mitad]) / 2 : arr[mitad];
}

// Función para calcular la moda
function calcularModa(arr) {
    const frecuencia = {};
    arr.forEach(num => frecuencia[num] = (frecuencia[num] || 0) + 1);
    const maxFrecuencia = Math.max(...Object.values(frecuencia));
    const modas = Object.keys(frecuencia).filter(num => frecuencia[num] === maxFrecuencia);
    return modas.length === arr.length ? "No hay moda" : modas.join(", ");
}

// Función para calcular la varianza
function calcularVarianza(arr, media) {
    return arr.reduce((sum, num) => sum + Math.pow(num - media, 2), 0) / arr.length;
}
