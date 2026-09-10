import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from "sonner";
import JournalEntriesListPage from './pages/JournalEntriesListPage';
import CreateJournalEntryPage from './pages/CreateJournalEntryPage';
import JournalEntryDetailPage from './pages/JournalEntryDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" richColors />
      <Routes>
        <Route path="/" element={<JournalEntriesListPage />} />
        <Route path="/journal-entries/new" element={<CreateJournalEntryPage />} />
        <Route path="/journal-entries/:id" element={<JournalEntryDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
