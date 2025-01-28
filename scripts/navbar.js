// JavaScript for burger menu toggle
const burgerButton = $('#burgerButton')[0];
const fullscreenMenu = $('#fullscreenMenu')[0];

burgerButton.addEventListener('click', () => {
    fullscreenMenu.classList.toggle('active');
    burgerButton.classList.toggle('open'); // Toggle "open" class for X transformation
    $('body')[0].classList.toggle('overflow-hidden');;
});