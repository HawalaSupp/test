/**
 * Device Authentication System
 * Ties passwords to specific devices and limits simultaneous usage
 */

const DeviceAuth = (function() {
    const STORAGE_KEY = 'deviceAuthData';
    const MAX_DEVICES = 2; // Maximum devices per password
    const SESSION_EXPIRY_DAYS = 30; // Sessions expire after 30 days
    
    /**
     * Generate a device fingerprint from browser/device properties
     */
    async function generateFingerprint() {
        const components = [];
        
        // User Agent
        components.push(navigator.userAgent || 'unknown');
        
        // Screen properties
        components.push(screen.width + 'x' + screen.height);
        components.push(screen.colorDepth || 'unknown');
        components.push(window.devicePixelRatio || 1);
        
        // Timezone
        components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown');
        components.push(new Date().getTimezoneOffset());
        
        // Language
        components.push(navigator.language || 'unknown');
        components.push((navigator.languages || []).join(','));
        
        // Platform
        components.push(navigator.platform || 'unknown');
        
        // Hardware
        components.push(navigator.hardwareConcurrency || 'unknown');
        components.push(navigator.maxTouchPoints || 0);
        
        // WebGL Renderer (unique per GPU)
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown');
                    components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown');
                }
            }
        } catch (e) {
            components.push('webgl-error');
        }
        
        // Canvas fingerprint
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 50;
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(0, 0, 100, 50);
            ctx.fillStyle = '#069';
            ctx.fillText('DeviceAuth', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('Fingerprint', 4, 35);
            components.push(canvas.toDataURL().slice(-50));
        } catch (e) {
            components.push('canvas-error');
        }
        
        // Combine and hash
        const fingerprint = components.join('|||');
        return await hashString(fingerprint);
    }
    
    /**
     * SHA-256 hash a string
     */
    async function hashString(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Generate a friendly device name from User Agent
     */
    function getDeviceName() {
        const ua = navigator.userAgent;
        let browser = 'Unknown Browser';
        let os = 'Unknown OS';
        
        // Detect browser
        if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
        else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
        
        // Detect OS
        if (ua.includes('iPhone')) os = 'iPhone';
        else if (ua.includes('iPad')) os = 'iPad';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('Mac')) os = 'Mac';
        else if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Linux')) os = 'Linux';
        
        return browser + ' - ' + os;
    }
    
    /**
     * Encrypt data using password hash as key
     */
    function encryptData(data, key) {
        const jsonStr = JSON.stringify(data);
        let encrypted = '';
        for (let i = 0; i < jsonStr.length; i++) {
            encrypted += String.fromCharCode(
                jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(encrypted);
    }
    
    /**
     * Decrypt data using password hash as key
     */
    function decryptData(encryptedStr, key) {
        try {
            const encrypted = atob(encryptedStr);
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(
                    encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
                );
            }
            return JSON.parse(decrypted);
        } catch (e) {
            return null;
        }
    }
    
    /**
     * Get stored auth data
     */
    function getStoredData(passwordHash) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;
        return decryptData(stored, passwordHash);
    }
    
    /**
     * Save auth data
     */
    function saveData(data, passwordHash) {
        const encrypted = encryptData(data, passwordHash);
        localStorage.setItem(STORAGE_KEY, encrypted);
    }
    
    /**
     * Check if a session has expired
     */
    function isSessionExpired(lastActive) {
        const now = Date.now();
        const expiryTime = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        return (now - lastActive) > expiryTime;
    }
    
    /**
     * Remove expired devices from the list
     */
    function cleanExpiredDevices(devices) {
        return devices.filter(device => !isSessionExpired(device.lastActive));
    }
    
    /**
     * Main authentication function
     * Returns: { success: boolean, message: string, action?: string }
     */
    async function authenticate(password) {
        const passwordHash = await hashString(password);
        const deviceId = await generateFingerprint();
        const deviceName = getDeviceName();
        const now = Date.now();
        
        // Get or create auth data
        let authData = getStoredData(passwordHash);
        
        if (!authData) {
            // First time login with this password - create new auth data
            authData = {
                passwordHash: passwordHash,
                devices: [],
                maxDevices: MAX_DEVICES,
                createdAt: now
            };
        }
        
        // Clean expired devices
        authData.devices = cleanExpiredDevices(authData.devices);
        
        // Check if current device is already registered
        const existingDevice = authData.devices.find(d => d.deviceId === deviceId);
        
        if (existingDevice) {
            // Device already registered - update last active
            existingDevice.lastActive = now;
            existingDevice.loginCount = (existingDevice.loginCount || 0) + 1;
            saveData(authData, passwordHash);
            
            return {
                success: true,
                message: 'Welcome back! Device recognized.',
                deviceName: existingDevice.deviceName,
                deviceCount: authData.devices.length,
                maxDevices: authData.maxDevices
            };
        }
        
        // New device - check if under limit
        if (authData.devices.length >= authData.maxDevices) {
            // At device limit - need to remove one
            return {
                success: false,
                message: 'Maximum devices reached (' + authData.maxDevices + '/' + authData.maxDevices + '). Please remove an old device.',
                action: 'device_limit',
                devices: authData.devices.map(d => ({
                    deviceId: d.deviceId,
                    deviceName: d.deviceName,
                    lastActive: d.lastActive,
                    loginCount: d.loginCount
                })),
                passwordHash: passwordHash,
                currentDeviceId: deviceId,
                currentDeviceName: deviceName
            };
        }
        
        // Under limit - register new device
        authData.devices.push({
            deviceId: deviceId,
            deviceName: deviceName,
            registeredAt: now,
            lastActive: now,
            loginCount: 1
        });
        
        saveData(authData, passwordHash);
        
        return {
            success: true,
            message: 'New device registered: ' + deviceName,
            isNewDevice: true,
            deviceName: deviceName,
            deviceCount: authData.devices.length,
            maxDevices: authData.maxDevices
        };
    }
    
    /**
     * Remove a device from the registered list
     */
    async function removeDevice(passwordHash, deviceIdToRemove) {
        let authData = getStoredData(passwordHash);
        
        if (!authData) {
            return { success: false, message: 'No auth data found' };
        }
        
        const initialCount = authData.devices.length;
        authData.devices = authData.devices.filter(d => d.deviceId !== deviceIdToRemove);
        
        if (authData.devices.length === initialCount) {
            return { success: false, message: 'Device not found' };
        }
        
        saveData(authData, passwordHash);
        
        return {
            success: true,
            message: 'Device removed successfully',
            remainingDevices: authData.devices.length
        };
    }
    
    /**
     * Register current device after removing another
     */
    async function registerAfterRemoval(passwordHash, currentDeviceId, currentDeviceName) {
        let authData = getStoredData(passwordHash);
        const now = Date.now();
        
        if (!authData) {
            return { success: false, message: 'No auth data found' };
        }
        
        // Check if already registered (edge case)
        const existing = authData.devices.find(d => d.deviceId === currentDeviceId);
        if (existing) {
            existing.lastActive = now;
            saveData(authData, passwordHash);
            return { success: true, message: 'Device already registered' };
        }
        
        // Register new device
        authData.devices.push({
            deviceId: currentDeviceId,
            deviceName: currentDeviceName,
            registeredAt: now,
            lastActive: now,
            loginCount: 1
        });
        
        saveData(authData, passwordHash);
        
        return {
            success: true,
            message: 'Device registered: ' + currentDeviceName,
            deviceCount: authData.devices.length
        };
    }
    
    /**
     * Validate current session (for page loads)
     */
    async function validateSession(password) {
        const passwordHash = await hashString(password);
        const deviceId = await generateFingerprint();
        
        const authData = getStoredData(passwordHash);
        
        if (!authData) {
            return { valid: false, reason: 'no_auth_data' };
        }
        
        const device = authData.devices.find(d => d.deviceId === deviceId);
        
        if (!device) {
            return { valid: false, reason: 'device_not_registered' };
        }
        
        if (isSessionExpired(device.lastActive)) {
            return { valid: false, reason: 'session_expired' };
        }
        
        // Update last active
        device.lastActive = Date.now();
        saveData(authData, passwordHash);
        
        return { valid: true, deviceName: device.deviceName };
    }
    
    /**
     * Get list of registered devices (for display)
     */
    async function getRegisteredDevices(password) {
        const passwordHash = await hashString(password);
        const authData = getStoredData(passwordHash);
        
        if (!authData) {
            return [];
        }
        
        return authData.devices.map(d => ({
            deviceId: d.deviceId,
            deviceName: d.deviceName,
            lastActive: new Date(d.lastActive).toLocaleString(),
            loginCount: d.loginCount
        }));
    }
    
    /**
     * Reset all devices (requires password)
     */
    async function resetAllDevices(password) {
        const passwordHash = await hashString(password);
        let authData = getStoredData(passwordHash);
        
        if (authData) {
            authData.devices = [];
            saveData(authData, passwordHash);
        }
        
        return { success: true, message: 'All devices have been reset' };
    }
    
    /**
     * Format time ago for display
     */
    function timeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        return Math.floor(seconds / 86400) + ' days ago';
    }
    
    // Public API
    return {
        authenticate: authenticate,
        removeDevice: removeDevice,
        registerAfterRemoval: registerAfterRemoval,
        validateSession: validateSession,
        getRegisteredDevices: getRegisteredDevices,
        resetAllDevices: resetAllDevices,
        hashString: hashString,
        generateFingerprint: generateFingerprint,
        timeAgo: timeAgo,
        MAX_DEVICES: MAX_DEVICES
    };
})();
