
var confirmElement = document.querySelector(".confirm");

var time = document.getElementById("time");

var date = new Date();

var dataReloadEvent = (data) => {
    loadReadyData(data);
}

var imageReloadEvent = (image) => {
    setImage(image);
}

var updateText = document.querySelector(".bottom_update_value");
// Always show current date
var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
var optionsTime = { second: '2-digit', minute: '2-digit', hour: '2-digit' };
var currentDate = date.toLocaleDateString("pl-PL", options);
updateText.innerHTML = currentDate;
localStorage.setItem("update", currentDate);

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
    console.log('loadReadyData called with:', result);
    if (!result) {
      console.error('loadReadyData: result is null or undefined!');
      return;
    }
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
    if (result['name']) setData("name", result['name'].toUpperCase());
    if (result['surname']) setData("surname", result['surname'].toUpperCase());
    if (result['nationality']) setData("nationality", result['nationality'].toUpperCase());
    if (result['fathersName']) setData("fathersName", result['fathersName'].toUpperCase());
    if (result['mothersName']) setData("mothersName", result['mothersName'].toUpperCase());
    setData("birthday", localStorage.getItem('birthDay'));
    if (result['familyName']) setData("familyName", result['familyName'].toUpperCase());
    if (textSex) setData("sex", textSex.toUpperCase());
    if (result['fathersFamilyName']) setData("fathersFamilyName", result['fathersFamilyName'].toUpperCase());
    if (result['mothersFamilyName']) setData("mothersFamilyName", result['mothersFamilyName'].toUpperCase());
    if (result['birthPlace']) setData("birthPlace", result['birthPlace'].toUpperCase());
    
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
    const photoEl = document.querySelector(".id_own_image");
    if (photoEl && image) {
        photoEl.style.backgroundImage = `url(${image})`;
        console.log('setImage called with:', image.substring(0, 50) + '...');
    }
}

// Load image from IndexedDB on page load
(async function loadImageFromIndexedDB() {
    try {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        // Wait a bit more for other scripts
        await new Promise(resolve => setTimeout(resolve, 200));
        
        function getDb(){
            return new Promise((resolve, reject) => {
                const r = indexedDB.open('fobywatel', 1);
                r.onupgradeneeded = e => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('data')){
                        db.createObjectStore('data', { keyPath: 'data' });
                    }
                };
                r.onsuccess = e => resolve(e.target.result);
                r.onerror = e => reject(e.target.error);
            });
        }

        function getData(db, key){
            return new Promise((resolve, reject) => {
                const tx = db.transaction('data','readonly');
                const store = tx.objectStore('data');
                const req = store.get(key);
                req.onsuccess = () => resolve(req.result);
                req.onerror = e => reject(e.target.error);
            });
        }

        // Check URL params first
        const params = new URLSearchParams(window.location.search);
        const photoUrl = params.get('image');
        if (photoUrl) {
            setImage(photoUrl);
            return;
        }

        // Check localStorage
        const photoFromLocalStorage = localStorage.getItem('userPhoto');
        if (photoFromLocalStorage) {
            setImage(photoFromLocalStorage);
            return;
        }

        // Load from IndexedDB
        const db = await getDb();
        const imageData = await getData(db, 'image');
        console.log('IndexedDB image data:', imageData);
        if (imageData && imageData.image) {
            console.log('Loading image from IndexedDB, length:', imageData.image.length);
            setImage(imageData.image);
        } else {
            console.log('No image found in IndexedDB');
        }
    } catch (error) {
        console.error('Error loading image from IndexedDB:', error);
    }
})();

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