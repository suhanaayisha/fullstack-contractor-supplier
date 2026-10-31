import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Contractor() {
    const location = useLocation();
    const userid = location.state?.userid;
    const username = location.state?.username;
    const [data, setData] = useState([]);
    const [equipment, setEquipment] = useState([]);

    useEffect(() => {
        fetch('./api/getEquipment')
            .then((data) => data.json())
            .then((res) => setEquipment(res.data));
    }, []);

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

    const myRequests = data.filter((dat) => dat.userid === userid);

    return (
        <div>
            <Navbar>
                <NavLink to={{ pathname: '/contractor', state: location.state }} activeClassName='is-active' exact={true}>My Requests</NavLink>
            </Navbar>
            <main className="page">
                <div className="page-header">
                    <h1>Hello, {username}</h1>
                    <p>Request equipment and track what you've asked for.</p>
                </div>

                <div className="card">
                    <h2 className="card-title">New request</h2>
                    <form className="inline-form" onSubmit={putDataToDB}>
                        <div className="form-group">
                            <label htmlFor="equip">Equipment</label>
                            <select className="input" id="equip" name="equip" defaultValue="" required>
                                <option value="" disabled>Select equipment</option>
                                {equipment.map((item) => (
                                    <option key={item._id} value={item.name}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="quantity">Quantity</label>
                            <input className="input" type="number" id="quantity" name="quantity" min="1" placeholder="1"></input>
                        </div>
                        <button className="btn">Submit request</button>
                    </form>
                </div>

                <h2 className="section-title">My requests</h2>
                {myRequests.length <= 0
                    ? <div className="empty-state">No requests yet. Create one above.</div>
                    : <ul className="card-grid">
                        {myRequests.map((dat) => (
                            <li className="card" key={dat._id}>
                                <h3 className="card-title">{dat.equip}</h3>
                                <dl className="details">
                                    <dt>Quantity</dt>
                                    <dd>{dat.quantity}</dd>
                                    <dt>Request ID</dt>
                                    <dd>{dat._id}</dd>
                                </dl>
                            </li>
                        ))}
                    </ul>}
            </main>
        </div>
    );
}
