import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Login from '../Components/Login';
import SignUp from '../Components/SignUp';
import Contractor from '../Components/Contractor';
import Supplier from '../Components/Supplier';
import Bids from '../Components/Bids';
import { getSession } from '../utils/auth';

const homeFor = (session) => (session.usertype === 'contractor' ? '/contractor' : '/supplier');

// only renders the page for a logged-in user of the right type
const ProtectedRoute = ({ component: Component, usertype, ...rest }) => (
    <Route
        {...rest}
        render={() => {
            const session = getSession();
            if (!session) return <Redirect to='/' />;
            if (session.usertype !== usertype) return <Redirect to={homeFor(session)} />;
            return <Component />;
        }}
    />
);

// login and sign-up pages send already logged-in users to their home page
const PublicRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={() => {
            const session = getSession();
            return session ? <Redirect to={homeFor(session)} /> : <Component />;
        }}
    />
);

const AppRouter = () => (
    <BrowserRouter>
        <Switch>
            <PublicRoute path='/' component={Login} exact={true} />
            <PublicRoute path='/signup' component={SignUp} />
            <ProtectedRoute path='/contractor' component={Contractor} usertype='contractor' />
            <ProtectedRoute path='/supplier' component={Supplier} usertype='supplier' />
            <ProtectedRoute path='/bid' component={Bids} usertype='supplier' />
        </Switch>
    </BrowserRouter>
);

export default AppRouter;
