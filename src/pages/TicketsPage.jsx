import { useEffect, useState } from 'react';
import { ticketApi } from '../api/ticketApi.js';
import { DateUtils } from '../utils/dateUtils.js';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import { Card, CardHeader, CardBody } from '../components/Card.jsx';

const CATEGORIES = [
  { value: 'LATE_SUBMISSION', label: 'Late Submission (Missed cutoff: End-of-week or 25th of month)' },
  { value: 'POST_DATE_CORRECTION', label: 'Post-Date Leave Correction (Leave date has already passed)' },
  { value: 'TECHNICAL_ERROR', label: 'Technical Error Encountered while applying' },
  { value: 'POLICY_EXCEPTION', label: 'Policy Exception / Discretionary Request' },
];

export default function TicketsPage() {
  const [ticketType, setTicketType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [tickets, setTickets] = useState(null);

  function loadTickets() {
    ticketApi.getTickets().then(setTickets).catch(() => setTickets([]));
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert(null);
    setSubmitting(true);
    try {
      await ticketApi.createTicket({ ticketType, subject, description });
      setAlert({ variant: 'success', text: 'Ticket submitted successfully! An HR administrator will review it.' });
      setTicketType('');
      setSubject('');
      setDescription('');
      loadTickets();
    } catch (err) {
      setAlert({ variant: 'danger', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Support Tickets Desk"
        subtitle="File tickets for late submissions after cutoffs, post-date corrections, technical errors, or policy exceptions."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>Create Support Ticket</CardHeader>
          <CardBody>
            {alert && <Alert variant={alert.variant} className="mb-4">{alert.text}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ticket Reason / Category *</label>
                <select
                  required
                  value={ticketType}
                  onChange={(e) => setTicketType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Subject / Summary *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Detailed Explanation & Leave Dates *</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why the request is late, or details of the adjustment required..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full justify-center">
                {submitting ? 'Submitting ticket...' : 'Submit Support Ticket'}
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>My Submitted Tickets</CardHeader>
          <div className="max-h-[500px] space-y-3 overflow-y-auto p-4">
            {tickets === null ? (
              <div className="text-slate-500">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">No support tickets filed yet.</div>
            ) : (
              tickets.map((t, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{t.subject}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="mb-1.5 text-xs text-slate-500">
                    {t.ticketType} • Filed {DateUtils.formatDateTime(t.createdAt)}
                  </div>
                  <div className="text-sm leading-relaxed text-slate-600">{t.description}</div>
                  {t.resolutionComment && (
                    <div className="mt-1.5 rounded-lg bg-indigo-100 px-2.5 py-1.5 text-xs text-indigo-800">
                      <strong>Admin Response:</strong> {t.resolutionComment}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
