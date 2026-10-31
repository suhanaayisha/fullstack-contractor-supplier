// Change this to any ISO 4217 code (e.g. 'EUR', 'GBP', 'AED', 'INR') to switch the app's currency
export const CURRENCY = 'USD';

const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: CURRENCY });

export const formatPrice = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? formatter.format(amount) : value;
};

// Just the symbol (e.g. "$"), for labels next to price inputs
export const currencySymbol =
    formatter.formatToParts(0).find((part) => part.type === 'currency')?.value || CURRENCY;
