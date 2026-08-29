// Local date/time text inputs <-> unix epoch seconds. Shared by the radio
// editor (Lost Mode activation) and the CollarDT panels (scheduled detach).

export function toUnixEpochSecondsFromLocal(
  dateStr: string,
  timeStr: string,
): number | undefined {
  if (!dateStr || !timeStr) return undefined;
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const t = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!m || !t) return undefined;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(t[1]);
  const minute = Number(t[2]);

  if (month < 1 || month > 12) return undefined;
  if (day < 1 || day > 31) return undefined;
  if (hour < 0 || hour > 23) return undefined;
  if (minute < 0 || minute > 59) return undefined;

  const d = new Date(year, month - 1, day, hour, minute, 0);
  const seconds = Math.floor(d.getTime() / 1000);
  return Number.isFinite(seconds) ? seconds : undefined;
}

export function fromUnixEpochSecondsToLocalStrings(epoch: number):
  | {
      date: string;
      time: string;
    }
  | undefined {
  if (!Number.isFinite(epoch) || epoch <= 0) return undefined;

  const d = new Date(epoch * 1000);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}
