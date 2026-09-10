import { formatDateTime } from '../utils/helper';
export default function AuditLogs({ auditLogs }) {
    return (<div className="bg-white p-5 rounded-xl border border-gray-200">
        <h2 className="text-base font-medium mb-3.5">Audit log</h2>
        {auditLogs.length > 0 ? (
            <ul className="text-sm">
                {auditLogs.map((log, i) => (
                    <li
                        key={log.AuditId}
                        className={`flex gap-2.5 py-2.5 ${i < auditLogs.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">{log.Action}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(log.CreatedAt)} | {log.Details}</p>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-gray-500">No audit history yet.</p>
        )}
    </div>)
}