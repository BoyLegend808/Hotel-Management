const fs = require('fs').promises;
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const CSV_FILE = path.join(BACKUP_DIR, 'bookings_backup.csv');

/**
 * Appends a booking record to a local CSV file.
 * @param {Object} booking 
 */
async function backupBookingToCSV(booking) {
    try {
        // Ensure backups directory exists
        await fs.mkdir(BACKUP_DIR, { recursive: true });

        // Check if file exists to write headers
        let fileExists = true;
        try {
            await fs.access(CSV_FILE);
        } catch {
            fileExists = false;
        }

        if (!fileExists) {
            const headers = "ID,Booking Code,Guest Name,Guest Email,Guest Phone,Room ID,Check In,Check Out,Status,Payment Method,Payment State,Total,Created At\n";
            await fs.writeFile(CSV_FILE, headers, 'utf8');
        }

        // Escape commas and quotes for CSV
        const escapeCSV = (val) => {
            if (val === null || val === undefined) return '""';
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const row = [
            booking.id,
            booking.bookingCode,
            booking.guestName,
            booking.guestEmail,
            booking.guestPhone,
            booking.roomId,
            booking.checkInDate,
            booking.checkOutDate,
            booking.status,
            booking.paymentMethod,
            booking.paymentState,
            booking.total,
            booking.createdAt
        ].map(escapeCSV).join(',') + '\n';

        await fs.appendFile(CSV_FILE, row, 'utf8');
        console.log(`[Backup] Booking ${booking.id} backed up to CSV.`);
    } catch (err) {
        console.error("[Backup Error] Failed to write to CSV:", err);
    }
}

module.exports = { backupBookingToCSV };
