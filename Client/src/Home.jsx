import React from 'react'
import LeftSidebar from './components/LeftSideBar/LeftSideBar'
import RightSidebar from './components/RightSideBar/RightSideBar'
import MainTweet from './components/MainTweet/MainTweet'

function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4" >
      <div className="px-6">
        <LeftSidebar />
      </div>
      <div className="col-span-2 border-x-2 border-t-slate-800 px-6">
        <MainTweet />
          </div>
      <div className="px-6">
        <RightSidebar />
      </div>
    </div>
  )
}

export default Home