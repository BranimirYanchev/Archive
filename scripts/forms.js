/* -------------------------- */
/* Session Storage Handling */
/* -------------------------- */
let id = sessionStorage.getItem('id');
const formContainers = [$('#signInForm')[0], $('#signUpForm')[0]];
const submitBtns = $('.submit-button');
const toggleBtns = $('.toggle-button');

if (id == null) {
    id = 1;
}

$(formContainers[id]).addClass('d-none');

toggleBtns.on('click', function () {
    toggleformContainers(formContainers);
    sessionStorage.setItem('id', toggleBtns.index(this));
});

function toggleformContainers(formContainers) {
    formContainers.forEach(e => $(e).toggleClass('d-none'));
}

/* --------------------------- */
/* Get Role */
/* --------------------------- */
const input = $('input');
const span = $('.red-clr');

// Show the span when input gains focus
input.on('focus', function(){
  span[input.index(this)-1].style.display = 'inline';
});

// Hide the span when input loses focus
input.on('blur', function(){
  span[input.index(this)-1].style.display = 'none';
    $(".toggle-btns-container").style.height = 60 + "%"
});

/* ----------------------------- */
/* Role Adjustment */
/* ----------------------------- */
if($('#userRole').val() == "teacher"){
    $('.code-input').removeClass('d-none');
}

$('#userRole').on('change', function(){
    if(this.value == "teacher"){
        $('.code-input').removeClass('d-none');
    }else{
        $('.code-input').addClass('d-none');
    }
});


/* --------------------------- */
/* Password Visibility Toggle */
/* --------------------------- */
const togglePassBtnsT = $('.toggle-non-slash');
const togglePassBtnsS = $('.toggle-slash');

togglePassBtnsS.on('click', function(){
    console.log(togglePassBtnsS.index(this));
    togglePassVisibility(togglePassBtnsS.index(this));
});

togglePassBtnsT.on('click', function(){
    console.log(togglePassBtnsT.index(this));
    togglePassVisibility(togglePassBtnsT.index(this));
});

function togglePassVisibility(i){
    const passwordField = $('.toggled')[i];
    const isPassword = passwordField.getAttribute('type') === 'password';

    // Toggle password field type
    passwordField.setAttribute('type', isPassword ? 'text' : 'password');

    // Toggle icons visibility
    $('.toggle-non-slash').toggleClass('d-none');
    $('.toggle-slash').toggleClass('d-none');
}