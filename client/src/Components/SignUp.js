import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { isValidEmail, getPasswordErrors } from '../utils/validation';

export default function SignUp() {
    const [users, setUsers] = useState([]);
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [usernameExists, setUsernameExists] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [successfulSubmission, setSuccessfulSubmission] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        fetch('./api/getUserData')
            .then((data) => data.json())
            .then((res) => {
                setUsers(res.data);
                setIsFetching(true);
            });
    }, []);

    const putDataToDB = (e) => {
        e.preventDefault();
        setPasswordMatch(true);
        let username = e.target.elements.username.value;
        let password1 = e.target.elements.password1.value;
        let password2 = e.target.elements.password2.value;
        let usertype = e.target.elements.usertype.value;

        const emailOk = isValidEmail(username);
        const errors = getPasswordErrors(password1);
        setInvalidEmail(!emailOk);
        setPasswordErrors(errors);
        if (!emailOk || errors.length > 0) {
            return false;
        }

        if (users.find((user) => user.username === username)) {
            return false;
        }
        if (password1 !== password2) {
            setPasswordMatch(false);
            return false; // The form won't submit
        }

        if (isFetching) {
            axios.post('./api/putUserData', {
                username: username,
                password: password1,
                usertype: usertype
            });
            setSuccessfulSubmission(true);
            formRef.current.reset();
        }
    };

    const onUserChange = (e) => {
        let username = e.target.value;
        setUsernameExists(!!users.find((user) => user.username === username));
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">Contractor · Supplier</div>
                <h2>Create an account</h2>
                <p className="subtitle">Request equipment or bid on requests</p>
                <form onSubmit={putDataToDB} ref={formRef}>
                    <div className="form-group">
                        <label htmlFor="username">Email</label>
                        <input className="input" type="text" id="username" name="username" placeholder="you@example.com" onChange={onUserChange} required autoComplete="off"></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password1">Password</label>
                        <input className="input" type="password" id="password1" name="password1" required autoComplete="new-password"></input>
                        <span className="hint">8+ characters with upper and lower case, a number and a special character</span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password2">Confirm password</label>
                        <input className="input" type="password" id="password2" name="password2" required autoComplete="new-password"></input>
                    </div>
                    <div className="form-group">
                        <label htmlFor="usertype">I am a</label>
                        <select className="input" id="usertype" name="usertype">
                            <option value="contractor">Contractor</option>
                            <option value="supplier">Supplier</option>
                        </select>
                    </div>
                    <button className="btn btn-block">Sign up</button>
                </form>
                {invalidEmail && <div className="alert alert-error">Username must be a valid email address</div>}
                {passwordErrors.length > 0 && <div className="alert alert-error">Password must contain {passwordErrors.join(', ')}</div>}
                {usernameExists && <div className="alert alert-error">An account with this email already exists</div>}
                {!passwordMatch && <div className="alert alert-error">Passwords do not match</div>}
                {successfulSubmission &&
                    <div className="alert alert-success">
                        Sign up successful. <NavLink to='/' exact={true}>Log in here</NavLink>
                    </div>}
                <p className="auth-footer">
                    Already have an account? <NavLink to='/' exact={true}>Log in</NavLink>
                </p>
            </div>
        </div>
    );
}
