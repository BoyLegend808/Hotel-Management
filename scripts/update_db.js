const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Update Room Types & Statuses
// Map existing types to the new RoomType enum: Standard, Deluxe, Family Suite, Business Suite
// Map existing statuses to RoomStatus: Available, Occupied, Cleaning, Maintenance
const typeMapping = {
  'EXECUTIVE SUITE': 'Business Suite',
  'DELUXE KING': 'Deluxe',
  'VIP SANCTUARY': 'Family Suite',
  'URBAN STUDIO': 'Standard',
  'ALPINE ESCAPE': 'Family Suite'
};

db.rooms = db.rooms.map(room => ({
  ...room,
  roomNumber: `10${room.id}`, // Assign room numbers
  type: typeMapping[room.type] || 'Standard',
  status: room.status === 'available' ? 'Available' : 'Occupied',
  bookingPrice: room.price
}));

// 2. Update Bookings (add checkInDate/checkOutDate mapping, map status)
db.bookings = db.bookings.map(booking => ({
  ...booking,
  checkInDate: booking.checkIn,
  checkOutDate: booking.checkOut,
  status: booking.status === 'confirmed' ? 'Confirmed' : booking.status === 'cancelled' ? 'Cancelled' : booking.status
}));

// 3. Add housekeepingLogs
if (!db.housekeepingLogs) {
  db.housekeepingLogs = [];
}

// 4. Update Payments
db.payments = db.payments.map(payment => ({
  ...payment,
  paymentType: payment.paymentMethod === 'card' ? 'Credit Card' : 'Cash',
  isPaid: payment.status === 'completed'
}));

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Database migrated to new HMS schema.');
