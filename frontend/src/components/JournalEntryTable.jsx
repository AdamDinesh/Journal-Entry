import { useNavigate } from 'react-router-dom';
import { formatDate, formatDateTime, formatAmount } from '../utils/helper';

function JournalEntryTable({ entries, filtersActive }) {
  const navigate = useNavigate();

  if (!entries || entries.length === 0) {
    if (filtersActive) {
      return (
        <div className="text-center py-16 border rounded">
          <p className="font-medium">No entries match your filters</p>
          <p className="text-sm text-gray-500 mt-1">Try a different search term or date range.</p>
        </div>
      );
    }
    return (
      <div className="text-center py-16 border rounded">
        <p className="font-medium">No journal entries yet</p>
        <p className="text-sm text-gray-500 mt-1">Every entry you create will show up here.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[28rem] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left bg-[#163D48] text-white">
            <th className="p-3 font-semibold border border-gray-300">Entry ID</th>
            <th className="p-3 font-semibold border border-gray-300">Entry Date</th>
            <th className="p-3 font-semibold border border-gray-300">Narration</th>
            <th className="p-3 font-semibold border border-gray-300">Total Debit</th>
            <th className="p-3 font-semibold border border-gray-300">Total Credit</th>
            <th className="p-3 font-semibold border border-gray-300">Created</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.JournalEntryId}
              onClick={() => navigate(`/journal-entries/${entry.JournalEntryId}`)}
              className={`cursor-pointer border border-gray-300 text-gray-800 ${index % 2 === 0
                ? "bg-white hover:bg-gray-50"
                : "bg-[#f9f9f9] hover:bg-[#DDEFF1]"
                }`}
            >
              <td className="p-3 border border-gray-300 font-mono text-gray-700">
                {entry.JournalEntryId}
              </td>

              <td className="p-3 border border-gray-300">
                {formatDate(entry.EntryDate)}
              </td>

              <td className="p-3 border border-gray-300 text-gray-600">
                {entry.Narration || "-"}
              </td>

              <td className="p-3 border border-gray-300 font-mono">
                {formatAmount(entry.TotalDebit)}
              </td>

              <td className="p-3 border border-gray-300 font-mono">
                {formatAmount(entry.TotalCredit)}
              </td>

              <td className="p-3 border border-gray-300 text-gray-500">
                {formatDateTime(entry.CreatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JournalEntryTable;