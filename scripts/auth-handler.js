/* 🔐 -------------------------------- */
/*    Session Defaults (за сигурност) */
/* ---------------------------------- */
sessionStorage.setItem("timer", 30);
sessionStorage.setItem("tries", 0);

/* 🚀 ------------------------------- */
/*    Submit Button Logic (Login / Register) */
/* ------------------------------- */
$(submitBtns).on('click', function (e) {
    e.preventDefault();

    $(e.currentTarget).text("Обработване...");

    checkTries($(this));// 🔐 Проверка на броя опити

    const currentId = submitBtns.index(this); // 0: login, 1: register
    const forms = [$('#login-form')[0], $('#register-form')[0]];

    let url = "https://archive-4vi4.onrender.com/api/register";
    let data = formToJSON(forms[currentId]);

    if (currentId === 0) {
        url = "https://archive-4vi4.onrender.com/api/login";
        sendData(data, "POST", url, "L");
        return;
    }

    sendData(data, "POST", url);
});

/* 🧰 ------------------------------------------ */
/* Convert HTML Form Data to JSON Object Format */
/* -------------------------------------------- */
/**
 * Преобразува формуляра във формат JSON.
 * Използва се за по-удобна обработка и изпращане чрез AJAX.
 */
function formToJSON(form) {
    const formData = new FormData(form);
    const jsonObject = {};
    formData.forEach((value, key) => {
        jsonObject[key] = value.trim();
    });
    return jsonObject;
}

/* 🛡️ Създаване на временен токен за логване */
async function createUserToken(userId) {
    try {
        const response = await fetch("https://archive-4vi4.onrender.com/api/verify_log/create_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId })
        });

        const result = await response.json();

        if (result.isTokenCreated) {
            console.log(result);
            return result.token;
        } else {
            toastr.error("Неуспешно създаване на токен. 🛑");
            return null;
        }
    } catch (error) {
        console.error("Грешка при заявката за токен:", error);
        toastr.error("Възникна грешка при заявката за токен! ❌");
        return null;
    }
}


/* 📡 ---------------------------------- */
/* Function for AJAX Submission of Data */
/* ------------------------------------ */
/**
 * Изпраща данните от login/register формата към сървъра.
 * @param {Object} data - Данните от формата
 * @param {string} method - HTTP метод (POST)
 * @param {string} url - Крайна точка от API-то
 * @param {string} type - "R" (register) или "L" (login)
 */
async function sendData(data, method, url, type = "R") {
    $.ajax({
        url,
        type: method,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: async function (response) {
            if (response.url !== "") {
                // 🎉 Успешен login/register
                sessionStorage.setItem("email", data.email);
                sessionStorage.setItem("user_Id", response.id);
                sessionStorage.setItem("isUserLogged", true);
                sessionStorage.setItem("hasToReload", true);
                sessionStorage.setItem("role", data.role);
                
                if(type != "R"){
                    const token = await createUserToken(response.id); // 🆕 Временен токен

                    if (token) {
                        sessionStorage.setItem("token", token);
                    }
                }

                if(data.email == adminEmail){
                    window.open("administrator.html", "_self");
                }

                window.open(response.url, "_self");
                $(submitBtns).text("Потвърди");
            } else {
                $(submitBtns).text("Потвърди");
                // 🛑 Обработка на грешки
                if (type === "R") {
                    handleRegisterData(response);
                } else if (type === "L") {
                    handleLoginData(response);
                }
            }
        },
        error: function (xhr, status, error) {
            console.error("❌ Грешка при заявка:", error);
        }
    });
}


/* 🔔 ---------------------------- */
/* Toastr Notifications Settings */
/* ----------------------------- */
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: true,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: true,
    onclick: null
};

/* ⚠️ ----------------------------- */
/* Съобщения за грешки при формите */
/* ------------------------------- */
const errorMessages = {
    role: "Трябва да селектирате роля!",
    email: "Неправилен имейл!",
    firstName: "Полето име не отговаря на изискванията!",
    lastName: "Полето фамилия не отговаря на изискванията!",
    password: "Паролата не отговаря на изискванията!",
    passwordsMatch: "Паролите не съвпадат!",
};

/* ✅ ----------------------------- */
/* Handle Register API Response */
/* ----------------------------- */
/**
 * Обработва отговора от регистрационната форма.
 */
function handleRegisterData(response) {
    Object.keys(response).some((key) => {
        if (response[key] === false && key !== "url") {
            if (key !== "isUserExists") {
                toastr.error(errorMessages[key] || "Невалидна стойност.");
            }
            return true;
        }

        if (key === "isUserExists" && response[key]) {
            toastr.error("⚠️ Потребител с тези данни вече съществува!");
            return true;
        }

        if ($("#userRole").val() === "teacher" && !response["code"]) {
            toastr.error("❌ Невалиден код за учител!");
            return true;
        }
    });
}

/* 🔐 ---------------------------- */
/* Handle Login API Response     */
/* ---------------------------- */
/**
 * Обработва отговора от login формата.
 */
function handleLoginData(response) {
    let counter = 0;
    Object.keys(response).forEach((key) => {
        if (response[key] === false && key !== "url" && key !== "isUserExists" && key !== "id" && counter < 1) {
            toastr.error(errorMessages[key] || "Грешка при вход.");
            counter++;
        }

        if (key === "isUserExists" && counter < 1) {
            toastr.error("🚫 Потребител с тези данни не съществува!");
            counter++;
        }
    });
}

/* 🛡️ ---------------------------- */
/* Login/Register Brute Force Protection */
/* ---------------------------- */
/**
 * След 5 грешни опита блокира бутоните за известно време.
 */
function checkTries(el) {
    let tries = parseInt(sessionStorage.getItem("tries")) || 0;
    let timer = parseInt(sessionStorage.getItem("timer")) || 10;

    tries++;
    sessionStorage.setItem("tries", tries);

    if (tries >= 5) {
        toastr.warning(`⏳ Изчакайте ${timer} секунди преди следващия опит.`);
        $(submitBtns).prop("disabled", true);

        let countdown = setInterval(() => {
            timer--;
            sessionStorage.setItem("timer", timer);

            toastr.info(`🕒 Оставащо време: ${timer} сек.`);

            if (timer <= 0) {
                clearInterval(countdown);
                sessionStorage.setItem("tries", 0);
                sessionStorage.setItem("timer", 10);
                $(submitBtns).prop("disabled", false);
                sessionStorage.clear();
            }
        }, 3000);
    }
}