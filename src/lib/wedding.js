// Single source of truth for the facts every guest page repeats.
export const COUPLE = "Tori & Connor";
export const WEDDING_DATE = new Date("2027-05-22T15:30:00-04:00");
export const DATE_LABEL = "May 22, 2027";
export const VENUE = "Yellowbrick on 39";
export const VENUE_ADDRESS = "3931 State Route 39 NW, Dover, OH 44622";
export const VENUE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  VENUE_ADDRESS
)}`;

export const SCHEDULE = [
  { time: "3:30 PM", label: "Ceremony" },
  { time: "4:00 PM", label: "Cocktail Hour" },
  { time: "5:00 PM", label: "Reception" },
  { time: "5:30 PM", label: "Dinner" },
  { time: "6:30 PM", label: "Cake Cutting" },
];
