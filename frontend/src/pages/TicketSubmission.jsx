import { useState } from "react";
import axios from "axios";



const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const categories = ["Bug / Error", "Feature Request", "Account / Access", "Performance", "Content Issue", "Other"];
const priorities = ["LOW", "MEDIUM", "HIGH"];


const initialForm = {
  name: "",
  email: "",
  category: "",
  priority: "",
  subject: "",
  description: "",
};

export default function TicketSubmission() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.category) e.category = "Required";
    if (!form.priority) e.priority = "Required";
    if (!form.subject.trim()) e.subject = "Required";
    if (!form.description.trim()) e.description = "Required";
    return e;
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    
    // Retrieve the token saved during your login process
    const token = localStorage.getItem("access_token");

    setLoading(true);
    try {
      const response = await api.post("/tickets/", {
        name: form.name,
        email: form.email,
        category: form.category,
        priority: form.priority,
        title: form.subject,
        description: form.description
      }, {
        headers: {
          // Send the token in the format "Bearer <token>"
          'Authorization': `Bearer ${token}`
        }
      });
      
      setTicketId(`TKT-${response.data.id}`);
      setSubmitted(true);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
      } else {
        console.error("Submission failed:", err);
        alert("Failed to submit ticket.");
      }
    } finally {
      setLoading(false);
    }
};


  // ... [Keep your priorityColor and baseCls functions exactly as they were]
  const priorityColor = { Low: "#22c55e", Medium: "#f5a623", High: "#f97316", Critical: "#ef4444" };
  const baseCls = (field) => `w-full bg-white border-2 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium ${errors[field] ? "border-red-400 bg-red-50" : focused === field ? "border-[#f5a623] shadow-[0_0_0_4px_rgba(245,166,35,0.12)]" : "border-gray-200 hover:border-gray-300"}`;


  if (submitted) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 sm:px-0">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');*{font-family:'Sora',sans-serif}`}</style>
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#f5a623] via-[#ffcd70] to-[#f5a623]" />
          <div className="p-6 sm:p-10 text-center">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6">
              <div className="absolute inset-0 rounded-full bg-[#f5a623]/10 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#f5a623] to-[#e09610] flex items-center justify-center shadow-lg shadow-[#f5a623]/30">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-gray-900 text-xl sm:text-2xl font-bold mb-2">Ticket submitted!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
              Your request has been received. We'll follow up at <span className="text-[#f5a623] font-semibold break-all">{form.email}</span>
            </p>
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 sm:px-6 py-3 mb-5 sm:mb-6">
              <span className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-widest">Ticket ID</span>
              <span className="text-gray-900 font-bold text-sm tracking-wider">{ticketId}</span>
            </div>
            <button onClick={() => { setForm(initialForm); setErrors({}); setSubmitted(false); setTicketId(""); }} className="w-full border-2 border-gray-200 hover:border-[#f5a623] text-gray-600 hover:text-[#f5a623] font-semibold text-sm py-3 rounded-xl transition-all duration-200">
              Submit another ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-0">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');*{font-family:'Sora',sans-serif}`}</style>
      <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#f5a623] via-[#ffcd70] to-[#f5a623]" />
        <div className="p-5 sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#f5a623] to-[#e09610] flex items-center justify-center shadow-md shadow-[#f5a623]/30 flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-gray-900 text-lg sm:text-xl font-bold leading-tight">Submit a Support Ticket</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Fill in the details and we'll get back to you.</p>
            </div>
          </div>
          <div className="space-y-4 sm:space-y-5">
            {/* ... Your original fields (Name/Email/Category/Priority/Subject/Description) remain exactly as they were ... */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label text="Full Name" error={errors.name} /><input type="text" placeholder="Jane Smith" value={form.name} onChange={set("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused("")} className={baseCls("name")} />{errors.name && <Err msg={errors.name} />}</div>
              <div><Label text="Email Address" error={errors.email} /><input type="email" placeholder="jane@company.com" value={form.email} onChange={set("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused("")} className={baseCls("email")} />{errors.email && <Err msg={errors.email} />}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label text="Category" error={errors.category} /><div className="relative"><select value={form.category} onChange={set("category")} onFocus={() => setFocused("category")} onBlur={() => setFocused("")} className={`${baseCls("category")} appearance-none pr-10 cursor-pointer ${!form.category ? "text-gray-400" : "text-gray-900"}`}><option value="" disabled>Select…</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select><ChevronIcon /></div>{errors.category && <Err msg={errors.category} />}</div>
              <div><Label text="Priority" error={errors.priority} /><div className="relative"><select value={form.priority} onChange={set("priority")} onFocus={() => setFocused("priority")} onBlur={() => setFocused("")} className={`${baseCls("priority")} appearance-none pr-10 cursor-pointer ${!form.priority ? "text-gray-400" : "text-gray-900"}`}><option value="" disabled>Select…</option>{priorities.map((p) => <option key={p} value={p}>{p}</option>)}</select><ChevronIcon /></div>{errors.priority && <Err msg={errors.priority} />}</div>
            </div>
            <div><Label text="Subject" error={errors.subject} /><input type="text" placeholder="Brief summary" value={form.subject} onChange={set("subject")} onFocus={() => setFocused("subject")} onBlur={() => setFocused("")} className={baseCls("subject")} />{errors.subject && <Err msg={errors.subject} />}</div>
            <div><Label text="Description" error={errors.description} /><textarea placeholder="Describe the issue..." value={form.description} onChange={set("description")} onFocus={() => setFocused("description")} onBlur={() => setFocused("")} rows={5} className={`${baseCls("description")} resize-none leading-relaxed`} /></div>

            <button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-[#f5a623] to-[#e09610] hover:from-[#e09610] hover:to-[#cc8800] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#f5a623]/30 hover:shadow-[#f5a623]/40 flex items-center justify-center gap-2">
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ text, error }) {
  return (
    <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${error ? "text-red-400" : "text-gray-500"}`}>
      {text}
    </label>
  );
}

function Err({ msg }) {
  return <p className="text-red-400 text-[11px] font-medium mt-1">{msg}</p>;
}

function ChevronIcon() {
  return (
    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}