import React, { useState } from "react";
import { Search, Loader2, Package, MapPin, Truck, CheckCircle, AlertCircle } from "lucide-react";
import "./index.css";

// ----------------------------------------------------------------------
// MAIN APP COMPONENT
// ----------------------------------------------------------------------
export default function App() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      // Direct call to local backend (adjust port if needed, default 3000)
      const response = await fetch(`http://localhost:3000/api/track/${trackingNumber}`);
      if (!response.ok) throw new Error("Failed to fetch tracking info");

      const result = await response.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      console.error(err);
      setError("Network error or backend offline. Ensure server.js is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col items-center justify-center p-6 text-slate-800 font-sans">

      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">
          TrackMyParcel
        </h1>
        <p className="text-lg text-slate-500 max-w-md mx-auto">
          Universal tracking for Australia Post, FedEx, and DHL. Simply enter your number below.
        </p>
      </header>

      {/* Search Container */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transform transition-all hover:shadow-2xl duration-300">
        <form onSubmit={handleTrack} className="p-2 flex items-center gap-2 border-b border-slate-100 bg-slate-50/50">
          <div className="pl-4 text-slate-400">
            <Package size={20} />
          </div>
          <input
            type="text"
            className="flex-1 bg-transparent p-4 text-lg outline-none placeholder:text-slate-400 font-medium"
            placeholder="Enter tracking number (e.g. EM123456789AU)..."
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !trackingNumber}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            <span>Track</span>
          </button>
        </form>

        {/* Results Area */}
        <div className="min-h-[200px] flex flex-col">
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 py-10">
              <Loader2 className="animate-spin text-blue-500" size={40} />
              <p className="animate-pulse font-medium">Contacting carrier...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex-1 flex flex-col items-center justify-center text-red-500 gap-3 py-10 px-6 text-center">
              <AlertCircle size={48} className="text-red-100 fill-red-500" />
              <p className="font-semibold text-lg">{error}</p>
            </div>
          )}

          {!loading && !data && !error && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 py-12 px-6 text-center opacity-60">
              <Truck size={48} strokeWidth={1.5} />
              <p>Ready to track. Enter a valid ID above.</p>
            </div>
          )}

          {!loading && data && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Carrier Info Header */}
              <div className="bg-indigo-50/50 p-6 flex items-center justify-between border-b border-indigo-100">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-900">{data.carrier}</h2>
                  <p className="text-indigo-600 font-mono text-sm tracking-wide">{data.trackingNumber}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(data.status)} shadow-sm`}>
                  {data.status}
                </div>
              </div>

              {/* Enhanced Timeline */}
              <div className="p-6 bg-white">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 ml-2">Shipment Progress</h3>
                <div className="relative pl-4 border-l-2 border-slate-100 ml-3 space-y-8 pb-2">
                  {data.events?.map((event, index) => (
                    <div key={index} className="relative pl-8 group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[1.3rem] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ring-4 ring-transparent transition-all duration-300 group-hover:scale-110 ${index === 0 ? 'bg-blue-500 ring-blue-50' : 'bg-slate-300'}`}></div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div>
                          <h4 className={`font-semibold text-base ${index === 0 ? 'text-slate-800' : 'text-slate-500'}`}>
                            {event.description}
                          </h4>
                          <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                            <MapPin size={14} />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        </div>
                        <time className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 whitespace-nowrap">
                          {event.time}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 text-xs text-center text-slate-400 border-t border-slate-100">
                Estimated Delivery: <span className="font-semibold text-slate-600">{data.estimatedDelivery || "Unknown"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-slate-400 text-xs opacity-70">
        Demo Application &copy; 2026 OrderliSS. Local Development Mode.
      </div>
    </div>
  );
}

function getStatusColor(status) {
  if (!status) return "bg-gray-100 text-gray-600 border-gray-200";
  const s = status.toLowerCase();
  if (s.includes("delivered")) return "bg-green-100 text-green-700 border-green-200";
  if (s.includes("transit")) return "bg-blue-100 text-blue-700 border-blue-200";
  if (s.includes("exception") || s.includes("error")) return "bg-red-100 text-red-700 border-red-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}
