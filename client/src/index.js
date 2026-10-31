import React from 'react';
import ReactDOM from 'react-dom';
import AppRouter from './routers/AppRouter';
import './styles.css';

import registerServiceWorker from './serviceWorker';

ReactDOM.render(<AppRouter/>, document.getElementById('root'));
registerServiceWorker();
