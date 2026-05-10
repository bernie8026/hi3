
const $ = (sel, scope=document) => scope.querySelector(sel);
const $$ = (sel, scope=document) => Array.from(scope.querySelectorAll(sel));

// Mobile nav
const navToggle = $('.nav-toggle');
const nav = $('#site-nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Reveal animation
const revealEls = $$('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('visible'));
}

// Memory archive
const memories = [
  {tag:'Memory 01', title:'邂逅：初識女武神', copy:'介紹 Kiana、Mei、Bronya 的初期關係，讓新玩家理解故事的情感起點。', points:['角色關係入口','學園與任務背景','建立玩家與三人組的連結']},
  {tag:'Memory 02', title:'犧牲：最後一課', copy:'以導師犧牲作為情感高峰，讓玩家理解成長不是升級，而是代價。', points:['Himeko 作為犧牲型導師','玩家見證 Kiana 的轉變','動畫短片作為情感爆發']},
  {tag:'Memory 03', title:'真相：文明與崩壞', copy:'透過前文明、Fu Hua、Otto 與 Elysian Realm，將個人故事推向文明命運。', points:['世界觀補完','前文明與現文明對照','反派執念與價值衝突']},
  {tag:'Memory 04', title:'救贖：承擔與終局', copy:'展示 Kiana 從受創角色走向承擔者，完成 Part 1 的情感閉環。', points:['受創救世主 archetype','角色弧光完成','玩家成為共同見證者']},
  {tag:'Memory 05', title:'未來：Part 2 Invitation', copy:'以新世界、新角色和新玩法開啟下一階段，將回顧轉化為重新入坑的動機。', points:['降低新玩家門檻','用回顧承接新章','campaign conversion']}
];
const memoryButtons = $$('.memory-btn');
if (memoryButtons.length) {
  const tag = $('#memory-tag'), title = $('#memory-title'), copy = $('#memory-copy'), points = $('#memory-points');
  const renderMemory = (idx) => {
    const m = memories[idx];
    tag.textContent = m.tag;
    title.textContent = m.title;
    copy.textContent = m.copy;
    points.innerHTML = m.points.map(p => `<li>${p}</li>`).join('');
    memoryButtons.forEach(btn => btn.classList.toggle('active', Number(btn.dataset.memory) === idx));
  };
  memoryButtons.forEach(btn => btn.addEventListener('click', () => renderMemory(Number(btn.dataset.memory))));
}

// Quiz
const quizQuestions = [
  { q: '你最想喺《崩壞3rd》入面體驗咩？', options: [
    ['story', '角色成長同催淚劇情'], ['battle','爽快戰鬥同操作'], ['lore','世界觀同前文明秘密']
  ]},
  { q: '如果要做 campaign，你最想加咩互動？', options: [
    ['story','角色記憶卡'], ['battle','戰鬥路線推薦'], ['lore','世界觀時間線']
  ]},
  { q: '你覺得 HI3 最大吸引力係？', options: [
    ['story','情感 payoff'], ['battle','角色玩法'], ['lore','跨媒體設定']
  ]}
];
let quizIndex = 0;
let quizScore = {story:0,battle:0,lore:0};
const qEl = $('#quiz-question');
const optEl = $('#quiz-options');
const resultEl = $('#quiz-result');
function renderQuiz(){
  if(!qEl || !optEl) return;
  const current = quizQuestions[quizIndex];
  qEl.textContent = current.q;
  optEl.innerHTML = current.options.map(([key,label]) => `<button data-key="${key}">${label}</button>`).join('');
  $$('#quiz-options button').forEach(btn => btn.addEventListener('click', () => {
    quizScore[btn.dataset.key]++;
    quizIndex++;
    if(quizIndex < quizQuestions.length) renderQuiz(); else showQuizResult();
  }));
}
function showQuizResult(){
  const top = Object.entries(quizScore).sort((a,b)=>b[1]-a[1])[0][0];
  const text = {
    story:'你係「劇情見證型艦長」：最適合用角色弧光同動畫短片做 report 核心。',
    battle:'你係「實戰攻略型艦長」：最適合將 gameplay 點樣支撐故事講清楚。',
    lore:'你係「世界觀考據型艦長」：最適合整理時間線、前文明同跨媒體設定。'
  }[top];
  optEl.innerHTML = '';
  resultEl.style.display = 'block';
  resultEl.textContent = text;
}
renderQuiz();

// LocalStorage note wall
const noteInput = $('#captain-note');
const saveNote = $('#save-note');
const notesList = $('#notes-list');
const NOTE_KEY = 'honkai-captain-notes-v2';
function getNotes(){ try { return JSON.parse(localStorage.getItem(NOTE_KEY)) || []; } catch { return []; } }
function setNotes(notes){ localStorage.setItem(NOTE_KEY, JSON.stringify(notes)); }
function renderNotes(){
  if(!notesList) return;
  const notes = getNotes();
  notesList.innerHTML = notes.length ? notes.map((note, idx) => `<div class="note-item"><span>${note}</span><button data-del="${idx}">刪除</button></div>`).join('') : '<p>暫時未有留言。寫一條，網站會喺你瀏覽器入面記住。</p>';
  $$('[data-del]').forEach(btn => btn.addEventListener('click', () => {
    const notes = getNotes(); notes.splice(Number(btn.dataset.del), 1); setNotes(notes); renderNotes();
  }));
}
if(saveNote && noteInput){
  saveNote.addEventListener('click', () => {
    const value = noteInput.value.trim();
    if(!value) return;
    const notes = getNotes(); notes.unshift(value); setNotes(notes.slice(0,8)); noteInput.value = ''; renderNotes();
  });
  renderNotes();
}

// Character gallery
const grid = $('#character-grid');
const search = $('#character-search');
const count = $('#character-count');
const modal = $('#character-modal');
let characterData = [];
function renderCharacters(list){
  if(!grid) return;
  count.textContent = `${list.length} characters`;
  grid.innerHTML = list.map((c, idx) => `
    <article class="character-card" data-index="${characterData.indexOf(c)}">
      <img src="assets/img/characters/${c.image}" alt="${c.zh}" onerror="this.src='assets/img/characters/lunar-vow-crimson-love.webp'">
      <div><small>${c.role}</small><h3>${c.zh}</h3><p>${c.en}</p></div>
    </article>`).join('');
  $$('.character-card').forEach(card => card.addEventListener('click', () => openCharacter(Number(card.dataset.index))));
}
function openCharacter(idx){
  const c = characterData[idx]; if(!c || !modal) return;
  $('#modal-img').src = `assets/img/characters/${c.image}`;
  $('#modal-img').alt = c.zh;
  $('#modal-role').textContent = `${c.role} · ${c.tag}`;
  $('#modal-title').textContent = `${c.zh} / ${c.en}`;
  $('#modal-desc').textContent = c.desc;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}
if(grid){
  fetch('assets/data/characters.json').then(res => res.json()).then(data => {
    characterData = data;
    renderCharacters(characterData);
  });
  search?.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    const filtered = characterData.filter(c => [c.zh,c.en,c.role,c.tag,c.desc].join(' ').toLowerCase().includes(q));
    renderCharacters(filtered);
  });
}
$$('[data-close="modal"]').forEach(btn => btn.addEventListener('click', () => {
  modal?.classList.remove('show'); modal?.setAttribute('aria-hidden','true');
}));
