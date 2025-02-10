const swiper = new Swiper('.swiper-container', {
    // Configuration
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    autoplay: {
        delay: 30000,
    },
});

$(document).ready(function () {
    // Функция за преоразмеряване на книгата
    function resizeFlipbook() {
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();

        // Определяне на ширината и височината на книгата като процент от екрана
        const bookWidth = Math.min(windowWidth * 0.8, 800); // 80% от ширината, макс. 800px
        const bookHeight = Math.min(windowHeight * 0.6, 600); // 60% от височината, макс. 600px

        // Актуализация на размерите на Turn.js обекта
        $(".flipbook").turn("size", bookWidth, bookHeight);
    }

    // Инициализация на turn.js
    $(".flipbook").turn({
        width: Math.max($(window).width() * 0.8, 800), // Първоначална ширина
        height: Math.max($(window).height() * 0.8, 600), // Първоначална височина
        autoCenter: true, // Центриране на книгата
    });

    // Отключване/заключване на скролването
    const disableScroll = () => $("body").css("overflow", "hidden");
    const enableScroll = () => $("body").css("overflow", "auto");

    // Клик върху книга
    $(".readable-book").on("click", function () {
        $("#bookViewer").addClass("active"); // Показваме Viewer-а
        disableScroll(); // Забраняваме скролването

        // Отиване директно на втората страница
        setTimeout(() => {
            $(".flipbook").turn("page", 2); // Показване на втора страница
        }, 300);
    });

    // Затваряне на Viewer
    $("#closeViewer").on("click", function () {
        $("#bookViewer").removeClass("active"); // Скриваме Viewer-а
        enableScroll(); // Разрешаваме скролването
        $(".flipbook").turn("page", 1); // Връщаме към корицата
    });

    // Преоразмеряване на книгата при промяна на размера на прозореца
    $(window).on("resize", resizeFlipbook);
});

console.log($('.book'));

$('.book').on('mouseover', function(){
    $('.tooltiptext')[$(".book").index(this)].classList.toggle('d-none');
})

$('.book').on('mouseout', function(){
    $('.tooltiptext')[$(".book").index(this)].classList.toggle('d-none');
})