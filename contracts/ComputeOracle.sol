pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ComputeOracle is Ownable{
    
    constructor(address initialOwner)
        Ownable(initialOwner)
    {}

    struct ComputeRequest{
        uint256 fee;
        bytes reqData;
        string result;
    }

    uint256 public requestCount;
    uint256 public constant MIN_FEE = 0.01 ether;
    mapping(uint256 => ComputeRequest) public requests; 

    event Request(uint256 id,address requester,uint256 fee,bytes reqData);
    
    function request(bytes calldata _reqData) external payable returns(bool){
        require(msg.value >= MIN_FEE,"insuffcient fee!");
        require(_reqData.length > 0,"data is nil!");
        requests[requestCount] = ComputeRequest(msg.value,_reqData,"");
        emit Request(requestCount,msg.sender,msg.value,_reqData);
        requestCount++;
        return true;
    }


    function callBack(uint256 _reqId,string memory _result) external onlyOwner {
        require(_reqId <= requestCount,"reqId is invalid");
        requests[_reqId].result = _result;
    }
}

