import React from 'react';
import axios from 'axios';
import { NavLink} from 'react-router-dom';

export default class Supplier extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      userid: this.props.location.userDetails.userid,
      username: this.props.location.userDetails.username,
      intervalIsSet: false
    };
    
  }
  
      

    componentDidMount() {
        this.getDataFromDb();
        if (!this.state.intervalIsSet) {
          let interval = setInterval(this.getDataFromDb, 1000);
          this.setState({ intervalIsSet: interval });
        }
    }
    componentWillUnmount() {
        if (this.state.intervalIsSet) {
          clearInterval(this.state.intervalIsSet);
          this.setState({ intervalIsSet: null });
        }
      }

    getDataFromDb = () => {
        fetch('./api/getBidData')
          .then((data) => data.json())
          .then((res) => this.setState({ data: res.data }));
      };

      

    render(){
        console.log(this.state.username)
        console.log("hi")
        const { data } = this.state;
        const userid = this.state.userid;
        const username = this.state.username;
        return(
            <div>
                <NavLink to={{
                  pathname:'/supplier',
                  userDetails:{
                      userid, 
                      username
                  }}}>Home</NavLink> <br/>
                <NavLink to='/' activeClassName='is-active' exact={true}>Logout</NavLink> 
                <h1>Bids Placed</h1>
                <ul>
                {data.length <= 0
                    ? 'No Bids yet'
                    : data.map((dat) => (
                        <li style={{ padding: '10px' }} key={dat.id}>
                        <span style={{ color: 'gray' }}> Bid Id: </span> {dat._id} <br />
                        <span style={{ color: 'gray' }}> Request Id </span> {dat.reqid} <br />
                        <span style={{ color: 'gray' }}> Price </span>  {dat.price} <br />
                        </li>
                    ))}
                </ul>

            </div>
        );
    }
}