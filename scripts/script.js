const redTimeEl   = document.getElementById('redTime');
const blueTimeEl  = document.getElementById('blueTime');
const roundLeftEl = document.getElementById('roundLeft');
const roundInput  = document.getElementById('roundInput');
const mTitle = document.getElementById('modalTitle');
const mBody  = document.getElementById('modalBody');
const confirmBtn = document.getElementById('modalConfirmBtn');
const modalEl    = document.getElementById('kothModal');
const modal      = new bootstrap.Modal(modalEl);

function showModal(title, body, onConfirm){
  mTitle.textContent = title;
  mBody.textContent  = body;

  /* clear any previous listener */
  confirmBtn.replaceWith(confirmBtn.cloneNode(true));
  const freshBtn = document.getElementById('modalConfirmBtn');

  if (onConfirm){
    freshBtn.addEventListener('click', () => {
      /* run callback only after the fade-out completes */
      const fn = () => { onConfirm(); modalEl.removeEventListener('hidden.bs.modal', fn); };
      modalEl.addEventListener('hidden.bs.modal', fn);
    }, {once:true});
  }

  modal.show();
}


let roundLimit = 10 * 60 * 1000;   // ms
let redTotal = 0, blueTotal = 0;
let activeTeam = null;
let lastStart = null;
let ticker = null;

const fmt = ms => {
  const m  = Math.floor(ms / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const ds = Math.floor((ms % 1000) / 100);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${ds}`;
};

function updateDisplays(){
  const now = Date.now();
  const red  = redTotal  + (activeTeam==='red'  ? now-lastStart : 0);
  const blue = blueTotal + (activeTeam==='blue' ? now-lastStart : 0);

  redTimeEl.textContent  = fmt(red);
  blueTimeEl.textContent = fmt(blue);

  const remaining = Math.max(roundLimit - (red+blue), 0);
  roundLeftEl.textContent = `Round: ${fmt(remaining)} left`;
  if (remaining === 0) endRound();
}

/*Core logic */
function startTeam(team){
  if (activeTeam === team) return;          // same team—ignore
  const now = Date.now();
  if (activeTeam === 'red') redTotal  += now - lastStart;
  if (activeTeam === 'blue')blueTotal += now - lastStart;
  activeTeam = team;
  lastStart  = now;
  if (!ticker) ticker = setInterval(updateDisplays,100);
}

function endRound(){
  if (!ticker) return;
  clearInterval(ticker); ticker = null;

  const now = Date.now();
  if (activeTeam==='red')  redTotal  += now - lastStart;
  if (activeTeam==='blue') blueTotal += now - lastStart;
  activeTeam = null;

  const winner =
    redTotal > blueTotal ? 'RED wins!' :
    blueTotal > redTotal ? 'BLUE wins!' :
    'It’s a tie!';
  showModal('Round Over', winner);
}

function reset(full=false){
  clearInterval(ticker); ticker = null;
  redTotal = blueTotal = 0;
  activeTeam = lastStart = null;
  if (full) roundLimit = (+roundInput.value || 10)*60*1000;
  updateDisplays();                 // shows 00:00 again
}

document.getElementById('arena').addEventListener('click', e=>{
  const t = e.target.closest('.team');
  if (t) startTeam(t.dataset.team);
});

/* Set new round time */
document.getElementById('setBtn').addEventListener('click', () => {
  showModal('New Round Time',
            'Press "Confirm" to start the new round.',
            () => reset(true));
});

/* Reset current timers */
document.getElementById('resetBtn').addEventListener('click', () => {
  showModal('Reset Round',
            'Press "Confirm" to zero the timers.',
            reset);
});


reset(true);
