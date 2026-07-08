const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const hotelDir = path.join(rootDir, 'pages', 'hotel');
const guestDir = path.join(rootDir, 'pages', 'guest');
const adminDir = path.join(rootDir, 'pages', 'admin');
const sharedDir = path.join(rootDir, 'pages', 'shared');

// Create directories
[guestDir, adminDir, sharedDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const guestDirs = [
    "about-lumina", "accessibility", "amenities-lumina", "booking-your-stay", 
    "contact-lumina", "dining-lumina", "faq-lumina", "gallery-lumina", 
    "guest-dashboard-lumina", "home-lumina", "local-area", "meetings-events", 
    "policies", "privacy", "reviews-lumina", "room-detail-lumina", 
    "rooms-lumina", "spa-wellness", "special-offers"
];

const adminDirs = [
    "admin-dashboard-lumina", "housekeeping", "housekeeping-dashboard", 
    "manage-bookings-lumina", "manager-dashboard", "reception", 
    "receptionist-dashboard", "resource-management-lumina", "staff-directory-lumina"
];

const sharedDirs = ["login-lumina"];

function moveDirs(dirs, targetBase) {
    dirs.forEach(dir => {
        const source = path.join(hotelDir, dir);
        const target = path.join(targetBase, dir);
        if (fs.existsSync(source)) {
            fs.renameSync(source, target);
            console.log(`Moved ${dir} to ${path.basename(targetBase)}`);
        }
    });
}

moveDirs(guestDirs, guestDir);
moveDirs(adminDirs, adminDir);
moveDirs(sharedDirs, sharedDir);

// Clean up
if (fs.existsSync(hotelDir)) {
    const remaining = fs.readdirSync(hotelDir);
    if (remaining.length === 0) {
        fs.rmdirSync(hotelDir);
        console.log('Removed empty hotel directory');
    } else {
        console.log(`hotel directory not empty, remaining items: ${remaining.join(', ')}`);
    }
}
