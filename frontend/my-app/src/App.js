import logo from './logo.svg';
import './App.css';
import { useState } from 'react'; 
function App() {

  const[message, setMessage] = useState("");
  const[reply, setReply] = useState("");

  const callMethod = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      console.log("data from api ", data)
      setReply(data.reply);

      console.log("api called ", message)
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
  <div>
    <input placeholder="Enter your message..." type='text' onChange={(e)=>setMessage(e.target.value)}></input>
    <p>{reply}</p>

    <button onClick={() => callMethod()}>Send</button>
  </div>
  );
}

export default App;
