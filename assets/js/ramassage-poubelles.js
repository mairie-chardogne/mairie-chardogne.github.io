(function (global) {
  'use strict';

  const DAY_NAMES = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const MONTH_NAMES = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const MORNING_CUTOFF_HOUR = 1; // treat "morning" as before 1 AM

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function formatDateFr(date) {
    const dayName = DAY_NAMES[date.getDay()];
    const day = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day} ${month} ${year}`;
  }

  // ISO week number (1..53)
  function getISOWeekNumber(date) {
    const d = new Date(date.getTime());
    // set to nearest Thursday (ISO week uses Thursday as anchor)
    const day = d.getDay() || 7; // 1..7 (Mon..Sun)
    d.setDate(d.getDate() + 4 - day);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
  }

  function nextWednesday(base = new Date()) {
    const now = new Date(base.getFullYear(), base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds(), base.getMilliseconds());
    const wednesday = 3; // JS: 0=Sun,1=Mon,...3=Wed
    const day = now.getDay();
    // If it's Wednesday morning, return today
    if (day === wednesday && now.getHours() < MORNING_CUTOFF_HOUR) {
      const today = new Date(now);
      today.setHours(8, 0, 0, 0);
      return today;
    }
    const daysUntil = (wednesday - day + 7) % 7 || 7;
    const result = new Date(now);
    result.setDate(now.getDate() + daysUntil);
    result.setHours(8, 0, 0, 0);
    return result;
  }

  // Thursday morning on odd ISO week numbers
  function nextThursdayOddWeek(base = new Date()) {
    const now = new Date(base.getFullYear(), base.getMonth(), base.getDate(), base.getHours(), base.getMinutes(), base.getSeconds(), base.getMilliseconds());
    const thursday = 4; // JS: Thu=4
    let daysUntil = (thursday - now.getDay() + 7) % 7;
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + daysUntil);

    // If it's Thursday but after the morning cutoff, move to next Thursday
    if (daysUntil === 0 && now.getHours() >= MORNING_CUTOFF_HOUR) {
      candidate.setDate(candidate.getDate() + 7);
    }

    // If candidate is on an even week, jump one week forward to get an odd week
    if ((getISOWeekNumber(candidate) % 2) === 0) {
      candidate.setDate(candidate.getDate() + 7);
    }

    candidate.setHours(8, 0, 0, 0);
    return candidate;
  }

  // Public functions — return formatted strings
  function nextPoubelleJaunes(baseDate) {
    const d = baseDate ? nextWednesday(baseDate) : nextWednesday(new Date());
    return formatDateFr(d);
  }

  function nextPoubelleMarron(baseDate) {
    const d = baseDate ? nextThursdayOddWeek(baseDate) : nextThursdayOddWeek(new Date());
    return formatDateFr(d);
  }

  // Expose API
  const ramassageApi = {
    nextPoubelleJaunes,
    nextPoubelleMarron,
    _helpers: { getISOWeekNumber, formatDateFr }
  };

	// expose to global scope
  global.ramassagePoubelles = ramassageApi;

})(window);
