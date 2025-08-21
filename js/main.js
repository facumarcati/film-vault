const apiKey = "89177e61dbef1aabc1501bd1f683547d";

async function buscarPelicula() {
  const txtPelicula = document.getElementById("txtPelicula").value;
  const resultadoPelicula = document.getElementById("resultadoPelicula");

  if (txtPelicula === "") {
    return;
  }

  resultadoPelicula.innerHTML = "";
  document.getElementById("txtPelicula").value = "";

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
    txtPelicula
  )}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const peliculas = data.results;

    if (!peliculas || peliculas.length === 0) {
      resultadoPelicula.innerHTML =
        "No se encontraron películas con ese nombre";
      return;
    }

    peliculas.forEach((pelicula) => {
      const peliculaElement = document.createElement("div");
      peliculaElement.classList.add("container-pelicula");

      peliculaElement.innerHTML = `
        <img class="img-pelicula" src="https://image.tmdb.org/t/p/w200${
          pelicula.poster_path
        }" alt="${pelicula.title}">
          <div class="titulo-anio-pelicula"><h2 class="titulo-pelicula">${
            pelicula.title
          }</h2>
          <h2 class="anio-pelicula"> ${
            pelicula.release_date ? pelicula.release_date.slice(0, 4) : "N/A"
          }</h2></div>`;

      resultadoPelicula.appendChild(peliculaElement);
    });
  } catch (error) {
    alert("Ocurrió un error al buscar la película: " + error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("btnBuscarPelicula")
    .addEventListener("click", (e) => {
      e.preventDefault();
      buscarPelicula();
    });
});

// TO DO
// Home - agregar una imagen grande de una serie/pelicula (ej Star Wars)
// y debajo peliculas de esa serie
// Agregar a favoritos - agregar un boton o icono en las peliculas para poder
// agregarlas a favoritos
// Lista de favoritos - mostrar las peliculas que se agregaron a favoritos.
// Hacerlo con localStorage. Permitir que se puedan borrar de esa lista
// Agregar tipo de pelicula - agregar debajo del titulo etiquetas de las
// categorias de esa pelicula
// Agregar un boton para volver al inicio de la pagina
// Agregar footer - OPCIONAL
// Modo oscuro/claro - ULTIMO
