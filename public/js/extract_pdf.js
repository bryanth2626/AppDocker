const pdfForm = document.getElementById("pdfForm");
const documento = document.getElementById("documento");
const mensajePDF = document.getElementById("mensajePDF");
const listaTexto = document.getElementById("listaTexto");

documento.addEventListener("change", () => {
  const archivo = documento.files[0];

  mensajePDF.textContent = "";

  if (archivo && archivo.type !== "application/pdf") {
    mensajePDF.textContent = "Selecciona un archivo PDF.";
    documento.value = "";
  }
});

pdfForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const archivo = documento.files[0];

  if (!archivo) {
    mensajePDF.textContent = "Seleccione un PDF";
    return;
  }

  if (archivo.type !== "application/pdf") {
  mensajePDF.textContent = "El archivo debe ser PDF";
  return;
  }

  if (archivo.size >= 5 * 1024 * 1024) {
    listaTexto.innerHTML = "";
    mensajePDF.textContent =
      "DEBE PESAR MENOS DE 5 MB PARA ANALIZAR ESTE ARCHIVO";
    mensajePDF.classList.add("errorPDF");
    return;
  }

mensajePDF.classList.remove("errorPDF");

  const formData = new FormData();
  formData.append("documento", archivo);

  mensajePDF.textContent = "Analizando PDF con Textract...";
  listaTexto.innerHTML = "";

  try {

    const response = await fetch("/api/analizar-pdf", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {

      mensajePDF.textContent =
        "Análisis completado. Páginas: " + data.pages;

      data.lines.forEach(linea => {

        const li = document.createElement("li");

        li.textContent =
          `Texto: ${linea.Text} - Confianza: ${linea.Confidence.toFixed(2)}%`;

        listaTexto.appendChild(li);

      });

    } else {

      mensajePDF.textContent = data.error;

    }

  } catch (error) {

    console.error(error);
    mensajePDF.textContent = "Error de conexión con el servidor";

  }

});