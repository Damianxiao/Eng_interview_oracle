import {useState} from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';




const Compute =(walletAddress) =>{
    const [expression,setExpression] = useState('');
    const [nums,setNums] = useState('');
    const navigate = useNavigate()

    const handleSubmit= async (event)=>{
        if(walletAddress.address == false){
            alert('please connect wallet first')
            return 
        }
        const numsArray = nums.split(',').map(numStr => numStr.trim());
        // console.log(nums)
        
        const data={
          nums : numsArray,
          expression:expression,
          address:walletAddress
        }
        
          // console.log(process.env.ApiUrl)
            const response = await axios.post('http://127.0.0.1:3001/compute', data, {
                headers: {
                  'Content-Type': 'application/json; charset=utf-8'
                }
              });
              console.log(response)
              const d = response.data
              if (data.flag == "error"){
                  alert(d.data)
              }else{
                alert(d.data)
              }
           
    }

    return(
        <div className="compute-container">
      <form onSubmit={handleSubmit}>
      <input
          type="text"
          value={nums}
          onChange={(e) => setNums(e.target.value)}
          placeholder="Enter numbers, separated by ,"
          className="expression-input"
        />
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Enter an expression value can replace by above array: 1 + [0] ([0] means array element 1) "
          className="expression-input"
        />
        <button type="submit" className="expression-button">
          Compute
        </button>
      </form>
    </div>
    );
  };

export default Compute