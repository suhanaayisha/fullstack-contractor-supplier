import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { api } from '../utils/auth';
import Navbar from './Navbar';
import { formatDate } from '../utils/date';
import ConfirmModal from './ConfirmModal';
import { formatPrice } from '../utils/currency';
import { FiTrash2 } from 'react-icons/fi';

export default function Bids() {
    const [bidData, setBidData] = useState([]);
    const [reqData, setReqData] = useState([]);
    const [bidToDelete, setBidToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        api.get('./api/getBidData')
            .then((res) => setBidData(res.data.data));
        api.get('./api/getRequestData')
            .then((res) => setReqData(res.data.data));
    }, []);

    const closeDeleteModal = () => {
        setBidToDelete(null);
        setDeleteError(null);
    };

    const deleteBid = () => {
        setDeleting(true);
        setDeleteError(null);
        api.post('./api/deleteBidData', { id: bidToDelete._id })
            .then((res) => {
                if (!res.data.success) throw new Error();
                setBidData((bids) => bids.filter((bid) => bid._id !== bidToDelete._id));
                closeDeleteModal();
            })
            .catch(() => setDeleteError('Could not delete the bid. Please try again.'))
            .finally(() => setDeleting(false));
    };

    return (
        <div>
            <Navbar>
                <NavLink to='/supplier' exact={true}>Open Requests</NavLink>
                <NavLink to='/bid' activeClassName='is-active' exact={true}>Bids</NavLink>
            </Navbar>
            <main className="page">
                <div className="page-header">
                    <h1>Bids placed</h1>
                    <p>Your bids and whether the contractor has accepted them.</p>
                </div>

                {bidData.length <= 0
                    ? <div className="empty-state">No bids yet.</div>
                    : <ul className="card-grid">
                        {bidData.map((dat, ind) => {
                            const request = reqData.find((data) => data._id === dat.reqid);
                            return (
                                <li className="card" key={dat._id}>
                                    {dat.status !== 'accepted' &&
                                        <button className="btn-delete" onClick={() => setBidToDelete(dat)} aria-label="Delete bid" title="Delete bid"><FiTrash2 color='red'/></button>}
                                    <div className="card-status">
                                        <span className={`badge badge-${dat.status || 'pending'}`}>{dat.status || 'pending'}</span>
                                    </div>
                                    <div className="price">{formatPrice(dat.price)}</div>
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
            {bidToDelete &&
                <ConfirmModal
                    title="Delete bid?"
                    message={`Your bid of ${formatPrice(bidToDelete.price)} will be permanently removed.`}
                    busy={deleting}
                    error={deleteError}
                    onConfirm={deleteBid}
                    onCancel={closeDeleteModal}
                />}
        </div>
    );
}
