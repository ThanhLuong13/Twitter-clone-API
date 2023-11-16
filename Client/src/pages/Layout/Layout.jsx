// eslint-disable-next-line no-unused-vars
import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/Navbar/Navbar'
import '../../../src/App.css'

export const Layout = () => {
    return (
      <div className= "md:w-10/12 mx-auto">
        <Navbar />
        <Outlet></Outlet>
      </div>
    )
  }