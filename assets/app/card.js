
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
unfold.addEventListener('click', () => {

    if (unfold.classList.contains("unfolded")){
      unfold.classList.remove("unfolded");
    }else{
      unfold.classList.add("unfolded");
    }

})

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
    
    setData('givenDate', localStorage.getItem('givenDate'));
    setData('expiryDate', localStorage.getItem('expiryDate'));

    // DEBUG: Sprawdzenie czy dane się pobierają
    console.log('PESEL z localStorage:', localStorage.getItem('pesel'));
    console.log('givenDate z localStorage:', localStorage.getItem('givenDate'));
    console.log('expiryDate z localStorage:', localStorage.getItem('expiryDate'));
    console.log('seriesAndNumber z localStorage:', localStorage.getItem('seriesAndNumber'));

    // Pobierz i wyświetl PESEL - waż niż cokolwiek innego
    const peselValue = localStorage.getItem('pesel');
    setData("pesel_value", peselValue);

    // Jeśli pesel_value nie istnieje na stronie, spróbuj znaleźć go w innym miejscu
    const peselEl = document.getElementById("pesel_value");
    if (peselEl && peselValue) {
        peselEl.textContent = peselValue;
    }
}

function setImage(image){
    document.querySelector(".id_own_image").style.backgroundImage = `url(${image})`;
}

function setData(id, value){
    const el = document.getElementById(id);
    if (el && value) {
        el.innerHTML = value;
    }
}

// Ensure displayed PESEL, givenDate and expiryDate always reflect localStorage
// (overwrite any previous value when the page/script loads).
document.addEventListener('DOMContentLoaded', () => {
    try {
        const mapping = {
            'pesel_value': 'pesel',
            'seriesAndNumber': 'seriesAndNumber',
            'expiryDate': 'expiryDate',
            'givenDate': 'givenDate'
        };
        Object.keys(mapping).forEach(id => {
            const key = mapping[id];
            const val = localStorage.getItem(key);
            const el = document.getElementById(id);
            if (el) {
                if (val) el.textContent = val;
            }
        });
    } catch (e) {
        console.error('Error applying localStorage values to card:', e);
    }

    // Lock background image in place with saved position/dimensions
    const idImage = document.querySelector('.id_image');
    if (idImage) {
        // Load saved position and dimensions from localStorage
        const savedX = localStorage.getItem('bgImageX');
        const savedY = localStorage.getItem('bgImageY');
        const savedWidth = localStorage.getItem('bgImageWidth');
        const savedHeight = localStorage.getItem('bgImageHeight');
        
        let currentX = 0;
        let currentY = 0;
        let currentWidth = 100;
        let currentHeight = 100;
        
        if (savedX !== null && savedY !== null) {
            currentX = parseFloat(savedX);
            currentY = parseFloat(savedY);
        }
        if (savedWidth !== null) {
            currentWidth = parseFloat(savedWidth);
        }
        if (savedHeight !== null) {
            currentHeight = parseFloat(savedHeight);
        }
        
        // Apply the saved transform and lock it in place
        idImage.style.transform = `translate(${currentX}px, ${currentY}px) scaleX(${currentWidth / 100}) scaleY(${currentHeight / 100})`;
    }
});