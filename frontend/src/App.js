import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './component/MainPage';
import ExtraPage from './component/ExtraPage';


/*************** 양식 ***************/
/**********************************/




function App() {
	return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/extra-page" element={<ExtraPage />} />
            </Routes>
        </Router>
    );
}

export default App;














