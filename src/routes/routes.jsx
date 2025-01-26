import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Wallet from "../component/Wallet";
import Application from "../component/Application";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

export const routes = createBrowserRouter([
    {
        path: '/',
        element: (
            <div>
                <Navbar/>
                <Wallet />
                <Application/>
                <Footer/>
            </div>
        )
    }
]);
