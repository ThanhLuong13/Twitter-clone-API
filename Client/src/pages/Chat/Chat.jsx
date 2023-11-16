import React, { useEffect, useState } from "react";
import socket from "../../socket";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

const profile = JSON.parse(localStorage.getItem("profile"));
const usernames = [
  {
    name: "test_user1",
    value: "user6526c181e69819f21d5b82e0",
  },
  {
    name: "user2",
    value: "user652e3d9f38072c3014616a9e",
  },
  {
    name: "test_user2",
    value: "user6526ca75f79c1bb75ce5b698",
  },
  {
    name: "thanh_37",
    value: "6544b0cfdcf2f878214e8e91",
  },
  {
    name: "thanh_35",
    value: "652ac72c5873157e65e26868",
  },
];
const LIMIT = 10;
const PAGE = 1;
export default function Chat() {
  const [value, setValue] = useState("");
  const [conversations, setConversations] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [pagination, setPagination] = useState({
    page: PAGE,
    total_page: 0,
  });
  useEffect(() => {
    socket.on("receive_message", (data) => {
      const { payload } = data;
      setConversations((conversations) => [...conversations, payload]);
    });

    socket.on("connect_error", (err) => {
      console.log(err.data); // prints the message associated with the error
    });

    socket.on("disconnect", (reason) => {
      console.log(reason);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (receiver) {
      axios
        .get(`/conversation/receiver/${receiver}`, {
          baseURL: "http://localhost:4000",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            limit: LIMIT,
            page: PAGE,
          },
        })
        .then((res) => {
          const { conversation, page, total } = res.data;
          setConversations(conversation);
          setPagination({
            page,
            total_page: total,
          });
        });
    }
  }, [receiver]);

  const fetchMoreConversations = () => {
    if (receiver && pagination.page < pagination.total_page) {
      axios
        .get(`/conversation/receiver/${receiver}`, {
          baseURL: "http://localhost:4000",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            limit: LIMIT,
            page: pagination.page + 1,
          },
        })
        .then((res) => {
          const { conversation, page, total } = res.data;
          setConversations((prev) => [...prev, ...conversation]);
          setPagination({
            page,
            total_page: total,
          });
        });
    }
  };

  // Gui tin nhan
  const send = (e) => {
    e.preventDefault();
    setValue("");
    const conversation = {
      content: value,
      sender_id: profile._id,
      receiver_id: receiver,
    };
    socket.emit("send_massage", {
      payload: conversation,
    });
    setConversations((conversations) => [
      {
        ...conversation,
        _id: new Date().getTime(),
      },
      ...conversations,
    ]);
  };
  // Lay profile
  const getProfile = (username) => {
    axios
      .get(`users/${username}`, {
        baseURL: "http://localhost:4000",
      })
      .then((res) => {
        setReceiver(res.data.result._id);
      });
  };
  return (
    <div className="bg-grey">
      <h1 className="flex justify-center">Chat</h1>
      <div>
        {usernames.map((username) => (
          <div key={username.name}>
            <button onClick={() => getProfile(username.value)}>
              {username.name}
            </button>
          </div>
        ))}
      </div>
      <div
        id="scrollableDiv"
        style={{
          height: 300,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {/*Put the scroll bar always on the bottom*/}
        <InfiniteScroll
          dataLength={conversations.length}
          next={fetchMoreConversations}
          style={{ display: "flex", flexDirection: "column-reverse" }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={pagination.page < pagination.total_page}
          loader={<h4>Loading...</h4>}
          scrollableTarget="scrollableDiv"
        >
          {conversations.map((conversation, index) => (
            <div key={conversation._id}>
              <div className="message-container">
                <p
                  className={
                    "message " +
                    (conversation.sender_id === profile._id
                      ? "message-right bg-indigo-500 text-white"
                      : "message-left bg-gray-100 text-gray-800")
                  }
                >
                  {conversation.content}
                </p>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      </div>
      {/* <div className='bg-white rounded-lg shadow-md p-4'> 
            {
                conversations.map((conversation, index) => (
                    <div key={conversation._id} >
                        <div className='message-container'>
                            <p className={'message ' + (conversation.sender_id === profile._id ? 'message-right bg-indigo-500 text-white' : 'message-left bg-gray-100 text-gray-800')}> 
                                {conversation.content} 
                            </p>
                        </div>
                    </div>
                ))
            }
        </div> */}
      <form className="flex justify-center mt-6" onSubmit={send}>
        <input
          className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
          type="text"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <button
          className=" bg-indigo-500 text-white px-4 py-2 rounded-md ml-2"
          type="submit"
        >
          Send
        </button>
      </form>
    </div>
  );
}
