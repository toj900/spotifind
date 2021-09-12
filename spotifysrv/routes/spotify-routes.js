
const router = require("express").Router();
const passport = require("passport");
const refresh = require('passport-oauth2-refresh');
const fetch = require('node-fetch');
global.Headers = fetch.Headers;
const userModel = require('../models/users');

const CLIENT_HOME_PAGE_URL = "http://localhost:3000/";

async function spotify_request(user, url, requestOptions) {
    try {
        const response = await fetch(url, requestOptions);
        if (response.status === 401) {
            console.log(response.status)
            const refreshed = await refresh_request(user)

            //console.log(refreshed.accessToken)
            const response2 = await fetch(url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${refreshed.accessToken}`
                },
                redirect: 'follow'
            });
            const json2 = await response2.json();
            console.log('sending json')
            return await json2
        }
        if (response.ok) {
            const json = await response.json();
            console.log('sending json')
            return await json
        }

    } catch (error) {
        console.log(error);
        return await error
    }
};

function get_reccomend(user, limit, market, seed_artists, seed_genres, seed_tracks) {

    myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${user.accessToken}`);

    var url = new URL('https://api.spotify.com/v1/recommendations')

    // seed_genres=["dubstep","edm","electro_house","electronic_trap","future_bass","gaming_edm"]

    params = { limit: `${limit}`, market: `${market}`, seed_artists: [`${seed_artists}`], seed_genres: `${seed_genres}`, seed_tracks: [`${seed_tracks}`] }
    url.search = new URLSearchParams(params).toString();

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    reccomend = spotify_request(user, url, requestOptions)
    return reccomend
}

function get_artist(user, name, type) {

    myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${user.accessToken}`);

    var url = new URL('https://api.spotify.com/v1/search')

    // seed_genres=["dubstep","edm","electro_house","electronic_trap","future_bass","gaming_edm"]
    params = { q: `${name}`, type: `${type}`, limit: 10 }
    url.search = new URLSearchParams(params).toString();

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    artist = spotify_request(user, url, requestOptions)
    return artist
}
function get_genres(user, id) {

    myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${user.accessToken}`);
    var url = new URL(`https://api.spotify.com/v1/artists/${id}`)
    url.search = new URLSearchParams(params).toString();

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };
    genres = spotify_request(user, url, requestOptions)
    return genres
}
const refresh_request = (user) => {
    return new Promise((resolve, reject) => {
        refresh.requestNewAccessToken('spotify', user.refreshToken, (err, accessToken, refreshToken) => {
            userModel.findOneAndUpdate({ profile: user.profile }, { $set: { 'accessToken': accessToken } }, { new: true }, (err, doc) => {
                if (err) {
                    console.log("Something wrong when updating data!");
                    return reject(error)
                }
                console.log(`Refreshing Access for: ${doc.profile}`);
                return resolve(doc)
            });
        })
    })
}

router.get('/reccomend', async (req, res) => {
    var user = req.user
    var limit = '10', market = 'ES', seed_artists = ['5lCekoJW9jNq01B1wiqdAb'], seed_tracks = ['6BdICoTty55qOtn4sOwgFk'], seed_genres = ['dubstep', 'edm']
    spotify = await get_reccomend(user, limit, market, seed_artists, seed_genres, seed_tracks)

    res.send(await spotify.tracks)
})

router.get('/artist', async (req, res) => {
    var type = req.query.type
    console.log(type)
    var name = req.query.name
    var user = req.user
    if (name === null) {
        console.log('okay')
        res.send({ name: "nothing" })
    }
    var accessToken = req.user.accessToken
    artist = await get_artist(user, name, type)
    res.send(await artist)
})

router.get('/genres', async (req, res) => {
    // var type = req.query.type
    // console.log(type)
    var id = req.query.id
    var user = req.user
    // if (name === null) {
    //     console.log('okay')
    //     res.send({ name: "nothing" })
    // }
  
    genres = await get_genres(user, id)
    res.send(await genres)
})

module.exports = router;