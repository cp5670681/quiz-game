# 通用数学知识图谱设计

## 目标

为项目补一份 `不绑定教材版本` 的数学知识关系图，覆盖从小学到高中的主干知识点，并显式记录前置依赖关系，便于后续：

- 映射成知识树区域
- 做节点解锁与 Boss 前置判断
- 生成可视化图谱
- 作为题目分发与掌握度系统的底层结构

## 设计决定

- 使用 `JSON` 存储，方便后续程序直接读取
- 节点采用 `中等粒度`，避免过粗无法表达依赖、过细导致图失控
- 每个节点固定字段：
  - `id`
  - `name`
  - `stage`
  - `domain`
  - `prerequisites`
- 顶层补一个 `meta`，说明图谱范围和字段语义

## 文件位置

- 设计文档：`docs/superpowers/specs/2026-07-03-math-knowledge-graph-design.md`
- 图谱数据：`docs/superpowers/specs/quiz-rpg/math-knowledge-graph.json`
- 可视化图：`docs/superpowers/specs/quiz-rpg/math-knowledge-graph.svg`

## 建模规则

### 1. 图类型

图按 `有向无环图` 建模。

- 节点：一个中等粒度知识点
- 边：一个“通常应先掌握”的前置关系

### 2. 学段字段

`stage` 只表示该知识点通常首次被系统学习的大致阶段：

- `primary`
- `junior`
- `senior`

它不是教材版本绑定，也不是严格年级。

### 3. 领域字段

`domain` 使用较稳定的通用数学领域：

- `number`
- `algebra`
- `geometry`
- `function`
- `statistics_probability`
- `analytic_geometry`
- `trigonometry`
- `vectors`
- `calculus`
- `logic`

### 4. 依赖边原则

- 只保留主干依赖，不追求把所有可选路径都写满
- 优先表达“理解这个知识点通常离不开什么”
- 避免为了让图更密而增加噪音边

## 范围

本次图谱覆盖：

- 数与运算
- 代数与方程
- 平面几何与立体几何
- 函数
- 解析几何
- 三角
- 向量
- 统计与概率
- 极限、导数、积分直观

本次不单独展开：

- 竞赛数学
- 教材差异化章节命名
- 地区/版本专属选修结构
- 题库、难度层、掌握度数值

## 验证要求

落文件后必须至少验证：

- JSON 格式合法
- 所有 `id` 唯一
- 所有 `prerequisites` 都能指向已存在节点
- 图中不存在环
