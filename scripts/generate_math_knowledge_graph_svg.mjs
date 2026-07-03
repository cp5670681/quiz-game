import fs from "fs";
import path from "path";

const inputPath = path.resolve(
  "docs/superpowers/specs/quiz-rpg/math-knowledge-graph.json"
);
const outputPath = path.resolve(
  "docs/superpowers/specs/quiz-rpg/math-knowledge-graph.svg"
);

const stageOrder = ["primary", "junior", "senior"];
const stageLabels = {
  primary: "小学",
  junior: "初中",
  senior: "高中"
};

const domainOrder = [
  "number",
  "algebra",
  "geometry",
  "function",
  "analytic_geometry",
  "trigonometry",
  "vectors",
  "statistics_probability",
  "calculus",
  "logic"
];

const domainLabels = {
  number: "数与运算",
  algebra: "代数",
  geometry: "几何",
  function: "函数",
  analytic_geometry: "解析几何",
  trigonometry: "三角",
  vectors: "向量",
  statistics_probability: "统计与概率",
  calculus: "微积分直观",
  logic: "集合与逻辑"
};

const domainColors = {
  number: "#FDE68A",
  algebra: "#BFDBFE",
  geometry: "#C7D2FE",
  function: "#A7F3D0",
  analytic_geometry: "#FBCFE8",
  trigonometry: "#FDBA74",
  vectors: "#93C5FD",
  statistics_probability: "#DDD6FE",
  calculus: "#99F6E4",
  logic: "#D9F99D"
};

const canvas = {
  left: 48,
  top: 48,
  right: 48,
  bottom: 48
};

const stageWidth = 440;
const stageGap = 44;
const rowHeight = 208;
const rowGap = 24;
const domainHeaderHeight = 28;
const nodeWidth = 168;
const nodeHeight = 56;
const nodeGap = 12;
const headerHeight = 96;

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const nodes = data.nodes;

const grouped = new Map();
for (const stage of stageOrder) {
  grouped.set(stage, new Map());
  for (const domain of domainOrder) {
    grouped.get(stage).set(domain, []);
  }
}

for (const node of nodes) {
  if (!grouped.has(node.stage) || !grouped.get(node.stage).has(node.domain)) {
    throw new Error(`Unknown stage/domain for node ${node.id}`);
  }
  grouped.get(node.stage).get(node.domain).push(node);
}

for (const stage of stageOrder) {
  for (const domain of domainOrder) {
    grouped
      .get(stage)
      .get(domain)
      .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
  }
}

const layout = new Map();
for (const [stageIndex, stage] of stageOrder.entries()) {
  const stageX = canvas.left + stageIndex * (stageWidth + stageGap);
  for (const [domainIndex, domain] of domainOrder.entries()) {
    const rowY =
      canvas.top + headerHeight + domainIndex * (rowHeight + rowGap);
    const items = grouped.get(stage).get(domain);
    const columns = Math.max(1, Math.ceil(items.length / 3));
    items.forEach((node, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = stageX + 18 + col * (nodeWidth + nodeGap);
      const y = rowY + domainHeaderHeight + 16 + row * (nodeHeight + nodeGap);
      layout.set(node.id, { x, y, stage, domain, node });
    });
  }
}

const totalWidth =
  canvas.left +
  canvas.right +
  stageOrder.length * stageWidth +
  (stageOrder.length - 1) * stageGap;
const totalHeight =
  canvas.top +
  canvas.bottom +
  headerHeight +
  domainOrder.length * rowHeight +
  (domainOrder.length - 1) * rowGap;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, maxCharsPerLine = 10) {
  const chars = Array.from(text);
  const lines = [];
  for (let i = 0; i < chars.length; i += maxCharsPerLine) {
    lines.push(chars.slice(i, i + maxCharsPerLine).join(""));
  }
  return lines;
}

function edgePath(from, to) {
  const x1 = from.x + nodeWidth;
  const y1 = from.y + nodeHeight / 2;
  const x2 = to.x;
  const y2 = to.y + nodeHeight / 2;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

let svg = "";
svg += `<?xml version="1.0" encoding="UTF-8"?>\n`;
svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img" aria-labelledby="title desc">\n`;
svg += `  <title id="title">通用数学知识图谱</title>\n`;
svg += `  <desc id="desc">按小学、初中、高中分列，按数学领域分组的通用数学知识前置依赖图。</desc>\n`;
svg += `  <defs>\n`;
svg += `    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">\n`;
svg += `      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748B"/>\n`;
svg += `    </marker>\n`;
svg += `    <style>\n`;
svg += `      .title { font: 700 30px sans-serif; fill: #0F172A; }\n`;
svg += `      .subtitle { font: 400 14px sans-serif; fill: #475569; }\n`;
svg += `      .stage-title { font: 700 22px sans-serif; fill: #0F172A; }\n`;
svg += `      .domain-title { font: 700 14px sans-serif; fill: #334155; }\n`;
svg += `      .node-text { font: 600 12px sans-serif; fill: #0F172A; }\n`;
svg += `      .meta-text { font: 400 11px sans-serif; fill: #475569; }\n`;
svg += `      .edge { fill: none; stroke: #94A3B8; stroke-width: 1.5; marker-end: url(#arrow); opacity: 0.78; }\n`;
svg += `      .stage-box { fill: #F8FAFC; stroke: #CBD5E1; stroke-width: 1.5; rx: 20; }\n`;
svg += `      .domain-box { fill: #FFFFFF; stroke: #E2E8F0; stroke-width: 1; rx: 12; }\n`;
svg += `      .node-box { stroke: #CBD5E1; stroke-width: 1; rx: 10; }\n`;
svg += `    </style>\n`;
svg += `  </defs>\n`;
svg += `  <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#F8FAFC"/>\n`;
svg += `  <text x="${canvas.left}" y="${canvas.top - 8}" class="title">通用数学知识图谱</text>\n`;
svg += `  <text x="${canvas.left}" y="${canvas.top + 20}" class="subtitle">覆盖小学到高中主干数学知识。节点表示中等粒度知识点，箭头表示主干前置依赖关系。</text>\n`;

for (const [stageIndex, stage] of stageOrder.entries()) {
  const stageX = canvas.left + stageIndex * (stageWidth + stageGap);
  const stageY = canvas.top + 40;
  const stageBoxHeight = totalHeight - canvas.top - canvas.bottom - 40;
  svg += `  <rect x="${stageX}" y="${stageY}" width="${stageWidth}" height="${stageBoxHeight}" class="stage-box"/>\n`;
  svg += `  <text x="${stageX + 18}" y="${stageY + 30}" class="stage-title">${stageLabels[stage]}</text>\n`;
}

for (const [domainIndex, domain] of domainOrder.entries()) {
  const rowY =
    canvas.top + headerHeight + domainIndex * (rowHeight + rowGap);
  for (const [stageIndex, stage] of stageOrder.entries()) {
    const stageX = canvas.left + stageIndex * (stageWidth + stageGap);
    svg += `  <rect x="${stageX + 12}" y="${rowY}" width="${stageWidth - 24}" height="${rowHeight}" class="domain-box"/>\n`;
    if (stageIndex === 0) {
      svg += `  <text x="${stageX + 24}" y="${rowY + 20}" class="domain-title">${domainLabels[domain]}</text>\n`;
    }
  }
}

svg += `  <g id="edges">\n`;
for (const node of nodes) {
  const target = layout.get(node.id);
  for (const prerequisite of node.prerequisites) {
    const source = layout.get(prerequisite);
    svg += `    <path d="${edgePath(source, target)}" class="edge"/>\n`;
  }
}
svg += `  </g>\n`;

svg += `  <g id="nodes">\n`;
for (const node of nodes) {
  const { x, y, domain } = layout.get(node.id);
  const lines = wrapText(node.name);
  const fill = domainColors[domain] || "#E2E8F0";
  svg += `    <g>\n`;
  svg += `      <rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" class="node-box" fill="${fill}"/>\n`;
  const firstLineY = y + 22;
  lines.forEach((line, index) => {
    svg += `      <text x="${x + 10}" y="${firstLineY + index * 14}" class="node-text">${escapeXml(line)}</text>\n`;
  });
  svg += `    </g>\n`;
}
svg += `  </g>\n`;

svg += `  <text x="${canvas.left}" y="${totalHeight - 16}" class="meta-text">共 ${nodes.length} 个节点。颜色表示领域，列表示常见首次系统学习阶段。</text>\n`;
svg += `</svg>\n`;

fs.writeFileSync(outputPath, svg, "utf8");
console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
