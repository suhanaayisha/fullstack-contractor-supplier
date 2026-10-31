import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';

export default function Login() {
    const history = useHistory();
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
        <div>
            <h2>Login</h2>
            <form onSubmit={onSubmit}>
                <label>Username</label>
                <input type="text" name="username" autoComplete="off"></input>
                <label>Password</label>
                <input type="password" name="password" autoComplete="new-password"></input>
                <button>Login</button>
            </form>
            {userExists ? <p></p> : <p>User Does Not Exist. Please Sign Up</p>}
            {passwordMatch ? <p></p> : <p> Username and Password does not match</p>}
            <NavLink to='/signup' activeClassName='is-active' exact={true}>Sign up</NavLink>
        </div>
    );
}
