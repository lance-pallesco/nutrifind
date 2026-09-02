"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Clock3, Leaf, LockKeyhole, Search, Sparkles } from "lucide-react";
import { api, type Product, type RecentSearch, type SearchResponse } from "@/lib/api-client";
import { getDictionary, localeLabels, locales, type Locale } from "@/lib/i18n";

function value(number: number | null | undefined, locale: Locale, unit = "g") {
  if (number === null || number === undefined) return "—";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(number) + " " + unit;
}

function ProductImage({ product, fallback }: { product: Product; fallback: string }) {
  const [failed, setFailed] = useState(false);
  if (!product.imageUrl || failed) {
    return <div className="flex h-full min-h-52 items-center justify-center bg-slate-50 text-xs font-medium text-slate-400">{fallback}</div>;
  }
  return <img src={product.imageUrl} alt={product.name} onError={() => setFailed(true)} className="h-full min-h-52 w-full object-contain bg-white p-6" />; // eslint-disable-line @next/next/no-img-element
}

function Card({ product, locked, labels, locale }: { product: Product; locked: boolean; labels: ReturnType<typeof getDictionary>; locale: Locale }) {
  const nutrition = product.nutrition;
  const metrics = [
    [labels.energy, nutrition?.energyKcal100g === null || nutrition?.energyKcal100g === undefined ? "—" : new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(nutrition.energyKcal100g) + " kcal"],
    [labels.fat, value(nutrition?.fat100g, locale)],
    [labels.carbs, value(nutrition?.carbohydrates100g, locale)],
    [labels.protein, value(nutrition?.proteins100g, locale)],
    [labels.salt, value(nutrition?.salt100g, locale)],
  ];
  return <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/5">
    <div className="relative h-56 overflow-hidden"><ProductImage product={product} fallback={labels.unavailable} /><span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm">{labels.basicInfo}</span></div>
    <div className="p-5">
      <h2 className="line-clamp-2 min-h-12 text-lg font-bold leading-6 tracking-tight text-slate-950">{product.name}</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 border-b border-slate-100 pb-4 text-xs">
        <div><p className="text-slate-400">{labels.brand}</p><p className="mt-1 truncate font-semibold text-slate-700">{product.brand ?? labels.unavailable}</p></div>
        <div><p className="text-slate-400">{labels.quantity}</p><p className="mt-1 truncate font-semibold text-slate-700">{product.quantity ?? labels.unavailable}</p></div>
      </div>
      {locked ? <div className="relative mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 p-5"><LockKeyhole className="mb-3 size-5 text-amber-700" /><h3 className="text-sm font-bold text-slate-900">{labels.lockedTitle}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{labels.lockedText}</p><button onClick={() => window.dispatchEvent(new CustomEvent("nutrifind:checkout"))} className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700">{labels.subscribe}<ArrowRight className="size-3.5" /></button></div> : <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5"><div className="mb-4 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">{labels.nutrition}</h3></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{metrics.map(([name, amount]) => <div key={name} className="rounded-xl bg-white/80 px-3 py-2"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{name}</p><p className="mt-1 text-sm font-bold text-slate-900">{amount}</p></div>)}</div></div>}
    </div>
  </article>;
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [term, setTerm] = useState("");
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const labels = useMemo(() => getDictionary(locale), [locale]);

  useEffect(() => {
    void api.startDemo().then(() => api.recent().then((data) => setRecent(data.searches))).catch(() => undefined);
    const checkout = () => { void api.checkout().then(({ url }) => { window.location.href = url; }).catch(() => setError(true)); };
    window.addEventListener("nutrifind:checkout", checkout);
    return () => window.removeEventListener("nutrifind:checkout", checkout);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (term.trim().length < 2) return;
    setLoading(true); setError(false);
    try {
      const data = await api.search(term, locale);
      setResponse(data);
      setRecent((current) => [{ id: "local-" + Date.now(), term: data.query, locale, resultCount: data.products.length, createdAt: new Date().toISOString() }, ...current.filter((item) => item.term.toLowerCase() !== data.query.toLowerCase())].slice(0, 5));
    } catch { setError(true); } finally { setLoading(false); }
  }

  return <main className="min-h-screen overflow-hidden bg-[#f7faf8] text-slate-950">
    <div className="pointer-events-none absolute -left-40 -top-40 size-[28rem] rounded-full bg-emerald-200/30 blur-3xl" />
    <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
      <div className="flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-900/15"><Leaf className="size-5" /></div><span className="text-xl font-black tracking-tight">nutrifind<span className="text-emerald-600">.</span></span></div>
      <div className="flex items-center gap-3"><span className="hidden text-xs font-medium text-slate-400 sm:block">{labels.demo}</span><div className="relative"><label htmlFor="language" className="sr-only">{labels.language}</label><select id="language" value={locale} onChange={(event) => setLocale(event.target.value as Locale)} className="appearance-none rounded-full border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">{locales.map((item) => <option key={item} value={item}>{localeLabels[item]}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 size-3.5 text-slate-400" /></div></div>
    </header>
    <section className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-20 lg:px-10 lg:pb-24"><div className="max-w-3xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700"><span className="size-1.5 rounded-full bg-emerald-500" />{labels.eyebrow}</div><h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-7xl">{labels.title}</h1><p className="mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">{labels.subtitle}</p><form onSubmit={submit} className="mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-xl shadow-emerald-950/5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100"><Search className="size-5 shrink-0 text-emerald-600" /><input value={term} onChange={(event) => setTerm(event.target.value)} className="h-10 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400" placeholder={labels.placeholder} aria-label={labels.placeholder} /></div><button type="submit" disabled={loading || term.trim().length < 2} className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white shadow-xl transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>{labels.search}<ArrowRight className="size-4" /></>}</button></form></div></section>
    <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 pb-20 sm:px-8 lg:grid-cols-[14rem_1fr] lg:px-10"><aside className="hidden lg:block"><div className="sticky top-8"><div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400"><Clock3 className="size-3.5" />{labels.recent}</div><div className="space-y-1">{recent.length === 0 ? <p className="text-xs leading-5 text-slate-400">{labels.emptyText}</p> : recent.map((item) => <button key={item.id} onClick={() => { setTerm(item.term); setLocale(item.locale); }} className="group flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-white hover:text-emerald-700"><span className="truncate">{item.term}</span><span className="text-[10px] uppercase text-slate-400">{item.locale}</span></button>)}</div></div></aside><div className="min-w-0">{error && <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{labels.error}</div>}{!response && !loading && !error && <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center"><div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><Search className="size-6" /></div><h2 className="mt-5 text-xl font-bold">{labels.emptyTitle}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{labels.emptyText}</p></div>}{response && <><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">{labels.results}</p><h2 className="mt-1 text-2xl font-black tracking-tight">{response.query}</h2></div><span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">{response.products.length} {labels.resultCount}</span></div>{response.products.length === 0 ? <div className="rounded-3xl bg-white px-6 py-16 text-center"><h2 className="text-xl font-bold">{labels.noResults}</h2><p className="mt-2 text-sm text-slate-500">{labels.noResultsText}</p></div> : <div className="grid gap-6 md:grid-cols-2">{response.products.map((product) => <Card key={product.code} product={product} locked={!response.canViewNutrition} labels={labels} locale={locale} />)}</div>}</>}</div></section>
    <footer className="relative border-t border-slate-200/70 px-5 py-8 text-center text-xs text-slate-400 sm:px-8">Product data provided by Open Food Facts</footer>
  </main>;
}
