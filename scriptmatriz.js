// Helper functions
const getMatrixValues = (gridId) => {
    const inputs = document.querySelectorAll(`#${gridId} .matrix-cell`);
    const rows = Math.max(...Array.from(inputs).map(input => parseInt(input.dataset.row))) + 1;
    const cols = Math.max(...Array.from(inputs).map(input => parseInt(input.dataset.col))) + 1;
    const matrix = Array(rows).fill().map(() => Array(cols).fill(0));
    
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        matrix[row][col] = parseFloat(input.value) || 0;
    });
    
    return matrix;
};

const createMatrix = (matrix, editable = false) => {
    return matrix.map((row, i) => `
        <div class="matrix-row">
            ${row.map((val, j) => `
                <input type="number" 
                       class="matrix-cell" 
                       value="${val.toFixed(2)}" 
                       ${editable ? '' : 'disabled'}
                       data-row="${i}" 
                       data-col="${j}">`
            ).join('')}
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
    suma: (A, B) => {
        if (A.length !== B.length || A[0].length !== B[0].length) {
            showError('Las matrices deben tener la misma dimensión');
            return null;
        }
        return A.map((row, i) => row.map((val, j) => val + B[i][j]));
    },

    resta: (A, B) => {
        if (A.length !== B.length || A[0].length !== B[0].length) {
            showError('Las matrices deben tener la misma dimensión');
            return null;
        }
        return A.map((row, i) => row.map((val, j) => val - B[i][j]));
    },

    multiplicacion: (A, B) => {
        if (A[0].length !== B.length) {
            showError('El número de columnas de A debe coincidir con el de filas de B');
            return null;
        }
        return Array(A.length).fill().map((_, i) =>
            Array(B[0].length).fill().map((_, j) =>
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
    const A = getMatrixValues('gridA');
    const B = operacion !== 'escalar' ? getMatrixValues('gridB') : null;
    let resultado;

    try {
        switch(operacion) {
            case 'suma':
            case 'resta':
            case 'multiplicacion':
                resultado = matrixOperations[operacion](A, B);
                break;
            case 'determinante':
            case 'transpuesta':
            case 'inversa':
                resultado = matrixOperations[operacion](A);
                break;
            case 'escalar':
                resultado = matrixOperations[operacion](A);
                break;
            default:
                showError('Operación no reconocida');
                return;
        }

        if (!resultado) return;

        if (typeof resultado === 'number') {
            document.getElementById('resultadoGrid').innerHTML = '';
            document.getElementById('resultadoTexto').textContent = `Determinante: ${resultado.toFixed(2)}`;
        } else {
            document.getElementById('resultadoGrid').innerHTML = createMatrix(resultado);
            document.getElementById('resultadoTexto').textContent = 
                operacion === 'inversa' ? 'Matriz Inversa' : 
                operacion === 'transpuesta' ? 'Matriz Transpuesta' : '';
        }
    } catch (error) {
        showError('Error en el cálculo: ' + error.message);
    }
}

// Initial matrix generation
function generarMatrices() {
    const filas = parseInt(document.getElementById('filas').value);
    const columnas = parseInt(document.getElementById('columnas').value);
    
    const generateGrid = (rows, cols) => 
        Array(rows).fill().map((_, i) => `
            <div class="matrix-row">
                ${Array(cols).fill().map((_, j) => `
                    <input type="number" 
                           class="matrix-cell" 
                           data-row="${i}" 
                           data-col="${j}">`
                ).join('')}
            </div>`
        ).join('');
    
    document.getElementById('gridA').innerHTML = generateGrid(filas, columnas);
    document.getElementById('gridB').innerHTML = generateGrid(filas, columnas);
}

// Initialize default matrices
generarMatrices();