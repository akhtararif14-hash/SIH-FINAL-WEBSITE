'use client';
// components/RichText.js
// Turns the markdown the AI writes into real formatted output.
//
// No npm package needed — this is a small parser written by hand, so it works
// offline and adds nothing to the bundle size.
//
// Handles: headings, bullet lists (with nesting), numbered lists, bold,
// italic, `code`, links, horizontal rules and simple pipe tables.

import React from 'react';

/* ------------------------------------------------------------------ */
/* 1. Inline bits: **bold**, *italic*, `code`, [text](link)            */
/* ------------------------------------------------------------------ */

const INLINE_RE =
  /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function renderInline(text, keyPrefix = 'i') {
  if (!text) return null;
  const parts = String(text).split(INLINE_RE).filter((p) => p !== undefined && p !== '');

  return parts.map((part, idx) => {
    const key = `${keyPrefix}-${idx}`;

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} style={st.code}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('[')) {
      const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (m) {
        return (
          <a key={key} href={m[2]} target="_blank" rel="noopener noreferrer" style={st.link}>
            {m[1]}
          </a>
        );
      }
    }
    if (
      (part.startsWith('*') && part.endsWith('*')) ||
      (part.startsWith('_') && part.endsWith('_'))
    ) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

/* ------------------------------------------------------------------ */
/* 2. Split the answer into blocks (paragraph, heading, list item...)  */
/* ------------------------------------------------------------------ */

function toBlocks(md) {
  const lines = String(md || '')
    .replace(/\r\n/g, '\n')
    .split('\n');

  const blocks = [];
  let para = [];

  const flush = () => {
    if (para.length) {
      const text = para.join(' ').trim();
      // A line that is entirely bold is really a heading.
      const asHeading = text.match(/^\*\*(.+)\*\*$/);
      if (asHeading) blocks.push({ type: 'h', level: 3, text: asHeading[1] });
      else blocks.push({ type: 'p', text });
      para = [];
    }
  };

  for (let n = 0; n < lines.length; n++) {
    const line = lines[n].replace(/\t/g, '    ');
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      continue;
    }

    // Horizontal rule: --- or ***
    if (/^([-*_])\1{2,}$/.test(trimmed)) {
      flush();
      blocks.push({ type: 'hr' });
      continue;
    }

    // Table:  | a | b |   followed by   | --- | --- |
    if (trimmed.startsWith('|') && /^\|[\s:|-]+\|$/.test((lines[n + 1] || '').trim())) {
      flush();
      const cells = (row) =>
        row
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => c.trim());

      const head = cells(trimmed);
      const rows = [];
      let k = n + 2;
      while (k < lines.length && lines[k].trim().startsWith('|')) {
        rows.push(cells(lines[k]));
        k++;
      }
      blocks.push({ type: 'table', head, rows });
      n = k - 1;
      continue;
    }

    // Heading: # .. ######
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flush();
      blocks.push({ type: 'h', level: Math.min(h[1].length + 1, 5), text: h[2] });
      continue;
    }

    // Bullet: -, * or •
    const bullet = line.match(/^(\s*)[-*•]\s+(.*)$/);
    if (bullet) {
      flush();
      blocks.push({
        type: 'li',
        indent: Math.floor(bullet[1].length / 2),
        ordered: false,
        text: bullet[2],
      });
      continue;
    }

    // Numbered: 1. or 1)
    const num = line.match(/^(\s*)(\d+)[.)]\s+(.*)$/);
    if (num) {
      flush();
      blocks.push({
        type: 'li',
        indent: Math.floor(num[1].length / 2),
        ordered: true,
        text: num[3],
      });
      continue;
    }

    para.push(trimmed);
  }

  flush();
  return blocks;
}

/* ------------------------------------------------------------------ */
/* 3. Turn runs of list items into real nested lists                   */
/* ------------------------------------------------------------------ */

function buildList(items, level) {
  const node = { type: 'list', ordered: items[0].ordered, items: [] };
  let k = 0;

  while (k < items.length) {
    if (items[k].indent > level) {
      let m = k;
      while (m < items.length && items[m].indent > level) m++;
      const child = buildList(items.slice(k, m), items[k].indent);
      if (node.items.length) node.items[node.items.length - 1].children.push(child);
      else node.items.push({ text: '', children: [child] });
      k = m;
    } else {
      node.items.push({ text: items[k].text, children: [] });
      k++;
    }
  }
  return node;
}

function groupLists(blocks) {
  const out = [];
  let i = 0;
  while (i < blocks.length) {
    if (blocks[i].type === 'li') {
      let j = i;
      while (j < blocks.length && blocks[j].type === 'li') j++;
      out.push(buildList(blocks.slice(i, j), blocks[i].indent));
      i = j;
    } else {
      out.push(blocks[i]);
      i++;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* 4. Draw it                                                          */
/* ------------------------------------------------------------------ */

function renderList(node, key) {
  const Tag = node.ordered ? 'ol' : 'ul';
  return (
    <Tag key={key} style={node.ordered ? st.ol : st.ul}>
      {node.items.map((item, idx) => (
        <li key={`${key}-${idx}`} style={st.li}>
          {renderInline(item.text, `${key}-${idx}`)}
          {item.children.map((child, ci) => renderList(child, `${key}-${idx}-${ci}`))}
        </li>
      ))}
    </Tag>
  );
}

export default function RichText({ text }) {
  const blocks = groupLists(toBlocks(text));

  return (
    <div style={st.root}>
      {blocks.map((b, i) => {
        const key = `b${i}`;

        if (b.type === 'list') return renderList(b, key);
        if (b.type === 'hr') return <hr key={key} style={st.hr} />;

        if (b.type === 'h') {
          const Tag = `h${b.level}`;
          return (
            <Tag key={key} style={b.level <= 3 ? st.h3 : st.h4}>
              {renderInline(b.text, key)}
            </Tag>
          );
        }

        if (b.type === 'table') {
          return (
            <div key={key} style={st.tableWrap}>
              <table style={st.table}>
                <thead>
                  <tr>
                    {b.head.map((c, ci) => (
                      <th key={ci} style={st.th}>
                        {renderInline(c, `${key}-h${ci}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((c, ci) => (
                        <td key={ci} style={st.td}>
                          {renderInline(c, `${key}-${ri}-${ci}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={key} style={st.p}>
            {renderInline(b.text, key)}
          </p>
        );
      })}
    </div>
  );
}

const st = {
  root: { fontSize: 14.5, lineHeight: 1.6 },
  p: { margin: '0 0 10px' },
  h3: {
    fontFamily: 'var(--font-display)',
    fontSize: 16.5,
    fontWeight: 700,
    margin: '14px 0 7px',
    lineHeight: 1.35,
  },
  h4: { fontSize: 14.5, fontWeight: 700, margin: '12px 0 6px' },
  ul: { margin: '0 0 10px', paddingLeft: 20 },
  ol: { margin: '0 0 10px', paddingLeft: 22 },
  li: { margin: '0 0 5px' },
  hr: { border: 'none', borderTop: '1px solid currentColor', opacity: 0.2, margin: '12px 0' },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.9em',
    background: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    padding: '1px 5px',
  },
  link: { color: 'inherit', textDecoration: 'underline' },
  tableWrap: { overflowX: 'auto', margin: '0 0 12px' },
  table: { borderCollapse: 'collapse', width: '100%', fontSize: 13.5 },
  th: {
    textAlign: 'left',
    padding: '6px 10px',
    borderBottom: '2px solid rgba(0,0,0,0.15)',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  td: { padding: '6px 10px', borderBottom: '1px solid rgba(0,0,0,0.08)', verticalAlign: 'top' },
};