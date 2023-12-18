const content = document.querySelector('.content')

let baseUrl = "https://partiel-b1dev.imatrythis.com/api/"
let token = null


function render(pageContent) {
    content.innerHTML = ""
    content.innerHTML = pageContent
}

function run() {
    if (!token) {
        loginForm()
    } else {
        renderMyList()
        clearList()
        refreshList()
    }
}

function registerForm() {
    let templateRegisterForm = `<div class="container mt-5">
        <form id="registerForm" class="m-3">
            <label for="username" class="form-label">Nom d'utilisateur:</label>
            <input type="text" id="username" name="username" class="form-control" required>
            
            <label for="password" class="form-label">Mot de passe:</label>
            <input type="password" id="password" name="password" class="form-control" required>

            <div class="mt-3">
                <button type="button" onclick="register()" class="btn btn-primary">S'inscrire</button>
                <p class="d-inline ml-2"> <button onclick="loginForm()" class="btn btn-link">Se connecter</button></p>
            </div>
        </form>
    </div>`

    render(templateRegisterForm)
}

function updateUsername(newUsername) {
    userName = newUsername;

    const navbarBrand = document.querySelector('.navbar-brand');
    navbarBrand.textContent = `Page de ${userName}`;
}

async function postDataRegister(url = '', donnees = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(donnees),
    })
    return response.json()
}

async function register() {
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const response = await postDataRegister(baseUrl + 'register', { username, password })
    console.log(response)
}

function loginForm() {
    let templateLoginForm = `<div class="container mt-5">
        <form id="loginForm" class="m-3 container">
            <label for="username" class="form-label">Nom d'utilisateur:</label>
            <input type="text" id="username" name="username" class="form-control" required>

            <label for="password" class="form-label">Mot de passe:</label>
            <input type="password" id="password" name="password" class="form-control" required>

            <div class="mt-3">
                <button type="button" onclick="login()" class="btn btn-primary">Se connecter</button>
                <p class="d-inline ml-2"> <button onclick="registerForm()" class="btn btn-link">S'inscrire</button></p>
            </div>
        </form>
    </div>`

    render(templateLoginForm)
}

async function postDataLogin(url = '', donnees = {}) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(donnees),
    });
    return response.json()
}

async function login() {
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const response = await postDataLogin(baseUrl + 'login', { username, password })
    console.log(response)
    if (response.token) {
        token = response.token
        updateUsername(username)
        getMyList()
    }
}

async function getMyList() {
    const response = await fetch(baseUrl + 'mylist', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (response.ok) {
        const myList = await response.json()
        renderMyList(myList)
    } else {
        console.error('Erreur lors de la récupération de la liste de courses')
    }
}

async function addCourseForm(event) {
    event.preventDefault();
    const name = document.getElementById('courseName').value;
    const description = document.getElementById('courseDescription').value;

    if (name.trim() !== '') {
        const response = await fetch(baseUrl + 'mylist/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, status: false }),
        });

        if (response.ok) {
            getMyList();
        } else {
            console.error('Erreur lors de l\'ajout de la course');
        }
    } else {
        alert('Veuillez saisir le nom de la course.');
    }
}

async function refreshList() {
    const response = await fetch(baseUrl + 'mylist', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const myList = await response.json()
        renderMyList(myList)
    } else {
        console.error('Erreur lors du rafraîchissement de la liste de courses')
    }
}

async function clearList() {
    const response = await fetch(baseUrl + 'mylist/clear', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (response.ok) {
        renderMyList([])
    } else {
        console.error('Erreur lors de la suppression de la liste de courses')
    }
}

function renderMyList(myList) {
    let myListHTML = '<h2 class="text-center mt-5">Ma liste de courses</h2>'

    if (myList.length === 0) {
        myListHTML += '<p class="text-center">La liste de course est vide.</p>'
    } else {
        myListHTML += '<div class="row container-fluid">'

        myList.forEach(item => {
            myListHTML += `
        <div class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text" id="description-${item.id}">${item.description || 'Aucune description'}</p>
                    <button onclick="editDescription(${item.id})" class="btn btn-warning btn-sm">Modifier la description</button>
                    <p class="card-text">Statut: ${item.status ? 'Acheté' : 'En attente'}</p>
                    <button onclick="addImageForItem(${item.id})" class="btn btn-success btn-sm">Ajouter une image</button>
                    <button onclick="changeStatus(${item.id})" class="btn btn-primary">Changer le statut</button>
                    <button onclick="deleteCourse(${item.id})" class="btn btn-danger ml-2">Supprimer</button>
                </div>
            </div>
        </div>`;
        })

        myListHTML += '</div>'
    }

    myListHTML +=`
<div class="text-center m-2">
    <form onsubmit="addCourseForm(event)">  
        <label for="courseName"></label> 
        <input type="text" id="courseName" name="courseName" placeholder="nom de la course" required>
        <label for="courseDescription"></label>
        <input type="text" id="courseDescription" placeholder="description de la course" name="courseDescription"> 
        <br>
        <button type="submit"  class="btn btn-primary mt-5">Ajouter une course</button>
        <button onclick="clearList()" class="btn btn-danger mt-5">Supprimer la liste</button>
    </form>
</div>`

    content.innerHTML = myListHTML;
}

function editDescription(itemId) {
    const descriptionElement = document.getElementById(`description-${itemId}`);
    const currentDescription = descriptionElement.innerText;

    const newDescription = prompt("Nouvelle description de la course:", currentDescription);

    if (newDescription !== null) {
        descriptionElement.innerText = newDescription;
        updateCourse(itemId, { description: newDescription });
    }
}


async function deleteCourse(itemId) {
    const response = await fetch(baseUrl + `mylist/delete/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });

    if (response.ok) {
        refreshList()
    } else {
        console.error('Erreur lors de la suppression de la course')
    }
}


async function changeStatus(itemId) {
    const response = await fetch(baseUrl + `mylist/switchstatus/${itemId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });

    if (response.ok) {
        refreshList();
    } else {
        console.error('Erreur lors du changement de statut de la course')
    }
}


run();