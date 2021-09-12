import React, { useState, useEffect } from 'react';

function SpotifySearch() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData =  async () => {
     const result = await fetch('http://localhost:3001/spotify/reccomend',
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Credentials": true
        }
      })
      var car = await result.json()
      setData(await car)
    }
    fetchData();
  },[]);

  return (
    <ul>
      {data.map(item => (
        <li key={item.objectID}>
          <a href={item.preview_url}>{item.name}</a>
        </li>
      ))}
    </ul>
  );
}

export default SpotifySearch