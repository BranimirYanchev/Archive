$(".burger-btn").on('click', function(e){
    toggleMenu();
});

let adminEmail = "almachronicles@gmail.com";

function toggleMenu(){
    $('.fullscreen-menu').toggleClass('active');
    $('.burger-btn').toggleClass('open');
    $('body')[0].classList.toggle('overflow-hidden');;
}

if (sessionStorage.getItem("email")) {
    // Променяме href за профила в менюто
    $("#fullscreenMenu a:eq(2)")
        .attr("href", profileUrl)
        .html("Профил");
}else{
    $("#fullscreenMenu a:eq(2)")
    .attr("href" ,formsUrl)
    .html("Добави");

    $(".go-to-profile").attr("href",  formsUrl) 
}

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null
};

let tokenCheckFailures = 0; // брояч за неуспешни опити

/* 🔐 Проверка на временния токен за логване */
async function checkToken(isAdmin = false, url = "forms.html") {
    let email = sessionStorage.getItem("email");
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user_Id");

    if (isAdmin) {
        email = "almachronicles@gmail.com";
    }

    // Взимаме текущия брой грешки от sessionStorage или го слагаме на 0
    let tokenCheckFailures = parseInt(sessionStorage.getItem("tokenCheckFailures")) || 0;

    try {
        const response = await fetch("https://archive-4vi4.onrender.com/api/verify_log/check_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, token, userId })
        });

        const result = await response.json();

        if (!result.isTokenValid) {
            if (!isAdmin) {
                // Правим повторен опит с админ имейл
                return checkToken(true);
            } else {
                // Ако и вторият опит е неуспешен — грешка и пренасочване
                toastr.error("Невалиден токен! Моля, влезте отново.");
                sessionStorage.removeItem("tokenCheckFailures");
                return window.open(url, "_self");
            }
        } else {
            // Токенът е валиден
            sessionStorage.removeItem("tokenCheckFailures");
        }

    } catch (error) {
        console.error("Грешка при проверка на токена:", error);
        toastr.error("⚠️ Възникна грешка при проверка на токена.");

        tokenCheckFailures++;
        sessionStorage.setItem("tokenCheckFailures", tokenCheckFailures);

        if (tokenCheckFailures >= 3) {
            toastr.error("🔁 Прекалено много грешки при проверка. Пренасочване...");
            sessionStorage.removeItem("tokenCheckFailures");
            window.open(url, "_self");
        } else {
            setTimeout(() => checkToken(isAdmin), 1000); // Повторен опит със същата стойност на isAdmin
        }
    }
}

function hidePreloader() {
    $(".preloader-container").addClass("d-none");
}

function showPreloader() {
    $(".preloader-container").removeClass("d-none");
}
