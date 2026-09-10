import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJournalEntryById } from '../api/journalApi';
import { Error, Loading } from '../components/utils';

import JournalEntryLine from '../components/JournalEntryLine';
import AuditLogs from '../components/AuditLogs';
import JournalEntryHeader from '../components/JournalEntryHeader';

export default function JournalEntryDetailPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadEntry() {
    setLoading(true);
    setError(null);
    try {
      const data = await getJournalEntryById(id);
      setEntry(data.journalEntry || data);
    } catch (err) {
      setError('Journal entry not found');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntry();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;
  if (!entry) return null;

  const lines = entry.lines || [];
  const auditLogs = entry.auditLogs || [];


  return (
    <div className="max-w-2xl mx-auto p-6 space-y-3">
      <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">← Back to list</Link>

      <JournalEntryHeader entry={entry} />

      <JournalEntryLine lines={lines} totalDebit={entry.TotalDebit} totalCredit={entry.TotalCredit} />

      <AuditLogs auditLogs={auditLogs} />

    </div>
  );
}
