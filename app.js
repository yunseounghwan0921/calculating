const el = {
value: document.getElementById('value'),
history: document.getElementById('history'),
keys: document.querySelector('.keys')
};


const state = {
display: '0',
first: null,
operator: null,
waiting: false,
lastKey: null
};

function format(n){
const [i, d] = String(n).split('.');
const int = i.replace(/(\B)(?=(\d{3})+(?!\d))/g, ',');
return d ? `${int}.${d}` : int;
}


function setDisplay(v){
const str = String(v);
state.display = str.length > 14 ? Number(v).toExponential(8) : str;
el.value.textContent = format(state.display);
}


function updateHistory(){
const { first, operator, waiting } = state;
if(first !== null && operator){
el.history.textContent = `${format(first)} ${operator}` + (waiting ? '' : ` ${format(state.display)}`);
} else {
el.history.textContent = '';
}
}

function clearAll(){
state.display = '0';
state.first = null;
state.operator = null;
state.waiting = false;
state.lastKey = null;
setDisplay(state.display);
updateHistory();
setActiveOp(null);
}


function inputDigit(d){
if(state.waiting){
state.display = String(d);
state.waiting = false;
} else {
state.display = state.display === '0' ? String(d) : state.display + d;
}
setDisplay(state.display);
}

function inputDecimal(){
if(state.waiting){ state.display = '0.'; state.waiting = false; setDisplay(state.display); return; }
if(!state.display.includes('.')){ setDisplay(state.display + '.'); }
}


function setActiveOp(op){
document.querySelectorAll('.op').forEach(b => b.classList.toggle('active', b.dataset.op === op));
}


function chooseOperator(op){
const input = Number(state.display);
if(state.first === null){
state.first = input;
} else if(!state.waiting){
state.first = compute(state.first, input, state.operator);
setDisplay(state.first);
}
state.operator = op;
state.waiting = true;
setActiveOp(op);
updateHistory();
}


function compute(a, b, op){
if(op === '+') return a + b;
if(op === '-') return a - b;
if(op === '*') return a * b;
if(op === '/') return b === 0 ? NaN : a / b;
return b;
}

function equals(){
if(state.operator === null) return;
const a = state.first;
const b = Number(state.display);
const res = compute(a, b, state.operator);
setDisplay(res);
state.first = null;
state.operator = null;
state.waiting = false;
setActiveOp(null);
el.history.textContent = '';
}


function backspace(){
if(state.waiting) return;
const s = String(state.display);
const next = s.length > 1 ? s.slice(0, -1) : '0';
setDisplay(next);
}


function toggleSign(){
if(state.display === '0') return;
if(String(state.display).startsWith('-')) setDisplay(String(state.display).slice(1));
else setDisplay('-' + state.display);
}


function percent(){
const n = Number(state.display) / 100;
setDisplay(n);
}

function copy(){
const text = String(el.value.textContent).replace(/,/g, '');
navigator.clipboard?.writeText(text).then(() => {
flash('복사됨!');
}).catch(() => {
flash('복사 실패');
});
}


function flash(msg){
const w = document.createElement('div');
w.textContent = msg;
w.style.position = 'fixed';
w.style.bottom = '18px';
w.style.left = '50%';
w.style.transform = 'translateX(-50%)';
w.style.padding = '10px 14px';
w.style.background = 'rgba(23,26,42,.9)';
w.style.border = '1px solid rgba(255,255,255,.15)';
w.style.borderRadius = '12px';
w.style.backdropFilter = 'blur(4px)';
w.style.color = 'var(--text)';
w.style.fontWeight = '700';
w.style.boxShadow = 'var(--shadow)';
w.style.zIndex = '9999';
document.body.appendChild(w);
setTimeout(() => w.remove(), 900);
}


// Click handling
el.keys.addEventListener('click', (e) => {
const b = e.target.closest('button.key');
if(!b) return;
const { digit, op, action } = b.dataset;


if(digit !== undefined) inputDigit(digit);
else if(action === 'decimal') inputDecimal();
else if(op) { chooseOperator(op); }
else if(action === 'equals') equals();
else if(action === 'clear') clearAll();
else if(action === 'backspace') backspace();
else if(action === 'sign') toggleSign();
else if(action === 'percent') percent();
else if(action === 'copy') copy();
updateHistory();
});

// Keyboard support
window.addEventListener('keydown', (e) => {
const k = e.key;
if(/^[0-9]$/.test(k)) { inputDigit(k); }
else if(k === '.' || k === ',') { inputDecimal(); }
else if(['+','-','*','/'].includes(k)) { chooseOperator(k); }
else if(k === 'Enter' || k === '=') { e.preventDefault(); equals(); }
else if(k === 'Backspace') { backspace(); }
else if(k === 'Escape' || k === 'Delete') { clearAll(); }
else if(k.toLowerCase() === 'p' || k === '%') { percent(); }
updateHistory();
});


// Init
clearAll();