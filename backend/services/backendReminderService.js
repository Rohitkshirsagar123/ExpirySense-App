// Check which documents need notifications TODAY based on expiry date and offset days
// This is NOT scheduling - just checking which documents match the criteria TODAY

const REMINDER_OFFSETS = {
  d30: 30,
  d7: 7,
  d1: 1,
  onExpiry: 0,
};

// Parse expiry date in DD/MM/YYYY format
function parseExpiryDate(expiryDateString) {
  const [day, month, year] = expiryDateString.split('/').map(Number);
  if (!day || !month || !year) return null;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0); 
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

// Get today's date at midnight
function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// Calculate days between two dates
function daysUntilDate(expiryDate) {
  const today = getToday();
  const timeDiff = expiryDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// Check which documents need notifications TODAY
function checkNotificationsForToday(documents, reminderSettings) {
  const notificationsToShow = [];

  if (!reminderSettings?.remindersEnabled) {
    return notificationsToShow;
  }

  for (const doc of documents) {
    if (!doc.expiryDate) continue;

    const expiryDate = parseExpiryDate(doc.expiryDate);
    if (!expiryDate) continue;

    const daysUntilExpiry = daysUntilDate(expiryDate);

    // Check which offsets match TODAY
    if (reminderSettings.days?.d30 && daysUntilExpiry === 30) {
      notificationsToShow.push({
        documentId: doc.id,
        documentName: doc.name,
        documentType: doc.type,
        expiryDate: doc.expiryDate,
        offsetKey: 'd30',
        daysUntilExpiry: 30,
        title: `${doc.name} Expiring`,
        body: `${doc.name} expires in 30 days (on ${doc.expiryDate}).`,
      });
    }

    if (reminderSettings.days?.d7 && daysUntilExpiry === 7) {
      notificationsToShow.push({
        documentId: doc.id,
        documentName: doc.name,
        documentType: doc.type,
        expiryDate: doc.expiryDate,
        offsetKey: 'd7',
        daysUntilExpiry: 7,
        title: `${doc.name} Expiring`,
        body: `${doc.name} expires in 7 days (on ${doc.expiryDate}).`,
      });
    }

    if (reminderSettings.days?.d1 && daysUntilExpiry === 1) {
      notificationsToShow.push({
        documentId: doc.id,
        documentName: doc.name,
        documentType: doc.type,
        expiryDate: doc.expiryDate,
        offsetKey: 'd1',
        daysUntilExpiry: 1,
        title: `${doc.name} Expiring`,
        body: `${doc.name} expires tomorrow (on ${doc.expiryDate}).`,
      });
    }

    if (reminderSettings.days?.onExpiry && daysUntilExpiry === 0) {
      notificationsToShow.push({
        documentId: doc.id,
        documentName: doc.name,
        documentType: doc.type,
        expiryDate: doc.expiryDate,
        offsetKey: 'onExpiry',
        daysUntilExpiry: 0,
        title: `${doc.name} Expired`,
        body: `Your ${doc.name} expires today (${doc.expiryDate}).`,
      });
    }
  }

  return notificationsToShow;
}

module.exports = {
  checkNotificationsForToday,
  parseExpiryDate,
  getToday,
  daysUntilDate,
};
