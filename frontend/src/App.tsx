import { useState, useEffect } from 'react'
import './App.css'

function App() {
	const [data, setData] = useState<string>("");

	useEffect(() => {
		fetch("http://192.168.86.72:8000/api/finance/test")
		.then(res => res.text())
		.then(setData)
		.catch(err => console.error(err));
	}, []);

  return (
	  <div>
	  	<h1> React Axum Test </h1>
		<p>Backend says: {data}</p>
	  </div>
  );
}

export default App
