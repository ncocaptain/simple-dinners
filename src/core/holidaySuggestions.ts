export type HolidaySuggestion = {
  id: string;
  name: string;
  month?: number;
  day?: number;
  leadDays: number;
  recipeSlug: string;
  emoji: string;
  title: string;
  message: string;
  getDate?: (year: number) => Date;
};

export type ActiveHolidaySuggestion = HolidaySuggestion & {
  suggestionYear: number;
};


function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function nthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number,
) {
  const date = new Date(year, month - 1, 1);

  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() + 1);
  }

  date.setDate(date.getDate() + (nth - 1) * 7);
  return date;
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number) {
  const date = new Date(year, month, 0);

  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() - 1);
  }

  return date;
}

// Gregorian Easter calculation
function getEasterDate(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

function getThanksgivingDate(year: number) {
  return nthWeekdayOfMonth(year, 11, 4, 4);
}

function getBlackFridayDate(year: number) {
  return addDays(getThanksgivingDate(year), 1);
}

function getMardiGrasDate(year: number) {
  return addDays(getEasterDate(year), -47);
}

function getLentStartDate(year: number) {
  return addDays(getEasterDate(year), -46);
}

export const HOLIDAY_SUGGESTIONS: HolidaySuggestion[] = [
  {
    id: "new-years-day",
    name: "New Year's Day",
    month: 1,
    day: 1,
    leadDays: 10,
    recipeSlug: "holiday-new-years-day-comfort-dinner",
    emoji: "🎉",
    title: "New Year's Day is coming up",
    message: "Want to plan a cozy comfort dinner?",
  },
  {
    id: "winter-snow-day",
    name: "Winter Snow Day",
    month: 1,
    day: 15,
    leadDays: 14,
    recipeSlug: "holiday-winter-snow-day-chicken-noodle-soup",
    emoji: "❄️",
    title: "Cold weather dinner idea",
    message: "Warm up the week with a simple chicken noodle soup.",
  },
  {
    id: "game-day-chili",
    name: "Game Day",
    month: 1,
    day: 20,
    leadDays: 14,
    recipeSlug: "holiday-game-day-chili-bar-dinner",
    emoji: "🏈",
    title: "Game day is coming up",
    message: "Want to plan an easy chili bar dinner?",
  },
  {
    id: "three-kings-day",
    name: "Three Kings Day",
    month: 1,
    day: 6,
    leadDays: 7,
    recipeSlug: "holiday-three-kings-taco-bake-dinner",
    emoji: "👑",
    title: "Three Kings Day is coming up",
    message: "Want a simple family taco bake for the holiday?",
  },
  {
    id: "lunar-new-year",
    name: "Lunar New Year",
    month: 1,
    day: 25,
    leadDays: 14,
    recipeSlug: "holiday-lunar-new-year-noodle-stir-fry-dinner",
    emoji: "🏮",
    title: "Lunar New Year is coming up",
    message: "Want to plan a festive noodle stir-fry dinner?",
  },

  {
    id: "valentines-day",
    name: "Valentine's Day",
    month: 2,
    day: 14,
    leadDays: 10,
    recipeSlug: "holiday-valentines-family-pasta-bake",
    emoji: "💘",
    title: "Valentine's Day is coming up",
    message: "Want a cozy family pasta bake for dinner?",
  },
  {
    id: "big-game",
    name: "Big Game",
    leadDays: 10,
    getDate: (year) => nthWeekdayOfMonth(year, 2, 0, 2),
    recipeSlug: "holiday-big-game-slider-dinner",
    emoji: "🏈",
    title: "The big game is coming up",
    message: "Want to plan an easy slider dinner?",
  },
  {
    id: "presidents-day",
    name: "Presidents' Day",
    leadDays: 10,
    getDate: (year) => nthWeekdayOfMonth(year, 2, 1, 3),
    recipeSlug: "holiday-presidents-day-meatloaf-dinner",
    emoji: "🇺🇸",
    title: "Presidents' Day is coming up",
    message: "Want a classic comfort-food dinner?",
  },
  {
    id: "mardi-gras",
    name: "Mardi Gras",
    leadDays: 10,
    getDate: getMardiGrasDate,
    recipeSlug: "holiday-mardi-gras-sausage-rice-skillet",
    emoji: "🎭",
    title: "Mardi Gras is coming up",
    message: "Want a simple sausage and rice skillet dinner?",
  },

  {
    id: "st-patricks-day",
    name: "St. Patrick's Day",
    month: 3,
    day: 17,
    leadDays: 14,
    recipeSlug: "holiday-st-patricks-slow-cooker-corned-beef-dinner",
    emoji: "☘️",
    title: "St. Patrick's Day is coming up",
    message: "Want to plan a slow cooker corned beef dinner?",
  },
  {
    id: "march-madness",
    name: "March Madness",
    month: 3,
    day: 20,
    leadDays: 14,
    recipeSlug: "holiday-march-madness-loaded-nacho-dinner",
    emoji: "🏀",
    title: "March Madness dinner idea",
    message: "Loaded nachos make an easy game-night dinner.",
  },
  {
    id: "lent",
    name: "Lent",
    leadDays: 21,
    getDate: getLentStartDate,
    recipeSlug: "holiday-lenten-fish-taco-dinner",
    emoji: "🐟",
    title: "Lenten dinner idea",
    message: "Want to plan a simple fish taco dinner?",
  },
  {
    id: "spring-chicken-rice",
    name: "Spring Dinner",
    month: 3,
    day: 25,
    leadDays: 14,
    recipeSlug: "holiday-spring-chicken-rice-bake",
    emoji: "🌷",
    title: "Spring dinner idea",
    message: "Want a cozy but lighter chicken and rice bake?",
  },

  {
    id: "easter",
    name: "Easter",
    leadDays: 14,
    getDate: getEasterDate,
    recipeSlug: "holiday-easter-glazed-ham-dinner",
    emoji: "🐣",
    title: "Easter is coming up",
    message: "Want to plan a classic glazed ham dinner?",
  },
  {
    id: "passover",
    name: "Passover",
    month: 4,
    day: 10,
    leadDays: 14,
    recipeSlug: "holiday-passover-brisket-potato-dinner",
    emoji: "🍷",
    title: "Passover season is coming up",
    message: "Want to plan a simple brisket dinner?",
  },
  {
    id: "earth-day",
    name: "Earth Day",
    month: 4,
    day: 22,
    leadDays: 10,
    recipeSlug: "holiday-earth-day-veggie-pasta-bake",
    emoji: "🌎",
    title: "Earth Day is coming up",
    message: "Want to plan a meatless family dinner?",
  },
  {
    id: "april-showers",
    name: "April Showers",
    month: 4,
    day: 15,
    leadDays: 14,
    recipeSlug: "holiday-april-showers-chicken-pot-pie-skillet",
    emoji: "🌧️",
    title: "Rainy spring dinner idea",
    message: "Want a cozy chicken pot pie skillet?",
  },

  {
    id: "cinco-de-mayo",
    name: "Cinco de Mayo",
    month: 5,
    day: 5,
    leadDays: 10,
    recipeSlug: "holiday-cinco-de-mayo-chicken-fajita-rice-bake",
    emoji: "🌮",
    title: "Cinco de Mayo is coming up",
    message: "Want a family-friendly fajita rice bake?",
  },
  {
    id: "mothers-day",
    name: "Mother's Day",
    leadDays: 10,
    getDate: (year) => nthWeekdayOfMonth(year, 5, 0, 2),
    recipeSlug: "holiday-mothers-day-creamy-lemon-chicken-pasta",
    emoji: "💐",
    title: "Mother's Day is coming up",
    message: "Want to plan a creamy lemon chicken pasta dinner?",
  },
  {
    id: "memorial-day",
    name: "Memorial Day",
    leadDays: 14,
    getDate: (year) => lastWeekdayOfMonth(year, 5, 1),
    recipeSlug: "holiday-memorial-day-bbq-chicken-tray-dinner",
    emoji: "🇺🇸",
    title: "Memorial Day is coming up",
    message: "Want to plan an easy BBQ chicken dinner?",
  },
  {
    id: "graduation-party",
    name: "Graduation Party",
    month: 5,
    day: 20,
    leadDays: 21,
    recipeSlug: "holiday-graduation-party-baked-sandwiches",
    emoji: "🎓",
    title: "Graduation season dinner idea",
    message: "Baked sandwiches make an easy crowd-friendly meal.",
  },

  {
    id: "fathers-day",
    name: "Father's Day",
    leadDays: 10,
    getDate: (year) => nthWeekdayOfMonth(year, 6, 0, 3),
    recipeSlug: "holiday-fathers-day-bbq-burger-dinner",
    emoji: "🍔",
    title: "Father's Day is coming up",
    message: "Want to plan a BBQ burger dinner?",
  },
  {
    id: "juneteenth",
    name: "Juneteenth",
    month: 6,
    day: 19,
    leadDays: 10,
    recipeSlug: "holiday-juneteenth-bbq-chicken-red-rice-dinner",
    emoji: "❤️",
    title: "Juneteenth is coming up",
    message: "Want to plan a BBQ chicken and red rice dinner?",
  },
  {
    id: "flag-day",
    name: "Flag Day",
    month: 6,
    day: 14,
    leadDays: 7,
    recipeSlug: "holiday-flag-day-hot-dog-chili-tray",
    emoji: "🇺🇸",
    title: "Flag Day is coming up",
    message: "Want a simple chili dog tray dinner?",
  },
  {
    id: "summer-break",
    name: "Summer Break",
    month: 6,
    day: 10,
    leadDays: 14,
    recipeSlug: "holiday-summer-break-cheeseburger-pasta-skillet",
    emoji: "☀️",
    title: "Summer break dinner idea",
    message: "Want a quick cheeseburger pasta skillet?",
  },

  {
    id: "fourth-of-july",
    name: "Fourth of July",
    month: 7,
    day: 4,
    leadDays: 14,
    recipeSlug: "holiday-fourth-of-july-pulled-pork-sandwich-dinner",
    emoji: "🎆",
    title: "Fourth of July is coming up",
    message: "Want to plan an easy pulled pork sandwich dinner?",
  },
  {
    id: "summer-pool-day",
    name: "Summer Pool Day",
    month: 7,
    day: 15,
    leadDays: 14,
    recipeSlug: "holiday-summer-pool-day-chicken-caesar-wraps",
    emoji: "🏊",
    title: "Pool day dinner idea",
    message: "Want an easy chicken Caesar wrap dinner?",
  },
  {
    id: "backyard-bbq",
    name: "Backyard BBQ",
    month: 7,
    day: 22,
    leadDays: 14,
    recipeSlug: "holiday-backyard-bbq-sausage-corn-sheet-pan",
    emoji: "🔥",
    title: "Backyard BBQ dinner idea",
    message: "Want a simple sausage and corn sheet pan dinner?",
  },
  {
    id: "campfire-night",
    name: "Campfire Night",
    month: 7,
    day: 29,
    leadDays: 14,
    recipeSlug: "holiday-campfire-walking-taco-night",
    emoji: "🏕️",
    title: "Campfire dinner idea",
    message: "Want to plan a walking taco night?",
  },

  {
    id: "back-to-school",
    name: "Back to School",
    month: 8,
    day: 15,
    leadDays: 21,
    recipeSlug: "holiday-back-to-school-taco-pasta-skillet",
    emoji: "🎒",
    title: "Back-to-school season is coming",
    message: "Want a quick taco pasta dinner for a busy weeknight?",
  },
  {
    id: "county-fair",
    name: "County Fair",
    month: 8,
    day: 5,
    leadDays: 14,
    recipeSlug: "holiday-county-fair-corn-dog-casserole",
    emoji: "🎡",
    title: "County fair season dinner idea",
    message: "Want a fun corn dog casserole dinner?",
  },
  {
    id: "late-summer-garden",
    name: "Late Summer Garden",
    month: 8,
    day: 22,
    leadDays: 14,
    recipeSlug: "holiday-late-summer-garden-chicken-pasta",
    emoji: "🍅",
    title: "Late summer dinner idea",
    message: "Want to plan a garden chicken pasta?",
  },
  {
    id: "beach-vacation",
    name: "Beach Vacation",
    month: 8,
    day: 1,
    leadDays: 14,
    recipeSlug: "holiday-beach-vacation-shrimp-boil-foil-packets",
    emoji: "🏖️",
    title: "Beach dinner idea",
    message: "Want a shrimp boil foil packet dinner?",
  },

  {
    id: "labor-day",
    name: "Labor Day",
    leadDays: 14,
    getDate: (year) => nthWeekdayOfMonth(year, 9, 1, 1),
    recipeSlug: "holiday-labor-day-bbq-chicken-drumstick-dinner",
    emoji: "🍗",
    title: "Labor Day is coming up",
    message: "Want to plan a BBQ chicken drumstick dinner?",
  },
  {
    id: "football-kickoff",
    name: "Football Kickoff",
    month: 9,
    day: 7,
    leadDays: 14,
    recipeSlug: "holiday-football-kickoff-loaded-baked-potato-bar",
    emoji: "🏈",
    title: "Football season is kicking off",
    message: "Want to plan a loaded baked potato bar?",
  },
  {
    id: "grandparents-day",
    name: "Grandparents Day",
    leadDays: 10,
    getDate: (year) => addDays(nthWeekdayOfMonth(year, 9, 1, 1), 6),
    recipeSlug: "holiday-grandparents-day-chicken-dumplings",
    emoji: "❤️",
    title: "Grandparents Day is coming up",
    message: "Want a cozy chicken and dumplings dinner?",
  },
  {
    id: "first-day-of-fall",
    name: "First Day of Fall",
    month: 9,
    day: 22,
    leadDays: 10,
    recipeSlug: "holiday-first-day-of-fall-sausage-apple-sheet-pan",
    emoji: "🍂",
    title: "Fall is almost here",
    message: "Want to plan a sausage and apple sheet pan dinner?",
  },

  {
    id: "halloween",
    name: "Halloween",
    month: 10,
    day: 31,
    leadDays: 14,
    recipeSlug: "holiday-halloween-mummy-hot-dog-dinner",
    emoji: "🎃",
    title: "Halloween is coming up",
    message: "Want a fun mummy hot dog dinner before trick-or-treating?",
  },
  {
    id: "oktoberfest",
    name: "Oktoberfest",
    month: 10,
    day: 5,
    leadDays: 14,
    recipeSlug: "holiday-oktoberfest-sausage-potato-sheet-pan",
    emoji: "🥨",
    title: "Oktoberfest dinner idea",
    message: "Want a sausage and potato sheet pan dinner?",
  },
  {
    id: "pumpkin-patch",
    name: "Pumpkin Patch",
    month: 10,
    day: 12,
    leadDays: 14,
    recipeSlug: "holiday-pumpkin-patch-turkey-chili",
    emoji: "🎃",
    title: "Pumpkin patch season dinner idea",
    message: "Want to plan a cozy turkey chili?",
  },
  {
    id: "fall-harvest",
    name: "Fall Harvest",
    month: 10,
    day: 20,
    leadDays: 14,
    recipeSlug: "holiday-fall-harvest-chicken-wild-rice-casserole",
    emoji: "🍁",
    title: "Fall harvest dinner idea",
    message: "Want a chicken and wild rice casserole?",
  },

  {
    id: "veterans-day",
    name: "Veterans Day",
    month: 11,
    day: 11,
    leadDays: 10,
    recipeSlug: "holiday-veterans-day-beef-stew-dinner",
    emoji: "🇺🇸",
    title: "Veterans Day is coming up",
    message: "Want to plan a hearty beef stew dinner?",
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving",
    leadDays: 21,
    getDate: getThanksgivingDate,
    recipeSlug: "holiday-thanksgiving-turkey-breast-dinner",
    emoji: "🦃",
    title: "Thanksgiving is coming up",
    message: "Want to plan a simple turkey breast dinner?",
  },
  {
    id: "friendsgiving",
    name: "Friendsgiving",
    month: 11,
    day: 18,
    leadDays: 14,
    recipeSlug: "holiday-friendsgiving-chicken-stuffing-casserole",
    emoji: "🍽️",
    title: "Friendsgiving dinner idea",
    message: "Want an easy chicken stuffing casserole?",
  },
  {
    id: "black-friday-leftovers",
    name: "Black Friday",
    leadDays: 3,
    getDate: getBlackFridayDate,
    recipeSlug: "holiday-black-friday-leftover-turkey-pot-pie-skillet",
    emoji: "🥧",
    title: "Black Friday leftovers idea",
    message: "Turn leftover turkey into a cozy pot pie skillet.",
  },

  {
    id: "christmas-eve",
    name: "Christmas Eve",
    month: 12,
    day: 24,
    leadDays: 14,
    recipeSlug: "holiday-christmas-eve-lasagna-dinner",
    emoji: "🎄",
    title: "Christmas Eve is coming up",
    message: "Want to plan a cozy lasagna dinner?",
  },
  {
    id: "hanukkah",
    name: "Hanukkah",
    month: 12,
    day: 10,
    leadDays: 14,
    recipeSlug: "holiday-hanukkah-chicken-potato-sheet-pan",
    emoji: "🕎",
    title: "Hanukkah season is coming up",
    message: "Want a simple chicken and potato sheet pan dinner?",
  },
  {
    id: "kwanzaa",
    name: "Kwanzaa",
    month: 12,
    day: 26,
    leadDays: 10,
    recipeSlug: "holiday-kwanzaa-black-eyed-pea-rice-skillet",
    emoji: "🕯️",
    title: "Kwanzaa is coming up",
    message: "Want to plan a black-eyed pea and rice skillet?",
  },
  {
    id: "new-years-eve",
    name: "New Year's Eve",
    month: 12,
    day: 31,
    leadDays: 10,
    recipeSlug: "holiday-new-years-eve-snack-dinner",
    emoji: "🥳",
    title: "New Year's Eve is coming up",
    message: "Want to plan an easy snack dinner?",
  },
];

function getDismissKey(id: string, year: number) {
  return `simple-dinners.dismissedHolidaySuggestion.${id}.${year}`;
}

export function dismissHolidaySuggestion(
  id: string,
  year = new Date().getFullYear(),
) {
  localStorage.setItem(getDismissKey(id, year), "true");
}

export function isHolidaySuggestionDismissed(
  id: string,
  year = new Date().getFullYear(),
) {
  return localStorage.getItem(getDismissKey(id, year)) === "true";
}

function getHolidayDate(holiday: HolidaySuggestion, year: number) {
  if (holiday.getDate) return holiday.getDate(year);

  return new Date(year, (holiday.month || 1) - 1, holiday.day || 1);
}

export function getActiveHolidaySuggestion(
  today = new Date(),
): ActiveHolidaySuggestion | undefined {
  const currentYear = today.getFullYear();
  const yearsToCheck = [currentYear, currentYear + 1];

  const activeSuggestions = HOLIDAY_SUGGESTIONS.flatMap((holiday) => {
    return yearsToCheck
      .map((year) => {
        const holidayDate = getHolidayDate(holiday, year);

        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfHoliday = new Date(holidayDate);
        startOfHoliday.setHours(0, 0, 0, 0);

        const diffMs = startOfHoliday.getTime() - startOfToday.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        return {
          holiday,
          year,
          diffDays,
        };
      })
      .filter(({ holiday, year, diffDays }) => {
        if (diffDays < 0 || diffDays > holiday.leadDays) return false;

        return !isHolidaySuggestionDismissed(holiday.id, year);
      });
  });

  activeSuggestions.sort((a, b) => a.diffDays - b.diffDays);

  const active = activeSuggestions[0];

  if (!active) return undefined;

  return {
    ...active.holiday,
    suggestionYear: active.year,
  };
}