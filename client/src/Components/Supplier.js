import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { api, getSession } from '../utils/auth';
import Navbar from './Navbar';
import { formatDate } from '../utils/date';
import { currencySymbol } from '../utils/currency';

export default function Supplier() {
    const { userid, username } = getSession() || {};
    const [data, setData] = useState([]);
    const [bids, setBids] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [successfulSubmission, setSuccessfulSubmission] = useState(false);
    const [bidError, setBidError] = useState(null);

    useEffect(() => {
        api.get('./api/getRequestData')
            .then((res) => setData(res.data.data));
        api.get('./api/getBidData')
            .then((res) => {
                setBids(res.data.data);
                setIsFetching(true);
            });
    }, [userid]);

    const putDataToDB = (e) => {
        e.preventDefault();
        setSuccessfulSubmission(false);
        setBidError(null);
        const form = e.target;
        let reqid = form.elements.reqid.value;
        let price = form.elements.price.value;
        if (!(Number(price) > 0)) {
            setBidError('Bid price must be greater than 0');
            return;
        }
        if (isFetching) {
            api.post('./api/putBidData', {
                reqid: reqid,
                price: price
            })
                .then((res) => {
                    if (!res.data.success) throw new Error(res.data.error);
                    // adding the bid hides its request from this supplier's open requests
                    setBids((bids) => [...bids, res.data.data]);
                    setSuccessfulSubmission(true);
                })
                .catch((err) => setBidError(err.message === 'This request is no longer open for bids'
                    ? err.message
                    : 'Could not place the bid. Please try again.'));
        }
    };

    // requests this supplier has already bid on move to the Bids page
    const biddedRequestIds = new Set(bids.map((bid) => bid.reqid));
    const openRequests = data.filter((request) =>
        request.status !== 'closed' && !biddedRequestIds.has(request._id));

    return (
        <div>
            <Navbar>
                <NavLink to='/supplier' activeClassName='is-active' exact={true}>Open Requests</NavLink>
                <NavLink to='/bid' activeClassName='is-active' exact={true}>Bids</NavLink>
            </Navbar>
            <main className="page">
                <div className="page-header">
                    <h1>Hello, {username}</h1>
                    <p>Browse open equipment requests and place your bids.</p>
                </div>

                {successfulSubmission && <div className="alert alert-success">Bid placed. You can find it on the Bids page.</div>}
                {bidError && <div className="alert alert-error">{bidError}</div>}

                <h2 className="section-title">Open requests</h2>
                {openRequests.length <= 0
                    ? <div className="empty-state">No open requests right now. Check back soon.</div>
                    : <ul className="card-grid">
                        {openRequests.map((dat) => (
                            <li className="card" key={dat._id}>
                                <h3 className="card-title">{dat.equip}</h3>
                                <dl className="details">
                                    <dt>Quantity</dt>
                                    <dd>{dat.quantity}</dd>
                                    <dt>Required by</dt>
                                    <dd>{formatDate(dat.requiredBy)}</dd>
                                    <dt>Requested by</dt>
                                    <dd>{dat.username}</dd>
                                </dl>
                                <form className="card-actions inline-form" onSubmit={putDataToDB}>
                                    <input type="hidden" name="reqid" value={dat._id}/>
                                    <div className="form-group">
                                        <label htmlFor={`price-${dat._id}`}>Your price ({currencySymbol})</label>
                                        <input className="input" type="number" id={`price-${dat._id}`} name="price" min="0.01" step="0.01" placeholder="0.00" required></input>
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
