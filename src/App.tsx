import { useEffect, useState } from 'react'
import { createClient, type User } from '@supabase/supabase-js'
import {
  Activity, ArrowUpRight, BarChart3, CalendarDays, Check,
  ChevronDown, CircleUserRound, Dumbbell, Flame, LogOut,
  ExternalLink, FileJson, FileSpreadsheet, Medal, Plus, Save,
  Scale, Sparkles, TrendingUp, Users, Wind,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import './App.css'

type Tab = 'today' | 'plan' | 'progress'
type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
type Profile = 'ashay' | 'girlfriend'
type SetLog = { exercise: string; weight: number; reps: number; date: string }
type Measurement = { date: string; weight: number; waist: number; chest: number; arm: number; thigh: number; hip: number; neck: number }
type Exercise = { name: string; sets: number; reps: string; rest: string; why: string; subs: [string, string] }

const supabase = createClient(
  'https://wzqayqiorgnjgkjxuobp.supabase.co',
  'sb_publishable_kwLx2flp63gSicXa8DAkyw_u4UChi1t',
)

const sessions: Record<string, { label: string; focus: string; color: string; exercises: Exercise[] }> = {
  lowerA: { label: 'Lower A', focus: 'Quad + strength', color: '#d9ff59', exercises: [
    { name: 'Machine Squat', sets: 3, reps: '6-10', rest: '3 min', why: 'Stable, deep knee flexion and easy progression without needing barbell-squat skill.', subs: ['Hack squat', 'Leg press'] },
    { name: 'Romanian Deadlift', sets: 3, reps: '6-10', rest: '3 min', why: 'High-tension hip hinge through a long hamstring length.', subs: ['45 degree hyperextension', 'DB Romanian deadlift'] },
    { name: 'Leg Extension', sets: 2, reps: '10-15', rest: '90 sec', why: 'Direct rectus femoris and quad work without more whole-body fatigue.', subs: ['Sissy squat', 'Reverse Nordic'] },
    { name: 'Seated Leg Curl', sets: 2, reps: '10-15', rest: '90 sec', why: 'Trains knee flexion with hamstrings at a long muscle length.', subs: ['Lying leg curl', 'Nordic curl'] },
    { name: 'Standing Calf Raise', sets: 3, reps: '8-12', rest: '90 sec', why: 'Straight-knee calf work emphasizes gastrocnemius.', subs: ['Leg press calf raise', 'Single-leg calf raise'] },
    { name: 'Hip Adduction Machine', sets: 2, reps: '12-20', rest: '60 sec', why: 'Adds direct inner-thigh work beyond the adductor stimulus from deep squats.', subs: ['Cable hip adduction', 'Wide-stance leg press'] },
  ] },
  upperA: { label: 'Upper A', focus: 'Press + pull strength', color: '#ff8b6a', exercises: [
    { name: 'Incline Machine Press', sets: 3, reps: '6-10', rest: '3 min', why: 'Your preferred stable press: easier to feel the upper chest and progress safely.', subs: ['Incline DB press', 'Low-incline Smith press'] },
    { name: 'Neutral-Grip Lat Pulldown', sets: 3, reps: '6-10', rest: '3 min', why: 'Stable vertical pull with a shoulder-friendly grip and simple progression.', subs: ['Neutral-grip pull-up', 'Assisted pull-up'] },
    { name: 'Chest-Supported Machine Row', sets: 3, reps: '8-12', rest: '2 min', why: 'High back stimulus without taxing the lower back before sports.', subs: ['Seated cable row', 'Chest-supported DB row'] },
    { name: 'Machine Shoulder Press', sets: 2, reps: '8-12', rest: '2 min', why: 'Stable overhead pressing lets you focus on the delts rather than balancing dumbbells.', subs: ['Seated DB shoulder press', 'Cable shoulder press'] },
    { name: 'Machine Lateral Raise', sets: 3, reps: '12-20', rest: '75 sec', why: 'Stable direct side-delt tension with little recovery cost.', subs: ['Cable lateral raise', 'DB lateral raise'] },
    { name: 'Cable Triceps Pressdown', sets: 2, reps: '10-15', rest: '75 sec', why: 'Stable direct triceps work with easy load control.', subs: ['Machine triceps extension', 'EZ-bar skull crusher'] },
    { name: 'Machine Preacher Curl', sets: 2, reps: '10-15', rest: '75 sec', why: 'The pad fixes your upper arm so the biceps do the work.', subs: ['Cable preacher curl', 'Incline DB curl'] },
  ] },
  lowerB: { label: 'Lower B', focus: 'Glute + hamstring', color: '#75d7ff', exercises: [
    { name: 'Leg Press', sets: 3, reps: '8-12', rest: '3 min', why: 'Stable bilateral leg work with low skill and fatigue cost.', subs: ['Machine squat', 'Hack squat'] },
    { name: 'Bulgarian Split Squat', sets: 3, reps: '8-12', rest: '2 min', why: 'Unilateral strength and hip stability useful for racket sports.', subs: ['Reverse lunge', 'DB step-up'] },
    { name: '45 Degree Hyperextension', sets: 3, reps: '10-15', rest: '2 min', why: 'Glute-biased hinge with less soreness than another heavy RDL day.', subs: ['Cable pull-through', 'Hip thrust'] },
    { name: 'Lying Leg Curl', sets: 3, reps: '8-12', rest: '90 sec', why: 'Complements hip extension with direct knee-flexion work.', subs: ['Seated leg curl', 'Assisted Nordic curl'] },
    { name: 'Seated Calf Raise', sets: 3, reps: '10-15', rest: '90 sec', why: 'Bent-knee calf work emphasizes soleus for running and court sports.', subs: ['Bent-knee calf raise', 'Leg press calf raise'] },
    { name: 'Cable Crunch', sets: 2, reps: '10-15', rest: '75 sec', why: 'Progressive loaded trunk flexion.', subs: ['Machine crunch', 'Reverse crunch'] },
    { name: 'Hip Abduction Machine', sets: 2, reps: '12-20', rest: '60 sec', why: 'Directly trains glute medius and minimus for hip stability during badminton and tennis.', subs: ['Cable hip abduction', 'Lateral band walk'] },
  ] },
  upperB: { label: 'Upper B', focus: 'Back + shoulders', color: '#c6a5ff', exercises: [
    { name: 'Machine Chest Press', sets: 3, reps: '8-12', rest: '2 min', why: 'Stable chest loading that matches your preference for feeling the pecs.', subs: ['Flat DB press', 'Cable chest press'] },
    { name: 'One-Arm Lat Pulldown', sets: 3, reps: '8-12', rest: '2 min', why: 'Shoulder extension through a long range with side-to-side control.', subs: ['Machine pulldown', 'Chin-up'] },
    { name: 'Machine Row', sets: 3, reps: '10-15', rest: '2 min', why: 'Stable upper-back volume with minimal lower-back fatigue.', subs: ['Helms row', 'Chest-supported T-bar row'] },
    { name: 'Reverse Pec Deck', sets: 3, reps: '12-20', rest: '75 sec', why: 'Direct rear-delt work to balance pressing and swimming.', subs: ['Cable rear-delt fly', 'Face pull'] },
    { name: 'Overhead Cable Triceps Extension', sets: 2, reps: '10-15', rest: '75 sec', why: 'Stable lengthened-position work for the triceps long head.', subs: ['Machine overhead triceps extension', 'DB French press'] },
    { name: 'Machine Biceps Curl', sets: 2, reps: '10-15', rest: '75 sec', why: 'Stable elbow flexion that makes progression and biceps focus simple.', subs: ['Cable curl', 'Spider curl'] },
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

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`
}

function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [profile, setProfile] = useState<Profile>(() => loadLocal('ash-active-profile', 'ashay'))
  const [schedule, setSchedule] = useState(() => loadLocal(`ash-schedule-${loadLocal<Profile>('ash-active-profile', 'ashay')}`, defaultSchedule))
  const [logs, setLogs] = useState<SetLog[]>(() => loadLocal(`ash-logs-${loadLocal<Profile>('ash-active-profile', 'ashay')}`, []))
  const [measurements, setMeasurements] = useState<Measurement[]>(() => loadLocal(`ash-measurements-${loadLocal<Profile>('ash-active-profile', 'ashay')}`, loadLocal<Profile>('ash-active-profile', 'ashay') === 'ashay' ? [baseline] : []))
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

  useEffect(() => { localStorage.setItem(`ash-schedule-${profile}`, JSON.stringify(schedule)) }, [schedule, profile])
  useEffect(() => { localStorage.setItem(`ash-logs-${profile}`, JSON.stringify(logs)) }, [logs, profile])
  useEffect(() => { localStorage.setItem(`ash-measurements-${profile}`, JSON.stringify(measurements)) }, [measurements, profile])

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('workout_sets').select('*').eq('profile', profile).order('performed_at'),
      supabase.from('measurements').select('*').eq('profile', profile).order('measured_at'),
    ]).then(([setsResult, measurementsResult]) => {
      if (setsResult.data?.length) setLogs(setsResult.data.map((row) => ({ exercise: row.exercise, weight: Number(row.weight_kg), reps: row.reps, date: row.performed_at })))
      if (measurementsResult.data?.length) setMeasurements(measurementsResult.data.map((row) => ({ date: row.measured_at, weight: Number(row.weight_kg), waist: Number(row.waist_cm || 0), chest: Number(row.chest_cm || 0), arm: Number(row.arm_cm || 0), thigh: Number(row.thigh_cm || 0), hip: Number(row.hip_cm || 0), neck: Number(row.neck_cm || 0) })))
    })
  }, [user, profile])

  const session = sessions[activeSession]
  const totalVolume = logs.reduce((sum, log) => sum + log.weight * log.reps, 0)
  const strengthData = logs.length ? logs.slice(-8).map((l, i) => ({ week: `${i + 1}`, e1rm: Math.round(l.weight * (1 + l.reps / 30)) })) : demoStrength
  const bodyData = measurements.map((m) => ({ date: m.date.slice(5), weight: m.weight, waist: m.waist || undefined }))

  async function magicLink() {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } })
    setAuthMessage(error ? error.message : 'Check your inbox for the secure sign-in link.')
  }

  function addSet(exercise: string, weight: number, reps: number) {
    const entry = { exercise, weight, reps, date: new Date().toISOString() }
    setLogs((current) => [...current, entry])
    if (user) void supabase.from('workout_sets').insert({ user_id: user.id, profile, session_name: session.label, exercise, weight_kg: weight, reps, rir: 2, performed_at: entry.date })
  }

  function switchProfile(next: Profile) {
    localStorage.setItem('ash-active-profile', JSON.stringify(next))
    setProfile(next)
    setSchedule(loadLocal(`ash-schedule-${next}`, defaultSchedule))
    setLogs(loadLocal(`ash-logs-${next}`, []))
    setMeasurements(loadLocal(`ash-measurements-${next}`, next === 'ashay' ? [baseline] : []))
    setOpenExercise(null)
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
        <div className="person-switch" role="group" aria-label="Choose training profile"><Users/><button className={profile === 'ashay' ? 'active' : ''} onClick={() => switchProfile('ashay')}>Ashay</button><button className={profile === 'girlfriend' ? 'active' : ''} onClick={() => switchProfile('girlfriend')}>Girlfriend</button></div>
        {profile === 'girlfriend' && <div className="profile-setup-note"><Sparkles/><p><b>Beginner profile is ready.</b> Her records are separate. The current exercise plan is only a preview until her details are added.</p></div>}
        {tab === 'today' && <Today sessionKey={activeSession} setSessionKey={setActiveSession} logs={logs} addSet={addSet} openExercise={openExercise} setOpenExercise={setOpenExercise} />}
        {tab === 'plan' && <Plan schedule={schedule} setSchedule={setSchedule} />}
        {tab === 'progress' && <Progress profile={profile} totalVolume={totalVolume} logs={logs} strengthData={strengthData} bodyData={bodyData} measurements={measurements} setMeasurements={setMeasurements} user={user} />}
      </main>

      <nav className="bottom-nav">
        <button className={tab === 'today' ? 'active' : ''} onClick={() => setTab('today')}><Dumbbell />Today</button>
        <button className={tab === 'plan' ? 'active' : ''} onClick={() => setTab('plan')}><CalendarDays />Plan</button>
        <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}><BarChart3 />Progress</button>
      </nav>
    </div>
  )
}

function Today({ sessionKey, setSessionKey, logs, addSet, openExercise, setOpenExercise }: { sessionKey: string; setSessionKey: (s: string) => void; logs: SetLog[]; addSet: (e: string, w: number, r: number) => void; openExercise: string | null; setOpenExercise: (s: string | null) => void }) {
  const session = sessions[sessionKey]
  return <div className="page">
    <div className="eyebrow">WEEK 1 · BUILD PHASE</div>
    <div className="page-title"><div><h1>Train with intent.</h1><p>Log clean reps. Leave the gym ready to recover.</p></div><div className="readiness"><Flame /><span><small>READINESS</small><b>Good day</b></span></div></div>
    <div className="session-tabs">{Object.entries(sessions).map(([key, value]) => <button key={key} onClick={() => setSessionKey(key)} className={key === sessionKey ? 'active' : ''}>{value.label}</button>)}</div>
    <section className="workout-hero" style={{ '--session-color': session.color } as React.CSSProperties}>
      <div><span className="workout-number">{Object.keys(sessions).indexOf(sessionKey) + 1}</span><div><small>TODAY'S SESSION</small><h2>{session.label}</h2><p>{session.focus} · 60-75 min</p></div></div>
      <span className="status-pill"><Activity /> Sports-aware volume</span>
    </section>
    <details className="session-warmup"><summary><Flame/><span><b>5-8 minute session warm-up</b><small>Open before training</small></span><ChevronDown/></summary><div><ol><li>3-5 minutes easy bike, treadmill or rower. You should feel warmer, not tired.</li><li>Do 5-8 controlled bodyweight reps of today’s main movement pattern.</li><li>Use the exercise card’s ramp-up sets for the first compound exercise.</li><li>For later exercises, do one easy rehearsal set only when needed.</li></ol><p>Static stretching is optional. Do not turn the warm-up into a workout.</p></div></details>
    <div className="exercise-list">
      {session.exercises.map((exercise, index) => {
        const previous = [...logs].reverse().find((l) => l.exercise === exercise.name)
        return <ExerciseCard key={exercise.name} exercise={exercise} index={index} previous={previous} expanded={openExercise === exercise.name} toggle={() => setOpenExercise(openExercise === exercise.name ? null : exercise.name)} addSet={addSet} />
      })}
    </div>
    <div className="coach-note"><Sparkles /><div><b>Progression rule</b><p>Use a weight that makes the final reps challenging while your technique stays clean. When every set reaches the top of the rep range, add the smallest available load next time. Never force a rep after form breaks.</p></div></div>
    <div className="evidence-note"><b>How exercises were chosen</b><p>“S-tier” here means stable, comfortable, easy to progress and a strong target-muscle fit for you. It is not a universal scientific grade. Research finds similar average muscle growth from machines and free weights, so your better chest connection on machines is a valid preference.</p><div><a href="https://pubmed.ncbi.nlm.nih.gov/37582807/" target="_blank" rel="noreferrer">Machines vs free weights study <ExternalLink/></a><a href="https://rpstrength.com/blogs/articles/complete-hypertrophy-training-guide" target="_blank" rel="noreferrer">RP/Mike Israetel selection guide <ExternalLink/></a><a href="https://www.youtube.com/@JeffNippard" target="_blank" rel="noreferrer">Jeff Nippard <ExternalLink/></a><a href="https://www.youtube.com/@tyler-path" target="_blank" rel="noreferrer">Tyler Path <ExternalLink/></a></div></div>
  </div>
}

function exerciseSteps(name: string): string[] {
  const n = name.toLowerCase()
  if (n.includes('squat') || n.includes('leg press')) return ['Set feet around shoulder width and keep your whole foot planted.', 'Brace your trunk, lower as deep as you can without your pelvis rolling off the pad.', 'Drive through the mid-foot; keep knees tracking in line with your toes.']
  if (n.includes('romanian') || n.includes('hyperextension') || n.includes('pull-through') || n.includes('hip thrust')) return ['Set a neutral spine and brace before moving.', 'Push your hips back until you feel the hamstrings or glutes stretch.', 'Drive the hips forward without leaning back or overextending your spine.']
  if (n.includes('leg extension')) return ['Align your knee with the machine pivot and place the pad above your ankle.', 'Hold the handles and extend your knees without lifting your hips.', 'Squeeze the quads briefly, then lower under control.']
  if (n.includes('curl') && (n.includes('leg') || n.includes('nordic'))) return ['Align your knee with the machine pivot and secure the pad above the heel.', 'Keep your hips fixed against the pad as you bend the knee.', 'Squeeze the hamstrings, then return slowly without dropping the weight.']
  if (n.includes('calf')) return ['Place the balls of your feet securely on the platform.', 'Lower your heels slowly into a comfortable stretch.', 'Rise as high as possible, pause, and avoid bouncing.']
  if (n.includes('adduction') || n.includes('wide-stance')) return ['Set the pads so the start position gives a comfortable inner-thigh stretch.', 'Keep your back and hips against the seat.', 'Bring the legs together smoothly, pause, then return under control.']
  if (n.includes('abduction') || n.includes('band walk')) return ['Keep your pelvis level and torso still.', 'Drive the knees or working leg outward from the hip.', 'Pause at the widest controlled position and return slowly.']
  if (n.includes('split squat') || n.includes('lunge') || n.includes('step-up')) return ['Set a stance that lets the front foot stay flat and stable.', 'Lower under control while the front knee tracks over the toes.', 'Push through the working leg; avoid springing off the back leg.']
  if (n.includes('shoulder press')) return ['Set the seat so handles begin near shoulder height and keep your back on the pad.', 'Use a comfortable neutral or slightly forward elbow position.', 'Press overhead without shrugging, then lower slowly to shoulder level.']
  if (n.includes('press') && (n.includes('chest') || n.includes('incline') || n.includes('smith') || n.includes('db'))) return ['Adjust the seat so the handles line up with mid-to-upper chest; pin shoulder blades to the pad.', 'Lower until you feel a comfortable chest stretch with elbows about 30-60 degrees from your torso.', 'Press in and forward, squeezing the chest without shrugging or locking out aggressively.']
  if (n.includes('pulldown') || n.includes('pull-up') || n.includes('chin-up')) return ['Secure your thighs and start with arms long and chest tall.', 'Drive your elbows down toward your sides without swinging.', 'Pause when the elbows reach your torso, then return to a full controlled stretch.']
  if (n.includes('row')) return ['Brace against the pad or sit tall with arms fully extended.', 'Lead with your elbows and pull toward your lower ribs.', 'Squeeze the upper back without shrugging, then reach forward slowly.']
  if (n.includes('lateral raise')) return ['Set the pads or cable so your arms begin slightly away from your sides.', 'Lead with the elbows and raise in the scapular plane.', 'Stop around shoulder height and lower slowly without swinging.']
  if (n.includes('reverse pec') || n.includes('rear-delt') || n.includes('face pull')) return ['Set the handles near shoulder height and keep your chest supported or torso still.', 'Move the upper arms out and back while keeping shoulders down.', 'Squeeze the rear delts, then return until they are comfortably stretched.']
  if (n.includes('triceps') || n.includes('skull') || n.includes('french')) return ['Fix your upper arms in place and keep wrists neutral.', 'Bend only at the elbows into a comfortable stretch.', 'Straighten the elbows fully by squeezing the triceps; control the return.']
  if (n.includes('biceps') || n.includes('curl')) return ['Set the pad or cable so your upper arms stay fixed and wrists remain neutral.', 'Curl without moving your shoulders or lifting your elbows.', 'Squeeze at the top, then lower slowly to a full comfortable stretch.']
  if (n.includes('crunch')) return ['Lock your hips in place and brace before starting.', 'Bring your ribs toward your pelvis rather than pulling with your arms.', 'Pause in the shortened position and return slowly without arching hard.']
  return ['Set the machine to fit your joints and choose a light first set.', 'Move through the largest comfortable range with no momentum.', 'Control the lowering phase and stop if you feel sharp pain.']
}

type Muscle = 'chest' | 'shoulders' | 'back' | 'biceps' | 'triceps' | 'abs' | 'glutes' | 'quads' | 'hamstrings' | 'adductors' | 'abductors' | 'calves'

function targetMuscles(name: string): { primary: Muscle[]; secondary: Muscle[] } {
  const n = name.toLowerCase()
  if (n.includes('adduction') || n.includes('wide-stance')) return { primary: ['adductors'], secondary: ['glutes', 'quads'] }
  if (n.includes('abduction') || n.includes('band walk')) return { primary: ['abductors'], secondary: ['glutes'] }
  if (n.includes('squat') || n.includes('leg press') || n.includes('lunge') || n.includes('split squat') || n.includes('step-up')) return { primary: ['quads', 'glutes'], secondary: ['adductors', 'hamstrings'] }
  if (n.includes('romanian') || n.includes('hyperextension') || n.includes('pull-through') || n.includes('hip thrust')) return { primary: ['hamstrings', 'glutes'], secondary: ['back'] }
  if (n.includes('leg extension') || n.includes('reverse nordic') || n.includes('sissy')) return { primary: ['quads'], secondary: [] }
  if ((n.includes('curl') && n.includes('leg')) || n.includes('nordic')) return { primary: ['hamstrings'], secondary: ['calves'] }
  if (n.includes('calf')) return { primary: ['calves'], secondary: [] }
  if (n.includes('crunch')) return { primary: ['abs'], secondary: [] }
  if (n.includes('shoulder press')) return { primary: ['shoulders'], secondary: ['triceps'] }
  if (n.includes('chest') || n.includes('incline') || (n.includes('press') && !n.includes('down'))) return { primary: ['chest'], secondary: ['shoulders', 'triceps'] }
  if (n.includes('pulldown') || n.includes('pull-up') || n.includes('chin-up')) return { primary: ['back'], secondary: ['biceps'] }
  if (n.includes('row')) return { primary: ['back'], secondary: ['biceps', 'shoulders'] }
  if (n.includes('lateral raise') || n.includes('reverse pec') || n.includes('rear-delt') || n.includes('face pull')) return { primary: ['shoulders'], secondary: ['back'] }
  if (n.includes('triceps') || n.includes('skull') || n.includes('french')) return { primary: ['triceps'], secondary: [] }
  if (n.includes('biceps') || n.includes('curl')) return { primary: ['biceps'], secondary: [] }
  return { primary: [], secondary: [] }
}

function warmupFor(name: string, workingWeight: number): string[] {
  const n = name.toLowerCase()
  const compound = n.includes('squat') || n.includes('leg press') || n.includes('romanian') || n.includes('press') || n.includes('pulldown') || n.includes('pull-up') || n.includes('row') || n.includes('split squat')
  if (compound) return [
    `Easy set: ${workingWeight ? `${Math.round(workingWeight * .45)} kg` : 'about 45% of working weight'} × 8-10 reps.`,
    `Ramp set: ${workingWeight ? `${Math.round(workingWeight * .65)} kg` : 'about 65%'} × 5-6 reps.`,
    `Primer set: ${workingWeight ? `${Math.round(workingWeight * .8)} kg` : 'about 80%'} × 2-3 reps, then rest 2 minutes.`,
  ]
  return [
    'One easy set at about half your working weight for 10-12 controlled reps.',
    'Check the machine adjustment and rehearse the full comfortable range.',
    'Start working sets when the target muscle feels warm, not tired.',
  ]
}

function videoFor(name: string): { url: string; label: string } {
  const n = name.toLowerCase()
  const exact: [string, string, string][] = [
    ['machine squat', 'https://youtu.be/N56STpGGRYE', 'Jeff PDF demo'],
    ['romanian deadlift', 'https://youtu.be/_oyxCn2iSjU?t=95', 'Jeff PDF technique'],
    ['leg extension', 'https://youtu.be/ljO4jkwv8wQ?t=202', 'Jeff PDF technique'],
    ['seated leg curl', 'https://youtu.be/2CMmuH4qJh0', 'Jeff PDF demo'],
    ['lying leg curl', 'https://www.youtube.com/watch?v=e_48W0vlU58', 'Jeff PDF demo'],
    ['calf', 'https://youtu.be/-qsRtp_PbVM?t=311', 'Jeff PDF technique'],
    ['machine shoulder press', 'https://www.youtube.com/watch?v=flr4ohSl0j8', 'Jeff PDF demo'],
    ['lat pulldown', 'https://youtu.be/QGKhvhMcpPQ', 'Jeff PDF demo'],
    ['pull-up', 'https://youtu.be/Hdc7Mw6BIEE?t=99', 'Jeff PDF technique'],
    ['machine row', 'https://youtu.be/160n9FBX84s', 'Jeff PDF row demo'],
    ['chest-supported', 'https://youtu.be/160n9FBX84s', 'Jeff PDF demo'],
    ['lateral raise', 'https://youtu.be/-9QsrJ542ao', 'Jeff PDF demo'],
    ['overhead cable triceps', 'https://youtu.be/qIW3z-ydg-M', 'Jeff PDF demo'],
    ['triceps pressdown', 'https://youtu.be/popGXI-qs98?t=123', 'Jeff PDF technique'],
    ['incline db press', 'https://youtu.be/URQ1Wn7lY3A', 'Jeff PDF press demo'],
    ['cable chest press', 'https://youtu.be/fV6G1aQb9mM', 'Jeff PDF demo'],
    ['curl', 'https://youtu.be/i1YgFZB6alI?t=487', 'Jeff PDF technique'],
    ['crunch', 'https://youtu.be/zU6X6DLCH_U', 'Jeff PDF demo'],
    ['hack squat', 'https://youtu.be/wEgQUCdtFLg', 'Jeff PDF demo'],
  ]
  const match = exact.find(([term]) => n.includes(term))
  return match ? { url: match[1], label: match[2] } : { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`Jeff Nippard ${name} technique`)}`, label: 'Find a Jeff demo' }
}

function MuscleMap({ target }: { target: { primary: Muscle[]; secondary: Muscle[] } }) {
  const tone = (muscle: Muscle) => target.primary.includes(muscle) ? 'primary-muscle' : target.secondary.includes(muscle) ? 'secondary-muscle' : 'inactive-muscle'
  return <div className="muscle-map"><svg viewBox="0 0 300 300" role="img" aria-label="Front and back body muscle map">
    <g transform="translate(18 8)"><text x="52" y="10">FRONT</text><circle className="body-base" cx="62" cy="30" r="16"/><path className="body-base" d="M42 50 Q62 42 82 50 L91 120 79 158 74 270H54L50 164 40 270H20L30 158 18 120Z"/>
      <path className={tone('shoulders')} d="M41 52Q25 54 20 72L31 78 45 62ZM83 52Q99 54 104 72L93 78 79 62Z"/><path className={tone('chest')} d="M45 59Q62 53 62 79Q45 82 42 68ZM79 59Q62 53 62 79Q79 82 82 68Z"/><path className={tone('biceps')} d="M25 79L18 118 31 120 39 80ZM99 79L106 118 93 120 85 80Z"/><path className={tone('abs')} d="M48 84H76L78 132 62 151 46 132Z"/><path className={tone('adductors')} d="M51 155L61 161 55 218 43 164ZM73 155L63 161 69 218 81 164Z"/><path className={tone('quads')} d="M31 157L50 158 51 220 30 220ZM74 158L93 157 94 220 73 220Z"/><path className={tone('calves')} d="M29 226L46 226 43 268H23ZM78 226L95 226 101 268H81Z"/>
    </g><g transform="translate(158 8)"><text x="54" y="10">BACK</text><circle className="body-base" cx="62" cy="30" r="16"/><path className="body-base" d="M42 50 Q62 42 82 50 L91 120 79 158 74 270H54L50 164 40 270H20L30 158 18 120Z"/>
      <path className={tone('shoulders')} d="M41 52Q25 54 20 72L31 78 45 62ZM83 52Q99 54 104 72L93 78 79 62Z"/><path className={tone('back')} d="M44 57Q62 68 80 57L78 119 62 145 46 119Z"/><path className={tone('triceps')} d="M25 79L18 118 31 120 39 80ZM99 79L106 118 93 120 85 80Z"/><path className={tone('glutes')} d="M40 137Q62 130 62 160Q45 170 35 154ZM84 137Q62 130 62 160Q79 170 89 154Z"/><path className={tone('abductors')} d="M31 145L42 137 39 174 27 166ZM93 145L82 137 85 174 97 166Z"/><path className={tone('hamstrings')} d="M31 170L53 166 49 220 29 220ZM71 166L93 170 95 220 75 220Z"/><path className={tone('calves')} d="M29 226L46 226 43 268H23ZM78 226L95 226 101 268H81Z"/>
    </g></svg><div className="muscle-legend"><span><i className="legend-primary"/>Primary: {target.primary.join(', ') || 'general'}</span><span><i className="legend-secondary"/>Supporting: {target.secondary.join(', ') || 'none'}</span></div></div>
}

function ExerciseCard({ exercise, index, previous, expanded, toggle, addSet }: { exercise: Exercise; index: number; previous?: SetLog; expanded: boolean; toggle: () => void; addSet: (e: string, w: number, r: number) => void }) {
  const [weight, setWeight] = useState(previous?.weight || 0)
  const [reps, setReps] = useState(previous?.reps || Number(exercise.reps.split('-')[0]))
  const [sub, setSub] = useState(exercise.name)
  const [detailView, setDetailView] = useState<'target' | 'instructions' | 'warmup'>('target')
  const steps = exerciseSteps(sub)
  const target = targetMuscles(sub)
  const video = videoFor(sub)
  return <article className={`exercise-card ${expanded ? 'expanded' : ''}`}>
    <button className="exercise-summary" onClick={toggle}>
      <span className="exercise-index">{String(index + 1).padStart(2, '0')}</span><div><h3>{sub}</h3><p>{exercise.sets} sets · {exercise.reps} reps · {exercise.rest} rest</p><small className="sub-hint">{expanded ? 'Choose below' : '2 substitutes + steps · tap to view'}</small></div>
      <span className="previous">{previous ? <><small>LAST</small><b>{previous.weight} kg × {previous.reps}</b></> : <><small>REST</small><b>{exercise.rest}</b></>}</span><ChevronDown />
    </button>
    {expanded && <div className="exercise-detail">
      <div className="why"><b>Why it earns its place</b><p>{exercise.why}</p></div>
      <label>Exercise or substitute<select value={sub} onChange={(e) => setSub(e.target.value)}><option>{exercise.name}</option>{exercise.subs.map((s) => <option key={s}>{s}</option>)}</select></label>
      <div className="detail-tabs"><button className={detailView === 'target' ? 'active' : ''} onClick={() => setDetailView('target')}>Target</button><button className={detailView === 'instructions' ? 'active' : ''} onClick={() => setDetailView('instructions')}>Instructions</button><button className={detailView === 'warmup' ? 'active' : ''} onClick={() => setDetailView('warmup')}>Warm-up</button></div>
      {detailView === 'target' && <MuscleMap target={target}/>}
      {detailView === 'instructions' && <div className="how-to"><div className="how-to-heading"><b>How to do {sub}</b><a href={video.url} target="_blank" rel="noreferrer">{video.label}<ExternalLink/></a></div><ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="breathing"><Wind/><p><b>Breathing:</b> inhale while lowering; exhale while lifting. Brace your trunk before each rep. A brief breath hold is only for trained lifters on very heavy efforts and raises blood pressure.</p></div></div>}
      {detailView === 'warmup' && <div className="how-to"><b>Ramp up, do not tire yourself</b><ol>{warmupFor(sub, weight).map((step) => <li key={step}>{step}</li>)}</ol><p className="warmup-note">Warm-up sets do not count toward the listed working sets. Later isolation exercises usually need only one easy set.</p></div>}
      <div className="set-entry no-rir"><label>Weight <span><input type="number" min="0" step="0.5" value={weight} onChange={(e) => setWeight(Number(e.target.value))} /> kg</span></label><label>Reps <input type="number" min="1" value={reps} onChange={(e) => setReps(Number(e.target.value))} /></label><button className="primary" onClick={() => addSet(sub, weight, reps)}><Plus /> Log set</button></div>
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

function Progress({ profile, totalVolume, logs, strengthData, bodyData, measurements, setMeasurements, user }: { profile: Profile; totalVolume: number; logs: SetLog[]; strengthData: { week: string; e1rm: number }[]; bodyData: { date: string; weight: number; waist?: number }[]; measurements: Measurement[]; setMeasurements: React.Dispatch<React.SetStateAction<Measurement[]>>; user: User | null }) {
  const emptyMeasurement: Measurement = { date: new Date().toISOString().slice(0, 10), weight: 0, waist: 0, chest: 0, arm: 0, thigh: 0, hip: 0, neck: 0 }
  const latest = measurements[measurements.length - 1] ?? emptyMeasurement
  const [form, setForm] = useState<Measurement>({ ...latest, date: new Date().toISOString().slice(0, 10) })
  const [showForm, setShowForm] = useState(false)
  const best = logs.reduce((max, l) => Math.max(max, l.weight * (1 + l.reps / 30)), 0)
  const exportJson = () => downloadFile(`${profile}-strength-data.json`, JSON.stringify({ exportedAt: new Date().toISOString(), profile, workoutSets: logs, measurements }, null, 2), 'application/json')
  const exportCsv = () => {
    const header = ['record_type', 'date', 'exercise', 'weight_kg', 'reps', 'waist_cm', 'chest_cm', 'arm_cm', 'thigh_cm', 'hip_cm', 'neck_cm']
    const setRows = logs.map((log) => ['workout_set', log.date, log.exercise, log.weight, log.reps, '', '', '', '', '', ''])
    const measurementRows = measurements.map((m) => ['measurement', m.date, '', m.weight, '', m.waist, m.chest, m.arm, m.thigh, m.hip, m.neck])
    downloadFile(`${profile}-strength-data.csv`, `\uFEFF${[header, ...setRows, ...measurementRows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`, 'text/csv;charset=utf-8')
  }
  return <div className="page">
    <div className="eyebrow">PERFORMANCE · {profile.toUpperCase()} · ALL TIME</div><div className="page-title"><div><h1>Proof, not guesses.</h1><p>Strength, consistency and body trends in one view.</p></div><div className="progress-actions"><button onClick={exportJson}><FileJson/>JSON</button><button onClick={exportCsv}><FileSpreadsheet/>Excel CSV</button><button className="primary" onClick={() => { setForm({ ...latest, date: new Date().toISOString().slice(0, 10) }); setShowForm(!showForm) }}><Plus /> New measurement</button></div></div>
    {showForm && <MeasurementForm form={form} setForm={setForm} save={() => { setMeasurements((m) => [...m, form]); if (user) void supabase.from('measurements').insert({ user_id: user.id, profile, measured_at: form.date, weight_kg: form.weight, waist_cm: form.waist || null, chest_cm: form.chest || null, arm_cm: form.arm || null, thigh_cm: form.thigh || null, hip_cm: form.hip || null, neck_cm: form.neck || null }); setShowForm(false) }} />}
    <section className="metric-grid"><div><TrendingUp /><small>EST. 1RM BEST</small><b>{best ? `${Math.round(best)} kg` : 'Start logging'}</b><p>Calculated from your sets</p></div><div><Dumbbell /><small>TOTAL VOLUME</small><b>{totalVolume ? `${Math.round(totalVolume).toLocaleString()} kg` : '0 kg'}</b><p>{logs.length} sets logged</p></div><div><Medal /><small>CONSISTENCY</small><b>{logs.length ? 'On track' : 'Not started'}</b><p>Based on logged sessions</p></div><div><Scale /><small>BODYWEIGHT</small><b>{latest.weight ? `${latest.weight} kg` : 'Add first entry'}</b><p>{profile === 'ashay' ? 'InBody baseline: 75.9 kg' : 'No baseline yet'}</p></div></section>
    <section className="chart-grid"><article className="chart-card wide"><div><span><small>STRENGTH TREND</small><h2>Estimated 1RM</h2></span><span className="trend"><ArrowUpRight /> Double progression</span></div><ResponsiveContainer width="100%" height={280}><AreaChart data={strengthData}><defs><linearGradient id="strength" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#d9ff59" stopOpacity={0.5}/><stop offset="95%" stopColor="#d9ff59" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2c2c2c"/><XAxis dataKey="week" stroke="#777"/><YAxis stroke="#777" domain={['dataMin - 5', 'dataMax + 5']}/><Tooltip contentStyle={{ background: '#191919', border: '1px solid #333' }}/><Area type="monotone" dataKey="e1rm" stroke="#d9ff59" strokeWidth={3} fill="url(#strength)"/></AreaChart></ResponsiveContainer></article>
    <article className="chart-card"><div><span><small>BODY TREND</small><h2>Weight</h2></span></div><ResponsiveContainer width="100%" height={280}><LineChart data={bodyData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2c2c2c"/><XAxis dataKey="date" stroke="#777"/><YAxis stroke="#777" domain={['dataMin - 2', 'dataMax + 2']}/><Tooltip contentStyle={{ background: '#191919', border: '1px solid #333' }}/><Line type="monotone" dataKey="weight" stroke="#75d7ff" strokeWidth={3} dot={{ fill: '#75d7ff' }}/></LineChart></ResponsiveContainer></article></section>
    <section className="measure-table"><div><h2>Latest measurements</h2><button onClick={() => { setForm({ ...latest, date: new Date().toISOString().slice(0, 10) }); setShowForm(true) }}>Add entry <Plus /></button></div><div className="measurement-grid">{(['waist', 'chest', 'arm', 'thigh', 'hip', 'neck'] as const).map((key) => <span key={key}><small>{key}</small><b>{latest[key] || '—'} {latest[key] ? 'cm' : ''}</b></span>)}</div></section>
  </div>
}

function MeasurementForm({ form, setForm, save }: { form: Measurement; setForm: React.Dispatch<React.SetStateAction<Measurement>>; save: () => void }) {
  const fields: (keyof Measurement)[] = ['weight', 'waist', 'chest', 'arm', 'thigh', 'hip', 'neck']
  return <section className="measurement-form"><label>Date<input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}/></label>{fields.map((key) => <label key={key}>{key}<span><input type="number" step="0.1" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}/>{key === 'weight' ? 'kg' : 'cm'}</span></label>)}<button className="primary" onClick={save}><Save /> Save</button></section>
}

export default App
