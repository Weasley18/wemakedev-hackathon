import { Routes, Route } from 'react-router-dom';

import { Dashboard } from './pages/dashboard';
import { HuntCreation } from './pages/hunt-creation';
import { HuntReview } from './pages/hunt-review';
import { HuntResults } from './pages/hunt-results';
import { HuntHistory } from './pages/hunt-history';
import { ThreatIntel } from './pages/threat-intel';
import { Analytics } from './pages/analytics';
import { Settings } from './pages/settings';
import { NotFound } from './pages/not-found';
import { RootLayout } from './layouts/root-layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="hunt/create" element={<HuntCreation />} />
        <Route path="hunt/review/:id" element={<HuntReview />} />
        <Route path="hunt/results/:id" element={<HuntResults />} />
        <Route path="hunt/history" element={<HuntHistory />} />
        <Route path="intel" element={<ThreatIntel />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
