import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useLocation } from 'react-router-dom';

export default function Contractor() {
    const location = useLocation();
    const userid = location.state?.userid;
    const username = location.state?.username;
    const [data, setData] = useState([]);

    useEffect(() => {
        const getDataFromDb = () => {
            fetch('./api/getRequestData')
                .then((data) => data.json())
                .then((res) => setData(res.data));
        };
        getDataFromDb();
        const interval = setInterval(getDataFromDb, 1000);
        return () => clearInterval(interval);
    }, []);

    const putDataToDB = (e) => {
        e.preventDefault();
        let equip = e.target.elements.equip.value;
        let quantity = e.target.elements.quantity.value;

        axios.post('./api/putRequestData', {
            userid: userid,
            username: username,
            equip: equip,
            quantity: quantity
        });
    };

    return (
        <div>
            <NavLink to='/contractor' activeClassName='is-active' exact={true}>Home</NavLink>
            <NavLink to='/' activeClassName='is-active' exact={true}>Logout</NavLink>
            <h1>Hello {username}</h1>
            <h2>My Requests</h2>
            <ul>
                {data.length <= 0
                    ? 'NO REQUESTS YET'
                    : data
                        .filter((dat) => dat.userid === userid)
                        .map((dat) => (
                            <li style={{ padding: '10px' }} key={dat._id}>
                                <span style={{ color: 'gray' }}> User Name: </span> {dat.username} <br />
                                <span style={{ color: 'gray' }}> Request Id: </span> {dat._id} <br />
                                <span style={{ color: 'gray' }}> Equipment: </span> {dat.equip} <br />
                                <span style={{ color: 'gray' }}> Quantity: </span>  {dat.quantity} <br />
                            </li>
                        ))}
            </ul>
            <form onSubmit={putDataToDB}>
                <label>Equipment</label>
                <input type="text" name="equip"></input>
                <label>Quantity</label>
                <input type="number" name="quantity"></input>
                <button>Request</button>
            </form>
        </div>
    );
}
