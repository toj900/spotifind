
import React, { useState, useEffect } from 'react';
function SpotifyArtists() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [artist, setArtist] = useState([]);
 
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(`http://localhost:3001/spotify/artist?name=${query}&type=artist`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Access-Control-Allow-Credentials": true
          }
        })
      var artists = await result.json()
      console.log(artist)
      // console.log(car.images[0].url)
      console.log(artists)
      if (artists !== '[]' && artists !== null) {
        setData(await artists.artists.items)
        // console.log(artists.artists.items[0].images[0].url)
      }
    }
    fetchData();
  }, [query]);

  const onFocus = () => setShowResults(true)
  const onBlur = () => setShowResults(false)

  const handleClick = (name) => {
    if(!(artist.find(item => item.id===name.id))){
      setArtist(artist => [...artist, name])
    }
    // setGenres(name.genres)
    setQuery('')
  }
  const handleRemoveItem = (e) => {
    
    const name = e.target.getAttribute("name")
     setArtist(artist.filter(item => item.id !== name));
   };

  return (
    <div className="search">

      <div className="search-container">
        <div className="search-input">
          <input
            onFocus={onFocus}
            onBlur={onBlur}
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by artist..."
          />
        </div>
        <ul className="search-list" >
          {showResults && query ?
            <div className="content-layout" >
              {data.map(item => (
                <li key={item.objectID} onMouseDown={() => handleClick(item)}>
                  {item.images[0] ? <img style={{borderRadius: 7}}src={item.images[0].url} alt={item.name} ></img>
                    : <img src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/b5/b599127509772f2125568318a38f24e64881de61_full.jpg" alt="Default Profile" ></img>}
                  <div className="content-layout">
                    <div className="title">{item.name}</div>
                    <div className="description">{item.genres[0]}</div>
                  </div>
                </li>
              ))}
            </div> : null}
        </ul>
      </div>
      {artist   ?
        <div className="search-res">
           {artist.map( e =>(<div className="search-results">{ e.name }<img src="https://www.breakthrubev.com/Presentation/WirtzBev/includes/images/x-mark.png" alt="x" name={e.id} onClick={handleRemoveItem} ></img></div>))}
        </div>
        : null}
    </div>
  );
}

export default SpotifyArtists
/* <a href={item.external_urls.spotify}>{item.name}</a> */ 

// const Results = () => (
//   <div className="card">
//     <div className="content-layout" >
//       {data.map(item => (
//         <li key={item.objectID} >
//           {item.images[0] ? <img src={item.images[0].url} alt="Girl in a jacket" ></img>
//             : <img src="https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/b5/b599127509772f2125568318a38f24e64881de61_full.jpg" alt="Girl in a jacket" ></img>}
//           <div className="content-layout">
//             <div className="title">{item[0].name}</div>
//             <div className="description">{item.genres[0]}</div>
//           </div>
//         </li>
//       ))}
//     </div>
//   </div>
// )
