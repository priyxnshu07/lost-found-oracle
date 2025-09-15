// Core app JS split out for clarity and cache
const notify = (msg, ok=true) => {
  const el = document.createElement('div');
  el.className = `fixed top-4 right-4 px-4 py-2 rounded-xl shadow-lg text-white ${ok? 'bg-emerald-600':'bg-rose-600'}`;
  el.textContent = msg; document.body.appendChild(el); setTimeout(()=>el.remove(), 2000);
};

const setLoading = (loading) => {
  let spinner = document.getElementById('globalSpinner');
  if (loading) {
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.id = 'globalSpinner';
      spinner.className = 'fixed z-50 bottom-6 right-6 h-10 w-10 grid place-items-center rounded-full bg-indigo-600 text-white shadow-lg';
      spinner.innerHTML = '<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle class="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4"/></svg>';
      document.body.appendChild(spinner);
    }
  } else {
    spinner && spinner.remove();
  }
};

const api = (p) => fetch(p).then(async r => { if(!r.ok) throw new Error(await r.text()); return r.json(); });
const post = (p, body) => fetch(p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async r => { if(!r.ok) throw new Error(await r.text()); return r.json(); });

async function refresh() {
  const [lost, found, matches] = await Promise.all([
    api('/api/lost'), api('/api/found'), api('/api/matches')
  ]);
  const rows = matches.map(m => Array.isArray(m) ? {
    match_id:m[0],lost_id:m[1],found_id:m[2],match_date:m[3],status:m[4],
    lost_name:m[5],lost_category:m[6],lost_location:m[7],
    found_name:m[8],found_category:m[9],found_location:m[10]
  } : m);
  const statusBadge = (s) => {
    const t = (s || 'Pending').toString();
    const cls = t === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : t === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700';
    return `<span class="px-2 py-1 rounded-full text-[11px] font-semibold ${cls}">${t}</span>`;
  };
  const actionBtns = (id) => `
    <div class="flex gap-2 justify-end">
      <button data-action="confirm" data-id="${id}" class="px-2 py-1 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-700">Confirm</button>
      <button data-action="reject" data-id="${id}" class="px-2 py-1 rounded-md bg-rose-600 text-white text-xs hover:bg-rose-700">Reject</button>
    </div>`;
  const tableBody = rows.length ? rows.map(m => `<tr class="odd:bg-white even:bg-gray-50 hover:bg-indigo-50/60 transition-colors">
      <td class="p-2">#${m.match_id ?? ''}</td>
      <td class="p-2">
        <div class="text-gray-900 font-medium">${m.lost_name ?? ''} <span class="text-xs text-gray-500">${m.lost_id?`(ID ${m.lost_id})`:''}</span></div>
        <div class="text-xs text-gray-500">${m.lost_category ?? ''} • ${m.lost_location ?? ''}</div>
      </td>
      <td class="p-2">
        <div class="text-gray-900 font-medium">${m.found_name ?? ''} <span class="text-xs text-gray-500">${m.found_id?`(ID ${m.found_id})`:''}</span></div>
        <div class="text-xs text-gray-500">${m.found_category ?? ''} • ${m.found_location ?? ''}</div>
      </td>
      <td class="p-2 whitespace-nowrap">${m.match_date ?? ''}</td>
      <td class="p-2 text-center">${statusBadge(m.status)}${m.match_id? actionBtns(m.match_id):''}</td>
    </tr>`).join('') : `<tr><td colspan="5" class="p-4 text-center text-gray-500">No matches yet. Add items and click <b>Run AutoMatch</b>.</td></tr>`;
  document.getElementById('matches').innerHTML = `<table class="w-full text-sm overflow-hidden rounded-xl border border-gray-100"><thead><tr class="text-left bg-gray-50"><th class="p-2 text-gray-600">Match</th><th class="p-2 text-gray-600">Lost</th><th class="p-2 text-gray-600">Found</th><th class="p-2 text-gray-600">Date</th><th class="p-2 text-gray-600 text-center">Status</th></tr></thead><tbody>${tableBody}</tbody></table>`;
}

document.addEventListener('click', async (e) => {
  const el = e.target;
  if (el.matches('[data-action]')) {
    const id = el.getAttribute('data-id');
    const action = el.getAttribute('data-action');
    const status = action === 'confirm' ? 'Confirmed' : 'Rejected';
    try { setLoading(true); await post(`/api/matches/${id}/status`, { status }); notify(`Marked ${status}`); refresh(); } catch(err){ notify(err.message,false) } finally { setLoading(false) }
  }
});

document.getElementById('lostForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  try { setLoading(true); await post('/api/lost', data); notify('Lost item submitted'); e.target.reset(); refresh(); } catch(err){ notify(err.message,false); } finally { setLoading(false) }
});

document.getElementById('foundForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  try { setLoading(true); await post('/api/found', data); notify('Found item submitted'); e.target.reset(); refresh(); } catch(err){ notify(err.message,false); } finally { setLoading(false) }
});

document.getElementById('runMatch').addEventListener('click', async () => {
  try { setLoading(true); await post('/api/automatch', {}); notify('AutoMatch ran'); refresh(); } catch(err){ notify(err.message,false); } finally { setLoading(false) }
});

document.getElementById('resetDb').addEventListener('click', async () => {
  if (!confirm('Reset all data?')) return;
  try { setLoading(true); await post('/api/admin/reset', {}); notify('Database reset'); refresh(); } catch(err){ notify(err.message,false); } finally { setLoading(false) }
});

refresh();


