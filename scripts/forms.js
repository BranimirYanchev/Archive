let id = sessionStorage.getItem('id');
const formContainers = [$('#signInForm')[0], $('#signUpForm')[0]];
const toggleBtns = $('.toggle-button');
const submitBtns = $('.submit-button');

if (id == null) {
    id = 0;
}

$(formContainers[id]).addClass('d-none')

toggleBtns.on('click', function () {
    toggleformContainers(formContainers);
    sessionStorage.setItem('id', toggleBtns.index(this));
});

$(submitBtns).on('click', function(e){
    e.preventDefault();

    const url = "http://localhost:5175/api/echo"
    const currentId = submitBtns.index(this);
    const forms = [$('#login-form')[0], $('#register-form')[0]];

    let data = formToJSON(forms[currentId]);
    sendData(data, "POST", url);
})

// Function to toggle between Sign In and Sign Up formContainers
function toggleformContainers(formContainers) {
    formContainers.forEach(e => $(e).toggleClass('d-none'));
}

// Convert form data to JSON
function formToJSON(form) {
    const formData = new FormData(form);
    console.log(formData)
    const jsonObject = {};
    formData.forEach((value, key) => {
        jsonObject[key] = value;
    });
    return jsonObject;
}

function sendData(data, method, url) {
    $.ajax({
        url : url,
        type : method,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function(response) {
            if(response.url != ""){
                sessionStorage.setItem("email", data.email);
                window.open(response.url, "_self");
            }
            
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    })
}
