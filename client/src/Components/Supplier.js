import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function Supplier() {
    const location = useLocation();
    const userid = location.state?.userid || location.userDetails?.userid;
    const username = location.state?.username || location.userDetails?.username;
    const [data, setData] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [successfulSubmission, setSuccessfulSubmission] = useState(false);

    useEffect(() => {
        fetch('./api/getRequestData')
            .then((data) => data.json())
            .then((res) => setData(res.data));
        fetch('./api/getBidData')
            .then((data) => data.json())
            .then(() => setIsFetching(true));
    }, []);

    const putDataToDB = (e) => {
        e.preventDefault();
        setSuccessfulSubmission(false);
        let reqid = e.target.elements.reqid.value;
        let price = e.target.elements.price.value;
        if (isFetching) {
            axios.post('./api/putBidData', {
                reqid: reqid,
                price: price
            });
            setSuccessfulSubmission(true);
            e.target.reset();
        }
    };

    return (
        <div>
            <Navbar>
                <NavLink to={{ pathname: '/supplier', state: { userid, username } }} activeClassName='is-active' exact={true}>Open Requests</NavLink>
                <NavLink to={{
                    pathname: '/bid',
                    userDetails: {
                        userid,
                        username
                    }}}
                    activeClassName='is-active'
                    exact={true}>Bids</NavLink>
            </Navbar>
            <main className="page">
                <div className="page-header">
                    <h1>Hello, {username}</h1>
                    <p>Browse open equipment requests and place your bids.</p>
                </div>

                {successfulSubmission && <div className="alert alert-success">Bid placed.</div>}

                <h2 className="section-title">Open requests</h2>
                {data.length <= 0
                    ? <div className="empty-state">No requests yet. Check back soon.</div>
                    : <ul className="card-grid">
                        {data.map((dat) => (
                            <li className="card" key={dat._id}>
                                <h3 className="card-title">{dat.equip}</h3>
                                <dl className="details">
                                    <dt>Quantity</dt>
                                    <dd>{dat.quantity}</dd>
                                    <dt>Requested by</dt>
                                    <dd>{dat.username}</dd>
                                    <dt>Request ID</dt>
                                    <dd>{dat._id}</dd>
                                </dl>
                                <form className="card-actions inline-form" onSubmit={putDataToDB}>
                                    <input type="hidden" name="reqid" value={dat._id}/>
                                    <div className="form-group">
                                        <label htmlFor={`price-${dat._id}`}>Your price</label>
                                        <input className="input" type="number" id={`price-${dat._id}`} name="price" min="0" placeholder="0"></input>
                                    </div>
                                    <button className="btn">Place bid</button>
                                </form>
                            </li>
                        ))}
                    </ul>}
            </main>
        </div>
    );
}
