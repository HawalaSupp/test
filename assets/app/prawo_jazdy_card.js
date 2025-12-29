
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
localStorage.setItem("update_prawoJazdy", currentDate);

var update = document.querySelector(".update");
update.addEventListener('click', () => {
    var newDate = date.toLocaleDateString("pl-PL", options);
    localStorage.setItem("update_prawoJazdy", newDate);
    updateText.innerHTML = newDate;

    scroll(0, 0)
});

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

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

    // Use prawo jazdy specific keys
    setData("name", result['name'].toUpperCase());
    setData("surname", result['surname'].toUpperCase());
    setData("nationality", result['nationality'].toUpperCase());
    setData("birthday", localStorage.getItem('birthDay'));
    setData("familyName", result['familyName'].toUpperCase());
    setData("sex", textSex.toUpperCase());
    setData("fathersFamilyName", result['fathersFamilyName'].toUpperCase());
    setData("mothersFamilyName", result['mothersFamilyName'].toUpperCase());
    setData("birthPlace", result['birthPlace'].toUpperCase());
    
    setData('givenDate', localStorage.getItem('prawoJazdy_givenDate'));
    
    // Prawo jazdy specific fields
    setData('wydany', localStorage.getItem('prawoJazdy_wydany'));
    setData('numerDokumentu', localStorage.getItem('prawoJazdy_numerDokumentu'));
    setData('numerBlankietu', localStorage.getItem('prawoJazdy_numerBlankietu'));
    setData('organWydajacy', localStorage.getItem('prawoJazdy_organWydajacy'));
    setData('ograniczenia', localStorage.getItem('prawoJazdy_ograniczenia'));

    // Use prawo jazdy specific PESEL key
    const peselValue = localStorage.getItem('prawoJazdy_pesel');
    setData("pesel_value", peselValue);
    
    // Use prawo jazdy specific Kategorie key
    const kategorieValue = localStorage.getItem('prawoJazdy_kategorie');
    setData("kategorie", kategorieValue);
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

        // Check localStorage for prawo jazdy image
        const photoFromLocalStorage = localStorage.getItem('prawoJazdy_userPhoto');
        if (photoFromLocalStorage) {
            setImage(photoFromLocalStorage);
            return;
        }

        // Load from IndexedDB with prawo jazdy key
        const db = await getDb();
        const imageData = await getData(db, 'prawoJazdy_image');
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
document.addEventListener('DOMContentLoaded', () => {
    try {
        const mapping = {
            'pesel_value': 'prawoJazdy_pesel',
            'kategorie': 'prawoJazdy_kategorie',
            'seriesAndNumber': 'prawoJazdy_seriesAndNumber',
            'expiryDate': 'prawoJazdy_expiryDate',
            'givenDate': 'prawoJazdy_givenDate'
        };
        Object.keys(mapping).forEach(id => {
            const key = mapping[id];
            const val = localStorage.getItem(key);
            const el = document.getElementById(id);
            if (el) {
                if (val) el.textContent = val;
            }
        });

        // Load update date for prawo jazdy
        const updateVal = localStorage.getItem('update_prawoJazdy');
        if (updateVal && updateText) {
            updateText.innerHTML = updateVal;
        }
    } catch (e) {
        console.error('Error applying localStorage values to card:', e);
    }

    // Lock background image in place with saved position/dimensions
    const idImage = document.querySelector('.id_image');
    if (idImage) {
        // Load saved position and dimensions from localStorage (prawo jazdy specific)
        const savedX = localStorage.getItem('prawoJazdy_bgImageX');
        const savedY = localStorage.getItem('prawoJazdy_bgImageY');
        const savedWidth = localStorage.getItem('prawoJazdy_bgImageWidth');
        const savedHeight = localStorage.getItem('prawoJazdy_bgImageHeight');
        
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

