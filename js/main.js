const apiKey = "89177e61dbef1aabc1501bd1f683547d";

const Genero = function (id, genero) {
  this.id = id;
  this.genero = genero;
};

async function generosPeliculas() {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=es-ES`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const generos = data.genres;

    const listaGeneros = generos.map(
      (genero) => new Genero(genero.id, genero.name)
    );

    return listaGeneros;
  } catch (error) {
    alert("Error al devolver los generos: " + error);
  }
}

function normalizarTexto(genero) {
  return genero
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function buscarIdGenero(genero) {
  try {
    const generos = await generosPeliculas();

    const generoEncontrado = generos.find(
      (g) => normalizarTexto(g.genero) === normalizarTexto(genero)
    );

    return generoEncontrado ? generoEncontrado.id : null;
  } catch (error) {
    alert("Error al devolver los generos por ID: " + error);
  }
}

async function buscarPelicula() {
  const txtPelicula = document.getElementById("txtPelicula").value;
  const resultadoPelicula = document.getElementById("resultadoPelicula");

  if (txtPelicula === "") {
    return;
  }

  resultadoPelicula.innerHTML = "";
  document.getElementById("txtPelicula").value = "";

  const urlPeliculas = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
    txtPelicula
  )}`;

  try {
    const response = await fetch(urlPeliculas);
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

      const generosContainer = document.createElement("div");
      generosContainer.classList.add("generos-container");

      const urlDatosPelicula = `https://api.themoviedb.org/3/movie/${pelicula.id}?api_key=${apiKey}&language=es-ES`;

      fetch(urlDatosPelicula)
        .then((response) => response.json())
        .then((data) => {
          const duracion = data.runtime;
          const generosPelicula = data.genres;

          generosPelicula.forEach((genero) => {
            const generoElement = document.createElement("span");
            generoElement.textContent = genero.name;
            generoElement.classList.add("generos");

            generosContainer.appendChild(generoElement);
          });

          peliculaElement.innerHTML = `
          <img class="img-pelicula" src="https://image.tmdb.org/t/p/w200${
            pelicula.poster_path
          }" alt="${pelicula.title}">
            <div class="titulo-anio-pelicula"><h2 class="titulo-pelicula">${
              pelicula.title
            }</h2>
            <h2 class="anio-pelicula"> ${
              pelicula.release_date ? pelicula.release_date.slice(0, 4) : "N/A"
            }</h2></div>
            <h2>${duracion > 0 ? duracion : "N/A"}</h2>`;

          peliculaElement.appendChild(generosContainer);

          if (pelicula.poster_path) {
            resultadoPelicula.appendChild(peliculaElement);
          }
        })
        .catch((error) => alert("Ocurrió un error: " + error));
    });
  } catch (error) {
    alert("Ocurrió un error al buscar la película: " + error);
  }
}

async function buscarPeliculaPorGenero(genero) {
  const idGenero = await buscarIdGenero(genero);

  if (!idGenero) {
    alert("No se encontró el género: " + genero);
    return;
  }

  const resultadoPelicula = document.getElementById(
    "resultadoPelicula" + genero
  );

  resultadoPelicula.innerHTML = "";
  const urlPeliculas = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${idGenero}&language=es-ES`;

  try {
    const response = await fetch(urlPeliculas);
    const data = await response.json();
    const peliculas = data.results.slice(0, 6); // cantidad de peliculas

    peliculas.forEach((pelicula) => {
      const peliculaElement = document.createElement("div");
      peliculaElement.classList.add("container-pelicula");

      const generosContainer = document.createElement("div");
      generosContainer.classList.add("generos-container");

      const urlDatosPelicula = `https://api.themoviedb.org/3/movie/${pelicula.id}?api_key=${apiKey}&language=es-ES`;

      fetch(urlDatosPelicula)
        .then((response) => response.json())
        .then((data) => {
          const duracion = data.runtime;
          const generosPelicula = data.genres;

          generosPelicula.forEach((genero) => {
            const generoElement = document.createElement("span");
            generoElement.textContent = genero.name;
            generoElement.classList.add("generos");

            generosContainer.appendChild(generoElement);
          });

          peliculaElement.innerHTML = `
          <img class="img-pelicula" src="https://image.tmdb.org/t/p/w200${
            pelicula.poster_path
          }" alt="${pelicula.title}">
            <div class="titulo-anio-pelicula"><h2 class="titulo-pelicula">${
              pelicula.title
            }</h2>
            <h2 class="anio-pelicula"> ${
              pelicula.release_date ? pelicula.release_date.slice(0, 4) : "N/A"
            }</h2></div>
            <h2>${duracion > 0 ? duracion : "N/A"}</h2>`;

          peliculaElement.appendChild(generosContainer);

          if (pelicula.poster_path) {
            resultadoPelicula.appendChild(peliculaElement);
          }
        })
        .catch((error) => alert("Ocurrió un error: " + error));
    });
  } catch (error) {
    alert("Ocurrió un error al buscar la película: " + error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  generosPeliculas();
  document.getElementById("resultadoPeliculaGenero").style.display = "block";

  buscarPeliculaPorGenero("Comedia");
  buscarPeliculaPorGenero("Accion");
  buscarPeliculaPorGenero("Familia");

  document
    .getElementById("btnBuscarPelicula")
    .addEventListener("click", (e) => {
      e.preventDefault();

      document.getElementById("resultadoPeliculaGenero").style.display = "none";
      buscarPelicula();
    });
});

// TO DO
// Agregar a favoritos - agregar un boton o icono en las peliculas para poder
// agregarlas a favoritos
// Lista de favoritos - mostrar las peliculas que se agregaron a favoritos.
// Hacerlo con localStorage. Permitir que se puedan borrar de esa lista
// Agregar un boton para volver al header de la pagina
// Hacer responsive a PC
// Agregar footer - OPCIONAL
// Modo oscuro/claro - ULTIMO
