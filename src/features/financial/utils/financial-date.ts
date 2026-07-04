const fallbackTimeZone = 'Africa/Cairo';

function safeTimeZone(timeZone?: string) {
  if (!timeZone) {
    return fallbackTimeZone;
  }

  try {
    new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
    return timeZone;
  } catch {
    return fallbackTimeZone;
  }
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}

function zonedParts(date: Date, timeZone?: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTimeZone(timeZone),
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function timeZoneOffsetMs(date: Date, timeZone?: string) {
  const parts = zonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    date.getUTCMilliseconds(),
  );

  return asUtc - date.getTime();
}

function zonedDateTimeToUtc(
  timeZone: string | undefined,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
) {
  const zone = safeTimeZone(timeZone);
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);

  for (let index = 0; index < 3; index += 1) {
    utcMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond) -
      timeZoneOffsetMs(new Date(utcMs), zone);
  }

  return new Date(utcMs);
}

function dateInputToParts(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return {
    year: year || new Date().getFullYear(),
    month: month || 1,
    day: day || 1,
  };
}

function dateTimeInputToParts(value: string) {
  const [datePart, timePart = '00:00'] = value.split('T');
  const date = dateInputToParts(datePart);
  const [hour, minute] = timePart.split(':').map(Number);

  return {
    ...date,
    hour: hour || 0,
    minute: minute || 0,
  };
}

export function dateInputValueInTimeZone(date: Date, timeZone?: string) {
  const parts = zonedParts(date, timeZone);

  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}`;
}

export function dateTimeInputValueInTimeZone(date = new Date(), timeZone?: string) {
  const parts = zonedParts(date, timeZone);

  return `${parts.year}-${padDatePart(parts.month)}-${padDatePart(parts.day)}T${padDatePart(parts.hour)}:${padDatePart(parts.minute)}`;
}

export function permittedFromDateInTimeZone(months: number, timeZone?: string) {
  const parts = zonedParts(new Date(), timeZone);
  const date = new Date(parts.year, parts.month - 1, parts.day);

  date.setMonth(date.getMonth() - months);
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function currentMonthStartDateInTimeZone(timeZone?: string) {
  const parts = zonedParts(new Date(), timeZone);

  return `${parts.year}-${padDatePart(parts.month)}-01`;
}

export function startOfDateInputInTimeZone(value: string, timeZone?: string) {
  if (!value) {
    return undefined;
  }

  const { year, month, day } = dateInputToParts(value);
  return zonedDateTimeToUtc(timeZone, year, month, day).toISOString();
}

export function endOfDateInputInTimeZone(value: string, timeZone?: string) {
  if (!value) {
    return undefined;
  }

  const { year, month, day } = dateInputToParts(value);
  return zonedDateTimeToUtc(timeZone, year, month, day, 23, 59, 59, 999).toISOString();
}

export function dateTimeInputToUtcIso(value: string, timeZone?: string) {
  const { year, month, day, hour, minute } = dateTimeInputToParts(value);
  return zonedDateTimeToUtc(timeZone, year, month, day, hour, minute).toISOString();
}

export function calendarMonthEndDateInput(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const lastDay = new Date(year, month || 1, 0);

  return `${lastDay.getFullYear()}-${padDatePart(lastDay.getMonth() + 1)}-${padDatePart(lastDay.getDate())}`;
}

export function calendarWeekRangeDateInputs(weekKey: string) {
  const [yearPart, weekPart] = weekKey.split('-W');
  const year = Number(yearPart);
  const week = Number(weekPart);
  const first = new Date(year, 0, 1);
  const start = new Date(first);

  start.setDate(first.getDate() + (week - 1) * 7 - first.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    from: `${start.getFullYear()}-${padDatePart(start.getMonth() + 1)}-${padDatePart(start.getDate())}`,
    to: `${end.getFullYear()}-${padDatePart(end.getMonth() + 1)}-${padDatePart(end.getDate())}`,
  };
}
