// lib/userFiles.js
// The "Downloads" section: every report the user generates is kept here so
// they can open or download it later, even offline. Stored in the browser,
// so nothing is uploaded anywhere.

import { advisorT } from './advisor/i18n';

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
  // Keep letters from any script (Hindi, Urdu, Bengali), not just A-Z, or a
  // non-English title would strip down to an empty filename.
  const safeName =
    file.title
      .replace(/[\\/:*?"<>|]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 80) || 'srigen-report';
  a.download = `${safeName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Builds a printable one-page report, in the user's language.
export function buildLocationReportHtml(report, profile, lang = 'en') {
  const A = advisorT(lang);
  const money = (n) => (n == null ? '\u2014' : '\u20b9' + Number(n).toLocaleString('en-IN'));
  const top = report.ranked.filter((r) => r.eligible).slice(0, 5);

  const rows = top
    .map(
      (r, i) => `<tr>
        <td>${i + 1}</td>
        <td><b>${r.name}</b><br><small>${A('repSimilarNearby', { n: r.competitorCount })}</small></td>
        <td>${r.score}</td>
        <td>${money(r.finance?.totalInvestment)}</td>
        <td>${money(r.finance?.netProfit)}</td>
        <td>${r.finance?.paybackMonths ? r.finance.paybackMonths + ' ' + A('repMonths') : '\u2014'}</td>
      </tr>`
    )
    .join('');

  const best = top[0];
  const SWOT_HEADINGS = {
    strengths: 'repStrengths',
    weaknesses: 'repWeaknesses',
    opportunities: 'repOpportunities',
    threats: 'repThreats',
  };
  const swot = best?.swot
    ? Object.keys(SWOT_HEADINGS)
        .map(
          (k) =>
            `<div class="swot"><h4>${A(SWOT_HEADINGS[k])}</h4><ul>${best.swot[k]
              .map((x) => `<li>${x}</li>`)
              .join('')}</ul></div>`
        )
        .join('')
    : '';

  // Urdu reads right to left.
  const dir = lang === 'ur' ? 'rtl' : 'ltr';

  return `<!doctype html>
<html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${A('repDocTitle', { place: report.location.label })}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #2b2620; max-width: 820px; margin: 24px auto; padding: 0 16px; line-height: 1.55; }
  h1 { color: #6b4226; font-size: 24px; margin-bottom: 4px; }
  .muted { color: #7a6f63; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
  th, td { border: 1px solid #e4d7c6; padding: 8px; text-align: start; vertical-align: top; }
  th { background: #eaf3ec; color: #1f3b28; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; margin: 14px 0; }
  .box { border: 1px solid #e4d7c6; border-radius: 10px; padding: 10px; }
  .swot { border: 1px solid #e4d7c6; border-radius: 10px; padding: 10px; }
  .swot h4 { margin: 0 0 6px; color: #2e5339; }
  ul { margin: 0; padding-inline-start: 18px; }
  li { font-size: 13px; margin-bottom: 4px; }
  footer { margin-top: 24px; font-size: 12px; color: #7a6f63; border-top: 1px solid #e4d7c6; padding-top: 10px; }
</style></head><body>
<h1>${A('repHeading')}</h1>
<div class="muted">${report.location.label}<br>
${A('repCircle')}: ${(report.radius / 1000).toFixed(1)} km \u00b7 ${A('repCreated')}: ${new Date(
    report.generatedAt || Date.now()
  ).toLocaleString('en-IN')}${profile?.name ? ` \u00b7 ${A('repPreparedFor')}: ${profile.name}` : ''}</div>

<div class="grid">
  <div class="box"><b>${A('repPeople')}</b><br>${
    report.population ? report.population.people.toLocaleString('en-IN') : A('repNotAvailable')
  }</div>
  <div class="box"><b>${A('avgTemp')}</b><br>${report.climate?.avgMaxTemp ?? '\u2014'} \u00b0C</div>
  <div class="box"><b>${A('rainLast12')}</b><br>${report.climate?.annualRainMm ?? '\u2014'} mm</div>
  <div class="box"><b>${A('dataConfidence')}</b><br>${report.dataConfidence}</div>
</div>

<h3>${A('repBestIdeas')}</h3>
<table><thead><tr><th>${A('repRank')}</th><th>${A('repBusiness')}</th><th>${A('repScore')}</th><th>${A(
    'repInvestment'
  )}</th><th>${A('repMonthlyProfit')}</th><th>${A('repPayback')}</th></tr></thead>
<tbody>${rows}</tbody></table>

${best ? `<h3>${A('repSwotFor', { name: best.name })}</h3><div class="grid">${swot}</div>` : ''}

${
  report.explanation
    ? `<h3>${A('repAdvisorSummary')}</h3><p style="white-space:pre-wrap">${report.explanation}</p>`
    : ''
}

<footer>
  ${A('repData')}: ${report.sources.join(' \u00b7 ')}.<br>
  ${A('repDisclaimer')}<br>
  ${A('repMadeBy')}
</footer>
</body></html>`;
}