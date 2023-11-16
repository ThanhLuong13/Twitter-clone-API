import { createBrowserRouter } from "react-router-dom";
import Home from "./Home";

import { Profile } from "./pages/Profile/Profile";
import { Explore } from "./pages/Explore/Explore";
import { Signin } from "./pages/Signin/Signin";
import { Layout } from "./pages/Layout/Layout";
import Error from "./pages/Error/Error";
import LoginWithEmail from "./pages/Login/LoginWithEmail";
import Login from "./Login";
import Chat from "./pages/Chat/Chat";

// const router = createBrowserRouter([
//     {
//       path: "/",
//       element: <div><Home /></div>,
//     },
//     {
//         path: "/login/oauth",
//         element: <Login />,
//     }
//     ]);

    const router = createBrowserRouter([
      {
        path: "/",
        errorElement: <Error />,
        element: <Layout />,
        children: [
          {
            path: "/home",
            element: <Home />,
          },
          {
            path: "/profile/:id",
            element: <Profile />,
          },
          {
            path: "/explore",
            element: <Explore />,
          },
          {
            path: "/",
            element: <LoginWithEmail />,
            },
          {
          path: "/login/oauth",
          element: <Login />,
          },
          {
            path: "/signin",
            element: <Signin />,
          },
          {
            path: "/signout",
            element: <Signin />,
          },
          {
            path: '/chat',
            element: <Chat />
          }
        ],
      },
    ]);

  export default router