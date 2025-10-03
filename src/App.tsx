import AppRoutes from './routes'
import { BrowserRouter } from 'react-router-dom';
import "./App.css"

function App() {

  return (
    <div className='App'>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </div>
  )
}

export default App
