import { useEffect, useState } from 'react'
import { createClient, type User } from '@supabase/supabase-js'
import {
  Activity, ArrowUpRight, BarChart3, CalendarDays, Check,
  ChevronDown, CircleUserRound, Dumbbell, Flame, LogOut,
  Medal, Plus, Save, Scale, Sparkles, TrendingUp,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import './App.css'

type Tab = 'today' | 'plan' | 'progress'
type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
type SetLog = { exercise: string; weight: number; reps: number; rir: number; date: string }
type Measurement = { date: string; weight: number; waist: number; chest: number; arm: number; thigh: number; hip: number; neck: number }
type Exercise = { name: string; sets: number; reps: string; rir: string; rest: string; why: string; subs: string[] }

const supabase = createClient(
  'https://wzqayqiorgnjgkjxuobp.supabase.co',
  'sb_publishable_kwLx2flp63gSicXa8DAkyw_u4UChi1t',
)

const sessions: Record<string, { label: string; focus: string; color: string; exercises: Exercise[] }> = {
  lowerA: { label: 'Lower A', focus: 'Quad + strength', color: '#d9ff59', exercises: [
    { name: 'Hack Squat', sets: 3, reps: '5-8', rir: '1-2', rest: '3 min', why: 'Stable, deep knee flexion and easy progression with less systemic fatigue than a barbell squat.', subs: ['Pendulum squat', 'Leg press'] },
    { name: 'Romanian Deadlift', sets: 3, reps: '6-10', rir: '2', rest: '3 min', why: 'High-tension hip hinge through a long hamstring length.', subs: ['45 degree hyperextension', 'DB Romanian deadlift'] },
    { name: 'Leg Extension', sets: 2, reps: '10-15', rir: '1', rest: '90 sec', why: 'Direct rectus femoris and quad work without more axial fatigue.', subs: ['Sissy squat', 'Reverse Nordic'] },
    { name: 'Seated Leg Curl', sets: 2, reps: '10-15', rir: '1', rest: '90 sec', why: 'Trains knee flexion with hamstrings at a long muscle length.', subs: ['Lying leg curl', 'Nordic curl'] },
    { name: 'Standing Calf Raise', sets: 3, reps: '8-12', rir: '1', rest: '90 sec', why: 'Straight-knee calf work emphasizes gastrocnemius.', subs: ['Leg press calf raise', 'Single-leg calf raise'] },
  ] },
  upperA: { label: 'Upper A', focus: 'Press + pull strength', color: '#ff8b6a', exercises: [
    { name: 'Incline DB Press', sets: 3, reps: '6-10', rir: '1-2', rest: '3 min', why: 'Stable press with strong upper-chest stimulus and free shoulder path.', subs: ['Incline machine press', 'Low-incline Smith press'] },
    { name: 'Neutral-Grip Pull-up', sets: 3, reps: '6-10', rir: '1-2', rest: '3 min', why: 'Scalable vertical pull with a shoulder-friendly grip.', subs: ['Neutral lat pulldown', 'Assisted pull-up'] },
    { name: 'Chest-Supported Row', sets: 3, reps: '8-12', rir: '1-2', rest: '2 min', why: 'High back stimulus without taxing the lower back before sports.', subs: ['Seated cable row', 'Machine row'] },
    { name: 'Cable Lateral Raise', sets: 3, reps: '12-20', rir: '1', rest: '75 sec', why: 'Consistent lateral-delt tension with little recovery cost.', subs: ['Machine lateral raise', 'DB lateral raise'] },
    { name: 'Cable Triceps Extension', sets: 2, reps: '10-15', rir: '1', rest: '75 sec', why: 'Direct elbow extension with easy load control.', subs: ['DB French press', 'EZ-bar skull crusher'] },
    { name: 'Bayesian Cable Curl', sets: 2, reps: '10-15', rir: '1', rest: '75 sec', why: 'Loads the biceps in a lengthened position.', subs: ['Incline DB curl', 'Cable curl'] },
  ] },
  lowerB: { label: 'Lower B', focus: 'Glute + hamstring', color: '#75d7ff', exercises: [
    { name: 'Leg Press', sets: 3, reps: '8-12', rir: '2', rest: '3 min', why: 'Stable bilateral leg work with low skill and fatigue cost.', subs: ['Hack squat', 'Machine squat'] },
    { name: 'Bulgarian Split Squat', sets: 3, reps: '8-12', rir: '2', rest: '2 min', why: 'Unilateral strength and hip stability useful for racket sports.', subs: ['Reverse lunge', 'DB step-up'] },
    { name: '45 Degree Hyperextension', sets: 3, reps: '10-15', rir: '2', rest: '2 min', why: 'Glute-biased hinge with less soreness than another heavy RDL day.', subs: ['Cable pull-through', 'Hip thrust'] },
    { name: 'Lying Leg Curl', sets: 3, reps: '8-12', rir: '1', rest: '90 sec', why: 'Complements hip extension with direct knee-flexion work.', subs: ['Seated leg curl', 'Assisted Nordic curl'] },
    { name: 'Seated Calf Raise', sets: 3, reps: '10-15', rir: '1', rest: '90 sec', why: 'Bent-knee calf work emphasizes soleus for running and court sports.', subs: ['Bent-knee calf raise', 'Leg press calf raise'] },
    { name: 'Cable Crunch', sets: 2, reps: '10-15', rir: '1', rest: '75 sec', why: 'Progressive loaded trunk flexion.', subs: ['Machine crunch', 'Reverse crunch'] },
  ] },
  upperB: { label: 'Upper B', focus: 'Back + shoulders', color: '#c6a5ff', exercises: [
    { name: 'Machine Chest Press', sets: 3, reps: '8-12', rir: '2', rest: '2 min', why: 'Stable chest loading after swimming, without demanding setup.', subs: ['Flat DB press', 'Cable chest press'] },
    { name: 'One-Arm Lat Pulldown', sets: 3, reps: '8-12', rir: '2', rest: '2 min', why: 'Shoulder extension through a long range with side-to-side control.', subs: ['Machine pulldown', 'Chin-up'] },
    { name: 'Machine Row', sets: 3, reps: '10-15', rir: '1-2', rest: '2 min', why: 'Stable upper-back volume with minimal lower-back fatigue.', subs: ['Helms row', 'Chest-supported T-bar row'] },
    { name: 'Reverse Pec Deck', sets: 3, reps: '12-20', rir: '1', rest: '75 sec', why: 'Direct rear-delt work to balance pressing and swimming.', subs: ['Cable rear-delt fly', 'Face pull'] },
    { name: 'Overhead Cable Triceps', sets: 2, reps: '10-15', rir: '1', rest: '75 sec', why: 'Lengthened-position work for the triceps long head.', subs: ['DB French press', 'PJR pullover'] },
    { name: 'Preacher Curl', sets: 2, reps: '10-15', rir: '1', rest: '75 sec', why: 'Stable elbow flexion that is simple to progress.', subs: ['Machine curl', 'Spider curl'] },
  ] },
}

const days: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const defaultSchedule: Record<string, Day> = { lowerA: 'Mon', upperA: 'Tue', lowerB: 'Wed', upperB: 'Fri' }
const sports: Partial<Record<Day, string>> = { Thu: 'Swim · 7 PM', Fri: 'Badminton · 1 hr', Sun: 'Tennis · coached' }
const baseline = { date: '2026-01-27', weight: 75.9, waist: 0, chest: 0, arm: 0, thigh: 0, hip: 0, neck: 0 }
const demoStrength = [
  { week: 'W1', e1rm: 72 }, { week: 'W2', e1rm: 74 }, { week: 'W3', e1rm: 75 },
  { week: 'W4', e1rm: 77 }, { week: 'W5', e1rm: 79 }, { week: 'W6', e1rm: 81 },
]

function loadLocal<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback }
}

function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [schedule, setSchedule] = useState(() => loadLocal('ash-schedule', defaultSchedule))
  const [logs, setLogs] = useState<SetLog[]>(() => loadLocal('ash-logs', []))
  const [measurements, setMeasurements] = useState<Measurement[]>(() => loadLocal('ash-measurements', [baseline]))
  const [activeSession, setActiveSession] = useState('lowerA')
  const [openExercise, setOpenExercise] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => { localStorage.setItem('ash-schedule', JSON.stringify(schedule)) }, [schedule])
  useEffect(() => { localStorage.setItem('ash-logs', JSON.stringify(logs)) }, [logs])
  useEffect(() => { localStorage.setItem('ash-measurements', JSON.stringify(measurements)) }, [measurements])

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('workout_sets').select('*').order('performed_at'),
      supabase.from('measurements').select('*').order('measured_at'),
    ]).then(([setsResult, measurementsResult]) => {
      if (setsResult.data?.length) setLogs(setsResult.data.map((row) => ({ exercise: row.exercise, weight: Number(row.weight_kg), reps: row.reps, rir: row.rir, date: row.performed_at })))
      if (measurementsResult.data?.length) setMeasurements(measurementsResult.data.map((row) => ({ date: row.measured_at, weight: Number(row.weight_kg), waist: Number(row.waist_cm || 0), chest: Number(row.chest_cm || 0), arm: Number(row.arm_cm || 0), thigh: Number(row.thigh_cm || 0), hip: Number(row.hip_cm || 0), neck: Number(row.neck_cm || 0) })))
    })
  }, [user])

  const session = sessions[activeSession]
  const totalVolume = logs.reduce((sum, log) => sum + log.weight * log.reps, 0)
  const strengthData = logs.length ? logs.slice(-8).map((l, i) => ({ week: `${i + 1}`, e1rm: Math.round(l.weight * (1 + l.reps / 30)) })) : demoStrength
  const bodyData = measurements.map((m) => ({ date: m.date.slice(5), weight: m.weight, waist: m.waist || undefined }))

  async function magicLink() {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } })
    setAuthMessage(error ? error.message : 'Check your inbox for the secure sign-in link.')
  }

  function addSet(exercise: string, weight: number, reps: number, rir: number) {
    const entry = { exercise, weight, reps, rir, date: new Date().toISOString() }
    setLogs((current) => [...current, entry])
    if (user) void supabase.from('workout_sets').insert({ user_id: user.id, session_name: session.label, exercise, weight_kg: weight, reps, rir, performed_at: entry.date })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setTab('today')}><span>AS</span><b>ASHAY<br />STRENGTH</b></button>
        <nav>
          <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}><Dumbbell /> Today</button>
          <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}><CalendarDays /> Plan</button>
          <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}><BarChart3 /> Progress</button>
        </nav>
        <div className="profile-mini">
          <button onClick={() => setShowProfile(!showProfile)}><CircleUserRound /><span><b>Ashay</b><small>{user ? 'Cloud synced' : 'Local mode'}</small></span><ChevronDown /></button>
          {showProfile && <div className="profile-popover">
            {user ? <><small>{user.email}</small><button onClick={() => supabase.auth.signOut()}><LogOut /> Sign out</button></> : <>
              <b>Sync across devices</b><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" /><button className="primary" onClick={magicLink}>Email me a link</button><small>{authMessage}</small>
            </>}
          </div>}
        </div>
      </aside>

      <main>
        <header className="mobile-header"><button className="brand"><span>AS</span><b>ASHAY STRENGTH</b></button><button onClick={() => setShowProfile(!showProfile)}><CircleUserRound /></button></header>
        {tab === 'today' && <Today sessionKey={activeSession} setSessionKey={setActiveSession} logs={logs} addSet={addSet} openExercise={openExercise} setOpenExercise={setOpenExercise} />}
        {tab === 'plan' && <Plan schedule={schedule} setSchedule={setSchedule} />}
        {tab === 'progress' && <Progress totalVolume={totalVolume} logs={logs} strengthData={strengthData} bodyData={bodyData} measurements={measurements} setMeasurements={setMeasurements} user={user} />}
      </main>

      <nav className="bottom-nav">
        <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}><Dumbbell />Today</button>
        <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}><CalendarDays />Plan</button>
        <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}><BarChart3 />Progress</button>
      </nav>
    </div>
  )
}

function Today({ sessionKey, setSessionKey, logs, addSet, openExercise, setOpenExercise }: { sessionKey: string; setSessionKey: (s: string) => void; logs: SetLog[]; addSet: (e: string, w: number, r: number, rir: number) => void; openExercise: string | null; setOpenExercise: (s: string | null) => void }) {
  const session = sessions[sessionKey]
  return <div className="page">
    <div className="eyebrow">WEEK 1 · BUILD PHASE</div>
    <div className="page-title"><div><h1>Train with intent.</h1><p>Log clean reps. Leave the gym ready to recover.</p></div><div className="readiness"><Flame /><span><small>READINESS</small><b>Good day</b></span></div></div>
    <div className="session-tabs">{Object.entries(sessions).map(([key, value]) => <button key={key} onClick={() => setSessionKey(key)} className={key === sessionKey ? 'active' : ''}>{value.label}</button>)}</div>
    <section className="workout-hero" style={{ '--session-color': session.color } as React.CSSProperties}>
      <div><span className="workout-number">{Object.keys(sessions).indexOf(sessionKey) + 1}</span><div><small>TODAY'S SESSION</small><h2>{session.label}</h2><p>{session.focus} · 60-75 min</p></div></div>
      <span className="status-pill"><Activity /> Sports-aware volume</span>
    </section>
    <div className="exercise-list">
      {session.exercises.map((exercise, index) => {
        const previous = [...logs].reverse().find((l) => l.exercise === exercise.name)
        return <ExerciseCard key={exercise.name} exercise={exercise} index={index} previous={previous} expanded={openExercise === exercise.name} toggle={() => setOpenExercise(openExercise === exercise.name ? null : exercise.name)} addSet={addSet} />
      })}
    </div>
    <div className="coach-note"><Sparkles /><div><b>Progression rule</b><p>Reach the top of the rep range on every set at the target RIR, then add the smallest available load next time. Keep 2 RIR on compounds during tiring sport weeks.</p></div></div>
  </div>
}

function ExerciseCard({ exercise, index, previous, expanded, toggle, addSet }: { exercise: Exercise; index: number; previous?: SetLog; expanded: boolean; toggle: () => void; addSet: (e: string, w: number, r: number, rir: number) => void }) {
  const [weight, setWeight] = useState(previous?.weight || 0)
  const [reps, setReps] = useState(previous?.reps || Number(exercise.reps.split('-')[0]))
  const [rir, setRir] = useState(2)
  const [sub, setSub] = useState(exercise.name)
  return <article className={`exercise-card ${expanded ? 'expanded' : ''}`}>
    <button className="exercise-summary" onClick={toggle}>
      <span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><div><h3>{sub}</h3><p>{exercise.sets} sets · {exercise.reps} reps · {exercise.rir} RIR</p></div>
      <span className="previous">{previous ? <><small>LAST</small><b>{previous.weight} kg × {previous.reps}</b></> : <><small>REST</small><b>{exercise.rest}</b></>}</span><ChevronDown />
    </button>
    {expanded && <div className="exercise-detail">
      <div className="why"><b>Why it earns its place</b><p>{exercise.why}</p></div>
      <label>Exercise or substitute<select value={sub} onChange={(e) => setSub(e.target.value)}><option>{exercise.name}</option>{exercise.subs.map((s) => <option key={s}>{s}</option>)}</select></label>
      <div className="set-entry"><label>Weight <span><input type="number" min="0" step="0.5" value={weight} onChange={(e) => setWeight(Number(e.target.value))} /> kg</span></label><label>Reps <input type="number" min="1" value={reps} onChange={(e) => setReps(Number(e.target.value))} /></label><label>RIR <input type="number" min="0" max="5" value={rir} onChange={(e) => setRir(Number(e.target.value))} /></label><button className="primary" onClick={() => addSet(sub, weight, reps, rir)}><Plus /> Log set</button></div>
    </div>}
  </article>
}

function Plan({ schedule, setSchedule }: { schedule: Record<string, Day>; setSchedule: React.Dispatch<React.SetStateAction<Record<string, Day>>> }) {
  const lowerDays = [schedule.lowerA, schedule.lowerB].map((d) => days.indexOf(d)).sort()
  const lowerGap = lowerDays[1] - lowerDays[0]
  return <div className="page">
    <div className="eyebrow">YOUR WEEK · FULLY FLEXIBLE</div><div className="page-title"><div><h1>Build around life.</h1><p>Choose any lifting days. Recovery guidance updates with you.</p></div></div>
    <section className="week-grid">{days.map((day) => <div className="day-column" key={day}><h3>{day}</h3>{sports[day] && <div className="sport-card"><Activity />{sports[day]}</div>}{Object.entries(schedule).filter(([, d]) => d === day).map(([key]) => <div className="day-session" style={{ borderColor: sessions[key].color }} key={key}><b>{sessions[key].label}</b><small>{sessions[key].focus}</small></div>)}</div>)}</section>
    <section className="plan-grid">
      {Object.entries(sessions).map(([key, session]) => <article className="plan-card" key={key} style={{ '--session-color': session.color } as React.CSSProperties}><div><span></span><div><h3>{session.label}</h3><p>{session.focus} · {session.exercises.length} exercises</p></div></div><label>Training day<select value={schedule[key]} onChange={(e) => setSchedule((s) => ({ ...s, [key]: e.target.value as Day }))}>{days.map((day) => <option key={day}>{day}</option>)}</select></label></article>)}
    </section>
    <section className={`recovery-check ${lowerGap < 2 ? 'warning' : ''}`}><Check /><div><b>{lowerGap < 2 ? 'Lower sessions are too close' : 'Recovery spacing looks workable'}</b><p>{lowerGap < 2 ? 'Separate Lower A and Lower B by at least one full day.' : 'Keep the hardest lower session at least 48 hours from tennis when possible. Friday Upper B is intentionally low-fatigue after badminton.'}</p></div></section>
    <section className="profile-baseline"><div><small>PROGRAM INPUT</small><h2>Your January baseline</h2><p>The scan guides trend tracking, not exercise diagnosis. Balanced segmental lean mass does not suggest a corrective side bias.</p></div><div className="baseline-stats"><span><b>75.9</b>kg weight</span><span><b>21.1</b>% body fat</span><span><b>34.2</b>kg SMM</span><span><b>6</b>visceral level</span><span><b>174</b>cm corrected</span><span><b>30</b>years</span></div></section>
  </div>
}

function Progress({ totalVolume, logs, strengthData, bodyData, measurements, setMeasurements, user }: { totalVolume: number; logs: SetLog[]; strengthData: { week: string; e1rm: number }[]; bodyData: { date: string; weight: number; waist?: number }[]; measurements: Measurement[]; setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>; user: User | null }) {
  const latest = measurements[measurements.length - 1]
  const [form, setForm] = useState<Measurement>({ ...latest, date: new Date().toISOString().slice(0, 10) })
  const [showForm, setShowForm] = useState(false)
  const best = logs.reduce((max, l) => Math.max(max, l.weight * (1 + l.reps / 30)), 0)
  return <div className="page">
    <div className="eyebrow">PERFORMANCE · ALL TIME</div><div className="page-title"><div><h1>Proof, not guesses.</h1><p>Strength, consistency and body trends in one view.</p></div><button className="primary" onClick={() => setShowForm(!showForm)}><Plus /> New measurement</button></div>
    {showForm && <MeasurementForm form={form} setForm={setForm} save={() => { setMeasurements((m) => [...m, form]); if (user) void supabase.from('measurements').insert({ user_id: user.id, measured_at: form.date, weight_kg: form.weight, waist_cm: form.waist || null, chest_cm: form.chest || null, arm_cm: form.arm || null, thigh_cm: form.thigh || null, hip_cm: form.hip || null, neck_cm: form.neck || null }); setShowForm(false) }} />}
    <section className="metric-grid"><div><TrendingUp /><small>EST. 1RM BEST</small><b>{best ? `${Math.round(best)} kg` : 'Start logging'}</b><p>Calculated from your sets</p></div><div><Dumbbell /><small>TOTAL VOLUME</small><b>{totalVolume ? `${Math.round(totalVolume).toLocaleString()} kg` : '0 kg'}</b><p>{logs.length} sets logged</p></div><div><Medal /><small>CONSISTENCY</small><b>{logs.length ? 'On track' : 'Week 1'}</b><p>Target: 4 sessions/week</p></div><div><Scale /><small>BODYWEIGHT</small><b>{latest.weight} kg</b><p>Baseline: 75.9 kg</p></div></section>
    <section className="chart-grid"><article className="chart-card wide"><div><span><small>STRENGTH TREND</small><h2>Estimated 1RM</h2></span><span className="trend"><ArrowUpRight /> Double progression</span></div><ResponsiveContainer width="100%" height={280}><AreaChart data={strengthData}><defs><linearGradient id="strength" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d9ff59" stopOpacity={0.5}/><stop offset="95%" stopColor="#d9ff59" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2c2c2c"/><XAxis dataKey="week" stroke="#777"/><YAxis stroke="#777" domain={['dataMin - 5', 'dataMax + 5']}/><Tooltip contentStyle={{ background: '#191919', border: '1px solid #333' }}/><Area type="monotone" dataKey="e1rm" stroke="#d9ff59" strokeWidth={3} fill="url(#strength)"/></AreaChart></ResponsiveContainer></article>
    <article className="chart-card"><div><span><small>BODY TREND</small><h2>Weight</h2></span></div><ResponsiveContainer width="100%" height={280}><LineChart data={bodyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2c2c2c"/><XAxis dataKey="date" stroke="#777"/><YAxis stroke="#777" domain={['dataMin - 2', 'dataMax + 2']}/><Tooltip contentStyle={{ background: '#191919', border: '1px solid #333' }}/><Line type="monotone" dataKey="weight" stroke="#75d7ff" strokeWidth={3} dot={{ fill: '#75d7ff' }}/></LineChart></ResponsiveContainer></article></section>
    <section className="measure-table"><div><h2>Latest measurements</h2><button onClick={() => setShowForm(true)}>Add entry <Plus /></button></div><div className="measurement-grid">{(['waist', 'chest', 'arm', 'thigh', 'hip', 'neck'] as const).map((key) => <span key={key}><small>{key}</small><b>{latest[key] || '—'} {latest[key] ? 'cm' : ''}</b></span>)}</div></section>
  </div>
}

function MeasurementForm({ form, setForm, save }: { form: Measurement; setForm: React.Dispatch<React.SetStateAction<Measurement>>; save: () => void }) {
  const fields: (keyof Measurement)[] = ['weight', 'waist', 'chest', 'arm', 'thigh', 'hip', 'neck']
  return <section className="measurement-form"><label>Date<input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}/></label>{fields.map((key) => <label key={key}>{key}<span><input type="number" step="0.1" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}/>{key === 'weight' ? 'kg' : 'cm'}</span></label>)}<button className="primary" onClick={save}><Save /> Save</button></section>
}

export default App
