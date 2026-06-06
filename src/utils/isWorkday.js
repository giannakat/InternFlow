const Holidays = require('date-holidays');

const hd = new Holidays('PH');

function isWorkday(date = new Date()) {
  const day = date.getDay();

//   0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
    console.log('Today is a weekend. Skipping.');
    return false;
    }

  const holiday = hd.isHoliday(date);
  if (holiday) {
    console.log(`Today is a holiday: ${holiday[0].name}. Skipping.`);
    return false;
  }

  return true;
}

module.exports = { isWorkday };