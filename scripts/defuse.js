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

const modal  = new bootstrap.Modal(document.getElementById('defuseModal'));
const mTitle = document.getElementById('modalTitle');
const mBody  = document.getElementById('modalBody');
function showModal(title, body){
  mTitle.textContent = title;
  mBody.textContent  = body;
  modal.show();
}

let fullTime = 0, timeLeft = 0, tickInt = null;
let code = '', entered = '';

const fmt = ms => String(Math.ceil(ms/1000)).padStart(2,'0');
function resetUI(){
  clearInterval(tickInt); tickInt = null;
  countdown.textContent = '00';
  codeReveal.textContent = '';
  enterDisp.textContent  = '';
  statusMsg.textContent  = '';
  decryptBtn.disabled = true;
  numpadBox.innerHTML = '';
  entered = '';
}

plantBtn.addEventListener('click', ()=>{
  resetUI();
  fullTime = Math.max(10,+timeInput.value)*1000;
  timeLeft = fullTime;
  code     = Math.floor(1000+Math.random()*9000).toString();

  tickInt = setInterval(()=>{
    timeLeft -= 100;
    countdown.textContent = fmt(timeLeft);
    if (timeLeft <= 0){
      clearInterval(tickInt); tickInt=null;
      boomSound.play();
      showModal('💥 Detonated','Attackers win!');
      decryptBtn.disabled = true;
      numpadBox.innerHTML = '';
    }
  },100);

  decryptBtn.disabled = false;
  statusMsg.textContent = 'Spike planted!';
});

decryptBtn.addEventListener('click', ()=>{
  if (decryptBtn.disabled) return;
  decryptBtn.disabled = true;
  statusMsg.textContent = 'Decrypting…';

  setTimeout(()=>{
    codeReveal.textContent = `CODE: ${code}`;
    statusMsg.textContent  = 'Enter code to defuse';
    buildPad();
  },5000);
});

function buildPad(){
  const mk = v=>{
    const b=document.createElement('button');
    b.className='btn btn-outline-light';
    b.textContent=v;
    b.onclick=()=>handleDigit(v);
    return b;
  };
  [1,2,3,4,5,6,7,8,9,'←','0','↺'].forEach(v=>numpadBox.appendChild(mk(v)));
}
function handleDigit(d){
  if (d==='←') entered=entered.slice(0,-1);
  else if (d==='↺') entered='';
  else if (entered.length<4) entered+=d;

  enterDisp.textContent = entered;

  if (entered.length===4){
    if (entered===code){
      clearInterval(tickInt);
      winSound.play();
      showModal('🛡️ Defused!','Defenders win.');
      numpadBox.innerHTML='';
    }else{
      statusMsg.textContent='Wrong code!';
      entered=''; enterDisp.textContent='';
    }
  }
}
