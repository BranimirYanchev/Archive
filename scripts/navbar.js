$(".burger-btn").on('click', function(e){
    toggleMenu();
});

function toggleMenu(){
    $('.fullscreen-menu').toggleClass('active');
    $('.burger-btn').toggleClass('open');
    $('body')[0].classList.toggle('overflow-hidden');;
}

if(sessionStorage.getItem("email")){
    $("#fullscreenMenu a:eq(2)")
    .attr("href", profileUrl)
    .html("Профил");

    $(".go-to-profile").attr("href", profileUrl) 
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
