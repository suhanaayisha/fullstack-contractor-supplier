import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { isValidEmail, getPasswordErrors } from '../utils/validation';

export default function Login() {
    const history = useHistory();
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [users, setUsers] = useState([]);
    const [userExists, setUserExists] = useState(true);
    const [passwordMatch, setPasswordMatch] = useState(true);

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
            if (users.length > 0 && users.find(user => user.username === username)) {
                const user = users.find(user => user.username === username && user.password === password);
                if (user) {
                    if (user.usertype === "contractor") {
                        history.push('/contractor', { userid: user._id, username: user.username });
                    }
                    else if (user.usertype === "supplier") {
                        history.push('/supplier', { userid: user._id, username: user.username });
                    }
                    else {
                        history.push('/supplier', { userid: user._id });
                    }
                }
                else {
                    setPasswordMatch(false);
                    return false;
                }
            }
            else {
                setUserExists(false);
                return false;
            }
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
                <p className="auth-footer">
                    Don't have an account? <NavLink to='/signup' exact={true}>Sign up</NavLink>
                </p>
            </div>
        </div>
    );
}
