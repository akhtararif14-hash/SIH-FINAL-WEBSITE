// lib/userFiles.js
// The "Downloads" section: every report the user generates is kept here so
// they can open or download it later, even offline. Stored in the browser,
// so nothing is uploaded anywhere.

const KEY = 'srigen-files';

export function listFiles() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const rows = raw ? JSON.parse(raw) : [];
    return Array.isArray(rows) ? rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  } catch {
    return [];
  }
}

export function saveFile({ title, subtitle, kind = 'report', html }) {
  const row = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    subtitle,
    kind,
    html,
    createdAt: new Date().toISOString(),
  };
  try {
    const rows = listFiles();
    // Keep the newest 30 files so the browser storage never fills up.
    window.localStorage.setItem(KEY, JSON.stringify([row, ...rows].slice(0, 30)));
  } catch {}
  return row;
}

export function deleteFile(id) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(listFiles().filter((f) => f.id !== id)));
  } catch {}
}

// Turns the saved HTML into a real file the user can keep.
export function downloadFile(file) {
  const blob = new Blob([file.html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${file.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Builds a printable one-page report from a location analysis.
export function buildLocationReportHtml(report, profile) {
  const money = (n) => (n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN'));
  const top = report.ranked.filter((r) => r.eligible).slice(0, 5);
  const rows = top
    .map(
      (r, i) => `<tr>
        <td>${i + 1}</td>
        <td><b>${r.name}</b><br><small>${r.competitorCount} similar shops nearby</small></td>
        <td>${r.score}</td>
        <td>${money(r.finance?.totalInvestment)}</td>
        <td>${money(r.finance?.netProfit)}</td>
        <td>${r.finance?.paybackMonths ? r.finance.paybackMonths + ' months' : '—'}</td>
      </tr>`
    )
    .join('');

  const best = top[0];
  const swot = best?.swot
    ? ['strengths', 'weaknesses', 'opportunities', 'threats']
        .map(
          (k) =>
            `<div class="swot"><h4>${k[0].toUpperCase() + k.slice(1)}</h4><ul>${best.swot[k]
              .map((x) => `<li>${x}</li>`)
              .join('')}</ul></div>`
        )
        .join('')
    : '';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Business report — ${report.location.label}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #2b2620; max-width: 820px; margin: 24px auto; padding: 0 16px; line-height: 1.55; }
  h1 { color: #6b4226; font-size: 24px; margin-bottom: 4px; }
  .muted { color: #7a6f63; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
  th, td { border: 1px solid #e4d7c6; padding: 8px; text-align: left; vertical-align: top; }
  th { background: #eaf3ec; color: #1f3b28; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; margin: 14px 0; }
  .box { border: 1px solid #e4d7c6; border-radius: 10px; padding: 10px; }
  .swot { border: 1px solid #e4d7c6; border-radius: 10px; padding: 10px; }
  .swot h4 { margin: 0 0 6px; color: #2e5339; }
  ul { margin: 0; padding-left: 18px; }
  li { font-size: 13px; margin-bottom: 4px; }
  footer { margin-top: 24px; font-size: 12px; color: #7a6f63; border-top: 1px solid #e4d7c6; padding-top: 10px; }
</style></head><body>
<h1>Business opportunity report</h1>
<div class="muted">${report.location.label}<br>
Circle studied: ${(report.radius / 1000).toFixed(1)} km · Created: ${new Date(report.generatedAt || Date.now()).toLocaleString('en-IN')}${
    profile?.name ? ` · Prepared for: ${profile.name}` : ''
  }</div>

<div class="grid">
  <div class="box"><b>People in this circle</b><br>${
    report.population ? report.population.people.toLocaleString('en-IN') : 'not available'
  }</div>
  <div class="box"><b>Average day temperature</b><br>${report.climate?.avgMaxTemp ?? '—'} °C</div>
  <div class="box"><b>Rain last 12 months</b><br>${report.climate?.annualRainMm ?? '—'} mm</div>
  <div class="box"><b>Data confidence</b><br>${report.dataConfidence}</div>
</div>

<h3>Best business ideas here</h3>
<table><thead><tr><th>#</th><th>Business</th><th>Score</th><th>Investment</th><th>Monthly profit</th><th>Payback</th></tr></thead>
<tbody>${rows}</tbody></table>

${best ? `<h3>SWOT — ${best.name}</h3><div class="grid">${swot}</div>` : ''}

${report.explanation ? `<h3>Advisor summary</h3><p style="white-space:pre-wrap">${report.explanation}</p>` : ''}

<footer>
  Data: ${report.sources.join(' · ')}.<br>
  All figures are estimates to guide your own research. Visit the area at different times of day before investing.<br>
  Generated by SriGen — AI Business Advisor.
</footer>
</body></html>`;
}