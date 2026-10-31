import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './routers/AppRouter';
import './styles.css';

import { unregister } from './serviceWorker';

ReactDOM.render(<AppRouter/>, document.getElementById('root'));

// no offline caching: removes any service worker an earlier version installed, so users always get the latest deploy
unregister();
