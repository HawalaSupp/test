
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

async function checkPasswordAndLogin(){
    // Get the actual password
    var rawValue = input ? input.value : '';
    var actualPassword = original || rawValue;
    
    // Clean up any masking characters
    actualPassword = actualPassword.replace(/•/g, '');
    
    console.log('Checking password...');
    
    // First check if password is correct
    if (actualPassword !== CORRECT_PASSWORD && rawValue !== CORRECT_PASSWORD) {
        // Wrong password - show error
        if (input) {
            input.style.borderColor = '#ff4444';
            input.style.animation = 'shake 0.3s ease';
            setTimeout(function() {
                input.style.animation = '';
            }, 300);
        }
        return;
    }
    
    // Password is correct - now check device authentication
    const password = actualPassword === CORRECT_PASSWORD ? actualPassword : rawValue;
    
    try {
        const result = await DeviceAuth.authenticate(password);
        
        if (result.success) {
            // Device authenticated successfully
            console.log('Device authenticated:', result.message);
            
            // Show success notification
            showNotification(result.message, 'success');
            
            // Store session data
            localStorage.setItem('hasUserData', 'true');
            localStorage.setItem('sessionStartTime', Date.now());
            localStorage.setItem('lastActiveTime', Date.now());
            localStorage.setItem('authPassword', password); // For session validation
            
            // Smooth fade-out animation before redirect
            setTimeout(function() {
                document.body.style.transition = 'opacity 0.3s ease-out';
                document.body.style.opacity = '0';
                
                setTimeout(function() {
                    location.href = 'documents.html?' + params;
                }, 300);
            }, 1000);
            
        } else if (result.action === 'device_limit') {
            // Device limit reached - show device management modal
            console.log('Device limit reached:', result.message);
            showDeviceManagementModal(result);
        } else {
            // Other error
            showNotification(result.message, 'error');
        }
        
    } catch (error) {
        console.error('Authentication error:', error);
        showNotification('Authentication error. Please try again.', 'error');
    }
}

function showNotification(message, type) {
    // Remove existing notification
    const existing = document.querySelector('.auth-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'auth-notification ' + type;
    notification.innerHTML = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('visible'), 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showDeviceManagementModal(result) {
    // Remove existing modal
    const existing = document.querySelector('.device-modal-overlay');
    if (existing) existing.remove();
    
    // Create modal
    const overlay = document.createElement('div');
    overlay.className = 'device-modal-overlay';
    
    let devicesHtml = '';
    result.devices.forEach((device, index) => {
        const timeAgo = DeviceAuth.timeAgo(device.lastActive);
        devicesHtml += `
            <div class="device-item" data-device-id="${device.deviceId}">
                <div class="device-info">
                    <div class="device-name">${device.deviceName}</div>
                    <div class="device-meta">Last active: ${timeAgo} • ${device.loginCount} logins</div>
                </div>
                <button class="device-remove-btn" onclick="removeDeviceAndContinue('${device.deviceId}', '${result.passwordHash}', '${result.currentDeviceId}', '${result.currentDeviceName}')">
                    Remove
                </button>
            </div>
        `;
    });
    
    overlay.innerHTML = `
        <div class="device-modal">
            <div class="device-modal-header">
                <h3>Device Limit Reached</h3>
                <p>Maximum ${result.devices.length} devices are registered. Remove one to continue.</p>
            </div>
            <div class="device-modal-body">
                <div class="current-device-info">
                    <strong>Your current device:</strong> ${result.currentDeviceName}
                </div>
                <div class="device-list">
                    <div class="device-list-title">Registered Devices:</div>
                    ${devicesHtml}
                </div>
            </div>
            <div class="device-modal-footer">
                <button class="device-cancel-btn" onclick="closeDeviceModal()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animate in
    setTimeout(() => overlay.classList.add('visible'), 10);
}

function closeDeviceModal() {
    const overlay = document.querySelector('.device-modal-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        setTimeout(() => overlay.remove(), 300);
    }
}

async function removeDeviceAndContinue(deviceIdToRemove, passwordHash, currentDeviceId, currentDeviceName) {
    try {
        // Remove the selected device
        const removeResult = await DeviceAuth.removeDevice(passwordHash, deviceIdToRemove);
        
        if (removeResult.success) {
            // Register current device
            const registerResult = await DeviceAuth.registerAfterRemoval(passwordHash, currentDeviceId, currentDeviceName);
            
            if (registerResult.success) {
                closeDeviceModal();
                showNotification('Device registered: ' + currentDeviceName, 'success');
                
                // Store session data
                localStorage.setItem('hasUserData', 'true');
                localStorage.setItem('sessionStartTime', Date.now());
                localStorage.setItem('lastActiveTime', Date.now());
                
                // Redirect after delay
                setTimeout(function() {
                    document.body.style.transition = 'opacity 0.3s ease-out';
                    document.body.style.opacity = '0';
                    
                    setTimeout(function() {
                        location.href = 'documents.html?' + params;
                    }, 300);
                }, 1000);
            } else {
                showNotification('Failed to register device: ' + registerResult.message, 'error');
            }
        } else {
            showNotification('Failed to remove device: ' + removeResult.message, 'error');
        }
    } catch (error) {
        console.error('Device management error:', error);
        showNotification('An error occurred. Please try again.', 'error');
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
    original = input.value;
    console.log('Password updated:', original);
})

function delay(time, length) {
    return new Promise(resolve => setTimeout(resolve, time));
}

eye.addEventListener('click', () => {
    // Smooth fade animation
    eye.style.opacity = '0';
    
    setTimeout(() => {
        // Toggle password visibility
        if (input.type === 'password') {
            input.type = 'text';
            eye.classList.add("eye_close");
        } else {
            input.type = 'password';
            eye.classList.remove("eye_close");
        }
        
        // Fade back in
        setTimeout(() => {
            eye.style.opacity = '1';
        }, 10);
    }, 150);
})
