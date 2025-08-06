const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const { sendNotificationEmail } = require('./notificationService');

const reservationsFilePath = path.join(__dirname, './data/reservations.json');
const usersFilePath = path.join(__dirname, './data/users.json');

const checkAndSendNotifications = async () => {
  try {
    const reservationsData = await fs.readFile(reservationsFilePath, 'utf8');
    const reservations = JSON.parse(reservationsData);

    const usersData = await fs.readFile(usersFilePath, 'utf8');
    const users = JSON.parse(usersData);

    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day

    for (const reservation of reservations) {
      if (reservation.endDate && reservation.status === 'active' && !reservation.notified) {
        const endDate = new Date(reservation.endDate);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const dayAfterTomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

        // Check if endDate falls within tomorrow's 24-hour period
        if (endDate >= tomorrowStart && endDate < dayAfterTomorrowStart) {
          // Send notification to all users with a Gmail account
          for (const user of users) {
            if (user.gmail) {
              const subject = `Reservation ending soon: ${reservation.description}`;
              const text = `Dear ${user.username || 'User'},

the reservation for ${reservation.description} (ID: ${reservation.id}) is ending tomorrow, on ${endDate.toDateString()}.

You may start contacting the concerned people to arrange for the return of the item.

Regards,
Your Material Management Service`;

              await sendNotificationEmail(user.gmail, subject, text);
            }
          }

          // Mark reservation as notified and save
          reservation.notified = true;
          await fs.writeFile(reservationsFilePath, JSON.stringify(reservations, null, 2));
        }
      }
    }
  } catch (error) {
    console.error('Error in scheduled notification task:', error);
  }
};

// Schedule the task to run every minute
cron.schedule('* * * * * ', () => {
  checkAndSendNotifications();
});

module.exports = { checkAndSendNotifications };