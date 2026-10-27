'use client';

// Department · Overview dashboard + Review & dispatch
import { useCallback, useEffect, useMemo, useState } from 'react';
import { demoDrivers, demoPins, isConfigured, supabase, type Driver, type PortalPin } from '@/lib/supabase';

const STATUS: Record<string, { label: string; cls: string }> = {
  reported: { label: 'New', cls: 'bg-amber-100 text-amber-800' },
  verified: { label: 'Verified', cls: 'bg-amber-100 text-amber-800' },
  assigned: { label: 'Assigned', cls: 'bg-blue-100 text-blue-800' },
  on_the_way: { label: 'On the way', cls: 'bg-blue-100 text-blue-800' },
  collected: { label: 'Collected', cls: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Rejected', cls: 'bg-gray-100 text-gray-700' },
};

export default function Dashboard() {
  const [pins, setPins] = useState<PortalPin[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(!isConfigured);
  const [msg, setMsg] = useState<string | null>(null);
  const [today, setToday] = useState('');

  const load = useCallback(async () => {
    setToday(new Date().toDateString());
    if (!isConfigured) {
      setPins(demoPins);
      setDrivers(demoDrivers);
      return;
    }
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from('pins_view').select('id, code, address, status, size, waste_types, votes, created_at').order('created_at', { ascending: false }).limit(200),
      supabase.from('profiles').select('id, full_name, truck_no').eq('role', 'driver'),
    ]);
    setPins((p ?? []) as PortalPin[]);
    setDrivers((d ?? []) as Driver[]);
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      Promise.resolve().then(load);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSignedIn(true);
        load();
      }
    });
    const ch = supabase
      .channel('portal-pins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const stats = useMemo(() => {
    return {
      newToday: pins.filter((p) => new Date(p.created_at).toDateString() === today).length,
      waiting: pins.filter((p) => ['reported', 'verified'].includes(p.status)).length,
      inProgress: pins.filter((p) => ['assigned', 'on_the_way'].includes(p.status)).length,
      collected: pins.filter((p) => p.status === 'collected').length,
    };
  }, [pins, today]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMsg(error.message);
    setSignedIn(true);
    load();
  };

  const verify = async (pin: PortalPin) => {
    if (isConfigured) await supabase.from('pins').update({ status: 'verified' }).eq('id', pin.id);
    setPins((all) => all.map((p) => (p.id === pin.id ? { ...p, status: 'verified' } : p)));
  };

  const dispatch = async (pin: PortalPin, driverId: string) => {
    if (!driverId) return;
    if (isConfigured) {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from('assignments').insert({ pin_id: pin.id, driver_id: driverId, assigned_by: auth.user?.id });
      if (error) return setMsg(error.message);
      await supabase.from('pins').update({ status: 'assigned' }).eq('id', pin.id);
    }
    setPins((all) => all.map((p) => (p.id === pin.id ? { ...p, status: 'assigned' } : p)));
    setMsg(`${pin.code} sent to ${drivers.find((d) => d.id === driverId)?.full_name ?? 'driver'}`);
  };

  if (!signedIn) {
    return (
      <main className="min-h-screen grid place-items-center bg-emerald-50 p-6">
        <form onSubmit={signIn} className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 flex flex-col gap-4">
          <h1 className="text-2xl font-extrabold text-emerald-900">EcoPin · Council portal</h1>
          <label className="text-sm font-semibold text-slate-700">Officer email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" required />
          </label>
          <label className="text-sm font-semibold text-slate-700">Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" required />
          </label>
          {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
          <button className="rounded-full bg-emerald-700 py-3 font-bold text-white hover:bg-emerald-800">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F2F7F4]">
      <header className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white">
        <div className="h-1 grid grid-cols-4"><span className="bg-[#EB7400]" /><span className="bg-[#00534E]" /><span className="bg-[#8D153A]" /><span className="bg-[#FFBE29]" /></div>
        <div className="mx-auto max-w-6xl px-6 py-8">
          <p className="text-sm font-semibold text-emerald-200">Kalutara Urban Council · Solid Waste Unit</p>
          <h1 className="text-3xl font-extrabold">Today&apos;s garbage pins</h1>
          {!isConfigured ? <p className="mt-2 text-xs text-amber-200">Demo mode: add Supabase keys in .env to see real data.</p> : null}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 -mt-6 flex flex-col gap-6 pb-12">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['New today', stats.newToday, 'text-slate-900'],
            ['Waiting', stats.waiting, 'text-amber-700'],
            ['In progress', stats.inProgress, 'text-blue-700'],
            ['Collected', stats.collected, 'text-emerald-700'],
          ].map(([label, value, cls]) => (
            <div key={label as string} className="rounded-2xl bg-white p-5 shadow-sm border border-emerald-100">
              <p className="text-sm font-semibold text-slate-500">{label}</p>
              <p className={`text-3xl font-extrabold ${cls}`}>{value}</p>
            </div>
          ))}
        </section>

        {msg ? <p className="rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-900">{msg}</p> : null}

        <section className="rounded-3xl bg-white shadow-sm border border-emerald-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="px-5 py-3">Pin</th><th className="px-5 py-3">Place</th><th className="px-5 py-3">Waste</th>
                <th className="px-5 py-3">+1</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pins.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-bold">{p.code}</td>
                  <td className="px-5 py-3">{p.address ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{p.size} · {p.waste_types.join(', ')}</td>
                  <td className="px-5 py-3">{p.votes}</td>
                  <td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS[p.status]?.cls ?? ''}`}>{STATUS[p.status]?.label ?? p.status}</span></td>
                  <td className="px-5 py-3">
                    {p.status === 'reported' ? (
                      <button onClick={() => verify(p)} className="rounded-full border border-emerald-600 px-3 py-1.5 font-bold text-emerald-800">Verify</button>
                    ) : p.status === 'verified' ? (
                      <select defaultValue="" onChange={(e) => dispatch(p, e.target.value)} className="rounded-full border border-slate-300 px-3 py-1.5" aria-label={`Dispatch ${p.code}`}>
                        <option value="" disabled>Dispatch to…</option>
                        {drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name} · {d.truck_no}</option>)}
                      </select>
                    ) : <span className="text-slate-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
