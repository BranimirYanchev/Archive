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
    const currentId = submitBtns.index(this);
    const forms = [$('#login-form')[0], $('#register-form')[0]];
    let data = formToJSON(forms[currentId]);
    console.log(data);
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
    return JSON.stringify(jsonObject);
}

function setData(data, method) {

}