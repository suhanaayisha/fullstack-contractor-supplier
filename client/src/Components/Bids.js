import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { formatDate } from '../utils/date';

export default function Bids() {
    const location = useLocation();
    const userDetails = location.userDetails;
    const [bidData, setBidData] = useState([]);
    const [reqData, setReqData] = useState([]);

    useEffect(() => {
        fetch('./api/getBidData')
            .then((data) => data.json())
            .then((res) => setBidData(res.data));
        fetch('./api/getRequestData')
            .then((data) => data.json())
            .then((res) => setReqData(res.data));
    }, []);

    return (
        <div>
            <Navbar>
                <NavLink to={{ pathname: '/supplier', state: userDetails }} exact={true}>Open Requests</NavLink>
                <NavLink to={{ pathname: '/bid', userDetails }} activeClassName='is-active' exact={true}>Bids</NavLink>
            </Navbar>
            <main className="page">
                <div className="page-header">
                    <h1>Bids placed</h1>
                    <p>All bids submitted on equipment requests.</p>
                </div>

                {bidData.length <= 0
                    ? <div className="empty-state">No bids yet.</div>
                    : <ul className="card-grid">
                        {bidData.map((dat, ind) => {
                            const request = reqData.find((data) => data._id === dat.reqid);
                            return (
                                <li className="card" key={dat._id}>
                                    <div className="price">{dat.price}</div>
                                    <h3 className="card-title">{request ? request.equip : 'Request removed'}</h3>
                                    <dl className="details">
                                        {request && <>
                                            <dt>Quantity</dt>
                                            <dd>{request.quantity}</dd>
                                            <dt>Required by</dt>
                                            <dd>{formatDate(request.requiredBy)}</dd>
                                        </>}
                                    </dl>
                                </li>
                            );
                        })}
                    </ul>}
            </main>
        </div>
    );
}
