import { useEffect, useState } from 'react';
import { agentApi } from '../api/agentApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Alert from '../components/Alert.jsx';
import { Card, CardHeader, CardBody } from '../components/Card.jsx';
import { Table, Thead, Th } from '../components/Table.jsx';
import Icon from '../components/Icon.jsx';

export default function PolicyPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    agentApi.getPolicies().then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <PageHeader
        title="Company Leave Policies & Guidelines"
        subtitle="Official policy governing eligibility, combination rules, cutoffs, and documentation requirements."
      />

      {error && <Alert variant="danger">Failed to load policies: {error}</Alert>}
      {!data && !error && <div className="text-slate-500">Loading company policies...</div>}

      {data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>1. General Policy &amp; Channel Governance</CardHeader>
            <CardBody>
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
                {data.generalRules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600"></span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>2. Application Deadlines &amp; Documentation Constraints</CardHeader>
            <CardBody>
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
                {data.deadlineRules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600"></span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>3. Leave Combination Rules</CardHeader>
            <CardBody>
              <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
                {data.combinationRules.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600"></span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>4. Annual Quotas &amp; Role Eligibility Matrix</CardHeader>
            <Table>
              <Thead>
                <Th>Leave Type</Th>
                <Th>Employee Eligibility</Th>
                <Th>Employee Quota</Th>
                <Th>Contractor Eligibility</Th>
                <Th>Contractor Quota</Th>
              </Thead>
              <tbody>
                {data.leaveTypes.map((t, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-800">{t.displayName}</td>
                    <td className="px-5 py-3.5">
                      {t.employeeEligible ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <Icon name="checkCircle" className="h-3.5 w-3.5" strokeWidth={2} /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                          <Icon name="close" className="h-3.5 w-3.5" strokeWidth={2} /> Not Eligible
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700"><strong className="text-slate-900">{t.employeeAnnualQuota}</strong> days/yr</td>
                    <td className="px-5 py-3.5">
                      {t.contractorEligible ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <Icon name="checkCircle" className="h-3.5 w-3.5" strokeWidth={2} /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          <Icon name="close" className="h-3.5 w-3.5" strokeWidth={2} /> Restricted (0)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700"><strong className="text-slate-900">{t.contractorAnnualQuota}</strong> days/yr</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
