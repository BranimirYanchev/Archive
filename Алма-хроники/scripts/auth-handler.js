/* ------------------------ */
/* Submit Button Handling */
/* ------------------------ */

sessionStorage.setItem("timer", 30)
sessionStorage.setItem("tries", 0)

$(submitBtns).on('click', function (e) {
    e.preventDefault();

    checkTries($(this));
    preventSpam($(this));

    const currentId = submitBtns.index(this);
    const forms = [$('#login-form')[0], $('#register-form')[0]];

    let url = "http://localhost:5175/api/register";
    let data = formToJSON(forms[currentId]);

    if (currentId == 0) {
        url = "http://localhost:5175/api/login";
        sendData(data, "POST", url, "L");
        return;
    }

    sendData(data, "POST", url);
});

/* ----------------------------- */
/* Utility: Convert Form to JSON */
/* ----------------------------- */
function formToJSON(form) {
    const formData = new FormData(form);
    const jsonObject = {};
    formData.forEach((value, key) => {
        jsonObject[key] = value.trim();
    });
    return jsonObject;
}

/* ----------------------------- */
/* AJAX Data Sending Function */
/* ----------------------------- */
function sendData(data, method, url, type = "R") {
    toastr.info("Моля изчакайте, докато се обработят вашите данни!");
    $.ajax({
        url: url,
        type: method,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            if (response.url != "") {
                sessionStorage.setItem("email", data.email);
                sessionStorage.setItem("user_Id", response.id)
                sessionStorage.setItem("isUserLogged", true);
                sessionStorage.setItem('password', data.password);
                sessionStorage.setItem("hasToReload", true);
                sessionStorage.setItem("role", data.role);
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
    role: "Трябва да селектирате роля!",
    email: "Неправилен имейл!",
    firstName: "Полето име не отговаря на изискванията!",
    lastName: "Полето фамилия не отговаря на изискванията!",
    password: "Паролата не отговаря на изискванията!",
    passwordsMatch: "Паролите не съвпадат!",
}

// TODO: Add info messages and toastr.info()

/* --------------------------- */
/* Register Data Handler */
/* --------------------------- */
function handleRegisterData(response, type) {
    Object.keys(response).some((key) => {
        if (response[key] === false && key !== "url") {
            if (key !== "isUserExists") {
                toastr.error(errorMessages[key]);
            }
            return true; // Stops the loop after the first iteration
        } else if (key === "isUserExists" && response[key]) {
            toastr.error("Потребител с тези данни вече съществува!");
            return true; // Stops the loop after the first iteration
        } else if($("#userRole").val() == "teacher" && !response["code"]){
            toastr.error("Невалиден код!");
            return true; // Stops the loop after the first iteration
        }
    });
}

/* ------------------------ */
/* Login Data Handler */
/* ------------------------ */

function handleLoginData(response) {
    let counter = 0;
    Object.keys(response).forEach((key) => {
        if (response[key] == false && key != "url" && key != "isUserExists" && key != "id" && counter < 1) {
            toastr.error(errorMessages[key]);
            counter++;
            return true;
        }

        if(key == "isUserExists" && counter < 1){
            toastr.error("Потребител с тези данни не съществува!");
            return true;
        }
    });
}

/* ------------------------ */
/* Security */
/* ------------------------ */


function checkTries(el) {
    let tries = parseInt(sessionStorage.getItem("tries")) || 0;
    let timer = parseInt(sessionStorage.getItem("timer")) || 10;

    tries++;
    sessionStorage.setItem("tries", tries);

    if (tries >= 5) {
        toastr.warning(`Изчакайте ${timer} секунди преди следващия опит.`);
        $(submitBtns).prop("disabled", true);

        let countdown = setInterval(() => {
            timer--;
            sessionStorage.setItem("timer", timer);

            toastr.info(`Оставащо време: ${timer} секунди`);

            if (timer <= 0) {
                clearInterval(countdown);
                sessionStorage.setItem("tries", 0); // Нулира опитите след забавянето
                sessionStorage.setItem("timer", 10); // Рестартира таймера
                $(submitBtns).prop( "disabled", false);
                sessionStorage.clear();
            }
        }, 3000); 
    }
}


function preventSpam(el) { 
    if(sessionStorage.getItem("tries") > 5) return;
    el.prop( "disabled", true );

    setTimeout(() => {
        el.prop( "disabled", false);
    }, 500); // 2 секунди (можеш да промениш стойността)
}
