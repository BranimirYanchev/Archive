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

// Clear the session
$(".go-to-forms").on('click', () => {
    sessionStorage.clear();
});

let editBtns = "";

if(sessionStorage.getItem("email") == null){
    window.open("forms.html", "_self")
}

const togglePassBtnsT = $('.toggle-non-slash');
const togglePassBtnsS = $('.toggle-slash');

togglePassBtnsS.on('click', function(){
    togglePassVisibility(togglePassBtnsS.index(this));
});

togglePassBtnsT.on('click', function(){
    togglePassVisibility(togglePassBtnsT.index(this));
});

$("#save-data-btn").on("click", function () {
    toastr.info("Моля изчакайте!");
    let formData = new FormData(); 
    Object.keys(isChanged).forEach((key, value) => {
        if(isChanged[key] && infoForm[key] != "" && infoForm[key] != undefined && key == "grade"){
            formData.append(key, infoForm[key].val());
        }else{
            isChanged[key] = false;
        }
    });

    if(description.text() != ""){
        formData.append("description", description.html())
    }else{
        isChanged.description = false;
    }

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


    let url = "https://archive-4vi4.onrender.com/api/update_data";

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false, 
        processData: false,
        success: function (response) {
            let isTrue = false;
            Object.keys(isChanged).forEach((key, value) => {
                if(isChanged[key] && !response.value[key] && key != "changePass"){
                    toastr.error(errorMessages[key]);
                    isTrue = true;
                }
            });

            if(!isTrue && isChanged.email && response.value.email){
                sessionStorage.setItem("email", formData.email.value())
                toastr.success("Данните са запазени успешно!");
            }

            if(isChanged.changePass && !response.value.arePasswordsMatch){
                toastr.error("Паролите не съвпадат!");
            }else if(isChanged.changePass && !response.value.isPasswordValid){
                toastr.error("Грешна парола!");
            }else if (isChanged.changePass && response.value.isPasswordValid && response.value.arePasswordsMatch){
                toastr.success("Данните бяха запазени успешно!")
            }

            location.reload();
        },
        error: function (error) {
            toastr.error(error.responseJSON);
            hasProfileImage = false;
        }
    })
});

setData();
areFieldsChanged();

// Set data function
function setData() {
    setArchives();
    toastr.info("Моля изчакайте!");

    let url = `https://archive-4vi4.onrender.com/users/${sessionStorage.getItem('user_Id')}/profile_info.json?nocache=${new Date().getTime()}`;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        cache: false, // Предотвратява кеширане
        success: function (data) {
            let response = data.personalInfo;
    
            console.log($(".section-2"));
            if (response.Role == "parent") {
                $(".section-2").addClass("d-none");
            }
    
            infoForm.firstName.val(response.FirstName);
            infoForm.lastName.val(response.LastName);
            infoForm.email.val(sessionStorage.getItem("email"));
    
            if (response.Grade !== undefined && response.Grade !== "") {
                infoForm.grade.val(response.Grade);
            }
    
            if (response.Role !== "student") {
                $($(".form-label")[3]).hide();
                infoForm.grade.hide();
            } else {
                $($(".form-label")[3]).show();
                infoForm.grade.show();
                infoForm.grade.val(response.Grade);
                if (response.Role === "teacher" || response.Role === "student") {
                    sessionStorage.setItem("name", response.FirstName + " " + response.LastName);
                }
            }
    
            description.html(data.description);
        },
        error: function (xhr, status, error) {
            console.error("Error fetching user profile:", error);
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

    // $("#imageFile").on("change", function () {
    //     isChanged.profileImg = true;

    //     // Pass the selected file to the setImage function
    //     imageOperations(this.files, "I", "http://Localhost:5175/api/save_user_image");
    //     preventSpam($("#uploadImgBtn"))
    // });

    $("#removeImgBtn").on("click", function (e) {
        e.preventDefault();
        imageOperations("", "D", "https://archive-4vi4.onrender.com/api/delete_user_image");
    });

    description.on("click", function(){
        isChanged.description = true;
    });
}

function setArchives() {
    let url = `https://archive-4vi4.onrender.com/users/${sessionStorage.getItem("user_Id")}/archives.json?nocache=${new Date().getTime()}`;
    toastr.info("Моля изчакайте!");
    $.ajax({
        url: url,
        type: "GET",
        cache: false,  // Принудително презареждане
        success: function (response) {
            $("#card-container").empty(); // Изчистваме старите елементи
    
            if (response.length == 0) {
                $('#empty_archive_container').removeClass('d-none');
            } else {
                $('#empty_archive_container').addClass('d-none');
            }
    
            response.forEach(e => {
                let category = "ученически живот";
                if (e.category == "sport") category = "спорт";
                else if (e.category == "news") category = "култура";
    
                $("#card-container").append(
                    `<div class="card" id=${e.id}>
                        <div class="card-header">
                            <img src="https://archive-4vi4.onrender.com/${e.imageUrl}"alt="archive-img" />
                        </div>
                        <div class="card-body">
                            <span class="tag tag-purple">${category}</span>
                            <i class="fa-solid fa-pencil editBtn"></i>
                            <h4>${e.title}</h4>
                            <p>${$(e.description).text().substring(0, 500)}...</p>
                            <div class="user">
                                <div class="user-info">
                                    <h5>${e.author}</h5>
                                    <small>${e.timestamp}</small>
                                </div>
                            </div>
                        </div>
                    </div>`
                );
            });
    
            $(".editBtn").on("click", function (e) {  
                e.stopPropagation();
                let cardId = $(this).closest(".card").attr("id");
                window.open(`archives/add_archive.html?id=${cardId}`, "_self");
            });
    
            $(".card").on("click", function () {  
                window.open(`archives/archive_single.html?id=${this.id}`, "_self");
            });
        }
    });    
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

function togglePassVisibility(i){
    const passwordField = $('.toggled')[i];
    const isPassword = passwordField.getAttribute('type') === 'password';

    // Toggle password field type
    passwordField.setAttribute('type', isPassword ? 'text' : 'password');

    // Toggle icons visibility
    $($('.toggle-non-slash')[i]).toggleClass('d-none');
    $($('.toggle-slash')[i]).toggleClass('d-none');
}

function getUserId(){
    let id = 0;
    let formData = new FormData();

    formData.append("email", sessionStorage.getItem("email"));

    let url = "https://archive-4vi4.onrender.com/api/get_user_id";

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false, 
        processData: false,
        success: function (response) {
            sessionStorage.setItem("id", response.id);
        }
    });
}
