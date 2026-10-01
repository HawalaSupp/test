const docSelectors = {
    series: document.getElementById('docSeries'),
    status: document.getElementById('docStatus'),
    issuer: document.getElementById('docIssuer'),
    expiry: document.getElementById('docExpiry'),
    issueDate: document.getElementById('docIssueDate'),
    update: document.getElementById('docUpdate'),
};

function getMdowodData() {
    try {
        return JSON.parse(localStorage.getItem('mdowod_userData') || '{}');
    } catch (_) {
        return {};
    }
}

function getDocumentValue(data, field, fallback, legacyKeys = []) {
    // The JSON object is the primary source because every generator submission
    // replaces it, including fields that the user intentionally cleared.
    if (Object.prototype.hasOwnProperty.call(data, field)) {
        const value = String(data[field] ?? '').trim();
        return value || fallback;
    }

    const keys = [`mdowod_${field}`, ...legacyKeys];
    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value && value.trim()) return value.trim();
    }

    return fallback;
}

function setText(el, value) {
    if (el) {
        el.textContent = value || '---';
    }
}

function initDocumentData() {
    const data = getMdowodData();

    setText(docSelectors.series, getDocumentValue(data, 'docSeriesNumber', '', ['docSeriesNumber']));
    setText(docSelectors.status, getDocumentValue(data, 'docStatus', 'Wydany', ['docStatus']));
    setText(docSelectors.issuer, getDocumentValue(
        data,
        'docIssuer',
        'URZĄD MIASTA',
        ['mdowod_issuingAuthority', 'docIssuer', 'issuingAuthority']
    ));
    setText(docSelectors.expiry, getDocumentValue(data, 'expiryDate', '', ['expiryDate']));
    setText(docSelectors.issueDate, getDocumentValue(data, 'givenDate', '', ['givenDate']));
    setText(docSelectors.update, getDocumentValue(data, 'update', '', ['mdowod_updateDate', 'update']));

    const copyBtn = document.getElementById('copyDocSeries');
    if (copyBtn && docSelectors.series) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(docSelectors.series.textContent.trim());
                copyBtn.textContent = 'Skopiowano!';
                setTimeout(() => copyBtn.textContent = 'Kopiuj', 1500);
            } catch (_) {
                copyBtn.textContent = 'Błąd kopiowania';
                setTimeout(() => copyBtn.textContent = 'Kopiuj', 1500);
            }
        });
    }

    const updateBtn = document.querySelector('.update');
    if (updateBtn && docSelectors.update) {
        updateBtn.addEventListener('click', () => {
            const now = new Date().toLocaleDateString('pl-PL');
            localStorage.setItem('update', now);
            setText(docSelectors.update, now);
        });
    }
}

document.addEventListener('DOMContentLoaded', initDocumentData);
