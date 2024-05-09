/* eslint-disable prettier/prettier */
import { HashRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import MainArea from './routes/MainArea'
import Settings from './routes/Settings'

export default function App(): JSX.Element {
    return (
        <div className="app">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<MainArea />} />
                    <Route path="/settings" element={<Settings />} />
                </Routes>
            </HashRouter>
        </div>
    )
}
