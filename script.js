// ==========================================
// 設定領域
// ==========================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzez8LaAvoYbRIngeH4fgp9Qk5EIZDzgqF95xUJ759Xhp4LJ8Zfjx3HAE4hOGNu034wCg/exec';
const classes = ['A', 'B', 'C'];
let allParticipants = [];

// DOM要素の取得
const radioGroupsContainer = document.getElementById('radioGroupsContainer');
const participantList = document.getElementById('participantList');
const emptyMessage = document.getElementById('emptyMessage');
const loadingOverlay = document.getElementById('loading');

// 現在のフィルター状態（3年次のみ）
const currentFilters = {
  year3: 'all'
};

// --- 初期化処理 ---
async function init() {
  createRadioButtons();
  setupEventListeners();
  
  // GASからデータを取得
  await fetchData();
}

// --- データ取得ロジック ---
async function fetchData() {
  try {
    const response = await fetch(GAS_URL);
    const data = await response.json();
    
    allParticipants = data;
    loadingOverlay.style.display = 'none';
    applyFilters();
    
  } catch (error) {
    console.error('データ取得エラー:', error);
    loadingOverlay.innerHTML = '<p>データの読み込みに失敗しました。</p>';
  }
}

// --- UI生成・描画ロジック ---
function createRadioButtons() {
  const row = document.createElement('div');
  row.className = 'radio-group-row';
  
  const label = document.createElement('div');
  label.className = 'radio-group-label';
  label.textContent = '3年次';
  row.appendChild(label);

  row.appendChild(createRadioElement('year3', 'all', 'すべて', true));

  classes.forEach(cls => {
    row.appendChild(createRadioElement('year3', cls, `${cls}組`, false));
  });

  radioGroupsContainer.appendChild(row);
}

function createRadioElement(name, value, text, isChecked) {
  const label = document.createElement('label');
  label.className = 'radio-label';
  
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = name;
  input.value = value;
  if (isChecked) input.checked = true;

  label.appendChild(input);
  label.appendChild(document.createTextNode(text));
  return label;
}

function setupEventListeners() {
  radioGroupsContainer.addEventListener('change', (e) => {
    if (e.target.type === 'radio') {
      const name = e.target.name;
      const value = e.target.value;
      currentFilters[name] = value;
      applyFilters();
    }
  });
}

function applyFilters() {
  let filteredData = allParticipants.filter(p => {
    return currentFilters.year3 === 'all' || String(p.year3) === currentFilters.year3;
  });

  renderCards(filteredData);
}

function renderCards(data) {
  participantList.innerHTML = '';

  if (data.length === 0) {
    participantList.style.display = 'none';
    emptyMessage.style.display = 'block';
    return;
  }

  participantList.style.display = 'grid';
  emptyMessage.style.display = 'none';

  const fragment = document.createDocumentFragment();

  data.forEach(p => {
    const card = document.createElement('div');
    let cardClass = 'participant-card';
    
    // ステータスの判定とクラス設定（既存のCSSクラスを流用）
    let badgeHtml = '';
    if (p.status === '登録済') {
      badgeHtml = `<div class="status-badge status-attending">登録済</div>`;
    } else {
      badgeHtml = `<div class="status-badge status-absent">未登録</div>`;
      cardClass += ' is-absent';
    }
    
    card.className = cardClass;
    
    const nameText = p.name || '不明';
    const y3 = p.year3 ? `3年: ${p.year3}組` : '';
    
    // カード全体のHTML組み立て
    card.innerHTML = `
      ${badgeHtml}
      <div class="card-header">
        <div class="name-main">${nameText}</div>
      </div>
      <div class="card-body">
        <div class="info-grid">
          <div class="class-info">
            <span class="badge">${y3}</span>
          </div>
        </div>
      </div>
    `;
    
    fragment.appendChild(card);
  });

  participantList.appendChild(fragment);
}

// アプリケーション起動
init();