import Web3Provider from "./providers/Web3Provider";
import { RouterProvider } from "react-router-dom";
import {routes} from "./routes/routes"
import React from "react";

const App = () => {
  return (
    // Wrap the app in Web3Provider to provide web3 state globally
    <Web3Provider>
        <RouterProvider router={routes}/>
    </Web3Provider>
  );
};

export default App;