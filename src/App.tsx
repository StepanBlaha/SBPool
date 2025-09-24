import AppRoutes from './routes'
import { BrowserRouter } from 'react-router-dom';
import "./App.css"
import PoolTable from './components/PoolTable/PoolTable';

function App() {

  return (
    <div className='App'>
      <BrowserRouter>
        <div id="wrap">
      <div id="hud">
        <div style={{display:'flex',gap:14,alignItems:'center',flexWrap:'wrap'}}>
          <button id="resetBtn" onClick={() => document.dispatchEvent(new CustomEvent('POOL_RESET'))}>
            Reset Rack
          </button>
          <div id="powerWrap" title="Shot power">
            <div id="powerBar"></div>
          </div>
          <div id="inst">Move mouse to aim • Press & hold to ready • Pull back to charge • Release to shoot</div>
        </div>
      </div>
      <PoolTable />
    </div>
      </BrowserRouter>
    </div>
  )
}

export default App
