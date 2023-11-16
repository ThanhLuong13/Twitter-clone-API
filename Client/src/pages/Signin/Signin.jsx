// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react'
import axios from "axios";

// import { useDispatch } from "react-redux";
// import { loginStart, loginSuccess, loginFailed } from "../../redux/userSlice";


export const Signin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    // dispatch(loginStart());
    try {
      const res = await axios.post("/users/login", { email, password });
      console.log(res)
      // dispatch(loginSuccess(res.data));
      // navigate("/");
    } catch (err) {
      console.log(err);
      // dispatch(loginFailed());
    }
  };

  return (
    <form className="bg-gray-200 flex flex-col py-12 px-8 rounded-lg w-8/12 md:w-6/12 mx-auto gap-10">
        <h2 className="text-3xl font-bold text-center">Login</h2>
        <input
        onChange={(e) => setEmail(e.target.value)}
        type="text"
        placeholder="email"
        className="text-xl py-2 rounded-full px-4"
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="password"
        className="text-xl py-2 rounded-full px-4"
      />

      <button
        className="text-xl py-2 rounded-full px-4 bg-blue-500 text-white"
        onClick={handleLogin}
      >
        Sign in
      </button>
      <p className="text-center text-xl"> Don&apos;t have an account?</p>

      <input
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        placeholder="username"
        className="text-xl py-2 rounded-full px-4"
      />
      <input
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="email"
        // required
        className="text-xl py-2 rounded-full px-4"
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="password"
        className="text-xl py-2 rounded-full px-4"
      />

      <button
        // onClick={handleSignup}
        className="text-xl py-2 rounded-full px-4 bg-blue-500 text-white"
        type="submit"
      >
        Sign up
      </button>
    </form>
  )
}
