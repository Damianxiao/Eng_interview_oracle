import React, { useState } from 'react';
import axios from 'axios';
const RequestComponent = () => {
    const [reqId, setReqId] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const request = { reqId };
            const response = await axios.post('http://127.0.0.1:3001/requests', request, {
                headers: {
                  'Content-Type': 'application/json; charset=utf-8'
                }
              });
            const data = await response.data;
            console.log(response)
            setResult(data.result);
        } catch (error) {
            console.error("Error fetching result for reqId:", reqId, error);
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="request-component">
            <h2>Request Result</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={reqId}
                    onChange={(e) => setReqId(e.target.value)}
                    placeholder="Enter reqId"
                />
                <button type="submit">Submit</button>
            </form>
            {isLoading && <div>Loading...</div>}
            {result && <div>{result}</div>}
        </div>
    );
};

export default RequestComponent;
