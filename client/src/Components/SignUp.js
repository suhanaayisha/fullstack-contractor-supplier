import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';

export default function SignUp() {
    const [users, setUsers] = useState([]);
    const [passwordMatch, setPasswordMatch] = useState(true);
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
        <div>
            <NavLink to='/' activeClassName='is-active' exact={true}>Login</NavLink>
            <h2>Sign Up</h2>
            <form onSubmit={putDataToDB} ref={formRef}>
                <label>Username</label>
                <input type="text" name="username" onChange={onUserChange} required autoComplete="off"></input>
                <label>Password</label>
                <input type="password" name="password1" required autoComplete="new-password"></input>
                <label>Confirm Password</label>
                <input type="password" name="password2" required></input>
                <label>Type of User:</label>
                <select name="usertype">
                    <option value="contractor">Contractor</option>
                    <option value="supplier">Supplier</option>
                </select>
                <button>Sign Up</button>
            </form>
            {usernameExists ? <p>Username Exists</p> : ""}
            {passwordMatch ? <p></p> : <p>Passwords do not match</p>}
            {successfulSubmission ?
                <div>
                    <div>Sign up successful.</div>
                    <NavLink to='/' activeClassName='is-active' exact={true}>Login Here</NavLink>
                </div>
                :
                " "}
        </div>
    );
}
