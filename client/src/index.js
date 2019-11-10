
import React from 'react';
import ReactDOM from 'react-dom';
import App from './Components/App';
import AppRouter from './routers/AppRouter';

import registerServiceWorker from './serviceWorker';

ReactDOM.render(<AppRouter/>, document.getElementById('root'));
registerServiceWorker();
