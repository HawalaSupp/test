var params = new URLSearchParams(window.location.search);

window.onload = async () => {
    const files = ['https://unpkg.com/html5-qrcode'];
    // Only include pages that actually exist (with .html extension)
    const pages = ['card.html', 'document.html', 'documents.html', 'id.html', 'more.html', 'pesel.html', 'qr.html', 'scan.html', 'services.html', 'shortcuts.html'];

    pages.forEach((page) => {
        files.push('' + page + (params.toString() ? '?' + params : ''));
    });

    // Try to fetch cache/files, but don't fail if it doesn't exist
    try {
        const filesRequest = await fetch('cache/files');
        if (filesRequest.ok) {
            const filesResponse = await filesRequest.json();
            if (filesResponse && filesResponse.files && Array.isArray(filesResponse.files)) {
                filesResponse.files.forEach((file) => {
                    files.push('' + file);
                });
            }
        }
        // Silently skip if cache/files doesn't exist - this is normal
    } catch (error) {
        // Silently skip if cache/files doesn't exist - this is normal
    }

    const cacheName = 'fobywatel';
    const cache = await caches.open(cacheName);
    
    // Add files one by one instead of addAll to handle failures gracefully
    for (const file of files) {
        try {
            // Only try to cache if it's a valid URL (not just a query string)
            if (file && !file.startsWith('?')) {
                await cache.add(file);
            }
        } catch (error) {
            // Silently skip files that don't exist - this is normal for optional cache files
            // Don't log to console to avoid noise
        }
    }

    const cachedRequests = await cache.keys();
    
    cachedRequests.forEach((request) => {
        checkElement(request, cache);
    });

    // Service worker registration disabled - worker.js not implemented
};

async function checkElement(request, cache) {
    try {
        const cachedResponse = await cache.match(request);
        if (!cachedResponse) return;
        
        const url = new URL(request.url);
        const modifiedUrl = new URL(url);

        modifiedUrl.searchParams.append('date', new Date());

        const networkResponse = await fetch(modifiedUrl);
        if (!networkResponse.ok) return; // Skip if network request fails

        const cachedText = await cachedResponse.clone().text();
        const networkText = await networkResponse.clone().text();

        if (cachedText !== networkText){
            cache.put(url, networkResponse);
        }
    } catch (error) {
        // Silently skip errors in cache checking - this is not critical
    }
}
