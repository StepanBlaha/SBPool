import AppRoutes from './routes'
import { BrowserRouter } from 'react-router-dom';
import "./App.css"
import PoolTable from './components/PoolTable/PoolTable';

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
