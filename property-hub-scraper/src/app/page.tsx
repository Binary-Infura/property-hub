'use client';

import { useState, useEffect } from 'react';

interface ScraperState {
  id: string;
  name: string;
  description: string;
  availableDistricts: string[];
}

interface JobStatus {
  id: string;
  state: string;
  progress: number;
  result?: {
    success: boolean;
    count: number;
    fileName: string;
  };
  failedReason?: string;
}

const RERA_STATES: ScraperState[] = [
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    description: 'Scrapes registered projects from Rajasthan RERA (rera.rajasthan.gov.in)',
    availableDistricts: ['Ajmer', 'Alwar', 'Banswara', 'Baran', 'Barmer', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Hanumangarh', 'Jaipur', 'Jaisalmer', 'Jalor', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Karauli', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    description: 'Scrapes registered projects from MahaRERA (maharerait.mahaonline.gov.in)',
    availableDistricts: ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondiya', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigarh', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'],
  }
];

export default function ReraScraperDashboard() {
  const [selectedState, setSelectedState] = useState<string>('rajasthan');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [activeJobs, setActiveJobs] = useState<Record<string, JobStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<{
    counts: { waiting: number, active: number, completed: number, failed: number, delayed: number },
    workerCount: number,
    isOnline: boolean
  } | null>(null);

  const currentState = RERA_STATES.find(s => s.id === selectedState);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const startScrape = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: selectedState, district: selectedDistrict }),
      });

      const data = await response.json();
      if (data.jobId) {
        setActiveJobs(prev => ({
          ...prev,
          [data.jobId]: { id: data.jobId, state: 'waiting', progress: 0 }
        }));
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to start scrape:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) return false;
      const status: JobStatus = await response.json();

      setActiveJobs(prev => ({
        ...prev,
        [jobId]: status
      }));

      if (status.state === 'completed' || status.state === 'failed') {
        fetchStats(); // Update stats when job completes/fails
        return true;
      }
      return false;
    } catch (error) {
      console.error('Polling error:', error);
      return true;
    }
  };

  useEffect(() => {
    fetchStats();
    const statsInterval = setInterval(fetchStats, 5000);
    return () => clearInterval(statsInterval);
  }, []);

  useEffect(() => {
    const jobInterval = setInterval(() => {
      Object.keys(activeJobs).forEach(jobId => {
        const job = activeJobs[jobId];
        if (job.state !== 'completed' && job.state !== 'failed') {
          pollJobStatus(jobId);
        }
      });
    }, 3000);
    return () => clearInterval(jobInterval);
  }, [activeJobs]);

  const downloadFile = (fileName: string) => {
    window.location.href = `/api/download?file=${fileName}`;
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
              RERA PRO SCRAPER
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Standalone High-Performance Scraping Engine</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className={`px-4 py-1.5 border rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all duration-500 ${stats?.isOnline
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${stats?.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {stats?.isOnline ? `Engine Online (${stats.workerCount} Workers)` : 'Engine Offline - Start Workers'}
            </div>

            {!stats?.isOnline && (
              <div className="text-[10px] text-rose-500/80 font-bold uppercase tracking-tighter animate-bounce">
                Tasks will stay in 'waiting' until worker is started
              </div>
            )}
          </div>
        </header>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Queue Waiting</div>
            <div className="text-2xl font-bold text-indigo-400">{stats?.counts.waiting || 0}</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Now</div>
            <div className="text-2xl font-bold text-cyan-400">{stats?.counts.active || 0}</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Completed</div>
            <div className="text-2xl font-bold text-emerald-400">{stats?.counts.completed || 0}</div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Failed Tasks</div>
            <div className="text-2xl font-bold text-rose-400">{stats?.counts.failed || 0}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <section className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Configuration
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2 block">State Portal</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedDistrict('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                  >
                    {RERA_STATES.map(s => (
                      <option key={s.id} value={s.id}>{s.name} RERA</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2 block">District Filter</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Full State Scan</option>
                    {currentState?.availableDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={startScrape}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden relative group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    Initiate Scrape
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </div>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-6">
              <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">State Info</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {currentState?.description}
              </p>
            </div>
          </section>

          {/* Active Jobs & History */}
          <section className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Job Monitoring
              </h2>
              <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-bold uppercase tracking-widest">
                {Object.keys(activeJobs).length} Total Jobs
              </span>
            </div>

            <div className="space-y-4">
              {Object.values(activeJobs).length === 0 ? (
                <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl py-20 text-center">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800">
                    <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-slate-500 font-medium">No tasks initiated. Select a state to begin.</p>
                </div>
              ) : (
                Object.values(activeJobs).sort((a, b) => b.id.localeCompare(a.id)).map(job => (
                  <div
                    key={job.id}
                    className={`bg-slate-900/50 border rounded-3xl p-6 transition-all duration-500 animate-in slide-in-from-right-4 ${job.state === 'completed' ? 'border-emerald-500/20 bg-emerald-500/5' :
                      job.state === 'failed' ? 'border-rose-500/20 bg-rose-500/5' :
                        'border-slate-800'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-lg">Job #{job.id}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${job.state === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                            job.state === 'failed' ? 'bg-rose-500/20 text-rose-400' :
                              'bg-indigo-500/20 text-indigo-400'
                            }`}>
                            {job.state}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Internal Processor ID: {job.id}</p>
                      </div>

                      {job.state === 'completed' && job.result?.fileName && (
                        <button
                          onClick={() => downloadFile(job.result!.fileName)}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download NDJSON
                        </button>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Job Progress</span>
                        <span>{job.state === 'completed' ? '100%' : 'Processing...'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${job.state === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                            job.state === 'failed' ? 'bg-rose-500' :
                              'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse'
                            }`}
                          style={{ width: job.state === 'completed' ? '100%' : '65%' }}
                        />
                      </div>
                    </div>

                    {job.state === 'completed' && job.result && (
                      <div className="mt-6 flex gap-6 text-[10px] font-bold text-slate-400">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                          {job.result.count} RECORDS SCRAPED
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                          FORMAT: NDJSON
                        </div>
                      </div>
                    )}

                    {job.failedReason && (
                      <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[11px] text-rose-400 font-mono leading-relaxed">
                        <div className="font-bold mb-1 uppercase tracking-widest">Error Logs:</div>
                        {job.failedReason}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Automation Info */}
        <footer className="bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-800 rounded-[40px] p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-slate-950 rounded-[2rem] flex items-center justify-center border border-slate-800 shadow-2xl">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Automated Scheduler</h2>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed font-medium">
                System is configured to automatically run these scrapers every 24 hours.
                Queued jobs are processed sequentially to avoid IP blocking from government portals.
              </p>
            </div>
            <div className="px-6 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              Next Run: 00:00 UTC
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
