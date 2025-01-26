import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Wallet from "../component/Wallet";
import Application from "../component/Application";

export const routes = createBrowserRouter([
    {
        path: '/',
        element: (
            <div>
                <Wallet />
                <Application/>

            </div>
        )
    }
]);
