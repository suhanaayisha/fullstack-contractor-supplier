import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Bids() {
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
            <NavLink to='/' activeClassName='is-active' exact={true}>Logout</NavLink>
            <h1>Bids Placed</h1>
            <ul>
                {bidData.length <= 0
                    ? 'No Bids yet'
                    : bidData.map((dat) => (
                        <li style={{ padding: '10px' }} key={dat._id}>
                            <span style={{ color: 'gray' }}> Bid Id: </span> {dat._id} <br />
                            <span style={{ color: 'gray' }}> Request Id </span> {dat.reqid} <br />
                            {reqData
                                .filter((data) => data._id === dat.reqid)
                                .map((data) => (
                                    <li key={data._id}>
                                        <span style={{ color: 'gray' }}> Requested Equipment: </span> {data.equip} <br />
                                        <span style={{ color: 'gray' }}> Requested Quantity </span> {data.quantity} <br />
                                    </li>
                                ))}
                            <span style={{ color: 'gray' }}> Price </span>  {dat.price} <br />
                        </li>
                    ))}
            </ul>
        </div>
    );
}
