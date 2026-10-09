const form = document.getElementById("uploadForm");
const listaEtiquetas = document.getElementById("listaEtiquetas");

// REKOGNITION: ANALIZAR IMAGEN

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  const formData = new FormData(form);

  listaEtiquetas.innerHTML = "<li>Analizando imagen con AWS...</li>";

  try {

    const response = await fetch("/api/analizar", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {

      listaEtiquetas.innerHTML = "";

      data.labels.forEach(label => {

        const li = document.createElement("li");

        li.textContent = `Etiqueta: ${label.Name} - Confianza: ${label.Confidence.toFixed(2)}%`;

        listaEtiquetas.appendChild(li);

      });

    } else {

      listaEtiquetas.innerHTML = `<li>${data.error}</li>`;

    }

  } catch (error) {

    console.error(error);
    listaEtiquetas.innerHTML = "<li>Error de conexión</li>";

  }

});
