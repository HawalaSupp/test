
var confirmElement = document.querySelector(".confirm");

var time = document.getElementById("time");

if (localStorage.getItem("update") == null){
    localStorage.setItem("update", "24.12.2024")
}

var date = new Date();

var dataReloadEvent = (data) => {
    loadReadyData(data);
}

var imageReloadEvent = (image) => {
    setImage(image);
}

var updateText = document.querySelector(".bottom_update_value");
updateText.innerHTML = localStorage.getItem("update");

var update = document.querySelector(".update");
update.addEventListener('click', () => {
    var newDate = date.toLocaleDateString("pl-PL", options);
    localStorage.setItem("update", newDate);
    updateText.innerHTML = newDate;

    scroll(0, 0)
});

setClock();
function setClock(){
    date = new Date();
    time.innerHTML = "Czas: " + date.toLocaleTimeString("pl-PL", optionsTime) + " " + date.toLocaleDateString("pl-PL", options);    
    delay(1000).then(() => {
        setClock();
    })
}

var unfold = document.querySelector(".info_holder");
if (unfold) {
    // Add click listener to the info_holder and all its interactive elements
    unfold.addEventListener('click', function(e) {
        // Prevent clicks on nested inputs from bubbling up
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            return;
        }
        
        if (unfold.classList.contains("unfolded")) {
            unfold.classList.remove("unfolded");
        } else {
            unfold.classList.add("unfolded");
        }
    });
    
    // Also add click listener to the arrow specifically
    const arrow = unfold.querySelector(".action_arrow");
    if (arrow) {
        arrow.style.cursor = "pointer";
        arrow.addEventListener('click', function(e) {
            e.stopPropagation();
            if (unfold.classList.contains("unfolded")) {
                unfold.classList.remove("unfolded");
            } else {
                unfold.classList.add("unfolded");
            }
        });
    }
}

function htmlEncode(value){
    if (value === undefined || value === null){
        return '';
    }
    return value.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function loadReadyData(result){
    Object.keys(result).forEach((key) => {
      result[key] = htmlEncode(result[key])
    })
    
    var sex = result['sex'];
    
    var textSex;
    if (sex === "m"){
        textSex = "Mężczyzna"
    }else if (sex === "k"){
        textSex = "Kobieta"
    }

    setData('seriesAndNumber', localStorage.getItem('seriesAndNumber'));
    setData("name", result['name'].toUpperCase());
    setData("surname", result['surname'].toUpperCase());
    setData("nationality", result['nationality'].toUpperCase());
    setData("fathersName", result['fathersName'].toUpperCase());
    setData("mothersName", result['mothersName'].toUpperCase());
    setData("birthday", localStorage.getItem('birthDay'));
    setData("familyName", result['familyName'].toUpperCase());
    setData("sex", textSex.toUpperCase());
    setData("fathersFamilyName", result['fathersFamilyName'].toUpperCase());
    setData("mothersFamilyName", result['mothersFamilyName'].toUpperCase());
    setData("birthPlace", result['birthPlace'].toUpperCase());
    setData("countryOfBirth", result['countryOfBirth'].toUpperCase());
    setData("adress", ("ul. " + result['address1'] + "<br>" + result['address2'] + " " + result['city']).toUpperCase());
    
    setData('givenDate', localStorage.getItem('givenDate'));
    setData('expiryDate', localStorage.getItem('expiryDate'));

    if (!localStorage.getItem("homeDate")){
      var homeDay = getRandom(1, 25);
      var homeMonth = getRandom(0, 12);
      var homeYear = getRandom(2012, 2019);
    
      var homeDate = new Date();
      homeDate.setDate(homeDay);
      homeDate.setMonth(homeMonth);
      homeDate.setFullYear(homeYear)
    
      localStorage.setItem("homeDate", homeDate.toLocaleDateString("pl-PL", options))
    }
    
    document.querySelector(".home_date").innerHTML = localStorage.getItem("homeDate");

    setData("pesel_value", localStorage.getItem('pesel'));
}

function setImage(image){
    document.querySelector(".id_own_image").style.backgroundImage = `url(${image})`;
}

function setData(id, value){
    document.getElementById(id).innerHTML = value;
}

// === Custom Field Save Functions ===
function saveCustomSeriesAndNumber() {
    const input = document.getElementById('customSeriesAndNumber');
    const value = input.value.trim();
    if (value) {
        localStorage.setItem('seriesAndNumber', value);
        document.getElementById('seriesAndNumber').textContent = value;
        input.value = '';
        alert('Seria i numer zapisane!');
    } else {
        alert('Podaj wartość');
    }
}

function saveCustomPesel() {
    const input = document.getElementById('customPesel');
    const value = input.value.trim();
    if (value) {
        localStorage.setItem('pesel', value);
        document.getElementById('pesel_value').textContent = value;
        input.value = '';
        alert('PESEL zapisany!');
    } else {
        alert('Podaj wartość');
    }
}

function saveCustomExpiryDate() {
    const input = document.getElementById('customExpiryDate');
    const value = input.value.trim();
    if (value) {
        localStorage.setItem('expiryDate', value);
        document.getElementById('expiryDate').textContent = value;
        input.value = '';
        alert('Data ważności zapisana!');
    } else {
        alert('Podaj wartość');
    }
}

function saveCustomGivenDate() {
    const input = document.getElementById('customGivenDate');
    const value = input.value.trim();
    if (value) {
        localStorage.setItem('givenDate', value);
        document.getElementById('givenDate').textContent = value;
        input.value = '';
        alert('Data wydania zapisana!');
    } else {
        alert('Podaj wartość');
    }
}