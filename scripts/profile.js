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
    grade: $("input[name='grade']"),
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

profileImgSettings.profileImg.hide();

const description = $("#editor");

// Clear the session
$(".go-to-forms").on('click', () => {
    sessionStorage.clear();
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

            if (response.Role != "student") {
                $($(".form-label")[3]).hide();
                infoForm.grade.hide();
            } else {
                $($(".form-label")[3]).show();
                infoForm.grade.show();
                infoForm.grade.val(response.Grade);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error fetching user ID:", error);
        }
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
                return;
            }
            hasUserImage = false;
        },
        error: function (error) {
            toastr.error(error.responseJSON);
            hasProfileImage = false;
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
        console.log(1);
        isChanged.profileImg = true;

        // Pass the selected file to the setImage function
        setImage(this.files);
    });
}


function setImage(imgs) {
    if (imgs.length === 0) {
        alert("Please select an image first.");
        return;
    }

    let formData = new FormData();
    formData.append("file", imgs[imgs.length - 1]);
    formData.append("id", sessionStorage.getItem("user_Id"));

    let url = "http://localhost:5175/api/save_user_image";
    $.ajax({
        url: url,
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            hasProfileImage();
            if (hasUserImage) {
                toastr.success("Снимката е качена успешно!");
                location.reload();
            } else {
                toastr.info("Сървърна грешка! Опитайте пак, моля!");
            }
        },
        error: function (error) {
            toastr.error(error.responseJSON);
        }
    });
}


function returnErrorMessage(){
    let errorMessages = {

    }
}