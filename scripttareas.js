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
  
  // Función para mostrar el contenido del Proyecto 2
  function mostrarProyecto2() {
    document.getElementById('contenido').innerHTML = `
      <h1>Proyecto 2: Desarrollo de Sitio Web</h1>
      <p>Este proyecto se enfoca en el diseño y desarrollo de un sitio web responsive y moderno. Se implementa utilizando HTML, CSS y JavaScript, y se optimiza para mejorar la experiencia del usuario y el SEO.</p>
      
      <h2>Imágenes del Proyecto</h2>
      <img src="https://via.placeholder.com/300/09f/fff.png" alt="Diseño del Sitio Web" style="max-width: 100%; height: auto;">
      
      <h2>Gráfica de Visitas del Sitio</h2>
      <div id="grafico2" style="width:100%;height:400px;"></div>
      
      <h2>Detalles Adicionales</h2>
      <p>El equipo está compuesto por diseñadores, desarrolladores y especialistas en marketing digital. Se utiliza la metodología Scrum para la gestión y seguimiento del proyecto, con reuniones diarias y sprints semanales.</p>
    `;
    
    // Gráfica de ejemplo utilizando Plotly para el Proyecto 2
    var trace2 = {
      x: ['Semana 1', 'Semana 2', 'Semana 3'],
      y: [100, 150, 200],
      type: 'line'
    };
    var data2 = [trace2];
    var layout2 = {
      title: 'Visitas Semanales'
    };
    Plotly.newPlot('grafico2', data2, layout2);
  }
  
  // Función para mostrar el contenido del Proyecto 3 a partir de un archivo de Word (Expo.docx)
  function mostrarProyecto3() {
    // Se obtiene el archivo Expo.docx y se convierte a HTML con Mammoth
    fetch('Expo.docx')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer: arrayBuffer }))
      .then(result => {
        // Se inyecta el contenido convertido en el contenedor, envuelto en un div con clase "word-content"
        document.getElementById('contenido').innerHTML = `
          <h1>Proyecto 3: Expo</h1>
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
    document.getElementById('contenido').innerHTML = `
      <h1>Proyecto 2: Desarrollo de Sitio Web</h1>
      <p>Este proyecto se enfoca en el diseño y desarrollo de un sitio web responsive y moderno. Se implementa utilizando HTML, CSS y JavaScript, y se optimiza para mejorar la experiencia del usuario y el SEO.</p>
      
      <h2>Imágenes del Proyecto</h2>
      <img src="https://via.placeholder.com/300/09f/fff.png" alt="Diseño del Sitio Web">
      
      <h2>Gráfica de Visitas del Sitio</h2>
      <div id="grafico2" style="width:100%;height:400px;"></div>
      
      <h2>Detalles Adicionales</h2>
      <p>El equipo está compuesto por diseñadores, desarrolladores y especialistas en marketing digital. Se utiliza la metodología Scrum para la gestión y seguimiento del proyecto, con reuniones diarias y sprints semanales.</p>
    `;
    
    // Gráfica de ejemplo utilizando Plotly para el Proyecto 2
    var trace2 = {
      x: ['Semana 1', 'Semana 2', 'Semana 3'],
      y: [100, 150, 200],
      type: 'line'
    };
    var data2 = [trace2];
    var layout2 = {
      title: 'Visitas Semanales'
    };
    Plotly.newPlot('grafico2', data2, layout2);
  }
  
  // Función para mostrar el contenido del Proyecto 3 a partir de un archivo de Word (Expo.docx)
  function mostrarProyecto3() {
    fetch('Expo.docx')
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer: arrayBuffer }))
      .then(result => {
        document.getElementById('contenido').innerHTML = `
          <h1>Proyecto 3: Expo</h1>
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