export function fmt(cents) {
  return (
    "€" +
    (cents / 100).toLocaleString("bg-BG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
