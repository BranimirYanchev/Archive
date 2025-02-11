// JavaScript for burger menu toggle
const burgerButton = $('#burgerButton')[0];
const fullscreenMenu = $('#fullscreenMenu')[0];

burgerButton.addEventListener('click', () => {
    fullscreenMenu.classList.toggle('active');
    burgerButton.classList.toggle('open'); // Toggle "open" class for X transformation
    $('body')[0].classList.toggle('overflow-hidden');;
});

if(sessionStorage.getItem("email")){
    $("#fullscreenMenu a:eq(2)")
    .attr("href", "profile.html")
    .html("Профил");

    $(".go-to-profile").attr("href", "profile.html") 
}else{
    $("#fullscreenMenu a:eq(2)")
    .attr("href", "forms.html")
    .html("Вход");

    $(".go-to-profile").attr("href", "forms.html") 
}

