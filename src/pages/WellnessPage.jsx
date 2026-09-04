import { useEffect, useState } from 'react';
import { agentApi } from '../api/agentApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icon.jsx';

function SectionTitle({ icon, children }) {
  return (
    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
        <Icon name={icon} className="h-4 w-4" strokeWidth={2} />
      </span>
      {children}
    </h3>
  );
}

export default function WellnessPage() {
  const { currentUser } = useAuth();
  const [amenities, setAmenities] = useState(null);
  const [hospitals, setHospitals] = useState(null);
  const [resorts, setResorts] = useState(null);

  useEffect(() => {
    agentApi.getAmenities().then(setAmenities).catch(() => setAmenities([]));
    agentApi.getHospitals(currentUser.baseLocation).then(setHospitals).catch(() => setHospitals([]));
    agentApi.getResorts().then(setResorts).catch(() => setResorts([]));
  }, [currentUser.baseLocation]);

  return (
    <div>
      <PageHeader title="Wellness & Benefits Concierge" subtitle="Curated health, rejuvenation, and corporate perks powered by Kura." />

      <div className="space-y-8">
        <div>
          <div className="mb-3">
            <SectionTitle icon="leaf">On-Campus Wellness Amenities</SectionTitle>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {amenities === null ? (
              <div className="text-slate-500">Loading amenities...</div>
            ) : (
              amenities.map((a, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{a.name}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">{a.category}</span>
                  </div>
                  <div className="mb-1.5 text-xs text-slate-500">{a.location} &bull; {a.timing}</div>
                  <div className="text-sm leading-relaxed text-slate-600">{a.description}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <SectionTitle icon="shield">Partner Hospitals &amp; OPD Discounts ({currentUser.baseLocation})</SectionTitle>
            <span className="text-xs text-indigo-600">Insurance Claim Window: Submit within 90 days</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hospitals === null ? (
              <div className="text-slate-500">Loading partner hospitals...</div>
            ) : (
              hospitals.map((h, i) => (
                <div key={i} className="rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 shadow-sm">
                  <div className="font-semibold text-slate-800">{h.name}</div>
                  <div className="mt-1 mb-2.5 text-xs text-slate-500">{h.address} • {h.city}</div>
                  <div className="space-y-1 rounded-lg bg-slate-50 p-2 text-sm">
                    <div className="font-medium text-sky-700">{h.opdDiscount}</div>
                    <div className="font-medium text-sky-700">{h.labTestDiscount}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Contact: {h.contactNumber}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-3">
            <SectionTitle icon="sun">Partner Resorts &amp; Vacation Getaways</SectionTitle>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resorts === null ? (
              <div className="text-slate-500">Loading vacation partners...</div>
            ) : (
              resorts.map((r, i) => (
                <div key={i} className="rounded-xl border border-slate-200 border-t-4 border-t-indigo-500 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{r.name}</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">{r.type}</span>
                  </div>
                  <div className="mt-1 mb-2 text-xs text-slate-500">{r.destination}</div>
                  <div className="my-2 text-sm font-semibold text-indigo-600">{r.discount}</div>
                  <div className="inline-block rounded bg-slate-100 px-2 py-1 text-xs">
                    Promo Code: <code className="font-mono">{r.couponCode}</code>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
