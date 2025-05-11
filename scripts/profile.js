let hasUserImage = false;
hidePreloader();

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
let userId = sessionStorage.getItem("user_Id");
let isReadOnly = false;

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

if(!(sessionStorage.getItem("email") != null || new URLSearchParams(window.location.search).get("userId") != null)){
    window.open("forms.html", "_self")
}else if(new URLSearchParams(window.location.search).get("userId") != null){
    userId = new URLSearchParams(window.location.search).get("userId");
    isReadOnly = true;
}

if(!isReadOnly){
    checkToken();
}

if(sessionStorage.getItem("role") == "administrator" && !isReadOnly){
    window.open("administrator.html?token=", "_self");
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
        formData.append("id", userId)
    }

    let url = "https://archive-4vi4.onrender.com/api/update_data";

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false, 
        processData: false,
        success: function (response) {
            checkToken();
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

const url = 'https://example.com/?token=abc123';
const urlParams = new URLSearchParams(window.location.search);

checkIfEmailIsVerified(urlParams.get('token'), sessionStorage.getItem("email"));
setData();
areFieldsChanged();

// Set data function
function setData() {
    setArchives();

    if(isReadOnly){
        switchToReadOnlyMode();
    }

    let url = `https://archive-4vi4.onrender.com/users/${userId}/profile_info.json?nocache=${new Date().getTime()}`;

    $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        cache: false, // Предотвратява кеширане
        success: function (data) {
            let response = data.personalInfo;
            
            if(response.Role == "administrator"){
                window.open("administrator.html?token=", "_self")
            }
            
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

            if(sessionStorage.getItem("role") == "administrator"){
                sessionStorage.setItem("email", getUserEmail(sessionStorage.getItem("userId")))
            }

            if (response.ProfilePictureUrl && response.ProfilePictureUrl !== "") {
                const cleanedUrl = response.ProfilePictureUrl.replace("/var/data", "");
                $("#profile-img").attr("src", `https://archive-4vi4.onrender.com${cleanedUrl}`);                
            } else {
                $("#profile-img").hide();
                $("#profile-img-icon").show();
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

    $("#imageFile").on("change", function () {
        const files = this.files;
        if (files.length === 0) return;
    
        isChanged.profileImg = true;
        imageOperations(files, "I", "https://archive-4vi4.onrender.com/api/user/upload_profile_picture");
    
        preventSpam($("#uploadImgBtn"));
    });
    
    $("#removeImgBtn").on("click", function (e) {
        e.preventDefault();
        imageOperations("", "D", "https://archive-4vi4.onrender.com/api/user/delete_profile_picture");
    });
    

    description.on("click", function(){
        isChanged.description = true;
    });
}

function setArchives() {
    let url = `https://archive-4vi4.onrender.com/users/${userId}/archives.json?nocache=${new Date().getTime()}`;

    $.ajax({
        url: url,
        type: "GET",
        cache: false,  // Принудително презареждане
        success: function (response) {
            if(!isReadOnly){
                checkToken();
            }
            $("#card-container").empty(); // Изчистваме старите елементи
    
            if (response.length == 0) {
                $('#empty_archive_container').removeClass('d-none');
            } else {
                $('#empty_archive_container').addClass('d-none');
            }
    
            response.forEach(e => {
                let category = "ученически живот";
                if(e.status != "hidden"){
                    if (e.category == "sport") category = "спорт";
                    else if (e.category == "culture") category = "култура";
                }else{
                    category = "СКРИТ"
                }
    
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

                if(category == "СКРИТ"){
                    console.log($(".tag"));
                    $(".tag").addClass("red-color");
                    $(".tag-purple").removeClass("tag-purple");
                }
            });
            
            if(isReadOnly && sessionStorage.getItem("role") !== "administrator"){
                $(".editBtn").hide();
            }

            $(".editBtn").on("click", function (e) {  
                e.stopPropagation();
                let cardId = $(this).closest(".card").attr("id");
                window.open(`archives/add_archive.html?id=${cardId}`, "_self");
            });
    
            $(".card").on("click", function () {  
                window.open(`archives/archive_single.html?id=${this.id}&authorId=${userId}`, "_self");
            });
        }
    });    
}

function imageOperations(files, imgType, url) {
    let formData = new FormData();

    if (imgType === "I") {
        const file = files[0];

        if (!file) {
            toastr.error("Не е избран файл!");
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const maxSizeMB = 2;

        if (!validTypes.includes(file.type)) {
            toastr.error("Грешен файлов тип!");
            return;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            toastr.error("Файлът е твърде голям!");
            return;
        }

        // Превю на избраната снимка
        const reader = new FileReader();
        reader.onload = function (e) {
            $("#profile-img").attr("src", e.target.result);
        };
        reader.readAsDataURL(file);
        
        $("#profile-img-icon").hide();
        $("#profile-img").show();

        formData.append("profilePicture", file);
    }else{
        $("#profile-img-icon").show();
        $("#profile-img").hide();
    }

    formData.append("email", email);
    formData.append("imgType", imgType);
    formData.append("userId", sessionStorage.getItem("user_Id"));

    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            if (imgType === "I" && response.success) {
                toastr.success("Снимката беше качена успешно!");
                location.reload();
            } else if (imgType === "D" && response.success) {
                toastr.success("Снимката беше премахната!");
                $("#profile-img").attr("src", "/assets/img/placeholder.png"); // сложи път към твоята дефолтна
                location.reload();
            } else {
                returnErrorMessage(response);
            }
        },
        error: function () {
            toastr.error("Грешка при качване на снимката.");
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

 function checkIfEmailIsVerified(token, email) {
    $.ajax({
        url: `https://archive-4vi4.onrender.com/api/account/confirm-email?token=${token}&email=${email}`,
        type: "GET",
        success: function (response) {
            if(!response.isEmailConfirmed){
                window.open("confirm-email.html", "_self");
            }
        }
    });
}

async function getUserEmail() {
    let formData = new FormData();
    formData.append("userId", userId);

    let url = "https://archive-4vi4.onrender.com/api/get_user_email";

    try {
        let response = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();

        if (!isReadOnly) {
            checkToken();
        }
        
        infoForm.email.val(data.result);
        
        if (sessionStorage.getItem("role") === "administrator") {
            sessionStorage.setItem("email", data.result);
        }

    } catch (error) {
        console.error("Error fetching user email:", error);
    }
}


async function switchToReadOnlyMode(){
    $(".description-container").addClass("justify-content-center");
    $(".edit-heading").text("Профилна снимка");
    $(".edit-heading").addClass("text-center");
    await getUserEmail();

    infoForm.grade[0].disabled = true;
    description.attr("contenteditable", "false") ;
    $($(".col-xxl-6")[1]).addClass("d-none");
    $(".btn").addClass("d-none");
    $(".add-button").addClass("d-none");
    $(".section-title").css("margin-right", "0px");
    $("h3").text("Профил");
    $("#empty_archive_container p").text("Потребителят не е публикувал архиви!");
}
