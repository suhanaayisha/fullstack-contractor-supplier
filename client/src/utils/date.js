// Dates are picked as calendar days (YYYY-MM-DD) and stored as UTC midnight,
// so format in UTC to avoid showing the previous day in negative-offset timezones.
export const formatDate = (value) => {
    if (!value) return 'Not specified';
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
};

// Today's local date as YYYY-MM-DD, for the min attribute of date inputs
export const today = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
