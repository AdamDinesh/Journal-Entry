import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import JournalEntryForm from '../components/JournalEntryForm';
import { getAccounts, createJournalEntry } from '../api/journalApi';
import { Error, Loading } from '../components/utils';
import { toast } from 'sonner';

export default function JournalEntryCreatePage() {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await getAccounts();
        setAccounts(data.accounts);
      } catch {
        setError('Failed to load accounts');
      } finally {
        setLoadingAccounts(false);
      }
    }

    loadAccounts();
  }, []);

  async function handleCreate(data) {
    try {
      await createJournalEntry(data);

      toast.success('Journal entry created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to create journal entry');
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-3">
      <Link
        to="/"
        className="text-sm text-blue-600 hover:text-blue-700"
      >
        ← Back to list
      </Link>

      {loadingAccounts && <Loading msg="Accounts" />}
      {error && <Error error={error} />}

      {!loadingAccounts && !error &&
        (
          <JournalEntryForm
            accounts={accounts}
            onSubmit={handleCreate}
          />
        )}
    </div>
  );
}