//Elements
const plantBtn   = document.getElementById('plantBtn');
const decryptBtn = document.getElementById('decryptBtn');
const timeInput  = document.getElementById('timeInput');
const countdown  = document.getElementById('countdown');
const codeReveal = document.getElementById('codeReveal');
const numpadBox  = document.getElementById('numpad');
const enterDisp  = document.getElementById('enterDisplay');
const statusMsg  = document.getElementById('statusMsg');
const boomSound  = document.getElementById('explode');
const winSound   = document.getElementById('defused');

//States
let fullTime   = 0;    // ms
let timeLeft   = 0;    // ms
let tickInt    = null;
let code       = '';
let entered    = '';

//Helpers
const fmt = ms => String(Math.ceil(ms / 1000)).padStart(2,'0');

function resetUI(){
  clearInterval(tickInt);
  tickInt = null;
  countdown.textContent = '00';
  codeReveal.textContent = '';
  enterDisp.textContent  = '';
  statusMsg.textContent  = '';
  decryptBtn.disabled = true;
  numpadBox.innerHTML = '';
}

//Main flow for stuff
plantBtn.addEventListener('click', () => {
  resetUI();

  fullTime   = Math.max(10, Number(timeInput.value)) * 1000;
  timeLeft   = fullTime;
  code       = Math.floor(1000 + Math.random()*9000).toString();

  // start round timer
  tickInt = setInterval(() => {
    timeLeft -= 100;
    countdown.textContent = fmt(timeLeft);
    if (timeLeft <= 0){
      clearInterval(tickInt);
      boomSound.play();
      statusMsg.textContent = 'Detonated! Attackers win.';
      decryptBtn.disabled = true;
      numpadBox.innerHTML = '';
    }
  }, 100);

  decryptBtn.disabled = false;
  statusMsg.textContent = 'Spike planted!';
});

decryptBtn.addEventListener('click', () => {
  if (decryptBtn.disabled) return;
  decryptBtn.disabled = true;
  statusMsg.textContent = 'Decrypting…';

  setTimeout(() => {
    codeReveal.textContent = `CODE: ${code}`;
    statusMsg.textContent  = 'Enter code to defuse';
    buildPad();
  }, 5000);               // 5-second decrypt
});

//Keypad
function buildPad(){
  const makeBtn = n => {
    const b = document.createElement('button');
    b.textContent = n;
    b.onclick = () => handleDigit(n);
    return b;
  };
  // 0-9 + back + clear
  [1,2,3,4,5,6,7,8,9,'←','0','↺'].forEach(v => numpadBox.appendChild(makeBtn(v)));
}

function handleDigit(d){
  if (d === '←'){
    entered = entered.slice(0,-1);
  } else if (d === '↺'){
    entered = '';
  } else if (entered.length < 4){
    entered += d;
  }
  enterDisp.textContent = entered;

  if (entered.length === 4){
    if (entered === code){
      clearInterval(tickInt);
      winSound.play();
      statusMsg.textContent = 'Defused! Defenders win.';
      numpadBox.innerHTML = '';
    }else{
      statusMsg.textContent = 'Wrong code!';
      entered = '';
      enterDisp.textContent = '';
    }
  }
}
3