import React, { useState, useEffect, useRef } from 'react';
// import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

function useComponentVisible(initialIsVisible) {
  const [isComponentVisible, setIsComponentVisible] = useState(
    initialIsVisible
  );
  const ref = useRef(null);

  // const handleHideDropdown = (event: KeyboardEvent) => {
  //   if (event.key === "Escape") {
  //     setIsComponentVisible(false);
  //   }
  // };

  const handleClickOutside = event => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    // document.addEventListener("keydown", handleHideDropdown, true);
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      // document.removeEventListener("keydown", handleHideDropdown, true);
      document.removeEventListener("click", handleClickOutside, true);
    };
  });

  return { ref, isComponentVisible, setIsComponentVisible };
}
function SpotifyTracks() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [artist, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectStatus, setSelectStatus] = useState([]);
  const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
  let selectedStyle = {backgroundColor: '#5DADE2',maxWidth:326,minWidth:300,color:'#D6DBDF',overflow: 'hidden'}
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(`http://localhost:3001/spotify/artist?name=${query}&type=track`,
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
      console.log(artists)
      if (artists !== '[]' && artists !== null) {
        setData(await artists.tracks.items)
      }
    }
    fetchData();
  }, [query]);

  const onFocus = () => {setIsComponentVisible(true)}

  const handleClick = (track) => {
    if (!(tracks.find(item => item.id === track.id))) {
      setTracks(tracks => [...tracks, track])
      setSelectStatus(select=>[...select,track.id])
      setArtists(artist=>[...artist,{"id":track.id,"artists":track.artists}])

    }
    else{
      setSelectStatus(selectStatus.filter(item => item !== track.id));
      setTracks(tracks.filter(item => item.id !== track.id));
      setArtists(artist.filter(item=> item.id !== track.id))
      console.log('item status')
    }
    // setQuery('')
  }


  const handleRemoveItem = (name) => {
    // const name = e.target.getAttribute("name")
    setSelectStatus(selectStatus.filter(item => item !== name.id));
    setTracks(tracks.filter(item => item.id !== name.id));
  };


  return (
    <div className="search">
      <div className={isComponentVisible ? 'active' : null}>
        <div className="search-container" ref={ref}>
          <div className="search-input">
            <input
              onFocus={onFocus}
              type="text"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search by track..."
            />
          </div>
          <ul className="search-list" ref={ref}>
            {isComponentVisible && query ?
              <div className="content-layout">
                {data.map((item, index )=> (
                  <li  key={index} style={selectStatus.find(element => element=== item.id)===item.id? selectedStyle :null} onClick={() => handleClick(item)} >
                    {item.album.images[0] ? <img src={item.album.images[0].url} alt={item.name} ></img>
                      : <img src="https://static.thenounproject.com/png/621426-200.png" alt="Default Profile" ></img>}
                    <div className="content-layout">
                      <div className="title">{item.name}</div>
                      <div className="description">{item.artists[0].name}</div>
                    </div>
                  </li>
                ))}
              </div> : null}
          </ul>
        </div>
      </div>
      <h3>Artists</h3>
      {tracks ?
        <div className="search-res">
          {/* {tracks.map(e => (<div className="search-results">{e.artists[0].name}<img src="https://www.breakthrubev.com/Presentation/WirtzBev/includes/images/x-mark.png" alt="x" onClick={() => handleClick(e)}></img></div>))} */}
          {artist.map((art)=> art.artists.map((names)=> <div className="search-results">{names.name}</div>))}

        </div>
        : null}
      <h3>Tracks</h3>
      {tracks ?
        <div className="search-res">

          {tracks.map(e => (<div className="search-results">{e.name}<img src="https://www.breakthrubev.com/Presentation/WirtzBev/includes/images/x-mark.png" alt="x" name={e.id} onClick={() => handleClick(e)} ></img></div>))}
          
        </div>
        : null}
    </div>
  )
}

export default SpotifyTracks
