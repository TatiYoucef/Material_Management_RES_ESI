const fs = require('fs');
const reservationsFilePath = './backend/data/reservations.json';
fs.readFile(reservationsFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading reservations file:', err);
    return;
  }
  const reservations = JSON.parse(data);
  const updatedReservations = reservations.map(reservation => {
    if (reservation.notified === undefined) {
      reservation.notified = false;
    }
    return reservation;
  });
  fs.writeFile(reservationsFilePath, JSON.stringify(updatedReservations, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error writing reservations file:', err);
      return;
    }
    console.log('Successfully updated reservations.json with notified property.');
  });
});