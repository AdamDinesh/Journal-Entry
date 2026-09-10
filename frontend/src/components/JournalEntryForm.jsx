import { useState } from 'react';
import { formatAmount } from '../utils/helper'
export default function JournalEntryForm({ accounts, onSubmit }) {
  const [entryDate, setEntryDate] = useState('');
  const [narration, setNarration] = useState('');
  const [lines, setLines] = useState([
    { accountId: '', type: 'DEBIT', amount: '' },
    { accountId: '', type: 'CREDIT', amount: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleLineChange(index, field, value) {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  }

  function handleAddLine() {
    setLines([...lines, { accountId: '', type: 'DEBIT', amount: '' }]);
  }

  function handleRemoveLine(index) {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  }

  const totalDebit = lines
    .filter(line => line.type === 'DEBIT')
    .reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

  const totalCredit = lines
    .filter(line => line.type === 'CREDIT')
    .reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!entryDate) {
      setError('Entry date is required');
      return;
    }

    const invalidLine = lines.some(
      line => !line.accountId || !line.amount || Number(line.amount) <= 0
    );

    if (invalidLine) {
      setError('Every line needs an account and an amount greater than 0');
      return;
    }

    if (!isBalanced) {
      setError('Total debit and total credit must match');
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        entryDate,
        narration: narration || undefined,
        lines: lines.map(line => ({
          accountId: Number(line.accountId),
          type: line.type,
          amount: Number(line.amount)
        }))
      });
    } catch (err) {
      setError(err.message || 'Failed to create journal entry');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-xl border border-gray-200 space-y-4"
    >
      <h1 className="text-base font-medium">New journal entry</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Entry date
          </label>
          <input
            type="date"
            value={entryDate}
            onChange={e => setEntryDate(e.target.value)}
            className="w-full h-9 border border-gray-300 rounded-md px-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Narration
          </label>
          <input
            type="text"
            value={narration}
            onChange={e => setNarration(e.target.value)}
            placeholder="Optional description"
            className="w-full h-9 border border-gray-300 rounded-md px-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Lines
        </label>

        <div className="space-y-2">
          {lines.map((line, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={line.accountId}
                onChange={e =>
                  handleLineChange(index, 'accountId', e.target.value)
                }
                className="flex-1 h-9 border border-gray-300 rounded-md px-2.5 text-sm"
              >
                <option value="">Select account</option>
                {accounts.map(account => (
                  <option
                    key={account.AccountId}
                    value={account.AccountId}
                  >
                    {account.AccountName}
                  </option>
                ))}
              </select>

              <select
                value={line.type}
                onChange={e =>
                  handleLineChange(index, 'type', e.target.value)
                }
                className="w-28 h-9 border border-gray-300 rounded-md px-2.5 text-sm"
              >
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Credit</option>
              </select>

              <input
                type="number"
                step="0.01"
                min="0.01"
                value={line.amount}
                onChange={e =>
                  handleLineChange(index, 'amount', e.target.value)
                }
                placeholder="Amount"
                className="w-32 h-9 border border-gray-300 rounded-md px-2.5 text-sm"
              />

              <button
                type="button"
                onClick={() => handleRemoveLine(index)}
                disabled={lines.length <= 2}
                className="text-sm text-gray-400 hover:text-red-600 disabled:opacity-30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddLine}
          className="mt-2 text-sm text-blue-600 hover:text-blue-700"
        >
          + Add line
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
        <div className="flex gap-4">
          <span>
            Debit: <span className="font-medium">{formatAmount(totalDebit)}</span>
          </span>
          <span>
            Credit: <span className="font-medium">{formatAmount(totalCredit)}</span>
          </span>
        </div>

        {isBalanced ? (
          <span className="text-green-600 text-xs font-medium">
            ✓ Balanced
          </span>
        ) : (
          <span className="text-red-600 text-xs font-medium">
            ✗ Debit and credit don't match
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="h-9 px-4 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Save entry'}
      </button>
    </form>
  );
}

