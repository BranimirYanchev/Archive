const elements = {
    title: $("#title"),
    image: $("#imageUpload"),
    description: $(".ql-editor"),
    category: $("#category"),
};

let image = "";
let isButtonClicked = false;

if (sessionStorage.getItem("email") == null) {
    window.open("../forms.html", "_self")
}

let isBeingEdited = true;
const archiveId = new URLSearchParams(window.location.search).get("id");

$($("label")[1]).hide(); 
$($(".custom-file-upload")[0]).hide();

if(archiveId == null || archiveId == undefined){
    $(".delete-btn").hide();
    $($("label")[1]).show(); 
    $($(".custom-file-upload")[0]).show();
    isBeingEdited = false;
}

$(".submit-btn").on('click', function (e) {
    e.preventDefault();

    let url = "https://archive-4vi4.onrender.com/api/save_archive";

    if(isBeingEdited){
        url = "https://archive-4vi4.onrender.com/api/update_archive";
    }

    if(!isButtonClicked){
        sendData(url);
    }
});

$(".delete-btn").on("click", function(e){
    e.preventDefault();
    let url = "https://archive-4vi4.onrender.com/api/delete_archive";
    sendData(url);
});

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

$("#imageUpload").on("change", function (event) {
    let previewContainer = $("#previewContainer");
    previewContainer.css("overflow-x", "visible"); // Изчистваме предишните

    let file = event.target.files[0]; // Вземаме само първия файл

    if (!file.type.startsWith("image/")) {
        alert("Моля, качете изображение!");
        return;
    }

    if($("#previewContainer").children().length >= 1){
        return false;
    }

    image = file;

    let reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = function (e) {
        let previewBox = $("<div class='previewBox'></div>");
        let img = $("<img>").attr("src", e.target.result);
        let removeBtn = $("<button class='removeBtn'>❌</button>");

        removeBtn.on("click", function () {
            previewBox.remove();
        });

        previewBox.append(img).append(removeBtn);
        previewContainer.append(previewBox);
    };
});

function readNewArchiveData(response){
    if(response.isSavedData){
        window.open("../profile.html", "_self");
    }
    else if(response.isFileUpdated){
        window.open("../profile.html", "_self");
        toastr.success("Вашият архив беше запазен успешно!");
    }else{
        if(!response.isDataCorrect){
            toastr.error("Моля попълнете всички полета!");
            isButtonClicked = false;
        }else{
            toastr.info("Има проблем с обработката. Моля опитайте отново!");
            isButtonClicked = false;
        }
    }
}

function isArchiveDeleted(response){
    if(response.isArchiveDeleted){
        window.open("../profile.html", "_self");
    }else if(response.isAFileEdited){
        window.open("../profile.html", "_self");
    }else{
         toastr.error("Възникна грешка! Моля опитайте пак!");
    }
}

function sendData(url){
    let keywords = [];

    $(".tag").each(function () {
        let text = $(this).clone().children().remove().end().text().trim();
        keywords.push(text);
    });

    if (elements.title.val().trim() == "" || elements.description.text().trim() == "" || elements.category.val().trim() == "" || keywords.length == 0) {
        toastr.error("Моля попълнете всички полета!");
        return false;
    }  

    if($($("#previewContainer")[0]).html() == "" && !isBeingEdited){
        toastr.error("Моля добавете снимка!");
        return false;
    }

    let formData = new FormData();

    formData.append("title", elements.title.val());
    formData.append("description", elements.description.html());
    formData.append("category", elements.category.val());
    formData.append("image", image);
    formData.append("keywords", keywords);
    formData.append("author", sessionStorage.getItem("name"));
    formData.append("email", sessionStorage.getItem("email"));

    if(archiveId != null && archiveId != undefined){
        formData.append("id", archiveId);
    }

    toastr.info("Моля изчакайте!");

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false, 
        processData: false,
        success: function (response) {
            if(!isBeingEdited){
                readNewArchiveData(response);
            }else{
                isArchiveDeleted(response);
            }
        }
    });
}

function addTag(keyword) {
    let tag = $('<div class="tag">' + keyword + ' <span onclick="$(this).parent().remove()">&times;</span></div>');
    $("#tags").append(tag);
}

setData();

function setData() {
    let url = `https://archive-4vi4.onrender.com/users/${sessionStorage.getItem('user_Id')}/archives.json`;

    toastr.info("Моля изчакайте!");

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (data) {
            data.forEach(element => {
                if(element.id == archiveId){
                    elements.title.val(element.title);
                    elements.description.html(element.description);
                    elements.category.val(element.category);
                    element.keywords.forEach(e => {
                        $("#tags").html($("#tags").html() + `<div class="tag">${e}<span onclick="$(this).parent().remove()">×</span></div>`)
                    })
                }
            });
        },
    });
}
