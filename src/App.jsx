import { useState, useEffect, useCallback } from "react";

const DAYS_DEFAULT = [
  { id: 1, label: "Samstag, 10. Mai", color: "#E8B931" },
  { id: 2, label: "Sonntag, 11. Mai", color: "#D46A43" },
  { id: 3, label: "Montag, 12. Mai", color: "#5B8C5A" },
];

const ICONS = ["🏋️", "💪", "🚛", "🧹", "📦", "🔧", "🪜", "🛠️", "🎒", "🍕"];

function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

export default function Umzugsplaner() {
  const [helpers, setHelpers] = usePersistedState("umzug_helpers", [
    { id: 1, name: "Dennis", phone: "", icon: "💪" },
    { id: 2, name: "Stefanie", phone: "", icon: "📦" },
  ]);
  const [days, setDays] = usePersistedState("umzug_days", DAYS_DEFAULT);
  const [assignments, setAssignments] = usePersistedState("umzug_assignments", { "1-1": true, "2-1": true, "2-2": true });
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDay, setNewDay] = useState("");
  const [editingHelper, setEditingHelper] = useState(null);
  const [tab, setTab] = useState("plan"); // plan | helfer | tage

  const nextId = (arr) => Math.max(0, ...arr.map(a => a.id)) + 1;

  const addHelper = () => {
    if (!newName.trim()) return;
    setHelpers(h => [...h, { id: nextId(h), name: newName.trim(), phone: newPhone.trim(), icon: ICONS[Math.floor(Math.random() * ICONS.length)] }]);
    setNewName("");
    setNewPhone("");
  };

  const removeHelper = (id) => {
    setHelpers(h => h.filter(x => x.id !== id));
    setAssignments(a => {
      const next = { ...a };
      Object.keys(next).forEach(k => { if (k.endsWith(`-${id}`)) delete next[k]; });
      return next;
    });
  };

  const addDay = () => {
    if (!newDay.trim()) return;
    const colors = ["#E8B931", "#D46A43", "#5B8C5A", "#6B7FD7", "#C75B8E", "#4AADBA"];
    setDays(d => [...d, { id: nextId(d), label: newDay.trim(), color: colors[d.length % colors.length] }]);
    setNewDay("");
  };

  const removeDay = (id) => {
    setDays(d => d.filter(x => x.id !== id));
    setAssignments(a => {
      const next = { ...a };
      Object.keys(next).forEach(k => { if (k.startsWith(`${id}-`)) delete next[k]; });
      return next;
    });
  };

  const toggleAssign = (dayId, helperId) => {
    const key = `${dayId}-${helperId}`;
    setAssignments(a => {
      const next = { ...a };
      if (next[key]) delete next[key]; else next[key] = true;
      return next;
    });
  };

  const helpersForDay = (dayId) => helpers.filter(h => assignments[`${dayId}-${h.id}`]);

  const totalSlots = Object.keys(assignments).length;

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a1a", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e8e4df" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .up-header { padding: 32px 24px 20px; background: linear-gradient(135deg, #1a1a1a 60%, #2a2520); border-bottom: 1px solid #333; }
        .up-title { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; letter-spacing: -0.5px; background: linear-gradient(90deg, #E8B931, #D46A43); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .up-sub { color: #888; font-size: 0.85rem; margin-top: 4px; }
        .up-tabs { display: flex; gap: 4px; padding: 12px 24px; background: #222; border-bottom: 1px solid #333; }
        .up-tab { flex: 1; padding: 10px; border: none; border-radius: 8px; background: transparent; color: #888; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .up-tab.active { background: #333; color: #E8B931; }
        .up-body { padding: 20px 24px 100px; }
        .up-card { background: #252525; border-radius: 14px; padding: 16px; margin-bottom: 12px; border: 1px solid #333; transition: all 0.2s; }
        .up-card:hover { border-color: #444; }
        .up-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px 4px 6px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; }
        .up-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #1a1a1a; flex-shrink: 0; }
        .up-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
        .up-toggle { padding: 10px; border-radius: 10px; border: 2px solid #333; background: #1a1a1a; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 8px; }
        .up-toggle.on { border-color: var(--ac); background: color-mix(in srgb, var(--ac) 12%, #1a1a1a); }
        .up-toggle .dot { width: 8px; height: 8px; border-radius: 50%; background: #555; transition: all 0.15s; flex-shrink: 0; }
        .up-toggle.on .dot { background: var(--ac); box-shadow: 0 0 8px var(--ac); }
        .up-toggle span { font-size: 0.8rem; color: #aaa; }
        .up-toggle.on span { color: #e8e4df; }
        .up-input { width: 100%; padding: 12px 14px; border-radius: 10px; border: 1px solid #333; background: #1a1a1a; color: #e8e4df; font-size: 0.9rem; font-family: inherit; outline: none; transition: border 0.2s; }
        .up-input:focus { border-color: #E8B931; }
        .up-input::placeholder { color: #555; }
        .up-btn { padding: 12px 20px; border-radius: 10px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .up-btn:active { transform: scale(0.97); }
        .up-btn-primary { background: linear-gradient(135deg, #E8B931, #D46A43); color: #1a1a1a; }
        .up-btn-ghost { background: transparent; color: #888; border: 1px solid #333; }
        .up-btn-danger { background: #3a2020; color: #e55; border: 1px solid #4a2020; }
        .up-stat { text-align: center; padding: 12px; }
        .up-stat-num { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; }
        .up-stat-label { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        .up-day-header { display: flex; align-items: center; justify-content: space-between; }
        .up-day-title { font-weight: 700; font-size: 1rem; }
        .up-day-count { font-size: 0.75rem; color: #888; background: #333; padding: 2px 10px; border-radius: 10px; }
        .up-helper-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #2a2a2a; }
        .up-helper-row:last-child { border: none; }
        .up-helper-name { font-weight: 500; font-size: 0.95rem; flex: 1; }
        .up-helper-phone { font-size: 0.75rem; color: #888; }
        .up-helper-days { display: flex; gap: 4px; flex-wrap: wrap; }
        .up-empty { text-align: center; padding: 40px 20px; color: #555; }
        .up-empty-icon { font-size: 2.5rem; margin-bottom: 8px; }
        .up-row { display: flex; gap: 8px; }
        .up-remove { background: none; border: none; color: #555; cursor: pointer; font-size: 1.1rem; padding: 4px; border-radius: 6px; transition: all 0.15s; }
        .up-remove:hover { color: #e55; background: #3a2020; }
      `}</style>

      <div className="up-header">
        <div className="up-title">Umzugsplaner</div>
        <div className="up-sub">Helfer koordinieren & Tage planen</div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", borderBottom: "1px solid #333", background: "#222" }}>
        <div className="up-stat" style={{ flex: 1, borderRight: "1px solid #333" }}>
          <div className="up-stat-num" style={{ color: "#E8B931" }}>{helpers.length}</div>
          <div className="up-stat-label">Helfer</div>
        </div>
        <div className="up-stat" style={{ flex: 1, borderRight: "1px solid #333" }}>
          <div className="up-stat-num" style={{ color: "#D46A43" }}>{days.length}</div>
          <div className="up-stat-label">Tage</div>
        </div>
        <div className="up-stat" style={{ flex: 1 }}>
          <div className="up-stat-num" style={{ color: "#5B8C5A" }}>{totalSlots}</div>
          <div className="up-stat-label">Einsätze</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="up-tabs">
        {[["plan", "📋 Planung"], ["helfer", "👥 Helfer"], ["tage", "📅 Tage"]].map(([k, l]) => (
          <button key={k} className={`up-tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div className="up-body">
        {/* ===== PLAN TAB ===== */}
        {tab === "plan" && (
          <>
            {days.length === 0 || helpers.length === 0 ? (
              <div className="up-empty">
                <div className="up-empty-icon">📋</div>
                <div>Lege zuerst Helfer und Tage an.</div>
              </div>
            ) : days.map(day => (
              <div className="up-card" key={day.id}>
                <div className="up-day-header">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 6, height: 28, borderRadius: 3, background: day.color }} />
                    <div className="up-day-title">{day.label}</div>
                  </div>
                  <div className="up-day-count">{helpersForDay(day.id).length} Helfer</div>
                </div>
                <div className="up-grid" style={{ "--ac": day.color }}>
                  {helpers.map(h => {
                    const on = !!assignments[`${day.id}-${h.id}`];
                    return (
                      <div key={h.id} className={`up-toggle ${on ? "on" : ""}`} onClick={() => toggleAssign(day.id, h.id)}>
                        <div className="dot" />
                        <span>{h.icon} {h.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {/* ===== HELFER TAB ===== */}
        {tab === "helfer" && (
          <>
            <div className="up-card" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: "0.9rem" }}>Neuen Helfer anlegen</div>
              <div className="up-row" style={{ marginBottom: 8 }}>
                <input className="up-input" placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addHelper()} />
              </div>
              <div className="up-row" style={{ marginBottom: 12 }}>
                <input className="up-input" placeholder="Telefon (optional)" value={newPhone} onChange={e => setNewPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && addHelper()} />
              </div>
              <button className="up-btn up-btn-primary" style={{ width: "100%" }} onClick={addHelper}>+ Helfer hinzufügen</button>
            </div>

            {helpers.length === 0 ? (
              <div className="up-empty"><div className="up-empty-icon">👥</div><div>Noch keine Helfer angelegt.</div></div>
            ) : helpers.map(h => {
              const hDays = days.filter(d => assignments[`${d.id}-${h.id}`]);
              return (
                <div className="up-card" key={h.id}>
                  <div className="up-helper-row" style={{ borderBottom: "none" }}>
                    <div className="up-avatar" style={{ background: "#E8B931", fontSize: "1rem" }}>{h.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="up-helper-name">{h.name}</div>
                      {h.phone && <div className="up-helper-phone">📞 {h.phone}</div>}
                    </div>
                    <div className="up-helper-days">
                      {hDays.map(d => (
                        <span key={d.id} className="up-chip" style={{ background: `${d.color}22`, color: d.color, border: `1px solid ${d.color}44` }}>{d.label.split(",")[0]}</span>
                      ))}
                    </div>
                    <button className="up-remove" onClick={() => removeHelper(h.id)} title="Entfernen">✕</button>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ===== TAGE TAB ===== */}
        {tab === "tage" && (
          <>
            <div className="up-card" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: "0.9rem" }}>Neuen Tag anlegen</div>
              <div className="up-row" style={{ marginBottom: 12 }}>
                <input className="up-input" placeholder='z.B. "Samstag, 10. Mai"' value={newDay} onChange={e => setNewDay(e.target.value)} onKeyDown={e => e.key === "Enter" && addDay()} />
              </div>
              <button className="up-btn up-btn-primary" style={{ width: "100%" }} onClick={addDay}>+ Tag hinzufügen</button>
            </div>

            {days.length === 0 ? (
              <div className="up-empty"><div className="up-empty-icon">📅</div><div>Noch keine Tage angelegt.</div></div>
            ) : days.map(d => (
              <div className="up-card" key={d.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: d.color }} />
                    <span style={{ fontWeight: 600 }}>{d.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.8rem", color: "#888" }}>{helpersForDay(d.id).length} Helfer</span>
                    <button className="up-remove" onClick={() => removeDay(d.id)} title="Entfernen">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
