hidePreloader();

const elements = {
    title: $("#title"),
    image: $("#imageUpload"),
    description: $(".ql-editor"),
    category: $("#category"),
};

let image = "";
let isButtonClicked = false;

// Проверка за логнат потребител 👤🔒
if (!sessionStorage.getItem("email")) {
    window.open("../forms.html", "_self");
}

checkToken(false, "../forms.html");

let isBeingEdited = true;
const archiveId = new URLSearchParams(window.location.search).get("id");

// Първоначално скриване на елементи при липса на archiveId 📦🚫
$("label").eq(1).hide(); 
$(".custom-file-upload").eq(0).hide();

if (!archiveId) {
    $(".delete-btn").hide();
    $("label").eq(1).show(); 
    $(".custom-file-upload").eq(0).show();
    isBeingEdited = false;
}

// Запазване или редакция на архив 💾📝
$(".submit-btn").on('click', function (e) {
    e.preventDefault();
    const url = isBeingEdited 
        ? "https://archive-4vi4.onrender.com/api/update_archive" 
        : "https://archive-4vi4.onrender.com/api/save_archive";

    if (!isButtonClicked) {
        sendData(url);
    }
});

// Изтриване на архив 🗑️
$(".delete-btn").on("click", function (e) {
    e.preventDefault();
    const url = "https://archive-4vi4.onrender.com/api/delete_archive";
    sendData(url);
});

// Скриване на архив (само за администратор) 🕶️👮
$(".hide-btn").on("click", function () {
    const url = "https://archive-4vi4.onrender.com/api/administrator/hide_archive"; 
    hideOrShowArchive(url);
});

// Показване на архив (само за администратор) 👁️👮
$(".show-btn").on("click", function () {
    const url = "https://archive-4vi4.onrender.com/api/administrator/show_archive"; 
    hideOrShowArchive(url);
});

// Добавяне на ключови думи с Enter 🔑⏎
$("#keywordInput").keypress(function (event) {
    if (event.which === 13) {
        event.preventDefault();
        let keyword = $(this).val().trim();
        if (keyword) {
            addTag(keyword.toLowerCase());
            $(this).val("");
        }
    }
});

// Преглед на каченото изображение и визуализация 🖼️👀
$("#imageUpload").on("change", function (event) {
    const previewContainer = $("#previewContainer");
    previewContainer.css("overflow-x", "visible");

    const file = event.target.files[0];
    if (!file.type.startsWith("image/")) {
        alert("📛 Моля, качете изображение!");
        return;
    }

    if (previewContainer.children().length >= 1) return;

    image = file;
    const reader = new FileReader();

    reader.onload = function (e) {
        const previewBox = $("<div class='previewBox'></div>");
        const img = $("<img>").attr("src", e.target.result);
        const removeBtn = $("<button class='removeBtn'>❌</button>");

        removeBtn.on("click", function () {
            previewBox.remove();
        });

        previewBox.append(img).append(removeBtn);
        previewContainer.append(previewBox);
    };

    reader.readAsDataURL(file);
});

/**
 * Функция за скриване или показване на архив чрез API заявка 🔃
 */
function hideOrShowArchive(url) {
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            userId: parseInt(sessionStorage.getItem("user_Id")),
            archiveId: parseInt(archiveId),
        }),
        success: function () {
            window.open("../administrator.html", "_self");
        },
        error: function () {
            alert("⚠️ Възникна грешка.");
        },
    });
}

// Обработка на резултата при създаване или обновяване ✅❌ℹ️
function readNewArchiveData(response) {
    if (response.isSavedData || response.isFileUpdated) {
        if (sessionStorage.getItem("role") === "administrator") {
            // Пренасочване към профила на потребителя с конкретен userId
            window.open(`../profile.html?userId=${sessionStorage.getItem("user_Id")}`, "_self");
        } else {
            // Обикновено пренасочване, ако не е администратор
            window.open("../profile.html", "_self");
        }

        if (response.isFileUpdated) {
            toastr.success("✅ Вашият архив беше запазен успешно!");
        }
    } else if (!response.isDataCorrect) {
        toastr.error("⚠️ Моля попълнете всички полета!");
        isButtonClicked = false;
    } else {
        toastr.info("ℹ️ Има проблем с обработката. Моля опитайте отново!");
        isButtonClicked = false;
    }
}

function isArchiveDeleted(response) {
    if (response.isArchiveDeleted || response.isFileUpdated) {
        if (sessionStorage.getItem("role") === "administrator") {
            // Пренасочване към профила на конкретен потребител при администратор
            window.open(`../profile.html?userId=${sessionStorage.getItem("user_Id")}`, "_self");
        } else {
            // Обикновено пренасочване, ако не е администратор
            window.open("../profile.html", "_self");
        }
    } else {
        toastr.error("❌ Възникна грешка! Моля опитайте пак!");
    }
}

/**
 * Събиране и изпращане на данните към сървъра чрез FormData API 📤📁
 */
function sendData(url) {
    const keywords = [];
    $(".tag").each(function () {
        const text = $(this).clone().children().remove().end().text().trim();
        keywords.push(text);
    });

    if (
        !elements.title.val().trim() ||
        !elements.description.text().trim() ||
        !elements.category.val().trim() ||
        keywords.length === 0
    ) {
        toastr.error("⚠️ Моля попълнете всички полета!");
        return;
    }

    if (!$("#previewContainer").html() && !isBeingEdited) {
        toastr.error("📷 Моля добавете снимка!");
        return;
    }

    const formData = new FormData();
    formData.append("title", elements.title.val());
    formData.append("description", elements.description.html());
    formData.append("category", elements.category.val());
    formData.append("image", image);
    formData.append("keywords", keywords);
    formData.append("author", sessionStorage.getItem("name"));
    formData.append("email", sessionStorage.getItem("email"));

    if (archiveId) {
        formData.append("id", archiveId);
    }

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            
            if (!isBeingEdited) {
                readNewArchiveData(response);
            } else {
                isArchiveDeleted(response);
            }
        }
    });
}

// Добавяне на ключова дума като таг 🏷️
function addTag(keyword) {
    const tag = $(`<div class="tag">${keyword} <span onclick="$(this).parent().remove()">×</span></div>`);
    $("#tags").append(tag);
}

/**
 * Зареждане на данни за архив, ако той вече съществува (редакция) 📄🔄
 */
function setData() {
    const url = `https://archive-4vi4.onrender.com/users/${sessionStorage.getItem("user_Id")}/archives.json?nocache=${Date.now()}`;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (data) {
            data.forEach(element => {
                if (element.id == archiveId) {
                    elements.title.val(element.title);
                    elements.description.html(element.description);
                    elements.category.val(element.category);
                    element.keywords.forEach(e => {
                        $("#tags").append(`<div class="tag">${e}<span onclick="$(this).parent().remove()">×</span></div>`);
                    });

                    if (sessionStorage.getItem("role") === "administrator") {
                        $(".submit-btn").hide();
                        if (element.status === "hidden") {
                            $(".show-btn").removeClass("d-none");
                        } else {
                            $(".hide-btn").removeClass("d-none");
                        }
                    }
                }
            });
        },
    });
}

setData();
