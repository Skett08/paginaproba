document.addEventListener("DOMContentLoaded", () => {
    let contador = 0;
    const contadorElemento = document.getElementById("contador");
    const btnSumar = document.getElementById("sumar");
    const btnRestar = document.getElementById("restar");

    let timeout; // Variable para el temporizador

    // Actualizacion del Contador
    function actualizarContador() {
        contadorElemento.textContent = contador;
        reiniciarTemporizador();
    }

    // Contador de 5 minutos, creo que no jala
    function reiniciarTemporizador() {
        clearTimeout(timeout); // Reinicia el temporizador anterior
        timeout = setTimeout(() => {
            contador = 0;
            actualizarContador();
        }, 300000); // Contador en milisegundos (5 minutos)
    }

    // Botones
    btnSumar.addEventListener("click", () => {
        contador++;
        actualizarContador();
    });

    btnRestar.addEventListener("click", () => {
        contador--;
        actualizarContador();
    });

    // Inicializacion del temporizador
    reiniciarTemporizador();
});
