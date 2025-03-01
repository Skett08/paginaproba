document.addEventListener("DOMContentLoaded", () => {
    const calcularBtn = document.getElementById("calcular");
    const inputNumeros = document.getElementById("numeros");
    const excelInput = document.getElementById("excelFile");
    const resultados = document.querySelector(".resultados");
    const resultadosTitulo = document.querySelector(".resultados-titulo");
    const tipoGraficaSelect = document.getElementById("tipoGrafica");

    function actualizarResultadosTextuales(datasets) {
        // Mostrar contenedores principales
        resultados.classList.add('resultados-activos');
        resultadosTitulo.classList.add('activo');
    
        // Resetear todos los elementos primero
        document.querySelectorAll('.dataset-results').forEach(el => {
            el.style.display = 'none'; // Ocultar contenedores
            el.querySelectorAll('span').forEach(span => {
                span.textContent = ''; // Limpiar valores anteriores
            });
        });
    
        // Actualizar datasets visibles
        datasets.slice(0, 2).forEach((data, index) => { // Solo primeros 2 datasets
            const datasetElement = document.getElementById(`dataset${index}`);
            if (!datasetElement || data.length === 0) return;
    
            // Calcular métricas
            const datos = data.slice().sort((a, b) => a - b);
            const media = datos.reduce((a, b) => a + b, 0) / datos.length;
            const mediana = calcularMediana(datos);
            const moda = calcularModa(datos);
            const varianza = calcularVarianza(datos, media);
            const desviacion = Math.sqrt(varianza);
            const q1 = calcularCuartil(datos, 0.25);
            const q3 = calcularCuartil(datos, 0.75);
            const sesgo = calcularSesgo(datos, media, desviacion);
            const curtosis = calcularCurtosis(datos, media, desviacion);
    
            // Actualizar DOM
            document.getElementById(`media${index}`).textContent = media.toFixed(2);
            document.getElementById(`moda${index}`).textContent = moda;
            document.getElementById(`mediana${index}`).textContent = mediana.toFixed(2);
            document.getElementById(`varianza${index}`).textContent = varianza.toFixed(2);
            document.getElementById(`desviacion${index}`).textContent = desviacion.toFixed(2);
            document.getElementById(`q1${index}`).textContent = q1.toFixed(2);
            document.getElementById(`q2${index}`).textContent = mediana.toFixed(2);
            document.getElementById(`q3${index}`).textContent = q3.toFixed(2);
            document.getElementById(`sesgo${index}`).textContent = sesgo.toFixed(2);
            document.getElementById(`curtosis${index}`).textContent = curtosis.toFixed(2);
    
            // Estilos para disposición en fila
            datasetElement.style.display = 'flex';
            datasetElement.style.flexDirection = 'column';
            datasetElement.style.flex = '1 1 45%';
            datasetElement.style.minWidth = '300px';
            datasetElement.style.margin = '10px';
            datasetElement.style.padding = '15px';
            datasetElement.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            datasetElement.style.borderRadius = '8px';
        });
    }

    function calcularResultados() {
        // Procesar archivos Excel
        if (excelInput.files.length > 0) {
            const files = excelInput.files;
            const datasets = [];
            let filesProcessed = 0;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const values = sheetData.flat().filter(v => v !== null && v !== undefined && v !== "");
                    const nums = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
                    
                    datasets.push(nums);
                    filesProcessed++;
                    
                    if (filesProcessed === files.length) {
                        generarGrafica(datasets);
                        actualizarResultadosTextuales(datasets.slice(0, 2));
                    }
                };
                reader.readAsBinaryString(file);
            }
            return;
        }

        // Procesar texto si no hay archivos Excel
        const lineas = inputNumeros.value.split("\n").filter(line => line.trim() !== "");
        const datasets = lineas.map(line => 
            line.split(/\s+/)
                .map(num => parseFloat(num.trim()))
                .filter(num => !isNaN(num))
        ).filter(data => data.length > 0);

        if (datasets.length === 0) {
            alert("Ingresa al menos un conjunto de datos o sube un archivo de Excel.");
            return;
        }

        // Mostrar siempre los resultados textuales (USANDO NUEVA LÓGICA)
        actualizarResultadosTextuales(datasets.slice(0, 2));
        generarGrafica(datasets);
    }

    function generarGrafica(datasets) {
        const tipoGrafica = tipoGraficaSelect.value;
        if (tipoGrafica === "caja y bigote") {
            generarBoxPlotPlotly(datasets);
        } else if (tipoGrafica === "histograma") {
            generarHistogramaPlotly(datasets);
        } else if (tipoGrafica === "xy") {
            generarXYPlotly(datasets);
        } else if (tipoGrafica === "tendencia") {
            generarTendenciaPlotly(datasets);
        } else {
            alert("Opción no válida. Inténtalo de nuevo.");
        }
    }

    if (calcularBtn) {
        calcularBtn.addEventListener("click", calcularResultados);
    }

    inputNumeros.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            calcularResultados();
        }
    });
});

// Funciones estadísticas

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

// Función auxiliar para obtener colores cíclicos
function getColor(index) {
    const colors = [
        'rgba(255,99,132,0.6)',
        'rgba(54,162,235,0.6)',
        'rgba(255,206,86,0.6)',
        'rgba(75,192,192,0.6)',
        'rgba(153,102,255,0.6)',
        'rgba(255,159,64,0.6)'
    ];
    return colors[index % colors.length];
}

// Gráfica de Caja y Bigote Comparativa usando Plotly
function generarBoxPlotPlotly(datasets) {
    const traces = datasets.map((data, index) => ({
        y: data,
        type: 'box',
        name: `Datos ${index + 1}`,
        marker: { color: getColor(index) }
    }));

    var layout = {
        title: 'Gráfica de Caja y Bigote Comparativa',
        autosize: true,
        width: 600,
        height: 400,
        margin: { l: 50, r: 50, b: 50, t: 50 }
    };

    Plotly.newPlot('grafico', traces, layout);
}

// Histograma Comparativo usando Plotly
function generarHistogramaPlotly(datasets) {
    const traces = datasets.map((data, index) => ({
        x: data,
        type: 'histogram',
        name: `Datos ${index + 1}`,
        opacity: 0.7,
        marker: { color: getColor(index) }
    }));

    var layout = {
        title: 'Histograma Comparativo',
        autosize: true,
        width: 600,
        height: 400,
        barmode: 'overlay',
        margin: { l: 50, r: 50, b: 50, t: 50 }
    };

    Plotly.newPlot('grafico', traces, layout);
}

// Gráfico XY (Scatter) Comparativo usando Plotly
function generarXYPlotly(datasets) {
    const traces = datasets.map((data, index) => {
        const indices = data.map((_, i) => i + 1);
        return {
            x: indices,
            y: data,
            mode: 'markers',
            type: 'scatter',
            name: `Datos ${index + 1}`,
            marker: { color: getColor(index), size: 8 }
        };
    });

    var layout = {
        title: 'Gráfico XY Comparativo',
        xaxis: { title: 'Índice' },
        yaxis: { title: 'Valor' },
        autosize: true,
        width: 600,
        height: 400,
        margin: { l: 50, r: 50, b: 50, t: 50 }
    };

    Plotly.newPlot('grafico', traces, layout);
}

// Gráfico de Tendencia (Línea) Comparativo usando Plotly
function generarTendenciaPlotly(datasets) {
    const traces = datasets.map((data, index) => {
        const indices = data.map((_, i) => i + 1);
        return {
            x: indices,
            y: data,
            mode: 'lines+markers',
            type: 'scatter',
            name: `Datos ${index + 1}`,
            line: { color: getColor(index) },
            marker: { color: getColor(index), size: 8 }
        };
    });

    var layout = {
        title: 'Gráfico de Tendencia Comparativo',
        xaxis: { title: 'Índice' },
        yaxis: { title: 'Valor' },
        autosize: true,
        width: 600,
        height: 400,
        margin: { l: 50, r: 50, b: 50, t: 50 }
    };

    Plotly.newPlot('grafico', traces, layout);
}

// Configurar el modal de ayuda
const ayudaModal = document.getElementById('ayudaModal');
const btnAyuda = document.getElementById('btnAyuda');
const cerrarAyuda = document.getElementById('cerrarAyuda');

// Datos de las fórmulas
const formulas = [
    {
        nombre: "Media",
        descripcion: "Promedio de todos los valores. Suma de todos los elementos dividida entre la cantidad de elementos.",
        formula: "μ = (Σxᵢ) / N"
    },
    {
        nombre: "Moda",
        descripcion: "Valores que aparecen con más frecuencia en el conjunto de datos.",
        formula: "Moda = valores con mayor frecuencia"
    },
    {
        nombre: "Mediana",
        descripcion: "Valor central cuando los datos están ordenados. Si hay un número par de elementos, es el promedio de los dos valores centrales.",
        formula: "Mediana = valor central ordenado"
    },
    {
        nombre: "Varianza",
        descripcion: "Medida de dispersión que representa la variabilidad promedio al cuadrado respecto a la media.",
        formula: "σ² = Σ(xᵢ - μ)² / N"
    },
    {
        nombre: "Desviación Estándar",
        descripcion: "Raíz cuadrada de la varianza. Indica la dispersión de los datos en las mismas unidades que los datos originales.",
        formula: "σ = √σ²"
    },
    {
        nombre: "Cuartiles",
        descripcion: "Valores que dividen los datos ordenados en cuatro partes iguales. Q1: 25%, Q2: 50% (mediana), Q3: 75%.",
        formula: "Qᵢ = valor en la posición i*(N+1)/4"
    },
    {
        nombre: "Sesgo",
        descripcion: "Medida de asimetría de la distribución. Sesgo positivo indica cola a la derecha, negativo cola a la izquierda.",
        formula: "Sesgo = [n/((n-1)(n-2))] * Σ[(xᵢ - μ)/σ]³"
    },
    {
        nombre: "Curtosis",
        descripcion: "Medida del \"pico\" de la distribución. Indica cuánta concentración existe alrededor de la media.",
        formula: "Curtosis = [n(n+1)/((n-1)(n-2)(n-3))] * Σ[(xᵢ - μ)/σ]⁴ - [3(n-1)²/((n-2)(n-3))]"
    }
];

// Generar contenido del modal
function generarContenidoAyuda() {
    const lista = document.getElementById('listaFormulas');
    lista.innerHTML = formulas.map((item, index) => `
        <div class="formula-item">
            <h3>${index + 1}. ${item.nombre}</h3>
            <div class="formula">${item.formula}</div>
            <div class="descripcion">${item.descripcion}</div>
        </div>
    `).join('');
}

// Manejar eventos
btnAyuda.addEventListener('click', () => {
    ayudaModal.style.display = "flex";
    generarContenidoAyuda();
});

cerrarAyuda.addEventListener('click', () => {
    ayudaModal.style.display = "none";
});

window.addEventListener('click', (event) => {
    if (event.target === ayudaModal) {
        ayudaModal.style.display = "none";
    }
});