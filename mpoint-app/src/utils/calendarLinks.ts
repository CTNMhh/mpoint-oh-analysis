export function generateGoogleCalendarLink({
  title,
  description,
  location,
  startDate,
  endDate,
}: {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}) {
  if (!title || !startDate) return "";
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toISOString().replace(/[-:]|\.\d{3}/g, "");
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : start;
  const params = new URLSearchParams({
    text: title,
    details: description || "",
    location: location || "",
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`;
}

export function generateICSLink({
  title,
  description,
  location,
  startDate,
  endDate,
}: {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
}) {
  if (!title || !startDate) return "";
  const dtStart = new Date(startDate)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  const dtEnd = endDate
    ? new Date(endDate)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z")
    : dtStart;
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:${description || ""}`,
    `LOCATION:${location || ""}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}