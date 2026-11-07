/*
 * Gør svarene ens, uanset hvordan de skrives.
 * Bruges både af låsesiden og af tools/encrypt.mjs – skal være ens begge steder.
 */
(() => {
  "use strict";

  const MONTHS = {
    jan: 1, januar: 1, january: 1,
    feb: 2, februar: 2, february: 2,
    mar: 3, marts: 3, march: 3,
    apr: 4, april: 4,
    maj: 5, may: 5,
    jun: 6, juni: 6, june: 6,
    jul: 7, juli: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    okt: 10, oct: 10, oktober: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
  };

  // Store/små bogstaver, mellemrum og tegn i enderne er ligegyldige
  function normalizeText(text) {
    return text
      .normalize("NFC")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/^[\s.,!?'"«»“”]+|[\s.,!?'"«»“”]+$/g, "");
  }

  // "3 marts 2001", "3. Marts 2001", "3/3/2001", "03-03-01" -> "2001-03-03"
  function normalizeDate(text) {
    const clean = normalizeText(text);
    const tokens = clean.split(/[^0-9a-zæøå]+/).filter(Boolean);
    let month = null;
    const numbers = [];
    for (const token of tokens) {
      if (/^\d+$/.test(token)) numbers.push(token);
      else if (MONTHS[token] && month === null) month = MONTHS[token];
    }
    let day;
    let year;
    if (month !== null && numbers.length === 2) {
      [day, year] = numbers[0].length === 4 ? [numbers[1], numbers[0]] : numbers;
    } else if (month === null && numbers.length === 3) {
      if (numbers[0].length === 4) [year, month, day] = numbers;
      else [day, month, year] = numbers;
    } else {
      return clean;
    }
    day = Number(day);
    month = Number(month);
    year = Number(year);
    if (year < 100) year += year > 30 ? 1900 : 2000;
    if (!(day >= 1 && day <= 31 && month >= 1 && month <= 12)) return clean;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function normalize(text, kind) {
    return kind === "date" ? normalizeDate(text) : normalizeText(text);
  }

  function combine(answers, questions) {
    return answers.map((answer, i) => normalize(answer, questions[i].kind)).join("\u0000");
  }

  globalThis.GaveAnswers = { normalize, combine };
})();
