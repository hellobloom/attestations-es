import React from 'react'
import ReactDOM from 'react-dom'
import {ReactQueryConfigProvider} from 'react-query'

import 'bulma/css/bulma.css'

import App from './App'
import * as serviceWorker from './serviceWorker'

import './index.css'

ReactDOM.render(
  <ReactQueryConfigProvider config={{refetchAllOnWindowFocus: false, retry: 0}}>
    <App />
  </ReactQueryConfigProvider>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()