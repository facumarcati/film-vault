const apiKey = "89177e61dbef1aabc1501bd1f683547d";

function buscarPelicula() {
  let pelicula = document.getElementById("txtPelicula").value;
  const resultadoPelicula = document.getElementById("resultadoPelicula");

  if (pelicula === "") {
    resultadoPelicula.innerHTML = "Escribí un nombre de película";
    return;
  }

  resultadoPelicula.innerHTML = "";

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
    pelicula
  )}`;

  document.getElementById("txtPelicula").value = "";
  try {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const peliculas = data.results;

        peliculas.forEach((pelicula) => {
          const peliculaElement = document.createElement("div");
          peliculaElement.classList.add("container-pelicula");
          peliculaElement.innerHTML = `
        <img class="img-pelicula" src="https://image.tmdb.org/t/p/w200${
          pelicula.poster_path
        }" alt="${pelicula.title}">
          <h2 class="titulo-pelicula">${pelicula.title}</h2>
          <h2 class="anio-pelicula"> ${
            pelicula.release_date ? pelicula.release_date.slice(0, 4) : "N/A"
          }</h2>
        
      `;
          resultadoPelicula.appendChild(peliculaElement);
        });
      })
      .catch(() => alert("No se encontro ninguna pelicula"));
  } catch (error) {
    alert(error);
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
