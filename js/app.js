
document.addEventListener('DOMContentLoaded', iniciarApp);


async function iniciarApp() {

    const selectCategorias = document.querySelector('#categorias');
    const resultados = document.querySelector('#resultado');


    if (selectCategorias) {
        selectCategorias.addEventListener('change', seleccionarCategoria);
        obtenerCategorias();

    }

    const favoritosDiv = document.querySelector('.favoritos');
    if(favoritosDiv){
        obtenerFavoritos();
    }



    const modal = new bootstrap.Modal('#modal', {});



    async function obtenerCategorias() {
        const urlCategorias = 'https://www.themealdb.com/api/json/v1/1/categories.php'

        try {
            fetch(urlCategorias)
                .then(respuesta => {
                    return respuesta.json();
                })
                .then(resultado => {
                    resultado = resultado.categories;
                    mostrarCategorias(resultado);
                })

            function mostrarCategorias(categorias = []) {
                categorias.map((categoria) => {

                    const { strCategory } = categoria;

                    const option = document.createElement('option');
                    option.textContent = strCategory;
                    option.value = strCategory;

                    selectCategorias.appendChild(option);

                })
            }


        } catch (error) {
            console.log(error);
        }
    }


    function seleccionarCategoria(e) {

        const categoria = e.target.value;

        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;
        try {
            fetch(url)
                .then(respuesta => {
                    return respuesta.json();
                })
                .then(resultado => {
                    mostrarPlatos(resultado.meals);
                })




        } catch (error) {
            console.log(error);
        }



    }

    async function mostrarPlatos(platos = []) {
        limpiarHTML(resultados);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = platos.length > 0 ? 'Resultados' : 'No hay resultados';
        resultados.appendChild(heading);

        platos.map((plato => {

            const { strMeal, strMealThumb, idMeal } = plato;

            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen de la receta ${strMeal || plato.titulo}`;
            recetaImagen.src = strMealThumb || plato.img;

            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal || plato.titulo;

            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';
            // recetaButton.dataset.bsTarget = '#modal';
            // recetaButton.dataset.bsToggle = 'modal';
            recetaButton.onclick = function () {
                seleccionarReceta(idMeal || plato.id);
            }

            //Inyectar en el código HTML
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody);

            recetaContenedor.appendChild(recetaCard);

            resultados.appendChild(recetaContenedor);

        }))

    }

    function seleccionarReceta(id) {

        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`

        try {
            fetch(url)
                .then(respuesta => respuesta.json())
                .then(resultado => mostrarReceta(resultado.meals[0]));

        } catch (error) {
            console.log(error);
        }

    }

    function mostrarReceta(receta) {

        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

        const modalTitle = document.querySelector('.modal .modal-title');
        modalTitle.textContent = strMeal;
        const modalBody = document.querySelector('.modal .modal-body');
        modalBody.innerHTML = `
            <img
            class="img-fluid"
            src="${strMealThumb}"
            alt="Receta ${strMeal}"
            />

            <h3 class="my-3">Instrucciones</h3>

            <p>${strInstructions}</p>

            <h3 class="my-3">Ingredientes y Cantidades</h3>

        `

        const listGroup = document.createElement('DIV');
        listGroup.classList.add('list-group');
        //Mostrar los ingredientes y cantidades
        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`

                listGroup.appendChild(ingredienteLi);

            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHTML(modalFooter);

        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        //localstorage
        btnFavorito.onclick = function () {


            if (existeStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Eliminado Correctamente');
                return;

            }

            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });

            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Agregado Correctamente');

        }

        modalFooter.appendChild(btnFavorito);



        const btnCerrar = document.createElement('BUTTON');
        btnCerrar.classList.add('btn', 'btn-secondary', 'col');
        btnCerrar.textContent = 'Cerrar';
        btnCerrar.onclick = function () {
            modal.hide();
        }
        modalFooter.appendChild(btnCerrar);


        // * Muestra el modal
        modal.show();


    }

    function agregarFavorito(receta) {

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));

    }

    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        const favoritosActualizados = favoritos.filter(favorito => favorito.id !== id);
        localStorage.setItem('favoritos', JSON.stringify(favoritosActualizados));
    }

    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        return favoritos.some(favorito => favorito.id === id);


    }

    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;

        toast.show();
    }

    function obtenerFavoritos(){

        const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
        if(favoritos){
            mostrarPlatos(favoritos);
            return;
        }
        const noFavoritos = document.createElement('P');
        noFavoritos.classList.add('font-bold', 'mt-5','fs-4', 'text-center');
        noFavoritos.textContent = 'No hay ninguna receta en favoritos';
        favoritosDiv.appendChild(noFavoritos);

    }

    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }
}