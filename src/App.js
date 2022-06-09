
import './App.css';
import { ConnectButton } from 'web3uikit';
import Home from './pages/Home';
import Proposal from './pages/Proposal';
import { Routes, Route } from 'react-router-dom'
import Logo from "./images/Logo.png"

function App() {
  return (
    <>
      <div className='header'>
        <img width="70px" src={Logo} alt="logo" />
        <ConnectButton />
      </div>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/proposal" element={<Proposal />}></Route>
      </Routes>
    </>
  );
}

export default App;
