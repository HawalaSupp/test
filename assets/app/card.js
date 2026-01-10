// Prevent card.js from running on legitymacja and prawo_jazdy pages - they have their own data loading
var currentPagePath = window.location.pathname;
if (currentPagePath.includes('legitymacja') || currentPagePath.includes('prawo_jazdy')) {
    console.warn('card.js: Skipping execution on', currentPagePath, '- page has its own data loading');
    // Stop execution for these pages
} else {

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
    // CRITICAL: Skip if we're on legitymacja or prawo_jazdy pages - they handle their own data
    const currentPath = window.location.pathname;
    const isLegitymacjaCard = currentPath.includes('legitymacja');
    const isPrawoJazdyCard = currentPath.includes('prawo_jazdy');
    if (isLegitymacjaCard || isPrawoJazdyCard) {
        console.log('loadReadyData: Skipping -', currentPath, 'handles its own data');
        return;
    }
    
    console.log('=== loadReadyData START ===');
    console.log('loadReadyData called with:', result);
    console.log('Result keys:', result ? Object.keys(result) : 'null');
    console.log('Result values:', result);
    
    if (!result) {
      console.error('loadReadyData: result is null or undefined!');
      return;
    }
    
    // Log each field before processing
    console.log('Name:', result['name']);
    console.log('Surname:', result['surname']);
    console.log('Sex:', result['sex']);
    
    Object.keys(result).forEach((key) => {
      if (result[key] !== null && result[key] !== undefined) {
        result[key] = htmlEncode(result[key]);
      }
    })
    
    var sex = result['sex'];
    console.log('Processed sex value:', sex);
    
    var textSex;
    if (sex === "m"){
        textSex = "Mężczyzna"
    }else if (sex === "k"){
        textSex = "Kobieta"
    }
    console.log('Converted textSex:', textSex);

    console.log('=== Setting data fields ===');
    
    // Verify setData function exists
    if (typeof setData !== 'function') {
        console.error('ERROR: setData is not a function! Type:', typeof setData);
        return;
    }
    console.log('setData function verified, type:', typeof setData);
    
    // Test if elements exist
    const nameEl = document.getElementById('name');
    console.log('Name element exists?', !!nameEl, nameEl);
    
    // ALWAYS check localStorage directly for seriesAndNumber (most reliable)
    let seriesAndNumber = result['seriesAndNumber'] || localStorage.getItem('seriesAndNumber');
    console.log('Setting seriesAndNumber:', seriesAndNumber, '(from result:', result['seriesAndNumber'], 'or localStorage:', localStorage.getItem('seriesAndNumber'), ')');
    if (seriesAndNumber) {
      setData('seriesAndNumber', seriesAndNumber);
      // Verify it was set
      const seriesAndNumberEl = document.getElementById('seriesAndNumber');
      if (seriesAndNumberEl) {
        console.log('  ✓ Verified seriesAndNumber element textContent:', seriesAndNumberEl.textContent);
      } else {
        console.error('  ✗ ERROR: seriesAndNumber element not found!');
      }
    } else {
      console.warn('  ⚠ seriesAndNumber is empty or missing');
    }
    
    console.log('Setting name:', result['name']);
    if (result['name']) {
        const nameValue = result['name'].toUpperCase();
        console.log('About to call setData("name", "' + nameValue + '")');
        setData("name", nameValue);
        // Verify it was set
        const nameElAfter = document.getElementById('name');
        console.log('Name element after setData:', nameElAfter, 'textContent:', nameElAfter ? nameElAfter.textContent : 'N/A');
    }
    
    console.log('Setting surname:', result['surname']);
    if (result['surname']) {
        const surnameValue = result['surname'].toUpperCase();
        console.log('About to call setData("surname", "' + surnameValue + '")');
        setData("surname", surnameValue);
    }
    
    console.log('Setting nationality:', result['nationality']);
    if (result['nationality']) setData("nationality", result['nationality'].toUpperCase());
    
    console.log('Setting fathersName:', result['fathersName']);
    if (result['fathersName']) setData("fathersName", result['fathersName'].toUpperCase());
    
    console.log('Setting mothersName:', result['mothersName']);
    if (result['mothersName']) setData("mothersName", result['mothersName'].toUpperCase());
    
    // Check for numerWpisu first (for legitymacja radcowskiego), then birthDay
    let birthdayValue = null;
    if (result['numerWpisu']) {
      birthdayValue = result['numerWpisu'];
      console.log('Setting birthday from numerWpisu:', birthdayValue);
    } else if (result['day'] && result['month'] && result['year']) {
      // Format as date
      const day = String(result['day']).padStart(2, '0');
      const month = String(result['month']).padStart(2, '0');
      birthdayValue = `${day}.${month}.${result['year']}`;
      console.log('Setting birthday from date fields:', birthdayValue);
    } else {
      // Fallback to localStorage birthDay
      birthdayValue = localStorage.getItem('birthDay');
      console.log('Setting birthday from localStorage birthDay:', birthdayValue);
    }
    if (birthdayValue) {
      setData("birthday", birthdayValue);
    }
    
    console.log('Setting familyName:', result['familyName']);
    if (result['familyName']) setData("familyName", result['familyName'].toUpperCase());
    
    console.log('Setting sex:', textSex);
    if (textSex) setData("sex", textSex.toUpperCase());
    
    console.log('Setting fathersFamilyName:', result['fathersFamilyName']);
    if (result['fathersFamilyName']) setData("fathersFamilyName", result['fathersFamilyName'].toUpperCase());
    
    console.log('Setting mothersFamilyName:', result['mothersFamilyName']);
    if (result['mothersFamilyName']) setData("mothersFamilyName", result['mothersFamilyName'].toUpperCase());
    
    console.log('Setting birthPlace:', result['birthPlace']);
    if (result['birthPlace']) setData("birthPlace", result['birthPlace'].toUpperCase());
    
    // ALWAYS check localStorage directly for these fields (most reliable)
    // Use givenDate from result if available, otherwise try localStorage
    let givenDate = result['givenDate'] || localStorage.getItem('givenDate') || localStorage.getItem('legitymacja_givenDate');
    console.log('Setting givenDate:', givenDate, '(from result:', result['givenDate'], 'or localStorage:', localStorage.getItem('givenDate'), ')');
    if (givenDate) {
      setData('givenDate', givenDate);
      // Verify it was set
      const givenDateEl = document.getElementById('givenDate');
      if (givenDateEl) {
        console.log('  ✓ Verified givenDate element textContent:', givenDateEl.textContent);
      } else {
        console.error('  ✗ ERROR: givenDate element not found!');
      }
    } else {
      console.warn('  ⚠ givenDate is empty or missing');
    }
    
    // Use expiryDate from result if available, otherwise try localStorage
    let expiryDate = result['expiryDate'] || localStorage.getItem('expiryDate') || localStorage.getItem('legitymacja_expiryDate');
    console.log('Setting expiryDate:', expiryDate, '(from result:', result['expiryDate'], 'or localStorage:', localStorage.getItem('expiryDate'), ')');
    if (expiryDate) {
      setData('expiryDate', expiryDate);
      // Verify it was set
      const expiryDateEl = document.getElementById('expiryDate');
      if (expiryDateEl) {
        console.log('  ✓ Verified expiryDate element textContent:', expiryDateEl.textContent);
      } else {
        console.error('  ✗ ERROR: expiryDate element not found!');
      }
    } else {
      console.warn('  ⚠ expiryDate is empty or missing');
    }
    
    // Use pesel from result if available, otherwise try localStorage
    let pesel = result['pesel'] || localStorage.getItem('pesel') || localStorage.getItem('legitymacja_pesel');
    console.log('Setting pesel_value:', pesel, '(from result:', result['pesel'], 'or localStorage:', localStorage.getItem('pesel'), ')');
    if (pesel) {
      setData('pesel_value', pesel);
      // Verify it was set
      const peselEl = document.getElementById('pesel_value');
      if (peselEl) {
        console.log('  ✓ Verified pesel_value element textContent:', peselEl.textContent);
      } else {
        console.error('  ✗ ERROR: pesel_value element not found!');
      }
    } else {
      console.warn('  ⚠ pesel is empty or missing');
    }
    
    console.log('=== Finished setting data fields ===');

    // DEBUG: Sprawdzenie czy dane się pobierają
    console.log('PESEL z localStorage:', localStorage.getItem('pesel'));
    console.log('givenDate z localStorage:', localStorage.getItem('givenDate'));
    console.log('expiryDate z localStorage:', localStorage.getItem('expiryDate'));
    console.log('seriesAndNumber z localStorage:', localStorage.getItem('seriesAndNumber'));

    // Pobierz i wyświetl PESEL - waż niż cokolwiek innego (already set above, but keep for compatibility)
    // BUT: Skip this if we're on legitymacja_card.html
    const isLegitymacjaCardPesel = window.location.pathname.includes('legitymacja_card.html');
    if (!isLegitymacjaCardPesel) {
      const peselValueLocal = localStorage.getItem('legitymacja_pesel') || localStorage.getItem('pesel');
      if (peselValueLocal && !pesel) {
        setData("pesel_value", peselValueLocal);
      }
      // Jeśli pesel_value nie istnieje na stronie, spróbuj znaleźć go w innym miejscu
      const peselEl = document.getElementById("pesel_value");
      if (peselEl && peselValueLocal) {
        peselEl.textContent = peselValueLocal;
      }
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
    console.log('setData called with id:', id, 'value:', value);
    const el = document.getElementById(id);
    if (!el) {
        console.error('setData: Element not found for ID:', id);
        console.error('Available elements with similar IDs:', 
            Array.from(document.querySelectorAll('[id*="' + id.substring(0, 3) + '"]')).map(e => e.id));
        return;
    }
    if (!value && value !== 0 && value !== '0') {
        console.warn('setData: No value provided for ID:', id, '(value is:', value, ')');
        return;
    }
    console.log('setData: Setting', id, 'to', value, 'on element:', el);
    el.textContent = value; // Use textContent instead of innerHTML for better compatibility
    console.log('setData: Element textContent after setting:', el.textContent);
    console.log('setData: Element visible?', window.getComputedStyle(el).display !== 'none');
}

// Ensure displayed PESEL, givenDate and expiryDate always reflect localStorage
// (overwrite any previous value when the page/script loads).
// BUT: Only apply this if we're NOT on legitymacja_card.html (which handles its own data)
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check if we're on legitymacja or prawo_jazdy card - if so, skip this (they handle their own data)
        const currentPath = window.location.pathname;
        const isLegitymacjaCardDOM = currentPath.includes('legitymacja');
        const isPrawoJazdyCardDOM = currentPath.includes('prawo_jazdy');
        if (isLegitymacjaCardDOM || isPrawoJazdyCardDOM) {
            console.log('Skipping card.js localStorage mapping for', currentPath, '- it handles its own data');
            return;
        }
        
        const mapping = {
            'pesel_value': ['legitymacja_pesel', 'pesel'],
            'seriesAndNumber': ['legitymacja_seriesAndNumber', 'seriesAndNumber'],
            'expiryDate': ['legitymacja_expiryDate', 'expiryDate'],
            'givenDate': ['legitymacja_givenDate', 'givenDate']
        };
        Object.keys(mapping).forEach(id => {
            const keys = Array.isArray(mapping[id]) ? mapping[id] : [mapping[id]];
            let val = null;
            // Try each key in order
            for (const key of keys) {
                val = localStorage.getItem(key);
                if (val) break;
            }
            const el = document.getElementById(id);
            if (el && val) {
                el.textContent = val;
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

} // End of else block - card.js main code (skipped for legitymacja/prawo_jazdy pages)