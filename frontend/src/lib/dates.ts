const pad = (v: number) => String(v).padStart(2, "0");

/** Local calendar date as YYYY-MM-DD. */
export const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayIso = () => toIso(new Date());

/** The date `n` days from today (negative = in the past), as YYYY-MM-DD. */
export const isoDaysFromToday = (n: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0); // noon avoids daylight-saving edge cases
  d.setDate(d.getDate() + n);
  return toIso(d);
};

/** Current local time as "HH:MM" (24h). */
export const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
