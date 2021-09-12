import React, { useState, useEffect, useRef, useReducer } from 'react';
import sad from './sad.png';
import { TiHome } from 'react-icons/ti';
import { MdLibraryMusic, MdAccountCircle, MdSearch, MdClear } from 'react-icons/md'
import '../../Themes/Example.scss';

function useComponentVisible(initialIsVisible) {
    const [isComponentVisible, setIsComponentVisible] = useState(
        initialIsVisible
    );
    const ref = useRef(null);

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
function useTracks(initialUrl, initialData, searchType) {
    const [data, setData] = useState(initialData)
    const [url, setUrl] = useState(initialUrl)
    // console.log(searchType)
    const [isError, setIsError] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            setIsError(false);
            try {
                const result = await fetch(url,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Credentials": true
                        }
                    })
                var results = await result.json()
                console.log(results)
                if (searchType === 'tracks') {
                    setData(await results.tracks.items)
                }

            } catch (error) {
                setIsError(true)
            }
        }
        fetchData();
    }, [url]);
    return [{ data, isError }, setUrl]
}
const getGenreReducer = (state, action) => {
    // return state.filter((item, index)=> index !== action.index)
    switch (action.type) {
        case 'FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false
            };
        case 'FETCH_SUCCESS':
            console.log('action payload', state)
            return {
                ...state,
                isLoading: false,
                isError: false,
                generic: action.payload,
            };
        case 'FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
                generic: [null]
            };
        default:
            throw new Error();
    }
}

function GetGenres(initialUrl, initialData) {
    const [url, setUrl] = useState(initialUrl)
    const [state, dispatch] = useReducer(getGenreReducer, {
        isLoading: false,
        isError: false,
        generic: initialData,
    });
    useEffect(() => {
        const fetchData = async () => {
            dispatch({ type: 'FETCH_INIT' });
            try {
                const result = await fetch(url,
                    {
                        method: "GET",
                        credentials: "include",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Credentials": true
                        }
                    })
                const results = await result.json()
                console.log(results)
                dispatch({ type: 'FETCH_SUCCESS', payload: results });
            } catch (error) {
                dispatch({ type: 'FETCH_FAILURE' });
            }
        }
        fetchData();
    }, [url]);
    return [state, setUrl]
}
const queryReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_GENRE':
            return {
                ...state,
                genres: [...state.genres, action.value]
            }
        case 'REMOVE_GENRE':
            console.log(action.value, state.genres)
            return {
                ...state,
                genres: state.genres.filter(item => item.id !== action.value)
            }

        default: return state;
    }
}

const Example = () => {
    // const map1= tracks.map(x => (x.artists[0].id))
    // console.log(map1)
    //  This is for the submit to get reccomendations ^^^
    const [query, setQuery] = useState('');
    const [artist, setArtists] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [selectStatus, setSelectStatus] = useState([]);
    const { ref, isComponentVisible, setIsComponentVisible } = useComponentVisible(false);
    const [{ data }, getTracks] = useTracks(`http://localhost:3001/spotify/artist?name=${query}&type=track`, [], 'tracks')
    const [{ generic }, getGenres] = GetGenres(`http://localhost:3001/spotify/genres?id=${artist}`, [null])
    const [{ genres }, dispatch] = useReducer(queryReducer, { genres: [] });
    let selectedStyle = { backgroundColor: '#5DADE2', maxWidth: 326, minWidth: 300, color: '#D6DBDF', overflow: 'hidden' }
    const [value, onChange] = useState(1);

    useEffect(() => {
        const ele = document.querySelector('.buble');
        if (ele) {
            ele.style.left = `${Number(value / 4)}px`;
        }
    })
    useEffect(() => {
        if (generic[0] !== null) {
            dispatch({ type: 'ADD_GENRE', value: generic })
            getGenres('')

        }
    }, [generic])

    const handleChange = (e) => {
        setQuery(e.target.value)
        getTracks(`http://localhost:3001/spotify/artist?name=${e.target.value}&type=track`)
    }

    const onFocus = () => { setIsComponentVisible(true) }
    const handleClick = async (track) => {
        if (!(tracks.find(item => item.id === track.id))) {
            setTracks(tracks => [...tracks, track])
            setSelectStatus(select => [...select, track.id])
            // if (!(artist.find(item => item === track.artists[0].id))) {
            // setArtists(artist =>[...artist, track.artists[0].id])
            // getGenres(`http://localhost:3001/spotify/genres?id=${track.artists[0].id}`)
            // }
        }

        else {
            setSelectStatus(selectStatus.filter(item => item !== track.id));
            setTracks(tracks.filter(item => item.id !== track.id));
            // setArtists(artist.filter(item => item.id !== track.id))
            // dispatch({type:'REMOVE_GENRE', value: track.artists[0].id})
        }
    }
    return (
        <div style={{ height: '100vh' }} >

            <div className=" container__row" style={{ zIndex: 1, margin: 0, padding: 0, }}>

                <div className="container__col-lg-1  container__col-md-4 container__col-sm-12 container__col-12 hidden-lg-down" style={{ height: 70 }} >
                    <div className='side'>
                        <div className='icon'>
                            <img src={sad} alt='logo' style={{ maxWidth: 50 }}></img>

                        </div>
                    </div>
                </div>
                <div className="container__col-lg-2  container__col-md-4 container__col-sm-12 container__col-12 hidden-lg-down" style={{ backgroundColor: '#212529' }}></div>
                <div className="container__col-lg-6  container__col-md-6 container__col-sm-12 container__col-12" style={{ backgroundColor: '#212529' }} >
                    <div className={isComponentVisible ? 'active' : null}>
                        <div className="search" ref={ref} >
                            <div className="search-input">
                                <MdSearch style={{ position: 'relative', top: 4, fontSize: 18 }} />

                                <input
                                    onFocus={onFocus}
                                    type="text"
                                    value={query}
                                    onChange={(e) => handleChange(e)}
                                    placeholder="Search by track..."
                                />
                            </div>
                            <ul className="search-list" ref={ref} style={{ position: 'absolute' }}>
                                {isComponentVisible && query ?
                                    <div className="content-layout">
                                        {data.map((item, index) => (
                                            <li key={index} style={selectStatus.find(element => element === item.id) === item.id ? selectedStyle : null} onClick={() => handleClick(item)} >
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

                </div>
                <div className="container__col-lg-2  container__col-md-6 container__col-sm-12 container__col-12 hidden-md-down" style={{ backgroundColor: '#212529' }}></div>

                <div className="container__col-lg-1  container__col-md-4 container__col-sm-12 container__col-12 hidden-lg-down" style={{ height: 70, backgroundColor: '#212529' }} >

                    <MdAccountCircle style={{ fontSize: '40', color: '#5DADE2' }} />

                </div>


            </div>
            <div className="container__row" style={{ backgroundColor: '#212529' }} >
                <div className="container__col-lg-1 hidden-lg-down" >
                    <div className='side'>
                        <div className='icon'>
                            <MdAccountCircle />
                            <p>Account</p>
                        </div>
                        <div className='icon'>
                            <TiHome />
                            <p>Home</p>
                        </div>
                        <div className='icon'>

                            <MdLibraryMusic />
                            <p>Discover</p>
                        </div>
                    </div>
                </div>


                <div className="container__col-lg-10  container__col-md-6 container__col-sm-12 container__col-12" style={{ backgroundColor: '#212529', height: 460 }} >
                    {tracks ?
                        <div className="search-res" >
                            <div className='header'>Tracks</div>
                            {tracks.map(e => (
                                <div className="search-results">
                                    {e.album.images[0] ? <  img src={e.album.images[0].url} alt={e.name} ></img> : <img src="https://static.thenounproject.com/png/621426-200.png" alt="Default Profile" ></img>}
                                    <div className='title'>{e.name}
                                        {/* <img className='imagine' src="https://www.breakthrubev.com/Presentation/WirtzBev/includes/images/x-mark.png" alt="x" name={e.id} onClick={() => handleClick(e)} ></img> */}
                                        <div className='imagine'><MdClear style={{ fontSize: 20 }} onClick={() => handleClick(e)} /></div>
                                    </div>
                                    <div className='description'>{e.artists[0].name}</div>

                                </div>
                            ))}
                        </div>
                        : null}

                </div>
                {/* <div className="container__col-lg-5  container__col-md-6 container__col-sm-12 container__col-12" style={{backgroundColor:'#212529', height:499}}>
                    {genres ?
                        <div className="search-res">
                            <div className='header'>Genres</div>
                            
                            {genres.map((art) => (
                                <div className='search-results'>
                                    {art.genres.map((names) => <div className='cirlce'>{names}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        : null}
                </div> */}
                <div className="container__col-lg-1 hidden-lg-down" style={{ backgroundColor: '#212529', overflow: 'hidden' }} ></div>

            </div>
            <div className="container__row" style={{ height: 'calc(100vh - 530px)', backgroundColor: '#212529' }} >
                <div className="container__col-lg-1 hidden-lg-down" style={{ backgroundColor: '#2a2e32', overflow: 'hidden' }}></div>
                <div className="container__col-lg-10  container__col-md-6 container__col-sm-12 container__col-12" style={{ backgroundColor: '#212529', height: 100 }} >
                    <div className="slider-parent">
                        <input type="range" min="1" max="100" value={value} className='slider'
                            onChange={({ target: { value: radius } }) => {
                                onChange(radius);
                            }}
                        />
                        <div className="buble">
                            {value}
                        </div>
                    </div>

                </div>

            </div>


        </div>
    )
}

export default Example
