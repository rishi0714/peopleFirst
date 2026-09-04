import { useEffect, useState } from 'react';
import { agentApi } from '../api/agentApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icon.jsx';

function SectionTitle({ icon, children }) {
  return (
    <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-xs">
        <Icon name={icon} className="h-4.5 w-4.5" strokeWidth={2} />
      </span>
      <span>{children}</span>
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
      <PageHeader title="Wellness &amp; Benefits Concierge" subtitle="Curated health, rejuvenation, and corporate perks powered by Kura." />

      <div className="space-y-8">
        <div>
          <div className="mb-4">
            <SectionTitle icon="leaf">On-Campus Wellness Amenities</SectionTitle>
          </div>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {amenities === null ? (
              <div className="text-slate-400 text-sm">Loading amenities...</div>
            ) : (
              amenities.map((a, i) => (
                <div key={i} className="group rounded-xl border border-slate-200/90 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-bold text-slate-900">{a.name}</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{a.category}</span>
                  </div>
                  <div className="mb-2 text-xs font-medium text-slate-400">{a.location} &bull; {a.timing}</div>
                  <div className="text-sm leading-relaxed text-slate-600">{a.description}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <SectionTitle icon="shield">Partner Hospitals &amp; OPD Discounts ({currentUser.baseLocation})</SectionTitle>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/20">Insurance Claim Window: 90 days</span>
          </div>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {hospitals === null ? (
              <div className="text-slate-400 text-sm">Loading partner hospitals...</div>
            ) : (
              hospitals.map((h, i) => (
                <div key={i} className="group rounded-xl border border-slate-200/90 border-l-4 border-l-sky-500 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised">
                  <div className="font-bold text-slate-900">{h.name}</div>
                  <div className="mt-1 mb-3 text-xs text-slate-400">{h.address} &bull; {h.city}</div>
                  <div className="space-y-1 rounded-xl bg-sky-50/70 p-2.5 text-xs">
                    <div className="font-semibold text-sky-800">{h.opdDiscount}</div>
                    <div className="font-semibold text-sky-800">{h.labTestDiscount}</div>
                  </div>
                  <div className="mt-3 text-xs font-medium text-slate-500">Contact: <span className="text-slate-700 font-semibold">{h.contactNumber}</span></div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-4">
            <SectionTitle icon="sun">Partner Resorts &amp; Vacation Getaways</SectionTitle>
          </div>
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
            {resorts === null ? (
              <div className="text-slate-400 text-sm">Loading vacation partners...</div>
            ) : (
              resorts.map((r, i) => (
                <div key={i} className="group rounded-xl border border-slate-200/90 border-t-4 border-t-indigo-500 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{r.name}</span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-600/20">{r.type}</span>
                  </div>
                  <div className="mt-1 mb-2 text-xs text-slate-400">{r.destination}</div>
                  <div className="my-2.5 text-sm font-bold text-indigo-600">{r.discount}</div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs text-slate-600">
                    <span>Promo:</span> <code className="font-mono font-bold text-slate-800">{r.couponCode}</code>
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
