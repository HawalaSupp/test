
var params = new URLSearchParams(window.location.search);
var CORRECT_PASSWORD = '777';
var dot = "•";
var original = "";
var input = document.querySelector(".password_input");

document.querySelector(".login").addEventListener('click', () => {
    checkPasswordAndLogin();
});

var welcome = "Dzień dobry!";

var date = new Date();
if (date.getHours() >= 18){
    welcome = "Dobry wieczór!"
}
document.querySelector(".welcome").innerHTML = welcome;

function checkPasswordAndLogin(){
    // Get the actual password - try both the raw input value and the 'original' tracking variable
    var rawValue = input ? input.value : '';
    var actualPassword = original || rawValue;
    
    // Clean up any masking characters (dots) that might be in the password
    actualPassword = actualPassword.replace(/•/g, '');
    
    console.log('Checking password:', actualPassword, 'Raw:', rawValue, 'Original:', original, 'Expected:', CORRECT_PASSWORD);
    
    if (actualPassword === CORRECT_PASSWORD || rawValue === CORRECT_PASSWORD) {
        localStorage.setItem('hasUserData', 'true');
        localStorage.setItem('sessionStartTime', Date.now());
        
        // Smooth fade-out animation before redirect
        document.body.style.transition = 'opacity 0.3s ease-out';
        document.body.style.opacity = '0';
        
        setTimeout(function() {
            location.href = 'documents.html?' + params;
        }, 300);
    } else {
        // Wrong password - show error
        if (input) {
            input.style.borderColor = '#ff4444';
            input.style.animation = 'shake 0.3s ease';
            setTimeout(function() {
                input.style.animation = '';
            }, 300);
        }
    }
}

function toHome(){
    location.href = 'documents.html?' + params;
}

input.addEventListener("keypress", (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        checkPasswordAndLogin();
    }
})

// Reset border color when user starts typing
input.addEventListener("focus", () => {
    input.style.borderColor = '';
})
var eye = document.querySelector(".eye");

input.addEventListener("input", () => {
    // With type="password", browser handles masking automatically
    // Just update the original variable to track the real password
    original = input.value;
    console.log('Password updated:', original);
})

function delay(time, length) {
    return new Promise(resolve => setTimeout(resolve, time));
}

eye.addEventListener('click', () => {
    // Toggle password visibility
    if (input.type === 'password') {
        input.type = 'text';
        eye.classList.add("eye_close");
    } else {
        input.type = 'password';
        eye.classList.remove("eye_close");
    }
})
