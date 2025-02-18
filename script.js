document.addEventListener("DOMContentLoaded", () => {
    let contador = 0;
    const contadorElemento = document.getElementById("contador");
    const btnSumar = document.getElementById("sumar");
    const btnRestar = document.getElementById("restar");

    let timeout; // Variable para el temporizador

    // Función para actualizar el contador en pantalla
    function actualizarContador() {
        contadorElemento.textContent = contador;
        reiniciarTemporizador();
    }

    // Función para reiniciar el temporizador de 5 minutos
    function reiniciarTemporizador() {
        clearTimeout(timeout); // Reinicia el temporizador anterior
        timeout = setTimeout(() => {
            contador = 0;
            actualizarContador();
        }, 300000); // 5 minutos = 300,000 ms
    }

    // Eventos de los botones
    btnSumar.addEventListener("click", () => {
        contador++;
        actualizarContador();
    });

    btnRestar.addEventListener("click", () => {
        contador--;
        actualizarContador();
    });

    // Iniciar el temporizador al cargar la página
    reiniciarTemporizador();
});
