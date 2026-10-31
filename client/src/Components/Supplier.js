import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useLocation } from 'react-router-dom';

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
            <NavLink to='/supplier' activeClassName='is-active' exact={true}>Home</NavLink>
            <NavLink to='/' activeClassName='is-active' exact={true}>Logout</NavLink> <br/>
            <NavLink to={{
                pathname: '/bid',
                userDetails: {
                    userid,
                    username
                }}}
                activeClassName='is-active'
                exact={true}> Bids</NavLink> <br/>

            <h1>Hello {username}</h1>
            <ul>
                {data.length <= 0
                    ? 'NO REQUESTS YET'
                    : data.map((dat) => (
                        <div key={dat._id}>
                            <li style={{ padding: '10px' }}>
                                <span style={{ color: 'gray' }}> User Name: </span> {dat.username} <br />
                                <span style={{ color: 'gray' }}> Request Id: </span> {dat._id} <br />
                                <span style={{ color: 'gray' }}> Equipment: </span> {dat.equip} <br />
                                <span style={{ color: 'gray' }}> Quantity: </span>  {dat.quantity} <br />
                            </li>
                            <form onSubmit={putDataToDB}>
                                <input type="checkbox" name="reqid" value={dat._id}/>
                                <label>Price</label>
                                <input type="number" name="price"></input>
                                <button>Place Your Bids</button>
                            </form>
                        </div>
                    ))}
                {successfulSubmission ?
                    <div>
                        <div>Bid Placed.</div>
                    </div>
                    :
                    " "
                }
            </ul>
        </div>
    );
}
