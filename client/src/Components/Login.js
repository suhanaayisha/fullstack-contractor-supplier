import React from 'react';
import { NavLink} from 'react-router-dom';

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
            users: [],
            userExists: true,
            passwordMatch: true,
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


    onSubmit = (e) => {
        this.setState({userExists: true}); 
        this.setState({passwordMatch: true}); 
        e.preventDefault();
        this.setState({userExists: true});
        this.setState({passwordMatch: true});
        
        let username =e.target.elements.username.value;
        let password =e.target.elements.password.value;
        const users = this.state.users;
        console.log(users)
        
        if(this.state.isFetching){
            
            if (users.length > 0 && users.find(user => user.username === username)) {
                if( users.find(user => user.username === username && user.password ===password )){
                    const user =  users.find(user => user.username === username)
                    if (user.usertype == "contractor"){
                        this.props.history.push('/contractor',{ userid: user._id, username: user.username });
                        
                    }
                    else if (user.usertype == "supplier"){
                        this.props.history.push('/supplier',{ userid: user._id, username: user.username });
                        
                    }
                    else{
                        this.props.history.push('/supplier',{ userid: user._id });
                    }
                }
                else{
                    this.setState({passwordMatch: false}); 
                    return false;
                }
                
               } 
            else {
                this.setState({userExists: false}); 
                return false;
               }
                
        } 

        // let user =e.target.elements.users.value;
        // if (user == "contractor"){
        //     this.props.history.push('/contractor');
        // }
        // else{
        //     this.props.history.push('/supplier');
        // }
    };

    componentDidUpdate(prevProps, prevState){
    
    }

    render(){
        
        return(
            <div>
                <h2>Login</h2>
                <form onSubmit={this.onSubmit}>
                    <label>Username</label>
                    <input type="text" name="username"></input>
                    <label>Password</label>
                    <input type="password" name="password"></input>
                    <button>Login</button>
                </form>
                { this.componentDidUpdate() }
                {  this.state.userExists ?  <p></p> : <p>User Does Not Exist. Please Sign Up</p>} 
                {  this.state.passwordMatch ? <p></p> : <p> Username and Password does not match</p>} 
                <NavLink to='/signup' activeClassName='is-active' exact={true}>Sign up</NavLink> 
    
            </div>
        )
    }
}