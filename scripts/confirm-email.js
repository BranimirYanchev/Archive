/* ---------------------- */
/* ⚙️ Toastr конфигурация */
/* ---------------------- */
toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: true,
    progressBar: true,
    positionClass: "toast-top-right",
    preventDuplicates: true,
    onclick: null
};

hidePreloader();

/* ------------------------------------- */
/* 🔍 Взимане на токен и имейл от сесия */
/* ------------------------------------- */
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token'); // 🎟️ Вземаме токена от URL
const email = sessionStorage.getItem("email"); // 📩 Имейл от sessionStorage

// 🛡️ Проверка дали имаме нужните данни преди да продължим
if (token && email) {
    confirmEmail(token, email); // 📬 Потвърждаваме имейла с AJAX заявка
}else{
    sendNewEmail("", email);
}

/* -------------------------------------- */
/* 📡 AJAX заявка за потвърждение на имейл */
/* -------------------------------------- */
function confirmEmail(token, email) {
    $.ajax({
        url: `https://archive-4vi4.onrender.com/api/account/confirm-email?token=${token}&email=${email}`,
        type: "GET",
        success: function (response) {
            // ✅ Имейлът е успешно потвърден – пращаме потребителя към профила
            if (response.isEmailConfirmed) {
                // window.open("profile.html", "_self");
            } else {
                // ⚠️ Линкът е вече изтекъл или невалиден
                $(".error").text("Моля отворете последния изпратен линк!");
                toastr.error("Моля отворете последния изпратен линк! 🔁");
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
            toastr.error("Възникна грешка при потвърждението на имейла. ❌");
        }
    });
}

/* -------------------------------- */
/* 🔁 Изпращане на нов имейл при клик */
/* -------------------------------- */
$(".btn").on("click", function(e) {
    e.preventDefault();

    // 🛡️ Проверка за налични данни преди изпращане
    if (token && email) {
        sendNewEmail(token, email); // 📬 Изпращаме нов линк
    } else {
        toastr.error("Липсва токен или имейл! ❌");
    }
});

/* ----------------------------------- */
/* 📡 AJAX заявка за нов линк по имейл */
/* ----------------------------------- */
function sendNewEmail(token, email) {
    $.ajax({
        url: `https://archive-4vi4.onrender.com/api/account/send-new-email?token=${token}&email=${email}`,
        type: "GET",
        success: function (response) {
            // ✅ Имейлът вече е потвърден – пращаме към профила
            if (response.isEmailConfirmed) {
                window.open("profile.html", "_self");
            } 
            // ✅ Ново съобщение е успешно изпратено
            else if (response.isNewMessageSent) {
                toastr.success("Съобщението беше изпратено! 📧✨");
            } 
            // ❌ Нещо се объркало
            else {
                toastr.error("Възникна грешка при изпращането на нов линк. 😓");
            }
        },
        error: function (xhr, status, error) {
            console.error(error);
            toastr.error("Възникна грешка при заявката. ❗");
        }
    });
}
