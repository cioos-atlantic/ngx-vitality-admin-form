import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';


const basename =  (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? "/" : "/vitality"
const homeProps = {
  body: "home"
};
const aboutProps = {
  body: "about"
}
const requestProps = {
  body: "request"
}


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
    <Routes>
        <Route path="*" element= {<App {...homeProps} />} />
        <Route path="/about" element={<App {...aboutProps} />} />
        <Route path="request" element={<App {...requestProps} />} />
        </Routes>
    </BrowserRouter> 
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
