const { Router } = require("express")
import React from 'react'
import Pay from './Pay';

const App = () => {
    return(
        <Router>
            <Switch>
                <Route path="/pay">
                    <Pay />
                </Route>
                <Route path="/success>">
                <Success />
                </Route>

                
            </Switch>
        </Router>
    );
};


export default App;