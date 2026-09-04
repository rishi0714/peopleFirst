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
            <CardHeader>1. General Policy & Channel Governance</CardHeader>
            <CardBody>
              <ul className="ml-5 list-disc space-y-1.5 text-sm text-slate-700">
                {data.generalRules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>2. Application Deadlines & Documentation Constraints</CardHeader>
            <CardBody>
              <ul className="ml-5 list-disc space-y-1.5 text-sm text-slate-700">
                {data.deadlineRules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>3. Leave Combination Rules</CardHeader>
            <CardBody>
              <ul className="ml-5 list-disc space-y-1.5 text-sm text-slate-700">
                {data.combinationRules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>4. Annual Quotas & Role Eligibility Matrix</CardHeader>
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
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-slate-800">{t.displayName}</td>
                    <td className="px-4 py-3">
                      {t.employeeEligible ? (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                          <Icon name="checkCircle" className="h-3.5 w-3.5" strokeWidth={2} /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                          <Icon name="close" className="h-3.5 w-3.5" strokeWidth={2} /> Not Eligible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3"><strong>{t.employeeAnnualQuota}</strong> days/year</td>
                    <td className="px-4 py-3">
                      {t.contractorEligible ? (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                          <Icon name="checkCircle" className="h-3.5 w-3.5" strokeWidth={2} /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                          <Icon name="close" className="h-3.5 w-3.5" strokeWidth={2} /> Restricted (0)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3"><strong>{t.contractorAnnualQuota}</strong> days/year</td>
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
