import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJournalEntries } from '../api/journalApi';
import JournalEntryTable from '../components/JournalEntryTable';
import Pagination from '../components/Pagination';
import { Error, Loading } from '../components/utils';
import useDebounce from '../hooks/useDebounce';

const PAGE_SIZE = 10;

export default function JournalEntriesListPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedSearch = useDebounce(search, 400);
  async function loadEntries() {
    setLoading(true);
    setError(null);
    try {
      const data = await getJournalEntries({
        search: search || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setEntries(data.journalEntries);
      setTotal(data.pagination.total);
    } catch (err) {
      setError('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntries();
  }, [page, debouncedSearch, fromDate, toDate]);

  function handleSearchChange(e) {
    setPage(1);
    setSearch(e.target.value);
  }

  function handleFromChange(e) {
    setPage(1);
    setFromDate(e.target.value);
  }

  function handleToChange(e) {
    setPage(1);
    setToDate(e.target.value);
  }

  function handleClearFilters() {
    setSearch('');
    setFromDate('');
    setToDate('');
  }

  const filtersActive = Boolean(search || fromDate || toDate);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900">Journal Entries</h1>
      </div>

      <div className="flex flex-wrap items-end gap-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">Search narration</label>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="h-9 border border-gray-300 rounded-md px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={handleFromChange}
            className="h-9 border border-gray-300 rounded-md px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">To</label>
          <input
            type="date"
            value={toDate}
            onChange={handleToChange}
            className="h-9 border border-gray-300 rounded-md px-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
          />
        </div>

        {filtersActive && (
          <button
            onClick={handleClearFilters}
            className="h-9 px-3 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Clear filters
          </button>
        )}

        <button
          onClick={() => navigate('/journal-entries/new')}
          className="leading-none ml-auto flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          <span className="text-base leading-none">+</span>
          New entry
        </button>
      </div>

      {loading && <Loading />}
      {error && <Error error={error} />}

      {!loading && !error && (
        <>
          <JournalEntryTable entries={entries} filtersActive={filtersActive} />
          {entries.length > 0 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
