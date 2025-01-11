sessionStorage.clear();

/* -------------------------- */
/* Session Storage Handling */
/* -------------------------- */
let id = sessionStorage.getItem('id');
const formContainers = [$('#signInForm')[0], $('#signUpForm')[0]];
const toggleBtns = $('.toggle-button');
const submitBtns = $('.submit-button');

if (id == null) {
    id = 1;
}

$(formContainers[id]).addClass('d-none');

toggleBtns.on('click', function () {
    toggleformContainers(formContainers);
    sessionStorage.setItem('id', toggleBtns.index(this));
});

function toggleformContainers(formContainers) {
    formContainers.forEach(e => $(e).toggleClass('d-none'));
}

/* --------------------------- */
/* Get Role */
/* --------------------------- */
const input = $('input');
const span = $('.red-clr');

// Show the span when input gains focus
input.on('focus', function(){
  span[input.index(this)-1].style.display = 'inline';
});

// Hide the span when input loses focus
input.on('blur', function(){
  span[input.index(this)-1].style.display = 'none';
    $(".toggle-btns-container").style.height = 60 + "%"
});

/* ----------------------------- */
/* Role Adjustment */
/* ----------------------------- */
if($("#userRole")[0].value == "teacher"){
    $('.non-teacher').addClass('d-none');
    $('.teacher').removeClass('d-none');
}

$('#userRole').on('change', function(){
    if(this.value == "teacher"){
        $('.teacher').removeClass('d-none');
        $('.non-teacher').addClass('d-none');
    }

    if(this.value != "teacher"){
        $('.teacher').addClass('d-none');
        $('.non-teacher').removeClass('d-none');
    }
});



/* ------------------------ */
/* Submit Button Handling */
/* ------------------------ */
$(submitBtns).on('click', function (e) {
    e.preventDefault();

    const currentId = submitBtns.index(this);
    const forms = [$('#login-form')[0], $('#register-form')[0]];

    let url = "http://localhost:5175/api/register";
    let data = formToJSON(forms[currentId]);

    if (currentId == 0) {
        url = "http://localhost:5175/api/login";
        sendData(data, "POST", url, "L");
        return;
    }

    console.warn(data.userRole);

    sendData(data, "POST", url);
});

/* --------------------------- */
/* Password Visibility Toggle */
/* --------------------------- */
const togglePassBtnsT = $('.toggle-non-slash');
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
    const passwordField = $('.toggled')[i];
    const isPassword = passwordField.getAttribute('type') === 'password';

    // Toggle password field type
    passwordField.setAttribute('type', isPassword ? 'text' : 'password');

    // Toggle icons visibility
    $('.toggle-non-slash').toggleClass('d-none');
    $('.toggle-slash').toggleClass('d-none');
}

/* ----------------------------- */
/* Utility: Convert Form to JSON */
/* ----------------------------- */
function formToJSON(form) {
    const formData = new FormData(form);
    const jsonObject = {};
    formData.forEach((value, key) => {
        jsonObject[key] = value;
    });
    return jsonObject;
}

/* ----------------------------- */
/* AJAX Data Sending Function */
/* ----------------------------- */
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
                }else if(type == "L"){
                    handleLoginData(response);
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        }
    })
}

/* ---------------------- */
/* Toastr Configuration */
/* ---------------------- */
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null
};

/* ---------------------------- */
/* Error Messages Configuration */
/* ---------------------------- */
const errorMessages = {
    email: "Неправилен имейл!",
    firstName: "Полето име не отговаря на изискванията!",
    lastName: "Полето фамилия не отговаря на изискванията!",
    password: "Паролата не отговаря на изискванията!",
    passwordsMatch: "Паролите не съвпадат!",
    role: "Трябва да селектирате роля!"
}

// TODO: Add info messages and toastr.info()

/* --------------------------- */
/* Register Data Handler */
/* --------------------------- */
function handleRegisterData(response) {
    Object.keys(response).forEach((key) => {
        if (response[key] == false && key != "url") {
            console.warn(key);
            if (key != "isUserExists") {
                toastr.error(errorMessages[key]);
            };
        }else if(key == "isUserExists" && response[key]){
            toastr.error("Потребител с тези данни вече съществува!");
        }
    });
}

/* ------------------------ */
/* Login Data Handler */
/* ------------------------ */
function handleLoginData(response) {
    Object.keys(response).forEach((key) => {
        if (response[key] == false && key != "url" && key != "isUserExists") {
            toastr.error(errorMessages[key]);
            return;
        }

        if(key == "isUserExists"){
            toastr.error("Потребител с тези данни не съществува!");
        }
    });
}
