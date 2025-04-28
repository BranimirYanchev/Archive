// 📦 Инициализация: зареждане на архива при отваряне на страницата
setArchives();

// 🍔 Бутон за отваряне/затваряне на мобилното меню
$(".burger-btn").on("click", () => toggleMenu());

/**
 * 📂 Зарежда конкретен архив по ID от URL параметрите.
 * Ако липсва authorId в URL, взима го от sessionStorage.
 * Визуализира архива в .section-content.
 */
function setArchives() {
    const archiveId = new URLSearchParams(window.location.search).get("id");
    let authorId = new URLSearchParams(window.location.search).get("authorId");

    // 🧠 Ако няма authorId в URL, взимаме от сесията
    if (!authorId) {
        authorId = sessionStorage.getItem("user_Id");
    }

    const url = `https://archive-4vi4.onrender.com/users/${authorId}/archives.json`;

    // 📡 AJAX заявка за взимане на архивите на автора
    $.ajax({
        url: url,
        type: "GET",
        success: function (response) {
            hidePreloader();
            response.forEach(e => {
                if (e.id == archiveId) {
                    // 🎨 Добавяме съдържанието в страницата
                    $(".section-content").append(` 
                        <div class="heading text-center mt-5" id="${e.id}">
                            <h1>${e.title}</h1>
                            <h2>${e.timestamp} | <span class="open-profile">${e.author}</span></h2>
                            <hr style="width: 70%; margin-left: 15%">
                        </div>

                        <div class="image-container d-flex justify-content-center mt-4">
                            <img src="https://archive-4vi4.onrender.com/${e.imageUrl}" alt="archive-img" />
                        </div>

                        <div class="content-conatiner d-flex flex-column mt-4">
                            <p>${e.description}</p>
                        </div>
                    `);
                }
            });

            // 👤 Клик върху автора отваря профила му
            $(".open-profile").on("click", function () {
                const authorId = new URLSearchParams(window.location.search).get("authorId");
                window.location.href = `../profile.html?userId=${authorId}`;
            });

            // ✅ zoomImage(), след като съдържанието вече е добавено
            zoomImage();
        },
        error: function () {
            // ❌ Ако има грешка в заявката — връща към архивите
            window.open("archives.html", "_self");
        }
    });
}

function zoomImage(){
    $(".image-container img").on("click", function() {
        $("#modalImage").attr("src", $(this).attr("src"));
        $("#imageModal").fadeIn();
    });

    $("#closeModal").on("click", function() {
        $("#imageModal").fadeOut().removeClass("zoomed");
    });

    $("#modalImage").on("click", function() {
        $("#imageModal").toggleClass("zoomed");
    });

    $(document).on("keydown", function(e) {
        if (e.key === "Escape") {
            $("#imageModal").fadeOut().removeClass("zoomed");
        }
    });
}