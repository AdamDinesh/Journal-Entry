function JournalEntryLine({ lines, totalDebit, totalCredit }) {
  return (<div className="bg-white p-5 rounded-xl border border-gray-200">
    <h2 className="text-base font-medium mb-3.5">Journal Entry Lines</h2>
    {lines.length > 0 ? (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="py-2 font-medium">Account</th>
            <th className="py-2 font-medium text-right">Debit</th>
            <th className="py-2 font-medium text-right">Credit</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.LineId} className="border-b border-gray-100 last:border-0">
              <td className="py-2">{line.AccountName}</td>
              <td className="py-2 text-right">
                {line.LineType === 'DEBIT' ? line.Amount : '-'}
              </td>
              <td className="py-2 text-right">
                {line.LineType === 'CREDIT' ? line.Amount : '-'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 font-medium">
            <td className="py-2">Total</td>
            <td className="py-2 text-right">{totalDebit}</td>
            <td className="py-2 text-right">{totalCredit}</td>
          </tr>
        </tfoot>
      </table>
    ) : (
      <p className="text-sm text-gray-500">No lines found.</p>
    )}
  </div>)
}

export default JournalEntryLine;
