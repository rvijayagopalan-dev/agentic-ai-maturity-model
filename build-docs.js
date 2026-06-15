// Converts every docs/*.md into a styled docs/*.html page matching the portal theme.
// Original .md files are preserved.
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const docsDir = path.join(__dirname, 'docs');

marked.setOptions({ gfm: true, breaks: false, headerIds: true, mangle: false });

function pageTemplate(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} — AI Evolution Platform</title>
<style>
  :root{
    --bg:#0a0e1a; --surface:#111827; --surface2:#1a2236; --border:#1e2d45;
    --accent:#3b82f6; --accent2:#8b5cf6; --accent3:#06b6d4;
    --text:#e2e8f0; --text-muted:#64748b; --text-dim:#94a3b8;
  }
  *{box-sizing:border-box;}
  body{
    margin:0; background:var(--bg); color:var(--text);
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
    line-height:1.7; font-size:15px;
  }
  /* Top bar */
  header{
    background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%);
    border-bottom:1px solid var(--border); position:sticky; top:0; z-index:100;
    backdrop-filter:blur(12px); padding:0 2rem;
  }
  .bar{max-width:980px; margin:0 auto; height:58px; display:flex; align-items:center; gap:14px;}
  .back{
    display:inline-flex; align-items:center; gap:7px; text-decoration:none;
    color:var(--text-dim); font-size:.85rem; padding:6px 14px; border-radius:7px;
    border:1px solid var(--border); transition:all .2s;
  }
  .back:hover{background:var(--surface2); color:var(--text); border-color:var(--accent);}
  .crumb{font-size:.8rem; color:var(--text-muted);}
  .crumb b{color:var(--text-dim); font-weight:600;}
  /* Article */
  main{max-width:980px; margin:0 auto; padding:3rem 2rem 5rem;}
  h1,h2,h3,h4{line-height:1.25; letter-spacing:-.02em; font-weight:700; scroll-margin-top:80px;}
  h1{font-size:2rem; margin:0 0 1.5rem;
     background:linear-gradient(135deg,#e2e8f0,#a5b4fc 60%,#67e8f9);
     -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;}
  h2{font-size:1.4rem; margin:2.5rem 0 1rem; padding-bottom:.5rem; border-bottom:1px solid var(--border);}
  h3{font-size:1.12rem; margin:1.8rem 0 .8rem; color:#c7d2fe;}
  h4{font-size:.98rem; margin:1.4rem 0 .6rem; color:var(--text-dim);}
  p{margin:.8rem 0; color:#cbd5e1;}
  a{color:var(--accent); text-decoration:none;}
  a:hover{text-decoration:underline;}
  strong{color:var(--text);}
  ul,ol{padding-left:1.4rem; color:#cbd5e1;}
  li{margin:.3rem 0;}
  hr{border:none; border-top:1px solid var(--border); margin:2.5rem 0;}
  /* Code */
  code{
    font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;
    font-size:.85em; background:var(--surface2); padding:2px 6px; border-radius:5px;
    color:#7dd3fc; border:1px solid var(--border);
  }
  pre{
    background:#0d1322; border:1px solid var(--border); border-radius:12px;
    padding:1.1rem 1.3rem; overflow-x:auto; margin:1.2rem 0;
    box-shadow:inset 0 1px 0 #ffffff08;
  }
  pre code{
    background:none; border:none; padding:0; color:#a5b4fc; font-size:.82rem;
    line-height:1.5; white-space:pre; display:block;
  }
  /* Mermaid diagrams */
  .mermaid-wrap{
    background:#0d1322; border:1px solid var(--border); border-radius:12px;
    padding:1.4rem; margin:1.4rem 0; overflow-x:auto; text-align:center;
  }
  pre.mermaid{
    background:none; border:none; padding:0; margin:0; box-shadow:none;
    display:flex; justify-content:center; line-height:normal;
  }
  pre.mermaid:not([data-processed]){color:#64748b; font-size:.8rem;}
  /* Tables */
  table{
    border-collapse:collapse; width:100%; margin:1.3rem 0; font-size:.86rem;
    background:var(--surface); border:1px solid var(--border); border-radius:10px; overflow:hidden;
  }
  th,td{padding:9px 13px; text-align:left; border-bottom:1px solid var(--border); vertical-align:top;}
  th{background:var(--surface2); color:#c7d2fe; font-weight:600; letter-spacing:.01em;
     border-bottom:1px solid var(--accent);}
  tr:last-child td{border-bottom:none;}
  tbody tr:hover{background:#ffffff05;}
  blockquote{
    margin:1.2rem 0; padding:.6rem 1.2rem; border-left:3px solid var(--accent2);
    background:var(--surface); border-radius:0 8px 8px 0; color:var(--text-dim);
  }
  /* Footer */
  footer{border-top:1px solid var(--border); text-align:center; padding:2rem;
    color:var(--text-muted); font-size:.8rem;}
  ::selection{background:#3b82f650;}
  @media(max-width:768px){main{padding:2rem 1rem 4rem;} header{padding:0 1rem;} .bar{padding:0;}}
</style>
</head>
<body>
<header>
  <div class="bar">
    <a class="back" href="../index.html">← Portal</a>
    <span class="crumb">AI Evolution Platform &nbsp;/&nbsp; <b>${title}</b></span>
  </div>
</header>
<main>
${bodyHtml}
</main>
<footer>
  Enterprise AI Evolution Platform · <a href="../index.html">Back to Documentation Portal</a>
  <div style="margin-top:8px;color:#475569;font-size:.78rem;">© 2026 Vijayagopalan Raveendran (VR). All rights reserved.</div>
</footer>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
  mermaid.initialize({
    startOnLoad: true,
    theme: 'base',
    themeVariables: {
      darkMode: true,
      background: '#0d1322',
      primaryColor: '#1a2236',
      primaryBorderColor: '#3b82f6',
      primaryTextColor: '#e2e8f0',
      lineColor: '#64748b',
      secondaryColor: '#1e1b4b',
      tertiaryColor: '#111827',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '14px'
    },
    flowchart: { curve: 'basis', htmlLabels: true, padding: 14 },
    sequence: { actorMargin: 40, mirrorActors: false }
  });
</script>
</body>
</html>`;
}

function titleFromMarkdown(md, fallback) {
  const m = md.match(/^#\s+(.+)$/m);
  if (!m) return fallback;
  // strip trailing " — ..." for a tidy tab/crumb title
  return m[1].split('—')[0].trim();
}

const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
let count = 0;
for (const file of files) {
  const md = fs.readFileSync(path.join(docsDir, file), 'utf8');
  const title = titleFromMarkdown(md, file.replace(/\.md$/, ''));
  // Rewrite intra-doc links: foo.md -> foo.html
  let body = marked.parse(md);
  body = body.replace(/href="([^"]+?)\.md(#[^"]*)?"/g, 'href="$1.html$2"');
  // Convert ```mermaid code blocks into <pre class="mermaid"> for Mermaid.js to render.
  // marked double-escapes content; we undo exactly ONE level of &amp; so that &lt;/&gt;
  // remain as entities. This keeps `<br/>`/`<b>` as LITERAL text (not real DOM elements),
  // which Mermaid needs in element.textContent to render htmlLabels (line breaks, bold).
  const unescapeOneLevel = s => s.replace(/&amp;/g, '&');
  body = body.replace(
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
    (_, code) => `<div class="mermaid-wrap"><pre class="mermaid">${unescapeOneLevel(code)}</pre></div>`
  );
  const html = pageTemplate(title, body);
  const outName = file.replace(/\.md$/, '.html');
  fs.writeFileSync(path.join(docsDir, outName), html, 'utf8');
  count++;
  console.log('  ✓ ' + outName);
}
console.log(`Converted ${count} markdown files to HTML.`);
