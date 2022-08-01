import React from 'react';
import './App.css';
import {Route, Routes, useNavigate} from "react-router-dom";
import Main from "pages/Main";
import Words from "pages/Words";
import RandomQuiz from "pages/RandomQuiz";
import { Button } from 'antd';

function App() {
  const navigate = useNavigate();
  return (
    <div>
      <Button onClick={() => navigate(-1)}>back</Button>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/words" element={<Words />} />
        <Route path="/quiz" element={<RandomQuiz />} />
      </Routes>
    </div>
  );
}

export default App;
