// TODO: Check if user exists

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null
};

// Initialize needen variables
const quill = new Quill('#editor', {
    theme: 'snow'
});

let hasUserImage = false;

const infoForm = {
    firstName: $("input[name='firstName']"),
    lastName: $("input[name='lastName']"),
    email: $("input[name='email']"),
    grade: $("#grade"),
};

const isChanged = {
    firstName: false,
    lastName: false,
    email: false,
    grade: false,
    profileImg: false,
    description: false,
    changePass: false
}

const profileImgSettings = {
    profileImg: $("#profile-img"),
    profileImgIcon: $("#profile-img-icon"),
}

const description = $('.ql-editor');

const password = {
    oldPass: $("#old-pass"),
    newPass: $("#new-pass"),
    repeatedPass: $("#repeated-pass")
}

let imgType = "I";
let email = sessionStorage.getItem("email");

const errorMessages = {
    email: "Неправилен имейл!",
    firstName: "Полето име не отговаря на изискванията!",
    lastName: "Полето фамилия не отговаря на изискванията!",
    isPasswordValid: "Грешна парола!",
    аrePasswordsMatch: "Паролите не съвпадат!",
}

profileImgSettings.profileImg.hide();

// Clear the session
$(".go-to-forms").on('click', () => {
    sessionStorage.clear();
});

$("#save-data-btn").on("click", function () {
    let formData = new FormData(); 
    Object.keys(isChanged).forEach((key, value) => {
        if(isChanged[key] && infoForm[key] != "" && infoForm[key] != undefined){
            formData.append(key, infoForm[key].val());
            if(key == "email"){
                email = infoForm[key].val();
            }
        }else{
            isChanged[key] = false;
        }
    });

    if(description.text() != ""){
        formData.append("description", description.html())
    }else{
        isChanged.description = false;
    }

    console.log(isChanged.description);
    console.log(description.html());

    if(password.oldPass.val() != "" && password.newPass.val() != "" && password.repeatedPass.val() != ""){
        formData.append("oldPass", password.oldPass.val());
        formData.append("newPass", password.newPass.val());
        formData.append("repeatedPass", password.repeatedPass.val());
        isChanged.changePass = true;
    }

    let formDataLength = 0;

    for (let entry of formData.entries()) {
        formDataLength++;
    }

    if(formDataLength > 0){
        formData.append("id", sessionStorage.getItem("user_Id"))
    }


    let url = "http://localhost:5175/api/update_data";

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false, 
        processData: false,
        success: function (response) {
            let isTrue = false;
            console.log(response.value)
            Object.keys(isChanged).forEach((key, value) => {
                if(isChanged[key] && !response.value[key] && key != "changePass"){
                    toastr.error(errorMessages[key]);
                    isTrue = true;
                }
            });

            if(!isTrue && isChanged.email && response.value.email){
                console.log(email)
                sessionStorage.setItem("email", email)
                toastr.success("Данните са запазени успешно!");
            }

            if(isChanged.changePass && !response.value.arePasswordsMatch){
                toastr.error("Паролите не съвпадат!");
            }else if(isChanged.changePass && !response.value.isPasswordValid){
                toastr.error("Грешна парола!");
            }else if (isChanged.changePass && response.value.isPasswordValid && response.value.arePasswordsMatch){
                toastr.success("Данните бяха запазени успешно!")
            }
        },
        error: function (error) {
            toastr.error(error.responseJSON);
            hasProfileImage = false;
        }
    })
});

setData();
hasProfileImage();
areFieldsChanged();

// Set data function
function setData() {
    let url = `../backend/users/${sessionStorage.getItem('user_Id')}/profile_info.json`

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        success: function (data) {
            let response = data.personalInfo;
            infoForm.firstName.val(response.FirstName);
            infoForm.lastName.val(response.LastName);
            infoForm.email.val(sessionStorage.getItem("email"));
            if(!response.Grade == undefined && !response.Grade == ""){
                infoForm.grade.val(response.Grade);
            }

            if (response.Role != "student") {
                $($(".form-label")[3]).hide();
                infoForm.grade.hide();
            } else {
                $($(".form-label")[3]).show();
                infoForm.grade.show();
                infoForm.grade.val(response.Grade);
            }

            description.html(data.description);

            console.log(1);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching user ID:", error);
        }
    });
}

// Check if fields are being changed
function areFieldsChanged() {
    Object.keys(infoForm).forEach(key => {
        infoForm[key].on("change", function () {
            if ($(this).val().trim() !== "") {
                isChanged[key] = true;
            }
        });
    });

    $("#imageFile").on("change", function () {
        isChanged.profileImg = true;

        // Pass the selected file to the setImage function
        imageOperations(this.files, "I", "http://Localhost:5175/api/save_user_image");
        preventSpam($("#uploadImgBtn"))
    });

    $("#removeImgBtn").on("click", function (e) {
        e.preventDefault();
        imageOperations("", "D", "http://localhost:5175/api/delete_user_image");
    });

    description.on("click", function(){
        console.log(1)
        isChanged.description = true;
    });
}

function hasProfileImage() {
    profileImgSettings.profileImg.hide();

    let formData = new FormData();
    formData.append("id", sessionStorage.getItem("user_Id"));

    let url = "http://localhost:5175/api/check_if_image_exists";

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false, // ✅ Important for FormData
        processData: false, // ✅ Prevents jQuery from processing FormData
        success: function (response) {
            if (response.url != "") {
                profileImgSettings.profileImg.attr("src", `../backend/users/${sessionStorage.getItem("user_Id")}/${response.url}`);
                profileImgSettings.profileImg.show();
                profileImgSettings.profileImgIcon.hide();
                hasUserImage = true;
                return true;
            }
            hasUserImage = false;
        },
        error: function (error) {
            toastr.error(error.responseJSON);
            hasProfileImage = false;
        }
    });
}

function imageOperations(imgs = "", type, url) {
    if (imgs.length === 0 && type == "I") {
        alert("Please select an image first.");
        return;
    }

    let timer = 100;

    if (type == "I") {
        timer = 1500;
    }

    toastr.info("Изчакайте 1 секунди!");

    setTimeout(function () {
        let formData = new FormData();

        console.log(imgs[imgs.length - 1])

        if (type == "I") {
            formData.append("file", imgs[imgs.length - 1]);
        }

        formData.append("id", sessionStorage.getItem("user_Id"));

        $.ajax({
            url: url,
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                if (type == "I") {
                    if(response.isFileSaved){
                        hasProfileImage();
                        toastr.success("Снимката е качена успешно!");
                        location.reload();
                    }else {
                        returnErrorMessage(response);
                        location.reload();
                    }

                } else {
                    if (response.isDeleted) {
                        toastr.success("Снимката бе премахната!");
                        location.reload();
                    } else {
                        toastr.warning("Моля опитайте пак!");
                    }
                }
            },
            error: function (error) {
                toastr.error(error.responseJSON);
            }
        });
    }, timer);
}


function returnErrorMessage(response) {
    let errorMessages = {
        isFileSelected: "Не е избран файл!",
        isFileTypeCorrect: "Грешен файлов тип!",
        isFileInCorrectSize: "Файлът е твърде тежък!",
        isNotFileExists: "Първо премахнете предишната снимка!",
        isFileSaved: "Опитайте пак!"
    }

    let isTrue = true;

    Object.keys(response).forEach((key, value) => {
        console.log(response[key])
        if (!response[key] && key != "isFileSaved") {
            toastr.error(errorMessages[key]);
            isTrue = false;
            return true;
        }
    });
}

function preventSpam(el) {
    el.prop("disabled", true);

    setTimeout(() => {
        el.prop("disabled", false);
    }, 500);
}