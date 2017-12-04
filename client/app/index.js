import Inferno from 'inferno'
let render = Inferno.render
import { Router, Route } from 'inferno-router'
import createBrowserHistory from 'history/createBrowserHistory'
const browserHistory = createBrowserHistory()

const C = () => (  //a very simple component
  <span>
    <p>C was rendered {new Date() + ''}</p>
  </span>
)

const routes = (
  <Router history={browserHistory}>
    <Route path='/' component={ C } />
  </Router>
)

const renderApp = () => {
  render(routes, document.getElementById('root'))
}

renderApp()
renderApp()
