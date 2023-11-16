// eslint-disable-next-line no-unused-vars
import { RouterProvider, Outlet } from "react-router-dom";
import "./App.css";
import router from "./router";
import { useEffect } from "react";
import axios from "axios";
import { Controls } from "@vidstack/react";

// export const Layout = () => {
//   return (
//     <div className='md:w-8/12 mx-auto'>
//       <h1>Navbar</h1>
//       <Outlet></Outlet>
//     </div>
//   )
// }

function App() {
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get("/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        baseURL: "http://localhost:4000",
        signal: controller.signal,
      })
      .then((response) => {
        localStorage.setItem("profile", JSON.stringify(response.data.result));
      });
    return () => {
      controller.abort();
    };
  }, []);
  return <RouterProvider router={router} />;
}

export default App;
