import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { api, getSession } from '../utils/auth';
import Navbar from './Navbar';
import { formatDate, today } from '../utils/date';
import ConfirmModal from './ConfirmModal';
import { FiTrash2 } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';

export default function Contractor() {
    const { userid, username } = getSession() || {};
    const [data, setData] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [requestToDelete, setRequestToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [bids, setBids] = useState([]);
    // { bid, status } while the accept/reject confirmation is open
    const [bidDecision, setBidDecision] = useState(null);
    const [deciding, setDeciding] = useState(false);
    const [decisionError, setDecisionError] = useState(null);

    useEffect(() => {
        fetch('./api/getEquipment')
            .then((data) => data.json())
            .then((res) => setEquipment(res.data));
    }, []);

    useEffect(() => {
        const getDataFromDb = () => {
            api.get('./api/getRequestData')
                .then((res) => setData(res.data.data));
            api.get('./api/getBidData')
                .then((res) => setBids(res.data.data));
        };
        getDataFromDb();
        const interval = setInterval(getDataFromDb, 1000);
        return () => clearInterval(interval);
    }, [userid]);

    const putDataToDB = (e) => {
        e.preventDefault();
        let equip = e.target.elements.equip.value;
        let quantity = e.target.elements.quantity.value;
        let requiredBy = e.target.elements.requiredBy.value;

        api.post('./api/putRequestData', {
            equip: equip,
            quantity: quantity,
            requiredBy: requiredBy
        });
    };

    const closeDeleteModal = () => {
        setRequestToDelete(null);
        setDeleteError(null);
    };

    const deleteRequest = () => {
        setDeleting(true);
        setDeleteError(null);
        api.delete('./api/deleteRequestData', { data: { id: requestToDelete._id } })
            .then((res) => {
                if (!res.data.success) throw new Error();
                setData((requests) => requests.filter((request) => request._id !== requestToDelete._id));
                closeDeleteModal();
            })
            .catch(() => setDeleteError('Could not delete the request. Please try again.'))
            .finally(() => setDeleting(false));
    };

    const closeDecisionModal = () => {
        setBidDecision(null);
        setDecisionError(null);
    };

    const decideBid = () => {
        const { bid, status } = bidDecision;
        setDeciding(true);
        setDecisionError(null);
        api.post('./api/updateBidStatus', { id: bid._id, status: status })
            .then((res) => {
                if (!res.data.success) {
                    setDecisionError(typeof res.data.error === 'string' ? res.data.error : 'Could not update the bid. Please try again.');
                    return;
                }
                setBids((bids) => bids.map((b) => {
                    if (b._id === bid._id) return { ...b, status: status };
                    if (status === 'accepted' && b.reqid === bid.reqid) return { ...b, status: 'rejected' };
                    return b;
                }));
                if (status === 'accepted') {
                    setData((requests) => requests.map((r) => r._id === bid.reqid ? { ...r, status: 'closed' } : r));
                }
                closeDecisionModal();
            })
            .catch(() => setDecisionError('Could not update the bid. Please try again.'))
            .finally(() => setDeciding(false));
    };

    const myRequests = data.filter((dat) => dat.userid === userid);
    const bidsFor = (reqid) => bids.filter((bid) => bid.reqid === reqid);

    return (
        <div>
            <Navbar>
                <NavLink to='/contractor' activeClassName='is-active' exact={true}>My Requests</NavLink>
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
                        <div className="form-group">
                            <label htmlFor="requiredBy">Required by</label>
                            <input className="input" type="date" id="requiredBy" name="requiredBy" min={today()} required></input>
                        </div>
                        <button className="btn">Submit request</button>
                    </form>
                </div>

                <h2 className="section-title">My requests</h2>
                {myRequests.length <= 0
                    ? <div className="empty-state">No requests yet. Create one above.</div>
                    : <ul className="card-grid">
                        {myRequests.map((dat, ind) => (
                            <li className="card" key={dat._id}>
                                <button className="btn-delete" onClick={() => setRequestToDelete(dat)} aria-label="Delete request" title="Delete request"><FiTrash2 color='red'/></button>
                                <h3 className="card-title">{dat.equip}</h3>
                                <div className="card-status">
                                    <span className={`badge badge-${dat.status || 'open'}`}>{dat.status || 'open'}</span>
                                </div>
                                <dl className="details">
                                    <dt>Quantity</dt>
                                    <dd>{dat.quantity}</dd>
                                    <dt>Required by</dt>
                                    <dd>{formatDate(dat.requiredBy)}</dd>
                                </dl>
                                <div className="card-actions">
                                    <p className="bid-section-title">Bids</p>
                                    {bidsFor(dat._id).length <= 0
                                        ? <p className="hint">No bids yet.</p>
                                        : <ul className="bid-list">
                                            {bidsFor(dat._id).map((bid) => (
                                                <li className="bid-row" key={bid._id}>
                                                    <div className="bid-row-info">
                                                        <span className="bid-row-price">{formatPrice(bid.price)}</span>
                                                        <span className="bid-row-supplier">{bid.suppliername || 'Unknown supplier'}</span>
                                                    </div>
                                                    <div className="bid-row-actions">
                                                        {dat.status !== 'closed' && bid.status === 'pending'
                                                            ? <>
                                                                <button className="btn btn-sm btn-success" onClick={() => setBidDecision({ bid, status: 'accepted' })}>Accept</button>
                                                                <button className="btn btn-sm btn-secondary" onClick={() => setBidDecision({ bid, status: 'rejected' })}>Reject</button>
                                                            </>
                                                            : <span className={`badge badge-${bid.status}`}>{bid.status}</span>}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>}
                                </div>
                            </li>
                        ))}
                    </ul>}
            </main>
            {requestToDelete &&
                <ConfirmModal
                    title="Delete request?"
                    message={`Your request for ${requestToDelete.quantity} × ${requestToDelete.equip} and any bids placed on it will be permanently removed.`}
                    busy={deleting}
                    error={deleteError}
                    onConfirm={deleteRequest}
                    onCancel={closeDeleteModal}
                />}
            {bidDecision &&
                <ConfirmModal
                    title={bidDecision.status === 'accepted' ? 'Accept bid?' : 'Reject bid?'}
                    message={bidDecision.status === 'accepted'
                        ? `Accept ${bidDecision.bid.suppliername || 'this supplier'}'s bid of ${formatPrice(bidDecision.bid.price)}? All other bids on this request will be rejected and the request will be closed.`
                        : `Reject ${bidDecision.bid.suppliername || 'this supplier'}'s bid of ${formatPrice(bidDecision.bid.price)}?`}
                    confirmLabel={bidDecision.status === 'accepted' ? 'Accept bid' : 'Reject bid'}
                    busyLabel="Saving…"
                    variant={bidDecision.status === 'accepted' ? 'success' : 'danger'}
                    busy={deciding}
                    error={decisionError}
                    onConfirm={decideBid}
                    onCancel={closeDecisionModal}
                />}
        </div>
    );
}
