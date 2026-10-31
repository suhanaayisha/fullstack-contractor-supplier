import axios from 'axios';

const SESSION_KEY = 'session';

// Reads the expiry ("exp", in seconds) from the JWT payload, without verifying it.
// The server does the real verification; this only lets the UI drop sessions that have clearly expired.
const tokenExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.exp * 1000;
    } catch (e) {
        return 0;
    }
};

export const saveSession = (session) => {
    try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
        // storage unavailable (e.g. private mode): the user will need to log in again after a refresh
    }
};

export const clearSession = () => {
    try {
        localStorage.removeItem(SESSION_KEY);
    } catch (e) {
        // nothing to clear
    }
};

// Returns { token, userid, username, usertype } for the logged-in user, or null
export const getSession = () => {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (session && session.token && tokenExpiry(session.token) > Date.now()) {
            return session;
        }
    } catch (e) {
        // fall through to logged out
    }
    clearSession();
    return null;
};

// axios instance for routes that need a logged-in user
export const api = axios.create();

api.interceptors.request.use((config) => {
    const session = getSession();
    if (session) {
        config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
});

// the server rejected the token (missing, expired or invalid): log out and go to the login page
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            clearSession();
            window.location.assign('/');
        }
        return Promise.reject(error);
    }
);
