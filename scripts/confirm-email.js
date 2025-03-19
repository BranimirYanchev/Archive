toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null
};

// Примерен код за обработка на линк за потвърждение с уникален токен
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token'); // Вземаме токена от URL
const email = sessionStorage.getItem("email"); // Вземаме токена от URL

confirmEmail(token, email);

// Функция, която симулира потвърждението на имейла
function confirmEmail(token, email) {
    // Това е примерен AJAX код, който ще изпрати токен за потвърждение

    $.ajax({
        url: `https://archive-4vi4.onrender.com/api/account/confirm-email?token=${token}&email=${email}`,
        type: "GET",
        success: function (response) {
            if(response.isEmailConfirmed){
                window.open("profile.html", "_self");
            }else if(token == null){
                sendNewEmail(token, email)
            }else{
                $(".error").text("Моля отворете последния изпратен линк!")
                toastr.error("Моля отворете последния изпратен линк!");
            }
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
}

$(".btn").on("click", function(e){
    e.preventDefault();
    sendNewEmail(token, email);
})

function sendNewEmail(token, email) {
    // Това е примерен AJAX код, който ще изпрати токен за потвърждение

    $.ajax({
        url: `https://archive-4vi4.onrender.com/api/account/send-new-email?token=${token}&email=${email}`,
        type: "GET",
        success: function (response) {
            if(response.isEmailConfirmed){
                window.open("profile.html", "_self");
            }

            if(response.isNewMessageSent){
                toastr.success("Съобщението беше изпратено!")
            }
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
}