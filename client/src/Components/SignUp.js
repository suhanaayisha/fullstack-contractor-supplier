import React from 'react';
import axios from 'axios';
import { NavLink} from 'react-router-dom';

export default class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            username: null,
            password: null,
            usertype: null,
            passwordMatch: true,
            usernameExists: false,
            intervalIsSet: false,
            isFetching: false,
            successfulSubmission: false
        };
        
      }

    componentDidMount() {
        this.getDataFromDb();
        // if (!this.state.intervalIsSet) {
        //   let interval = setInterval(this.getDataFromDb, 1000);
        //   this.setState({ intervalIsSet: interval });
        // }
    }

    getDataFromDb = () => {
        fetch('./api/getUserData')
          .then((data) => data.json())
          .then((res) => this.setState({ users: res.data, isFetching:true }));
      };


    putDataToDB = (e) => {
        e.preventDefault();
        this.setState({passwordMatch: true})
        let username =e.target.elements.username.value;
        let password1 =e.target.elements.password1.value;
        let password2 =e.target.elements.password2.value;
        let usertype =e.target.elements.usertype.value;
        if(this.state.users.find((user) => user.username === username)){
            return false;
        }
        if(password1 !== password2){
            this.setState({passwordMatch: false})
            return false; // The form won't submit
        }
        
        if(this.state.isFetching){
            if(!(this.state.users.find((user) => user.username === username)) && (password1 == password2) ){
                axios.post('./api/putUserData', {
                    username: username,
                    password: password1,
                    usertype: usertype
                });
                this.setState({successfulSubmission: true})
                this.form.reset() 
                
            } 
        
        }
    }

    onUserChange = (e) => {
        let username = e.target.value;
        if(this.state.users.find((user) => user.username === username)){
            this.setState({usernameExists: true})
            console.log("username matches")
        } else {
            this.setState({usernameExists: false})
        }

    }


    componentDidUpdate(prevProps, prevState){
    
        }

    
      

    
    render(){
        const { data } = this.state;
        // const users = this.getDataFromDb()
        // console.log(users)
        return(
            <div>
                <NavLink to='/' activeClassName='is-active' exact={true}>Login</NavLink> 
                <h2>Sign Up</h2>
                <form onSubmit={this.putDataToDB} ref={form => this.form = form}>
                    <label>Username</label>
                    <input type="text" name="username" onChange={this.onUserChange} required></input>
                    <label>Password</label>
                    <input type="password" name="password1" required></input>
                    <label>Confirm Password</label>
                    <input type="password" name="password2" onChange={this.onPassChange} required></input>
                    <label>Type of User:</label>
                    <select name="users" name="usertype">
                        <option value="contractor">Contractor</option>
                        <option value="supplier">Supplier</option>
                    </select>
                    <button>Sign Up</button>
                </form>
                { this.componentDidUpdate() }
                {  this.state.usernameExists ?  <p>Username Exists</p> : ""} 
                {  this.state.passwordMatch ? <p></p> : <p>Passwords do not match</p>}  
                {  this.state.successfulSubmission ? 
                    <div> 
                        <div>Sign up successful.</div> 
                        <NavLink to='/' activeClassName='is-active' exact={true}>Login Here</NavLink> 
                    </div> 
                    : 
                    " " }
                  
            </div>
        );
    }
}