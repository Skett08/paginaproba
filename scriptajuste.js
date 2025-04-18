document.addEventListener('DOMContentLoaded', () => {
  const graficarBtn = document.getElementById('graficar');
  
  graficarBtn.addEventListener('click', () => {
    // Si se ingresaron coordenadas, se prioriza ese ajuste (3D)
    const coordsStr = document.getElementById('coordenadas').value.trim();
    if (coordsStr !== "") {
      fitCoordinates(coordsStr);
      return;
    }
    
    // Si no hay coordenadas, se usan los otros dos campos (recta y parábola)
    const eqRecta = document.getElementById('numeros').value.trim();
    const eqParabola = document.getElementById('funcion').value.trim();
    let traces = [];
    
    if (eqRecta !== "") {
      const rectaTrace = getLineTrace(eqRecta);
      if (rectaTrace) traces.push(rectaTrace);
    }
    
    if (eqParabola !== "") {
      const parabolaTrace = getParabolaTrace(eqParabola);
      if (parabolaTrace) traces.push(parabolaTrace);
    }
    
    if (traces.length === 0) {
      alert("Por favor, introduce al menos una ecuación válida.");
      return;
    }
    
    // Si alguno de los trazos es 3D, se usa layout 3D
    let layout;
    const is3D = traces.some(trace => trace.type === 'scatter3d');
    if (is3D) {
      layout = {
        title: 'Gráfica de las Funciones en 3D',
        scene: {
          xaxis: { title: 'x', zeroline: true },
          yaxis: { title: 'y', zeroline: true },
          zaxis: { title: 'z', zeroline: true },
          bgcolor: 'rgba(245,245,245,0.9)'
        },
        paper_bgcolor: '#b8cbff'
      };
    } else {
      layout = {
        title: 'Gráfica de las Funciones',
        xaxis: { title: 'x', zeroline: true },
        yaxis: { title: 'y', zeroline: true },
        plot_bgcolor: 'rgba(245,245,245,0.9)',
        paper_bgcolor: '#b8cbff'
      };
    }
    
    Plotly.newPlot('plot', traces, layout);
  });
  /* Gestión del Modal de Ayuda */
  const ayudaBtn = document.getElementById('ayuda');
  const ayudaModal = document.getElementById('ayudaModal');
  const cerrarAyuda = document.getElementById('cerrarAyuda');

  ayudaBtn.addEventListener('click', () => {
    ayudaModal.style.display = 'flex';
  });

  cerrarAyuda.addEventListener('click', () => {
    ayudaModal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === ayudaModal) {
      ayudaModal.style.display = 'none';
    }
  });
});

/* Funciones para recta y parábola a partir de ecuaciones ingresadas */

function getLineTrace(equation) {
  const eq = equation.replace(/\s+/g, '').toLowerCase();
  // Si la ecuación empieza con "z=", se interpreta en 3D
  if (eq.startsWith("z=")) {
    return getLineTrace3D(equation);
  }
  // Formato esperado: y=mx+b
  const regex = /^y=([+-]?[\d.]*)x([+-][\d.]+)?$/;
  const match = eq.match(regex);
  
  if (!match) {
    alert('Formato de recta inválido. Usa el formato: y=mx+b');
    return null;
  }
  
  let mStr = match[1], bStr = match[2];
  let m = (mStr === '' || mStr === '+') ? 1 : (mStr === '-') ? -1 : parseFloat(mStr);
  let b = bStr ? parseFloat(bStr) : 0;
  
  const xValues = [-10, 10];
  const yValues = xValues.map(x => m * x + b);
  
  return {
    x: xValues,
    y: yValues,
    mode: 'lines',
    name: 'Recta',
    type: 'scatter',
    line: { color: '#4CAF50', width: 3 }
  };
}

function getLineTrace3D(equation) {
  const eq = equation.replace(/\s+/g, '').toLowerCase();
  // Formato esperado: z=mx+b
  const regex = /^z=([+-]?[\d.]*)x([+-][\d.]+)?$/;
  const match = eq.match(regex);
  
  if (!match) {
    alert('Formato de recta 3D inválido. Usa el formato: z=mx+b');
    return null;
  }
  
  let mStr = match[1], bStr = match[2];
  let m = (mStr === '' || mStr === '+') ? 1 : (mStr === '-') ? -1 : parseFloat(mStr);
  let b = bStr ? parseFloat(bStr) : 0;
  
  const xValues = [-10, 10];
  const zValues = xValues.map(x => m * x + b);
  const yValues = [0, 0]; // Se mantiene y en 0 (puedes modificarlo si necesitas otro comportamiento)
  
  return {
    x: xValues,
    y: yValues,
    z: zValues,
    mode: 'lines',
    name: 'Recta 3D',
    type: 'scatter3d',
    line: { color: '#4CAF50', width: 3 }
  };
}

function getParabolaTrace(equation) {
  const eq = equation.replace(/\s+/g, '').toLowerCase();
  // Si la ecuación empieza con "z=", se interpreta en 3D
  if (eq.startsWith("z=")) {
    return getParabolaTrace3D(equation);
  }
  // Formato esperado: y=ax^2+bx+c
  const regex = /^y=([+-]?[\d.]*)x\^2(?:([+-][\d.]+)x)?(?:([+-][\d.]+))?$/;
  const match = eq.match(regex);
  
  if (!match) {
    alert('Formato de parábola inválido. Usa el formato: y=ax^2+bx+c');
    return null;
  }
  
  let aStr = match[1], bStr = match[2], cStr = match[3];
  let a = (aStr === '' || aStr === '+') ? 1 : (aStr === '-') ? -1 : parseFloat(aStr);
  let b = bStr ? parseFloat(bStr) : 0;
  let c = cStr ? parseFloat(cStr) : 0;
  
  const xValues = [];
  const yValues = [];
  const numPoints = 100;
  for (let i = 0; i <= numPoints; i++) {
    let x = -10 + (20 * i / numPoints);
    xValues.push(x);
    yValues.push(a * x * x + b * x + c);
  }
  
  return {
    x: xValues,
    y: yValues,
    mode: 'lines',
    name: 'Parábola',
    type: 'scatter',
    line: { color: '#1d4415', width: 3 }
  };
}

function getParabolaTrace3D(equation) {
  const eq = equation.replace(/\s+/g, '').toLowerCase();
  // Formato esperado: z=ax^2+bx+c
  const regex = /^z=([+-]?[\d.]*)x\^2(?:([+-][\d.]+)x)?(?:([+-][\d.]+))?$/;
  const match = eq.match(regex);
  
  if (!match) {
    alert('Formato de parábola 3D inválido. Usa el formato: z=ax^2+bx+c');
    return null;
  }
  
  let aStr = match[1], bStr = match[2], cStr = match[3];
  let a = (aStr === '' || aStr === '+') ? 1 : (aStr === '-') ? -1 : parseFloat(aStr);
  let b = bStr ? parseFloat(bStr) : 0;
  let c = cStr ? parseFloat(cStr) : 0;
  
  const xValues = [];
  const zValues = [];
  const numPoints = 100;
  for (let i = 0; i <= numPoints; i++) {
    let x = -10 + (20 * i / numPoints);
    xValues.push(x);
    zValues.push(a * x * x + b * x + c);
  }
  
  // Fijamos y = 0 en todos los puntos (puedes modificarlo si lo requieres)
  const yValues = new Array(numPoints + 1).fill(0);
  
  return {
    x: xValues,
    y: yValues,
    z: zValues,
    mode: 'lines',
    name: 'Parábola 3D',
    type: 'scatter3d',
    line: { color: '#1d4415', width: 3 }
  };
}

/* Funciones para ajuste de mínimos cuadrados a partir de coordenadas ingresadas */

function fitCoordinates(coordsStr) {
  const lines = coordsStr.split('\n').filter(line => line.trim() !== "");
  if (lines.length === 0) {
    alert("Por favor, ingresa algunas coordenadas.");
    return;
  }
  
  let dim = 0;
  let xArr = [], yArr = [], zArr = [];
  
  // Detectar dimensión y separar datos
  for (let line of lines) {
    let parts = line.replace(/,/g, ' ').trim().split(/\s+/);
    if (parts.length === 0) continue;
    if (dim === 0) {
      // Se establece la dimensión según la primera línea
      dim = parts.length;
      if (dim !== 2 && dim !== 3) {
        alert("Cada línea debe contener 2 (X, Y) o 3 (X, Y, Z) números.");
        return;
      }
    }
    if (parts.length !== dim) {
      alert("Todas las líneas deben tener el mismo número de coordenadas.");
      return;
    }
    if (dim === 2) {
      xArr.push(parseFloat(parts[0]));
      yArr.push(parseFloat(parts[1]));
    } else if (dim === 3) {
      xArr.push(parseFloat(parts[0]));
      yArr.push(parseFloat(parts[1]));
      zArr.push(parseFloat(parts[2]));
    }
  }
  
  if (xArr.length < 2) {
    alert("Se requieren al menos dos coordenadas válidas para el ajuste.");
    return;
  }
  
  if (dim === 2) {
    // Graficar en 2D con ajuste de mínimos cuadrados (lineal y cuadrático)
    const dataPoints = {
      x: xArr,
      y: yArr,
      mode: 'markers',
      name: 'Datos',
      type: 'scatter',
      marker: { color: 'red', size: 5 }
    };
    
    let traces = [dataPoints];
    
    // Ajuste lineal: y = a*x + b
    const linearCoeffs = fitLinear(xArr, yArr);
    const linearError = errorLinear(xArr, yArr, linearCoeffs);
    let quadraticError = Infinity;
    let quadraticCoeffs = null;
    if (xArr.length >= 3) {
      quadraticCoeffs = fitQuadratic(xArr, yArr);
      quadraticError = errorQuadratic(xArr, yArr, quadraticCoeffs);
    }
    
    const useLinear = linearError < quadraticError;
    const numPointsFit = 100;
    let xFit = [];
    let yFit = [];
    const xMin = Math.min(...xArr), xMax = Math.max(...xArr);
    
    for (let i = 0; i < numPointsFit; i++) {
      const xVal = xMin + i * (xMax - xMin) / (numPointsFit - 1);
      xFit.push(xVal);
      if (useLinear) {
        yFit.push(linearCoeffs.a * xVal + linearCoeffs.b);
      } else {
        yFit.push(quadraticCoeffs.a * xVal * xVal + quadraticCoeffs.b * xVal + quadraticCoeffs.c);
      }
    }
    
    const fitTrace = {
      x: xFit,
      y: yFit,
      mode: 'lines',
      name: useLinear ? 'Ajuste Lineal 2D' : 'Ajuste Cuadrático 2D',
      type: 'scatter',
      line: { color: useLinear ? 'blue' : 'green', width: 3 }
    };
    
    traces.push(fitTrace);
    
    const layout = {
      title: 'Gráfica de Coordenadas y Ajuste por Mínimos Cuadrados 2D',
      xaxis: { title: 'X', zeroline: true },
      yaxis: { title: 'Y', zeroline: true },
      plot_bgcolor: 'rgba(245,245,245,0.9)',
      paper_bgcolor: '#b8cbff'
    };
    
    Plotly.newPlot('plot', traces, layout);
    
  } else if (dim === 3) {
    // Graficar en 3D con ajuste de mínimos cuadrados
    const dataPoints = {
      x: xArr,
      y: yArr,
      z: zArr,
      mode: 'markers',
      name: 'Datos',
      type: 'scatter3d',
      marker: { color: 'red', size: 5 }
    };
    
    let traces = [dataPoints];
    
    // Ajuste lineal en 3D: se calcula por separado para y y z en función de x
    const linearCoeffsY = fitLinear(xArr, yArr);
    const linearCoeffsZ = fitLinear(xArr, zArr);
    const linearError = error3DLinear(xArr, yArr, zArr, linearCoeffsY, linearCoeffsZ);
    
    let quadraticError = Infinity;
    let quadraticCoeffsY = null, quadraticCoeffsZ = null;
    if (xArr.length >= 3) {
      quadraticCoeffsY = fitQuadratic(xArr, yArr);
      quadraticCoeffsZ = fitQuadratic(xArr, zArr);
      quadraticError = error3DQuadratic(xArr, yArr, zArr, quadraticCoeffsY, quadraticCoeffsZ);
    }
    
    const useLinear = linearError < quadraticError;
    const numPointsFit = 100;
    let xFit = [];
    let yFit = [];
    let zFit = [];
    const xMin = Math.min(...xArr), xMax = Math.max(...xArr);
    
    for (let i = 0; i < numPointsFit; i++) {
      const xVal = xMin + i * (xMax - xMin) / (numPointsFit - 1);
      xFit.push(xVal);
      if (useLinear) {
        yFit.push(linearCoeffsY.a * xVal + linearCoeffsY.b);
        zFit.push(linearCoeffsZ.a * xVal + linearCoeffsZ.b);
      } else {
        yFit.push(quadraticCoeffsY.a * xVal * xVal + quadraticCoeffsY.b * xVal + quadraticCoeffsY.c);
        zFit.push(quadraticCoeffsZ.a * xVal * xVal + quadraticCoeffsZ.b * xVal + quadraticCoeffsZ.c);
      }
    }
    
    const fitTrace = {
      x: xFit,
      y: yFit,
      z: zFit,
      mode: 'lines',
      name: useLinear ? 'Ajuste Lineal 3D' : 'Ajuste Cuadrático 3D',
      type: 'scatter3d',
      line: { color: useLinear ? 'blue' : 'green', width: 3 }
    };
    
    traces.push(fitTrace);
    
    const layout = {
      title: 'Gráfica de Coordenadas en 3D y Ajuste por Mínimos Cuadrados',
      scene: {
        xaxis: { title: 'X', zeroline: true },
        yaxis: { title: 'Y', zeroline: true },
        zaxis: { title: 'Z', zeroline: true },
        bgcolor: 'rgba(245,245,245,0.9)'
      },
      paper_bgcolor: '#b8cbff'
    };
    
    Plotly.newPlot('plot', traces, layout);
  }
}

// Ajuste de plano: busca coeficientes a, b y c en z = a*x + b*y + c
function fitPlane(x, y, z) {
  const n = x.length;
  let Sxx = 0, Sxy = 0, Syy = 0, Sx = 0, Sy = 0, Sz = 0, Sxz = 0, Syz = 0;
  for (let i = 0; i < n; i++) {
    Sxx += x[i] * x[i];
    Sxy += x[i] * y[i];
    Syy += y[i] * y[i];
    Sx  += x[i];
    Sy  += y[i];
    Sz  += z[i];
    Sxz += x[i] * z[i];
    Syz += y[i] * z[i];
  }
  
  // Sistema de ecuaciones:
  // a·Sxx + b·Sxy + c·Sx = Sxz
  // a·Sxy + b·Syy + c·Sy = Syz
  // a·Sx  + b·Sy  + c·n  = Sz
  const A = [
    [Sxx, Sxy, Sx],
    [Sxy, Syy, Sy],
    [Sx,  Sy,  n]
  ];
  const B = [Sxz, Syz, Sz];
  const coeffs = solveLinearSystem(A, B);
  return { a: coeffs[0], b: coeffs[1], c: coeffs[2] };
}


// Ajuste lineal: y = a*x + b
function fitLinear(x, y) {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }
  const a = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const b = (sumY - a * sumX) / n;
  return { a, b };
}

function errorLinear(x, y, coeffs) {
  let err = 0;
  for (let i = 0; i < x.length; i++) {
    let diff = y[i] - (coeffs.a * x[i] + coeffs.b);
    err += diff * diff;
  }
  return err;
}

// Ajuste cuadrático: y = a*x^2 + b*x + c
function fitQuadratic(x, y) {
  const n = x.length;
  let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
  let sumY = 0, sumXY = 0, sumX2Y = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i];
    const yi = y[i];
    const xi2 = xi * xi;
    sumX += xi;
    sumX2 += xi2;
    sumX3 += xi2 * xi;
    sumX4 += xi2 * xi2;
    sumY += yi;
    sumXY += xi * yi;
    sumX2Y += xi2 * yi;
  }
  
  // Sistema de ecuaciones:
  // a*sumX4 + b*sumX3 + c*sumX2 = sumX2Y
  // a*sumX3 + b*sumX2 + c*sumX = sumXY
  // a*sumX2 + b*sumX + c*n = sumY
  const A = [
    [sumX4, sumX3, sumX2],
    [sumX3, sumX2, sumX],
    [sumX2, sumX, n]
  ];
  const B = [sumX2Y, sumXY, sumY];
  const coeffs = solveLinearSystem(A, B);
  return { a: coeffs[0], b: coeffs[1], c: coeffs[2] };
}

function errorQuadratic(x, y, coeffs) {
  let err = 0;
  for (let i = 0; i < x.length; i++) {
    const yiFit = coeffs.a * x[i] * x[i] + coeffs.b * x[i] + coeffs.c;
    const diff = y[i] - yiFit;
    err += diff * diff;
  }
  return err;
}

// Resolver sistema lineal 3x3 mediante eliminación gaussiana
function solveLinearSystem(A, B) {
  const n = 3;
  // Copia de A y B
  for (let i = 0; i < n; i++) {
    A[i].push(B[i]);
  }
  // Eliminación
  for (let i = 0; i < n; i++) {
    // Hacer el pivote A[i][i] no nulo
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }
    let tmp = A[i];
    A[i] = A[maxRow];
    A[maxRow] = tmp;
    
    // Normalizar fila i
    const divisor = A[i][i];
    for (let j = i; j < n + 1; j++) {
      A[i][j] /= divisor;
    }
    
    // Hacer cero las otras filas
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = i; j < n + 1; j++) {
          A[k][j] -= factor * A[i][j];
        }
      }
    }
  }
  // La solución está en la última columna
  return [A[0][n], A[1][n], A[2][n]];
}

// Calcula el error total del ajuste lineal en 3D: y = a*x + b y z = a*x + b
function error3DLinear(x, y, z, coeffsY, coeffsZ) {
  let err = 0;
  for (let i = 0; i < x.length; i++) {
    let dy = y[i] - (coeffsY.a * x[i] + coeffsY.b);
    let dz = z[i] - (coeffsZ.a * x[i] + coeffsZ.b);
    err += dy * dy + dz * dz;
  }
  return err;
}

// Calcula el error total del ajuste cuadrático en 3D: y = a*x^2 + b*x + c y z = a*x^2 + b*x + c
function error3DQuadratic(x, y, z, coeffsY, coeffsZ) {
  let err = 0;
  for (let i = 0; i < x.length; i++) {
    let dy = y[i] - (coeffsY.a * x[i] * x[i] + coeffsY.b * x[i] + coeffsY.c);
    let dz = z[i] - (coeffsZ.a * x[i] * x[i] + coeffsZ.b * x[i] + coeffsZ.c);
    err += dy * dy + dz * dz;
  }
  return err;
}