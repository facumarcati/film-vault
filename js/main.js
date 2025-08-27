const apiKey = "89177e61dbef1aabc1501bd1f683547d";

let peliculasFavoritas = [];

function guardarListaPeliculasFavoritas() {
  const listaPeliFavsJSON = JSON.stringify(peliculasFavoritas);
  localStorage.setItem("listaPeliculasFavoritas", listaPeliFavsJSON);
}

let listaPeliculasFavoritas = localStorage.getItem("listaPeliculasFavoritas");

if (listaPeliculasFavoritas) {
  peliculasFavoritas = JSON.parse(listaPeliculasFavoritas);
}

const Pelicula = function (
  id,
  titulo,
  imagen,
  anio,
  descripcion,
  duracion,
  generos
) {
  this.id = id;
  this.titulo = titulo;
  this.imagen = imagen;
  this.anio = anio;
  this.descripcion = descripcion;
  this.duracion = duracion;
  this.generos = generos;
};

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
  document.getElementById("section-peliculas").style.display = "block";
  document.getElementById("section-peliculas-favoritas").style.display = "none";
  document.getElementById("section-main").style.display = "none";
  document.getElementById("section-detalle-pelicula").style.display = "none";

  const seccionActiva = "section-peliculas";

  const txtPelicula = document.getElementById("txtPelicula").value;
  const resultadoPelicula = document.getElementById("resultadoPelicula");

  if (txtPelicula === "" || txtPelicula.length < 4) {
    document.getElementById("resultadoPeliculaGenero").style.display = "flex";
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

    document.getElementById("txtResultadoPelicula").innerHTML =
      "Peliculas de " + txtPelicula;

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
          const descripcion = data.overview;

          generosPelicula.forEach((genero) => {
            const generoElement = document.createElement("span");
            generoElement.textContent = genero.name;
            generoElement.classList.add("generos");

            generosContainer.appendChild(generoElement);
          });

          peliculaElement.innerHTML = `
          <div class="container-img-pelicula"><img class="img-pelicula" src="https://image.tmdb.org/t/p/w500${
            pelicula.poster_path
          }" alt="${pelicula.title}"></div>
            <div class="datos-pelicula">
            <div class="titulo-star"><h2 class="titulo-pelicula">${
              pelicula.title
            }</h2>
            <div class="container-icon"><h2><svg class="star-icon" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg></h2></div></div>
            <div class="anio-duracion-pelicula"><h2 class="anio-pelicula"> ${
              pelicula.release_date ? pelicula.release_date.slice(0, 4) : "N/A"
            }</h2>
            <p class="duracion-pelicula"> •</p>
            <h2 class="duracion-pelicula">${
              duracion > 0 ? duracion + " min" : "N/A"
            }</h2></div></div>`;

          peliculaElement.appendChild(generosContainer);

          const iconoFavoritos = peliculaElement.querySelectorAll(".star-icon");
          iconoFavoritos.forEach((icono) => {
            icono.addEventListener("click", (e) => {
              e.stopPropagation();

              const peliculaFavorita = new Pelicula(
                pelicula.id,
                pelicula.title,
                pelicula.poster_path,
                pelicula.release_date
                  ? pelicula.release_date.slice(0, 4)
                  : "N/A",
                descripcion,
                duracion > 0 ? duracion : "N/A",
                generosPelicula.map((g) => g.name)
              );

              agregarPeliculaFavorita(peliculaFavorita);
            });
          });

          peliculaElement.addEventListener("click", () => {
            const peliculaDetalle = new Pelicula(
              pelicula.id,
              pelicula.title,
              pelicula.poster_path,
              pelicula.release_date ? pelicula.release_date.slice(0, 4) : "N/A",
              descripcion,
              duracion > 0 ? duracion : "N/A",
              generosPelicula.map((g) => g.name)
            );

            detallePelicula(peliculaDetalle, seccionActiva);
          });

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

  const seccionActiva = "section-main";

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
          const descripcion = data.overview;

          generosPelicula.forEach((genero) => {
            const generoElement = document.createElement("span");
            generoElement.textContent = genero.name;
            generoElement.classList.add("generos");

            generosContainer.appendChild(generoElement);
          });

          peliculaElement.innerHTML = `
          <div class="container-img-pelicula"><img class="img-pelicula" src="https://image.tmdb.org/t/p/w500${
            pelicula.poster_path
          }" alt="${pelicula.title}"></div>
            <div class="datos-pelicula">
            <div class="titulo-star"><h2 class="titulo-pelicula">${
              pelicula.title
            }</h2>
            <div class="container-icon">
            <h2><svg class="star-icon" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg></h2></div></div>
            <div class="anio-duracion-pelicula"><h2 class="anio-pelicula"> ${
              pelicula.release_date ? pelicula.release_date.slice(0, 4) : "N/A"
            }</h2>
            <p class="duracion-pelicula"> •</p>
            <h2 class="duracion-pelicula">${
              duracion > 0 ? duracion + " min" : "N/A"
            }</h2></div></div>`;

          peliculaElement.appendChild(generosContainer);

          const iconoFavoritos = peliculaElement.querySelectorAll(".star-icon");
          iconoFavoritos.forEach((icono) => {
            icono.addEventListener("click", (e) => {
              e.stopPropagation();

              const peliculaFavorita = new Pelicula(
                pelicula.id,
                pelicula.title,
                pelicula.poster_path,
                pelicula.release_date
                  ? pelicula.release_date.slice(0, 4)
                  : "N/A",
                descripcion,
                duracion > 0 ? duracion : "N/A",
                generosPelicula.map((g) => g.name)
              );

              agregarPeliculaFavorita(peliculaFavorita);
            });
          });

          peliculaElement.addEventListener("click", () => {
            const peliculaDetalle = new Pelicula(
              pelicula.id,
              pelicula.title,
              pelicula.poster_path,
              pelicula.release_date ? pelicula.release_date.slice(0, 4) : "N/A",
              descripcion,
              duracion > 0 ? duracion : "N/A",
              generosPelicula.map((g) => g.name)
            );

            detallePelicula(peliculaDetalle, seccionActiva);
          });

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

function agregarPeliculaFavorita(peliculaFav) {
  const peliculaExiste = peliculasFavoritas.find(
    (p) => p.id === peliculaFav.id
  );

  if (peliculaExiste) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "error",
      title: "ESA PELICULA YA ESTÁ EN FAVORITOS",
      background: "#9b2222ff",
      color: "#fff",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });

    return;
  }

  peliculasFavoritas.push(peliculaFav);

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "PELICULA AGREGADA A FAVORITOS",
    background: "#208839ff",
    color: "#fff",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });

  guardarListaPeliculasFavoritas();
}

function mostrarPeliculasFavoritas() {
  document.getElementById("section-peliculas-favoritas").style.display =
    "block";
  document.getElementById("section-peliculas").style.display = "none";
  document.getElementById("section-main").style.display = "none";
  document.getElementById("section-detalle-pelicula").style.display = "none";

  const seccionActiva = "section-peliculas-favoritas";

  const resultadoPelicula = document.getElementById(
    "resultadoPeliculasFavoritas"
  );
  resultadoPelicula.innerHTML = "";

  document.getElementById("txtResultadoPeliculaFav").innerHTML =
    "Peliculas favoritas";

  try {
    const peliculas = peliculasFavoritas;

    if (peliculas.length === 0) {
      resultadoPelicula.innerHTML = "No hay peliculas guardadas";
      return;
    }

    peliculas.forEach((pelicula) => {
      const peliculaElement = document.createElement("div");
      peliculaElement.classList.add("container-pelicula");

      const generosContainer = document.createElement("div");
      generosContainer.classList.add("generos-container");

      pelicula.generos.forEach((genero) => {
        const generoElement = document.createElement("span");
        generoElement.textContent = genero;
        generoElement.classList.add("generos");
        generosContainer.appendChild(generoElement);
      });

      peliculaElement.innerHTML = `
          <div class="container-img-pelicula"><img class="img-pelicula" src="https://image.tmdb.org/t/p/w500${
            pelicula.imagen
          }" alt="${pelicula.titulo}"></div>
            <div class="datos-pelicula">
            <div class="titulo-star"><h2 class="titulo-pelicula">${
              pelicula.titulo
            }</h2>
            <div class="container-x-icon">
            <h2><svg class="x-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M183.1 137.4C170.6 124.9 150.3 124.9 137.8 137.4C125.3 149.9 125.3 170.2 137.8 182.7L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7L320.5 365.3L457.9 502.6C470.4 515.1 490.7 515.1 503.2 502.6C515.7 490.1 515.7 469.8 503.2 457.3L365.8 320L503.1 182.6C515.6 170.1 515.6 149.8 503.1 137.3C490.6 124.8 470.3 124.8 457.8 137.3L320.5 274.7L183.1 137.4z"/></svg></h2></div></div>
            <div class="anio-duracion-pelicula"><h2 class="anio-pelicula"> ${
              pelicula.anio ? pelicula.anio : "N/A"
            }</h2>
            <p class="duracion-pelicula"> •</p>
            <h2 class="duracion-pelicula">${
              pelicula.duracion > 0 ? pelicula.duracion + " min" : "N/A"
            }</h2></div></div>`;

      const iconoEliminar = peliculaElement.querySelectorAll(".x-icon");
      iconoEliminar.forEach((icono) => {
        icono.addEventListener("click", (e) => {
          e.stopPropagation();

          Swal.fire({
            title: "Queres eliminar la pelicula?",
            icon: "warning",
            background: "#1f1f1f",
            color: "#fff",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
          }).then((result) => {
            if (result.isConfirmed) {
              eliminarPeliculaFavorita(pelicula);

              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "PELICULA ELIMINADA CORRECTAMENTE",
                background: "#208839ff",
                color: "#fff",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
              });
            }
          });
        });
      });

      peliculaElement.addEventListener("click", () => {
        detallePelicula(pelicula, seccionActiva);
      });

      peliculaElement.appendChild(generosContainer);
      resultadoPelicula.appendChild(peliculaElement);
    });
  } catch (error) {
    alert("Ocurrió un error al buscar la película: " + error);
  }
}

function eliminarPeliculaFavorita(pelicula) {
  peliculasFavoritas = peliculasFavoritas.filter((p) => p.id !== pelicula.id);

  guardarListaPeliculasFavoritas();

  mostrarPeliculasFavoritas();
}

function detallePelicula(pelicula, seccionActiva) {
  const resultadoPelicula = document.getElementById("detalle-pelicula");
  resultadoPelicula.innerHTML = "";

  document.getElementById("section-main").style.display = "none";
  document.getElementById("section-peliculas").style.display = "none";
  document.getElementById("section-peliculas-favoritas").style.display = "none";
  document.getElementById("section-detalle-pelicula").style.display = "block";

  const peliculaElement = document.createElement("div");
  peliculaElement.classList.add("container-detalle-card-pelicula");

  const generosContainer = document.createElement("div");
  generosContainer.classList.add("generos-detalle-container");

  pelicula.generos.forEach((genero) => {
    const generoElement = document.createElement("span");
    generoElement.textContent = genero;
    generoElement.classList.add("generos");
    generosContainer.appendChild(generoElement);
  });

  peliculaElement.innerHTML = `
  <div class="container-detalle-pelicula">
  <div class="container-img-detalle-pelicula">
          <img class="img-detalle-pelicula" src="https://image.tmdb.org/t/p/w500${
            pelicula.imagen
          }" alt="${pelicula.titulo}"></div>
          <div class="container-datos-detalle-pelicula">
            <h2 class="titulo-pelicula-detalle">${pelicula.titulo}</h2>
            <div class="anio-duracion-pelicula"><h2 class="anio-pelicula-detalle"> ${
              pelicula.anio ? pelicula.anio : "N/A"
            }</h2>
            <p class="duracion-pelicula"> •</p>
            <h2 class="duracion-pelicula-detalle">${
              pelicula.duracion > 0 ? pelicula.duracion + " min" : "N/A"
            }</h2></div>
          <p class="descripcion-pelicula-detalle">${
            pelicula.descripcion || "Sin descripción disponible"
          }</p></div></div>`;

  peliculaElement.appendChild(generosContainer);
  resultadoPelicula.appendChild(peliculaElement);

  const flechaVolver = document.getElementById("flecha-volver");

  if (flechaVolver.volverListener) {
    flechaVolver.removeEventListener("click", flechaVolver.volverListener);
  }

  flechaVolver.volverListener = function (e) {
    e.preventDefault();
    volver(seccionActiva);
  };

  flechaVolver.addEventListener("click", flechaVolver.volverListener);
}

function volver(seccionActiva) {
  document.getElementById("section-detalle-pelicula").style.display = "none";
  document.getElementById(seccionActiva).style.display = "block";
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("resultadoPeliculaGenero").style.display = "flex";
  document.getElementById("resultadoPeliculaGenero").style.flexDirection =
    "column";

  document.getElementById("section-peliculas").style.display = "none";
  document.getElementById("section-peliculas-favoritas").style.display = "none";
  document.getElementById("section-detalle-pelicula").style.display = "none";

  buscarPeliculaPorGenero("Comedia");
  buscarPeliculaPorGenero("Accion");
  buscarPeliculaPorGenero("Familia");

  document
    .getElementById("btnBuscarPelicula")
    .addEventListener("click", (e) => {
      e.preventDefault();

      buscarPelicula();
    });

  document
    .getElementById("peliculasFavoritas")
    .addEventListener("click", (e) => {
      e.preventDefault();

      mostrarPeliculasFavoritas();
    });
});
