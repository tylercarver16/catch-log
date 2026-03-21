import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Log from './pages/Log.jsx';
import Add from './pages/Add.jsx';
import Detail from './pages/Detail.jsx';
import Edit from './pages/Edit.jsx';
import MapView from './pages/MapView.jsx';
import Import from './pages/Import.jsx';
import ImportResults from './pages/ImportResults.jsx';
import Settings from './pages/Settings.jsx';
import Stats from './pages/Stats.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                   element={<Log />} />
        <Route path="/add"                element={<Add />} />
        <Route path="/catch/:id"          element={<Detail />} />
        <Route path="/catch/:id/edit"     element={<Edit />} />
        <Route path="/map"                element={<MapView />} />
        <Route path="/import"             element={<Import />} />
        <Route path="/import/results"     element={<ImportResults />} />
        <Route path="/stats"              element={<Stats />} />
        <Route path="/settings"           element={<Settings />} />
        <Route path="*"                   element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
