function mostrarChrisProbaProyecto1() {
  fetch('ChrisProbaProyecto1.docx')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer: arrayBuffer }))
    .then(result => {
      document.getElementById('contenido').innerHTML = `
        <h1>Proyecto 1: Dimensionamiento de un Sistema Solar para una Vivienda</h1>
        <div class="word-content">
          ${result.value}
        </div>
      `;
    })
    .catch(err => {
      console.error("Error al cargar el archivo de Word:", err);
      document.getElementById('contenido').innerHTML = '<p>Error al cargar el contenido del archivo.</p>';
    });
}

  function toggleSubProyectos() {
    var sub = document.getElementById('subProyectos');
    // Alterna entre mostrar y ocultar el contenedor de sub-botones
    if (sub.style.display === "none" || sub.style.display === "") {
      sub.style.display = "block";
    } else {
      sub.style.display = "none";
    }
  }
  
  // Función para mostrar el contenido del Proyecto 2
  function mostrarProyecto2() {
    fetch('JuanProbaProyecto1.docx')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer: arrayBuffer }))
      .then(result => {
        document.getElementById('contenido').innerHTML = `
          <div class="word-content">
            ${result.value}
          </div>
        `;
      })
      .catch(err => {
        console.error("Error al cargar el archivo de Word:", err);
        document.getElementById('contenido').innerHTML = '<p>Error al cargar el contenido del archivo.</p>';
      });
}
