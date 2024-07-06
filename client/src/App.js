import './App.css';
import { useEffect ,useState} from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.js'
import Compute from './components/Compute.js'
import RequestComponent from './components/RequestComponent.js';
import ContractStatus from './components/ContractStatus.js';


function App() {
  const [walletAddress,setWallet] = useState("")

  useEffect(()=>{
    addWalletListener();
    getWalletAddress();
  },[]);

  function addWalletListener(){
    if (window.ethereum){
      window.ethereum.on("accountsChanged",(account)=>{
        if (account.length >0){
          setWallet(account[0])
        }else{
          setWallet("")
        }
      })

    }else{
      alert("please install metamask")
    }
  }

  const getWalletAddress = async()=>{
    if (window.ethereum){
      try{
        const accounts = await window.ethereum.request({ method:'eth_requestAccounts'});
        setWallet(accounts[0]);
      } catch(error){
        console.log('Error connecting to wallet!',error)
      }
    }
  }



  return (
    <div id="container">
      <Router >
        <Navbar onConnectWallet={getWalletAddress} address={walletAddress} />
        <Compute address={walletAddress}/>
        <ContractStatus />
        <RequestComponent />
        
        <Routes>
          
      </Routes>
      </Router>
      
    </div>
  );
}

export default App;
