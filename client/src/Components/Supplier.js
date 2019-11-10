import React from 'react';
import axios from 'axios';
import { NavLink} from 'react-router-dom';

export default class Supplier extends React.Component {
    state = {
        data: [],
        biddata: [],
        userid: this.props.location.state.userid,
        username: this.props.location.state.username,
        name: null,
        quantity: null,
        intervalIsSet: false,
        isFetching:false
      };

    componentDidMount() {
        this.getDataFromDb();
        this.getBidDataFromDb();
        // if (!this.state.intervalIsSet) {
        //   let interval = setInterval(this.getDataFromDb, 1000);
        //   this.setState({ intervalIsSet: interval });
        // }
    }
    componentWillUnmount() {
        if (this.state.intervalIsSet) {
          clearInterval(this.state.intervalIsSet);
          this.setState({ intervalIsSet: null });
        }
      }

    getDataFromDb = () => {
        fetch('http://localhost:3001/api/getRequestData')
          .then((data) => data.json())
          .then((res) => this.setState({ data: res.data }));
      };
    
    getBidDataFromDb = () => {
        fetch('http://localhost:3001/api/getBidData')
          .then((data) => data.json())
          .then((res) => this.setState({ biddata: res.data ,isFetching:true }));
      };
    

    putDataToDB = (e) => {
        e.preventDefault();
        let reqid =e.target.elements.reqid.value;
        let price =e.target.elements.price.value;
        let biddata = this.state.biddata;
        if(this.state.isFetching){
            
            if (biddata.length > 0 && biddata.find(data => data.reqid === reqid)){ 
                    let data = biddata.find(data => data.reqid === reqid);
                    console.log(data.price)
                    console.log(price)
                    if (price < data.price){
                        axios.post('http://localhost:3001/api/deleteBidData', {
                            id: data._id,
                        });

                        // axios.post('http://localhost:3001/api/putBidData', {
          
                        //     reqid: reqid,
                        //     price: price
                        // });
                       }
                    } else {
                        console.log("price is more than existing bid")
                    }

                    axios.post('http://localhost:3001/api/putBidData', {
                  
                        reqid: reqid,
                        price: price
                    });
                   }
                }
                    

    render(){
        const { data } = this.state;
        
        return(
            <div>
                <NavLink to='/supplier' activeClassName='is-active' exact={true}>Home</NavLink> 
                <NavLink to='/' activeClassName='is-active' exact={true}>Logout</NavLink> 
                <NavLink to='/bid' activeClassName='is-active' exact={true}>Bids</NavLink> 
                <h1>Hello {this.state.username}</h1>
                <ul>
                {data.length <= 0
                    ? 'NO REQUESTS YET'
                    : data.map((dat) => (
                        <li style={{ padding: '10px' }} key={dat.id}>
                        <span style={{ color: 'gray' }}> User Name: </span> {dat.username} <br />
                        <span style={{ color: 'gray' }}> Request Id: </span> {dat._id} <br />
                        <span style={{ color: 'gray' }}> Equipment: </span> {dat.equip} <br />
                        <span style={{ color: 'gray' }}> Quantity: </span>  {dat.quantity} <br />
                        </li>
                    ))}
                </ul>
                <form onSubmit={this.putDataToDB}>
                    <label>Request Id</label>
                    <input type="text" name="reqid"></input>
                    <label>Price</label>
                    <input type="number" name="price"></input>
                    <button>Bid</button>
                </form>

            </div>
        );
    }
}