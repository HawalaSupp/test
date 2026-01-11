
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
    // Use the 'original' variable which stores the actual typed password (without masking)
    var actualPassword = original;
    
    console.log('Checking password:', actualPassword, 'Expected:', CORRECT_PASSWORD);
    
    if (actualPassword === CORRECT_PASSWORD) {
        localStorage.setItem('hasUserData', 'true');
        localStorage.setItem('sessionStartTime', Date.now());
        location.href = 'documents.html?' + params;
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
    var value = input.value.toString();
    var char = value.substring(value.length - 1);
    if (value.length < original.length){
        original = original.substring(0, original.length - 1);
    }else{
        original = original + char;
    }

    if (!eye.classList.contains("eye_close")){
        var dots = "";
        for (var i = 0; i < value.length - 1; i++){
            dots = dots + dot
        }
        input.value = dots + char;
        delay(3000).then(() => {
            value = input.value;
            if (value.length != 0){
                input.value = value.substring(0, value.length - 1) + dot
            }
        });
        console.log(original)
    }
})

function delay(time, length) {
    return new Promise(resolve => setTimeout(resolve, time));
}

eye.addEventListener('click', () => {
    var classlist = eye.classList;
    if (classlist.contains("eye_close")){
        classlist.remove("eye_close");
        var dots = "";
        for (var i = 0; i < input.value.length - 1; i++){
            dots = dots + dot
        }
        input.value = dots;
    }else{
        classlist.add("eye_close");
        input.value = original;
    }

})
