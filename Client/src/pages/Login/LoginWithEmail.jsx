import React from 'react'

import { Link } from 'react-router-dom'
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/base.css';
import { PlayIcon } from '@vidstack/react/icons';
import { MediaPlayer, MediaProvider} from '@vidstack/react';
import {
  DefaultAudioLayout,
  defaultLayoutIcons,
  DefaultVideoLayout,
  DefaultPlayButton
} from '@vidstack/react/player/layouts/default';
import Home from '../../Home';

 
const getGoogleAuthUrl = () => {
    const {VITE_GOOGLE_CLIENT_ID, VITE_GOOGLE_REDIRECT_URI} = import.meta.env
    const url = `https://accounts.google.com/o/oauth2/v2/auth`
    const query = {
        client_id: VITE_GOOGLE_CLIENT_ID,
        redirect_uri: VITE_GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ].join(' '),
        prompt: 'consent',
        access_type: 'offline',
    }
    console.log(query.client_id)
    console.log(query.redirect_uri)
    const queryString = new URLSearchParams(query).toString()
    return `${url}?${queryString}`
}

const googleOAuthUrl = getGoogleAuthUrl()

export default function LoginWithEmail() {
  const isAuthenticated = Boolean(localStorage.getItem('access_token'))
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    window.location.reload()
  }
    return (
        <>
          {/* <div>
            <span>
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </span>
            <span>
              <img src={reactLogo} className="logo react" alt="React logo" />
            </span>
            
          </div> */}
            {/* <h2>Video streaming</h2>
                <video controls width={500}  >
                  <source 
                  src="http://localhost:4000/static/video-stream/6c423fe6f8d8d1d9f9c499300.mp4"
                  type='video/mp4'
                  />
                  </video>
            <h2>HLS streaming</h2>
            <MediaPlayer 
              title="Sprite Fight" 
              src="http://localhost:4000/static/video-hls/PPvoCHx3tCQrrWw2NAnS3/master.m3u8"
              aspectRatio= {16/9}>
            <MediaProvider />
              <DefaultVideoLayout 
                thumbnails="https://image.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU/storyboard.vtt" 
                icons= {defaultLayoutIcons}/>
            </MediaPlayer> */}
          <h2 className='underline center'>Google OAuth 2.0</h2>
          <p className="read-the-docs">
            {isAuthenticated ? 
            ( <>
                {/* <Home /> */}
                <span> Login success </span> 
                <button onClick={ logout }>Logout</button> 
              </>
            ) : (
              <Link to= {googleOAuthUrl}>Login with google</Link>
            )
            }
          </p>
        </>
      )
}