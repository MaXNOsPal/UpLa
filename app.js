let currentType = 'income';
let currentCat = '💰';
let currentAmount = '';

// สลับรายรับ/รายจ่าย
document.querySelectorAll('.typeBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentType = btn.dataset.type;
    document.querySelectorAll('.typeBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// เลือกหมวดหมู่
document.querySelectorAll('.catBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentCat = btn.dataset.cat;
    document.querySelectorAll('.catBtn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// กดตัวเลข
document.querySelectorAll('.numBtn').forEach(btn => {
  if (btn.id === 'btnClear' || btn.id === 'btnSave') return;
  btn.addEventListener('click', () => {
    currentAmount += btn.textContent;
    document.getElementById('txAmountDisplay').textContent = currentAmount;
  });
});

// ล้างค่า
document.getElementById('btnClear').addEventListener('click', () => {
  currentAmount = '';
  document.getElementById('txAmountDisplay').textContent = '0';
});

// บันทึก
document.getElementById('btnSave').addEventListener('click', async () => {
  const amount = parseFloat(currentAmount);
  if (!amount || amount <= 0) return;

  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('transactions').insert({
    user_id: user.id,
    type: currentType,
    amount,
    category: currentCat
  });

  if (!error) {
    currentAmount = '';
    document.getElementById('txAmountDisplay').textContent = '0';
    await loadTransactions();
  }
});

// โหลดรายการ (แสดงแบบ icon + ตัวเลขล้วนๆ)
async function loadTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return;

  const list = document.getElementById('txList');
  list.innerHTML = '';
  let balance = 0;

  const { data: all } = await supabase.from('transactions').select('*');
  all.forEach(tx => balance += tx.type === 'income' ? tx.amount : -tx.amount);

  data.forEach(tx => {
    const sign = tx.type === 'income' ? '+' : '−';
    const color = tx.type === 'income' ? '#2ecc71' : '#e74c3c';
    const row = document.createElement('div');
    row.style = `display:flex;justify-content:space-between;padding:10px 4px;border-bottom:1px solid #eee;`;
    row.innerHTML = `<span>${tx.category}</span><span style="color:${color};font-weight:bold;">${sign}${tx.amount}</span>`;
    list.appendChild(row);
  });

  document.getElementById('txBalance').textContent = balance.toFixed(0);
}

document.getElementById('btnLogout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.reload();
});