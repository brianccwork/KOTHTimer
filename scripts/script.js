//Elements
const redTimeEl   = document.getElementById('redTime');
const blueTimeEl  = document.getElementById('blueTime');
const roundLeftEl = document.getElementById('roundLeft');
const roundInput  = document.getElementById('roundInput');

//State
let roundLimit = 10 * 60 * 1000;   // default 10 min (ms)
let redTotal   = 0;
let blueTotal  = 0;
let activeTeam = null;             // 'red' | 'blue' | null
let lastStart  = null;             // timestamp when current team took hill
let ticker     = null;             // setInterval id

//Helpers
const fmt = ms => {
  const m  = Math.floor(ms / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const ds = Math.floor((ms % 1000) / 100);   // tenths
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ds}`;
};

function updateDisplays() {
  const now  = Date.now();
  const red  = redTotal  + (activeTeam === 'red'  ? now - lastStart : 0);
  const blue = blueTotal + (activeTeam === 'blue' ? now - lastStart : 0);

  redTimeEl.textContent  = fmt(red);
  blueTimeEl.textContent = fmt(blue);

  const elapsed   = red + blue;
  const remaining = Math.max(roundLimit - elapsed, 0);
  roundLeftEl.textContent = `Round: ${fmt(remaining)} left`;

  if (remaining === 0) endRound();
}

function startTeam(team) {
  //ignore if round over or same team tapped
  if (!ticker || activeTeam === team) return;

  const now = Date.now();
  if (activeTeam === 'red')  redTotal  += now - lastStart;
  if (activeTeam === 'blue') blueTotal += now - lastStart;

  activeTeam = team;
  lastStart  = now;
}

function endRound() {
  if (!ticker) return;

  const now = Date.now();
  if (activeTeam === 'red')  redTotal  += now - lastStart;
  if (activeTeam === 'blue') blueTotal += now - lastStart;

  activeTeam = null;
  clearInterval(ticker);
  ticker = null;

  const msg =
    redTotal > blueTotal ? 'RED wins!' :
    blueTotal > redTotal ? 'BLUE wins!' :
    'It’s a tie!';
  alert(msg);
}

function reset(full = false) {
  redTotal = blueTotal = 0;
  activeTeam = lastStart = null;

  if (ticker) clearInterval(ticker);
  ticker = setInterval(updateDisplays, 100);   // 10 fps

  if (full) {
    roundLimit = (Number(roundInput.value) || 10) * 60 * 1000;
  }
  updateDisplays();
}

//event listeners
document.getElementById('arena').addEventListener('click', e => {
  const section = e.target.closest('.team');
  if (!section) return;

  if (!ticker) ticker = setInterval(updateDisplays, 100); // start clock
  startTeam(section.dataset.team);
});

document.getElementById('setBtn').addEventListener('click', () => {
  if (confirm('Set new round time and restart?')) reset(true);
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Reset current round?')) reset();
});

//reset
reset(true);
