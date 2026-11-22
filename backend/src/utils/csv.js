// Prevent CSV formula injection by prefixing dangerous leading chars
const DANGEROUS_PREFIX = /^[=+\-@\t\r]/;

function sanitizeCsvValue(value) {
  if (value === null || value === undefined) return '';
  let str = String(value);
  // Escape double quotes
  str = str.replace(/"/g, '""');
  if (DANGEROUS_PREFIX.test(str)) {
    str = `'${str}`;
  }
  return str;
}

function escapeCsvField(value) {
  const sanitized = sanitizeCsvValue(value);
  if (/[",\n\r]/.test(sanitized)) {
    return `"${sanitized}"`;
  }
  return sanitized;
}

function toCsv(rows, columns) {
  const header = columns.map((c) => escapeCsvField(c.label)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvField(c.value(row))).join(','),
  );
  return [header, ...lines].join('\n');
}

module.exports = { toCsv, sanitizeCsvValue, escapeCsvField };