import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import App from './App'
import '@babel/plugin-proposal-nullish-coalescing-operator'

// declare global {
//     interface Window { ornamentV2: any; }
// }

// window.ornamentV2 = window.ornamentV2 || {};

// window.ornamentV2.app = <App />;
ReactDOM.render(<App
  seasonGap={5000}
/>, document.getElementById('root'))