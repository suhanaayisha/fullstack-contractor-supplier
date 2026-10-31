import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useHistory } from 'react-router-dom';
import { saveSession } from '../utils/auth';
import { isValidEmail, getPasswordErrors } from '../utils/validation';

export default function Login() {
    const history = useHistory();
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [users, setUsers] = useState([]);
    const [userExists, setUserExists] = useState(true);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [loginError, setLoginError] = useState(null);

    useEffect(() => {
        fetch('./api/getUserData')
            .then((data) => data.json())
            .then((res) => {
                setUsers(res.data);
                setIsFetching(true);
            });
    }, []);

    const onSubmit = (e) => {
        e.preventDefault();
        setUserExists(true);
        setPasswordMatch(true);
        setLoginError(null);

        let username = e.target.elements.username.value;
        let password = e.target.elements.password.value;

        // Accounts created before validation was added may not meet the rules, so only check new usernames
        const isExistingAccount = users.some(user => user.username === username);
        const emailOk = isExistingAccount || isValidEmail(username);
        const errors = isExistingAccount ? [] : getPasswordErrors(password);
        setInvalidEmail(!emailOk);
        setPasswordErrors(errors);
        if (!emailOk || errors.length > 0) {
            return false;
        }

        if (isFetching) {
            // the password is checked on the server; only the user's id, name and type come back
            axios.post('./api/login', { username: username, password: password })
                .then((res) => {
                    if (!res.data.success) {
                        if (res.data.error === 'user_not_found') setUserExists(false);
                        else if (res.data.error === 'wrong_password') setPasswordMatch(false);
                        else setLoginError('Could not log in. Please try again.');
                        return;
                    }
                    const user = res.data.data;
                    saveSession(user);
                    history.push(user.usertype === 'contractor' ? '/contractor' : '/supplier');
                })
                .catch(() => setLoginError('Could not log in. Please try again.'));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">Contractor · Supplier</div>
                <h2>Welcome back</h2>
                <p className="subtitle">Log in to your account</p>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Email</label>
                        <input className="input" type="text" id="username" name="username" placeholder="you@example.com" autoComplete="off"></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input className="input" type="password" id="password" name="password" autoComplete="new-password"></input>
                    </div>
                    <button className="btn btn-block">Log in</button>
                </form>
                {invalidEmail && <div className="alert alert-error">Username must be a valid email address</div>}
                {passwordErrors.length > 0 && <div className="alert alert-error">Password must contain {passwordErrors.join(', ')}</div>}
                {!userExists && <div className="alert alert-error">User does not exist. Please sign up.</div>}
                {!passwordMatch && <div className="alert alert-error">Username and password do not match</div>}
                {loginError && <div className="alert alert-error">{loginError}</div>}
                <p className="auth-footer">
                    Don't have an account? <NavLink to='/signup' exact={true}>Sign up</NavLink>
                </p>
            </div>
        </div>
    );
}
