var SUPABASE_URL = 'https://smivqeepvgoncavcyqfk.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtaXZxZWVwdmdvbmNhdmN5cWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMzAyNjgsImV4cCI6MjEwMTkwNjI2OH0.a1HbVI2NtYp5UpHePxmE88jjTporVtXyHGODW08UtD8';
var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

var loginScreen = document.getElementById('login-screen');
var dashboard = document.getElementById('dashboard');
var loginForm = document.getElementById('loginForm');
var loginError = document.getElementById('login-error');
var loginSubmit = document.getElementById('login-submit');

// 세션 타임아웃: 20분 미조작 시 자동 로그아웃
var IDLE_LIMIT_MS = 20 * 60 * 1000;
var idleTimer = null;
function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async function () {
    await supabaseClient.auth.signOut();
    location.reload();
  }, IDLE_LIMIT_MS);
}
['click', 'keydown', 'mousemove', 'scroll'].forEach(function (evt) {
  document.addEventListener(evt, resetIdleTimer, { passive: true });
});

async function showDashboard() {
  loginScreen.style.display = 'none';
  dashboard.style.display = 'block';
  resetIdleTimer();
  await loadConsultations();
}

function showLogin() {
  loginScreen.style.display = 'flex';
  dashboard.style.display = 'none';
}

loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  loginError.style.display = 'none';
  loginSubmit.disabled = true;
  var email = document.getElementById('login-email').value;
  var password = document.getElementById('login-password').value;
  var { error } = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
  loginSubmit.disabled = false;
  if (error) {
    loginError.style.display = 'block';
    return;
  }
  await showDashboard();
});

document.getElementById('logout-btn').addEventListener('click', async function () {
  await supabaseClient.auth.signOut();
  showLogin();
});

async function loadConsultations() {
  var tbody = document.getElementById('consult-tbody');
  var table = document.getElementById('consult-table');
  var loading = document.getElementById('loading-state');
  var empty = document.getElementById('empty-state');

  var { data, error } = await supabaseClient
    .from('consultations')
    .select('*')
    .order('created_at', { ascending: false });

  loading.style.display = 'none';

  if (error || !data || data.length === 0) {
    empty.style.display = 'block';
    updateStats([]);
    return;
  }

  table.style.display = 'table';
  tbody.innerHTML = '';
  data.forEach(function (row) {
    tbody.appendChild(renderRow(row));
  });
  updateStats(data);
}

function renderRow(row) {
  var tr = document.createElement('tr');
  var created = new Date(row.created_at);
  var dateStr = created.toLocaleDateString('ko-KR') + ' ' + created.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  var isDone = row.status === 'done';

  tr.innerHTML =
    '<td>' + escapeHtml(row.name) + '</td>' +
    '<td>' + escapeHtml(row.phone || '') + '<br><span style="color:var(--text-muted)">' + escapeHtml(row.email || '') + '</span></td>' +
    '<td><span class="status-badge ' + (isDone ? 'status-done' : 'status-pending') + '" data-role="status">' + (isDone ? '완료' : '대기중') + '</span></td>' +
    '<td class="mono" style="font-size:12px;">' + dateStr + '</td>' +
    '<td><button class="link-btn" data-role="toggle">' + (isDone ? '대기중으로' : '완료로 변경') + '</button> · <button class="link-btn" data-role="detail">상세보기</button>' +
    '<div class="row-detail" data-role="detail-box" style="display:none;">' +
      '<div><b>현재 상황:</b> ' + escapeHtml(row.situation || '-') + '</div>' +
      '<div style="margin-top:6px;"><b>희망 결과:</b> ' + escapeHtml(row.goal || '-') + '</div>' +
    '</div></td>';

  tr.querySelector('[data-role="detail"]').addEventListener('click', function () {
    var box = tr.querySelector('[data-role="detail-box"]');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  });

  tr.querySelector('[data-role="toggle"]').addEventListener('click', async function (e) {
    var btn = e.target;
    btn.disabled = true;
    var newStatus = isDone ? 'pending' : 'done';
    var { error } = await supabaseClient.from('consultations').update({ status: newStatus }).eq('id', row.id);
    if (!error) {
      row.status = newStatus;
      tr.replaceWith(renderRow(row));
    }
    btn.disabled = false;
  });

  return tr;
}

function updateStats(rows) {
  var today = new Date().toDateString();
  document.getElementById('stat-total').textContent = rows.length;
  document.getElementById('stat-today').textContent = rows.filter(function (r) {
    return new Date(r.created_at).toDateString() === today;
  }).length;
  document.getElementById('stat-pending').textContent = rows.filter(function (r) {
    return r.status !== 'done';
  }).length;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

(async function init() {
  var { data } = await supabaseClient.auth.getSession();
  if (data.session) {
    await showDashboard();
  } else {
    showLogin();
  }
})();
