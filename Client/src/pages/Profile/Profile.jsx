/* eslint-disable no-unused-vars */
import React from 'react'
import LeftSidebar from '../../components/LeftSideBar/LeftSideBar'
import RightSidebar from '../../components/RightSideBar/RightSideBar';

export const Profile = () => {
    return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="px-6">
              <LeftSidebar />
            </div>
            <div className="col-span-2 border-x-2 border-t-slate-800 px-6">
              <div className="flex justify-between items-center">
                <img
                //   src={userProfile?.profilePicture}
                  alt="Profile Picture"
                  className="w-12 h-12 rounded-full"
                />
                {/* {currentUser._id === id ? ( */}
                  <button
                    className="px-4 -y-2 bg-blue-500 rounded-full text-white"
                    // onClick={() => setOpen(true)}
                  >
                    Edit Profile
                  </button>
                {/* ) : currentUser.following.includes(id) ? ( */}
                  <button
                    className="px-4 -y-2 bg-blue-500 rounded-full text-white"
                    // onClick={handleFollow}
                  >
                    Following
                  </button>
                {/* ) : ( */}
                  <button
                    className="px-4 -y-2 bg-blue-500 rounded-full text-white"
                    // onClick={handleFollow}
                  >
                    Follow
                  </button>
                {/* )} */}
              </div>
              {/* <div className="mt-6">
                {userTweets &&
                  userTweets.map((tweet) => {
                    return (
                      <div className="p-2" key={tweet._id}>
                        <Tweet tweet={tweet} setData={setUserTweets} />
                      </div>
                    );
                  })}
              </div> */}
            </div>
    
            <div className="px-6">
              <RightSidebar />
            </div>
          </div>
          {/* {open && <EditProfile setOpen={setOpen} />} */}
        </>
      );
}
