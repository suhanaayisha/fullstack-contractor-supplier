import React from 'react';


import { BrowserRouter, Route, Switch} from 'react-router-dom';
import App from '../Components/App';
import Login from '../Components/Login';
import SignUp from '../Components/SignUp';
import Contractor from '../Components/Contractor';
import Supplier from '../Components/Supplier';
import Bids from '../Components/Bids';


   const AppRouter = () => (
    <BrowserRouter>
           <div>
               <Switch>
                    <Route path='/' component={Login} exact={true}/>
                    <Route path='/signup' component={SignUp} />
                    <Route path='/contractor' component={Contractor} />
                    <Route path='/supplier' component={Supplier} />
                    <Route path='/bid' component={Bids} />
               </Switch>
           </div>
       </BrowserRouter>
   );
   
   export default AppRouter;