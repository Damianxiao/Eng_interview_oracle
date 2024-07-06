import React, { useState, useEffect } from 'react';
import ethers from 'ethers'; 
import axios from 'axios'


function ContractStatus({}) {
  const [owner, setOwner] = useState('');
  const [requestCount, setRequestCount] = useState(0);
  const [minFee, setMinFee] = useState(0);

  useEffect(() => {
      loadContractStatus();
  }, []);

  const loadContractStatus = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:3001/contract');
      const data = response.data
      setOwner(data.ownerAddress)
      setMinFee(data.minFee)
      setRequestCount(data.reqCount-1)
    } catch (error) {
      console.error('Error loading contract status:', error);
    }
  };

  return (
    <div className="contract-status-container">
      <h2>Contract Status</h2>
      <div className="status-item">
        <strong>Owner:</strong> {owner}
      </div>
      <div className="status-item">
        <strong>Request Id:</strong> {requestCount}
      </div>
      <div className="status-item">
        <strong>Minimum Fee:</strong> {minFee}
      </div>
    </div>
  );
}

export default ContractStatus;
