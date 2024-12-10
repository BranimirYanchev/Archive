const id = sessionStorage.getItem('id');;
const forms = [$('#signInForm')[0], $('#signUpForm')[0]];
const btns = $('.toggle-button');

defaultHiddenForm(forms, id);

btns.on('click', function() {
    toggleForms(forms);
    sessionStorage.setItem('id', btns.index(this));
});

function defaultHiddenForm(forms, id = 0) {
    forms[id].classList.add('d-none')
}

// Function to toggle between Sign In and Sign Up forms
function toggleForms(forms) {
    forms.forEach(e => e.classList.toggle('d-none'));
}

