// Función de generación de grid mejorada
const generateGrid = (rows, cols) => {
    return Array(rows).fill().map((_, i) => `
        <div class="matrix-row">
            ${Array(cols).fill().map((_, j) => `
                <input type="number" 
                       class="matrix-cell" 
                       data-row="${i}" 
                       data-col="${j}">`
            ).join('')}
        </div>`
    ).join('');
};

function generarMatrizA() {
    const filas = parseInt(document.getElementById('filasA').value);
    const columnas = parseInt(document.getElementById('columnasA').value);
    document.getElementById('gridA').innerHTML = generateGrid(filas, columnas);
}

function generarMatrizB() {
    const filas = parseInt(document.getElementById('filasB').value);
    const columnas = parseInt(document.getElementById('columnasB').value);
    document.getElementById('gridB').innerHTML = generateGrid(filas, columnas);
}

// Helper functions
const getMatrixValues = (gridId, rows, cols) => {
    const inputs = document.querySelectorAll(`#${gridId} .matrix-cell`);
    const matrix = Array(rows).fill().map(() => Array(cols).fill(0));
    
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        if (row < rows && col < cols) {
            matrix[row][col] = parseFloat(input.value) || 0;
        }
    });
    
    return matrix;
};

const createMatrix = (matrix, editable = false) => {
    return matrix.map((row, i) => `
        <div class="matrix-row">
            ${row.map((val, j) => {
                // Si es un número, lo formateamos; si no, lo dejamos sin formatear (o lo convertimos a 0)
                const formattedVal = typeof val === 'number' ? val.toFixed(2) : (Number(val) || 0);
                return `<input type="number" 
                               class="matrix-cell" 
                               value="${formattedVal}" 
                               ${editable ? '' : 'disabled'}
                               data-row="${i}" 
                               data-col="${j}">`;
            }).join('')}
        </div>`
    ).join('');
};

const showError = (message) => {
    const resultadoTexto = document.getElementById('resultadoTexto');
    resultadoTexto.innerHTML = `<span style="color: #ff4444;">Error: ${message}</span>`;
    document.getElementById('resultadoGrid').innerHTML = '';
};

// Matrix operations
const matrixOperations = {
    suma: (A, B, rowsA, colsA, rowsB, colsB) => {
        if (rowsA !== rowsB || colsA !== colsB) {
            showError('Dimensiones incompatibles para suma');
            return null;
        }
        return A.map((row, i) => row.map((val, j) => val + B[i][j]));
    },

    resta: (A, B, rowsA, colsA, rowsB, colsB) => {
        if (rowsA !== rowsB || colsA !== colsB) {
            showError('Dimensiones incompatibles para resta');
            return null;
        }
        return A.map((row, i) => row.map((val, j) => val - B[i][j]));
    },

    multiplicacion: (A, B, rowsA, colsA, rowsB, colsB) => {
        if (colsA !== rowsB) {
            showError(`Columnas de A (${colsA}) ≠ Filas de B (${rowsB})`);
            return null;
        }
        return Array(rowsA).fill().map((_, i) =>
            Array(colsB).fill().map((_, j) =>
                A[i].reduce((sum, val, k) => sum + val * B[k][j], 0)
            )
        );
    },


    escalar: (A) => {
        const scalar = parseFloat(prompt('Ingrese el valor escalar:'));
        if (isNaN(scalar)) {
            showError('Escalar inválido');
            return null;
        }
        return A.map(row => row.map(val => val * scalar));
    },

    transpuesta: (A) => {
        return A[0].map((_, i) => A.map(row => row[i]));
    },

    determinante: (A) => {
        if (A.length !== A[0].length) {
            showError('La matriz debe ser cuadrada');
            return null;
        }
        
        const n = A.length;
        if (n === 1) return A[0][0];
        if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
        if (n === 3) {
            return A[0][0] * (A[1][1]*A[2][2] - A[1][2]*A[2][1]) -
                   A[0][1] * (A[1][0]*A[2][2] - A[1][2]*A[2][0]) +
                   A[0][2] * (A[1][0]*A[2][1] - A[1][1]*A[2][0]);
        }
        showError('Determinante solo disponible para matrices hasta 3x3');
        return null;
    },

    inversa: (A) => {
        if (A.length !== A[0].length) {
            showError('La matriz debe ser cuadrada');
            return null;
        }
        
        const det = matrixOperations.determinante(A);
        if (det === 0 || !det) {
            showError('La matriz no tiene inversa (determinante cero)');
            return null;
        }
        
        if (A.length === 2) {
            return [
                [A[1][1]/det, -A[0][1]/det],
                [-A[1][0]/det, A[0][0]/det]
            ];
        }
        
        showError('Inversa solo disponible para matrices 2x2');
        return null;
    }
};

// Main function
function calcularOperacion(operacion) {
    const rowsA = parseInt(document.getElementById('filasA').value);
    const colsA = parseInt(document.getElementById('columnasA').value);
    const rowsB = parseInt(document.getElementById('filasB').value);
    const colsB = parseInt(document.getElementById('columnasB').value);
    
    const A = getMatrixValues('gridA', rowsA, colsA);
    const B = operacion !== 'escalar' ? getMatrixValues('gridB', rowsB, colsB) : null;
    
    try {
        let resultado;
        switch(operacion) {
            case 'suma':
                resultado = matrixOperations.suma(A, B, rowsA, colsA, rowsB, colsB);
                break;
            case 'resta':
                resultado = matrixOperations.resta(A, B, rowsA, colsA, rowsB, colsB);
                break;
            case 'multiplicacion':
                resultado = matrixOperations.multiplicacion(A, B, rowsA, colsA, rowsB, colsB);
                break;
            case 'escalar':
                resultado = matrixOperations.escalar(A);
                break;
            case 'determinante':
                resultado = matrixOperations.determinante(A);
                break;
            case 'inversa':
                resultado = matrixOperations.inversa(A);
                break;
            case 'transpuesta':
                resultado = matrixOperations.transpuesta(A);
                break;
            default:
                showError('Operación no reconocida');
                return;
        }

        if (!resultado) return;

        const resultadoGrid = document.getElementById('resultadoGrid');
        const resultadoTexto = document.getElementById('resultadoTexto');
        
        // Limpiar resultados anteriores
        resultadoGrid.innerHTML = '';
        resultadoTexto.innerHTML = '';

        if (typeof resultado === 'number') {
            resultadoTexto.textContent = `Resultado: ${resultado.toFixed(2)}`;
        } else {
            resultadoGrid.innerHTML = createMatrix(resultado);
            resultadoTexto.textContent = `Operación: ${operacion.toUpperCase()}`;
        }

    } catch (error) {
        showError('Error en el cálculo: ' + error.message);
    }
}

// Inicializar matrices al cargar
window.onload = () => {
    try {
        generarMatrizA();
        generarMatrizB();
    } catch (e) {
        console.error('Error al inicializar:', e);
        alert('Error al cargar las matrices');
    }
};

const handleExcelUpload = (file, gridId, rowsInputId, colsInputId, fileNameSpanId) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
        
        const rows = jsonData.length;
        const cols = Math.max(...jsonData.map(row => row.length));
        
        // Actualizar dimensiones
        document.getElementById(rowsInputId).value = rows;
        document.getElementById(colsInputId).value = cols;
        
        // Generar grid
        document.getElementById(gridId).innerHTML = createMatrix(jsonData.map(row => 
            [...row, ...Array(cols - row.length).fill(0)].slice(0, cols)
        ));
        
        // Mostrar nombre de archivo
        document.getElementById(fileNameSpanId).textContent = file.name;
    };
    reader.readAsArrayBuffer(file);
};

// Event listeners para los inputs de archivo
document.getElementById('fileA').addEventListener('change', (e) => {
    handleExcelUpload(e.target.files[0], 'gridA', 'filasA', 'columnasA', 'fileAName');
});

document.getElementById('fileB').addEventListener('change', (e) => {
    handleExcelUpload(e.target.files[0], 'gridB', 'filasB', 'columnasB', 'fileBName');
});