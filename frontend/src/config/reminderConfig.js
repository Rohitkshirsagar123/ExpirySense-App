// Reminder time configuration - EASILY CHANGEABLE
// Update these values to change when reminders check daily

export const REMINDER_TIME = {
  hour: 12,      // 0-23 (24-hour format)
  minute: 39,    // 0-59
};

// Helper to format time display
export function formatReminderTime() {
  const { hour, minute } = REMINDER_TIME;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  const displayMinute = String(minute).padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

// Get notification trigger object
export function getReminderTrigger() {
  return {
    type: "daily",
    hour: REMINDER_TIME.hour,
    minute: REMINDER_TIME.minute,
  };
} 
