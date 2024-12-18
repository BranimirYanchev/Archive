let id = sessionStorage.getItem('id');
const formContainers = [$('#signInForm')[0], $('#signUpForm')[0]];
const toggleBtns = $('.toggle-button');
const submitBtns = $('.submit-button');

if(sessionStorage.getItem('isUserLogged')){
    const data = {
        email: sessionStorage.getItem('email'),
        password: sessionStorage.getItem('password')
    }

    sendData(data, "POST", "http://localhost:5175/api/login", "L");
}

if (id == null) {
    id = 1;
}

$(formContainers[id]).addClass('d-none')

toggleBtns.on('click', function () {
    toggleformContainers(formContainers);
    sessionStorage.setItem('id', toggleBtns.index(this));
});

$(submitBtns).on('click', function (e) {
    e.preventDefault();

    const currentId = submitBtns.index(this);
    const forms = [$('#login-form')[0], $('#register-form')[0]];

    let url = "http://localhost:5175/api/register"
    let data = formToJSON(forms[currentId]);

    if (currentId == 0) {
        url = "http://localhost:5175/api/login";
        sendData(data, "POST", url, "L");
        return;
    }

    sendData(data, "POST", url);
});
const togglePassBtnsT = $('.toggle');
const togglePassBtnsS = $('.toggle-slash');

togglePassBtnsS.on('click', function(){
    console.log(togglePassBtnsS.index(this));
    togglePassVisibility(togglePassBtnsS.index(this));
});

togglePassBtnsT.on('click', function(){
    console.log(togglePassBtnsT.index(this));
    togglePassVisibility(togglePassBtnsT.index(this));
});


function togglePassVisibility(i){
    console.log(i);    
    const passwordField = $('.toggled')[i];
    const isPassword = passwordField.getAttribute('type') === 'password';

    // Toggle password field type
    passwordField.setAttribute('type', isPassword ? 'text' : 'password');

    // Toggle icons visibility
    $('.toggle').toggleClass('d-none');
    $('.toggle-slash').toggleClass('d-none');
}

// Function to toggle between Sign In and Sign Up formContainers
function toggleformContainers(formContainers) {
    formContainers.forEach(e => $(e).toggleClass('d-none'));
}

// Convert form data to JSON
function formToJSON(form) {
    const formData = new FormData(form);
    const jsonObject = {};
    formData.forEach((value, key) => {
        jsonObject[key] = value;
    });
    return jsonObject;
}

function sendData(data, method, url, type = "R") {
    $.ajax({
        url: url,
        type: method,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            if (response.url != "") {
                sessionStorage.setItem("email", data.email);
                sessionStorage.setItem("id", 0);
                sessionStorage.setItem("isUserLogged", true);
                sessionStorage.setItem('password', data.password);
                window.open(response.url, "_self");
            } else {
                if (type == "R") {
                    handleRegisterData(response);
                    return;
                }

                handleLoginData(response);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    })
}

// Custom options for Toastr
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null
};

const errorMessages = {
    email: "Неправилен имейл!",
    firstName: "Полето име не може да бъде празно!",
    lastName: "Полето фамилия не може да бъде празно!",
    password: "Неправилна парола!",
    passwordsMatch: "Паролите не съвпадат!",
    isUserExists: "Потребител с тези данни вече съществува!"
}

// TODO: Add info messages and toastr.info()

function handleRegisterData(response) {
    Object.keys(response).forEach((key) => {
        if (response[key] == false && key != "url") {
            console.warn(key);
            if (key != "isUserExists") {
                toastr.error(errorMessages[key]);
                return;
            };
        }else if(key == "isUserExists" && response[key]){
            toastr.error(errorMessages[key]);
            return;
        }
    });
}

function handleLoginData(response) {
    Object.keys(response).forEach((key) => {
        if (response[key] == false && key != "url") {
            toastr.error(errorMessages[key]);
            return;
        }
    });
}