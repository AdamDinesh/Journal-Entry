import { formatDate } from '../utils/helper';

export default function JournalEntryHeader({ entry }) {
    const isBalanced = entry.TotalDebit === entry.TotalCredit;
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h1 className="text-base font-medium mb-4">Journal entry details</h1>
            <div className="grid grid-cols-[120px_1fr] gap-y-2.5 gap-x-3 text-sm">
                <span className="text-gray-500">Entry ID</span>
                <span className="font-mono text-xs text-gray-900">JE-{String(entry.JournalEntryId).padStart(4, '0')}</span>

                <span className="text-gray-500">Entry date</span>
                <span>{formatDate(entry.EntryDate)}</span>

                <span className="text-gray-500">Narration</span>
                <span>{entry.Narration || '—'}</span>

                <span className="text-gray-500">Total debit</span>
                <span className="font-medium">{entry.TotalDebit}</span>

                <span className="text-gray-500">Total credit</span>
                <span className="font-medium">{entry.TotalCredit}</span>

                <span className="text-gray-500">Balanced</span>
                <span>
                    {isBalanced ? (
                        <span className="text-green-600 text-xs font-medium">✓ Balanced</span>
                    ) : (
                        <span className="text-red-600 text-xs font-medium">✗ Mismatch</span>
                    )}
                </span>

                <span className="text-gray-500">Created</span>
                <span>{formatDate(entry.CreatedAt)}</span>
            </div>
        </div>
    )
}