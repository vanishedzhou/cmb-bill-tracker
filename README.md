# CMB Bill Tracker

招商银行信用卡账单自动追踪与分析系统。通过 IMAP 协议自动抓取招行账单邮件，解析交易数据，提供消费分析和可视化看板。

## 功能特性

- **自动抓取** — 定时从 163 邮箱拉取招行账单邮件（每日消费提醒 + 月度电子账单）
- **智能解析** — 自动识别日账单和月账单格式，提取交易明细
- **去重机制** — 日账单与月账单重叠时自动去重，手动重跑也不会产生重复数据
- **退款追踪** — 自动匹配退款与原始交易，标记退货状态
- **分类管理** — 基于规则的商户自动分类，支持手动调整并自动学习
- **多卡支持** — 同时追踪多张信用卡的消费
- **消费分析** — 分类占比、月度趋势、Top 10 排行等图表分析
- **数据看板** — 首页概览当月/当年消费，快速掌握支出情况

## 技术栈

| 组件 | 技术 |
|------|------|
| 后端 | Flask 3.1 + Python 3.13 |
| 数据库 | SQLite（WAL 模式） |
| 定时任务 | APScheduler |
| 邮件解析 | BeautifulSoup + lxml |
| 前端图表 | Chart.js 4.x |
| 部署 | Docker + Gunicorn |

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置 `.env`

复制示例文件并填入你的邮箱信息：

```bash
cp .env.example .env
```

编辑 `.env`：

```ini
EMAIL_ADDRESS=your_email@163.com
EMAIL_AUTH_CODE=your_163_auth_code    # 163 邮箱授权码（非登录密码）
SECRET_KEY=your-random-secret-key
```

> `.env` 已被 `.gitignore` 忽略，不会提交到 git。打包部署时 `build.sh` 会自动将其包含在内。

### 3. 启动

```bash
python3 app.py
```

打开浏览器访问 `http://localhost:5002`，进入「数据管理」页面，点击「7天」按钮测试抓取。

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `EMAIL_ADDRESS` | — | 163 邮箱地址 |
| `EMAIL_AUTH_CODE` | — | 163 邮箱授权码 |
| `IMAP_HOST` | `imap.163.com` | IMAP 服务器 |
| `IMAP_PORT` | `993` | IMAP 端口 |
| `DATABASE_PATH` | `./cmb_bills.db` | SQLite 数据库路径 |
| `DAILY_FETCH_TIMES` | `9:00,14:00` | 每日定时抓取时间，逗号分隔 |
| `URL_PREFIX` | （空） | 子路径部署前缀，如 `/cmb` |
| `SECRET_KEY` | 内置默认 | Flask Session 密钥 |
| `DEBUG` | `false` | 调试模式 |

## Docker 部署

```bash
# 构建并启动
./deploy.sh

# 查看日志
./deploy.sh logs

# 停止
./deploy.sh stop
```

容器默认监听 5002 端口，数据库持久化在 `./data/cmb_bills.db`。

### 子路径反向代理部署

如需部署在 `/cmb` 子路径下（如通过 Nginx 反代）：

```bash
docker run -d \
  -e URL_PREFIX=/cmb \
  -e EMAIL_ADDRESS=your@163.com \
  -e EMAIL_AUTH_CODE=your_code \
  -p 5002:5002 \
  cmb-bill-tracker
```

## 项目结构

```
cmb-bill-tracker/
├── app.py                  # Flask 应用入口 + 定时任务
├── config.py               # 配置（自动加载 .env）
├── .env                    # 敏感配置（git 忽略，打包时包含）
├── .env.example            # .env 示例文件
├── .gitignore
├── models/
│   └── database.py         # 数据库初始化与连接
├── services/
│   ├── email_fetcher.py    # IMAP 邮件抓取
│   ├── bill_parser.py      # 账单解析（日账单 + 月账单）
│   ├── pipeline.py         # 抓取-解析-入库 完整流水线
│   ├── category_mapper.py  # 商户分类映射
│   └── dedup.py            # 交易去重（SHA-256）
├── routes/
│   ├── dashboard.py        # 首页概览 API
│   ├── analysis.py         # 消费分析 API
│   └── data_mgmt.py        # 数据管理 API
├── templates/
│   ├── base.html           # 基础布局（侧栏导航）
│   ├── dashboard.html      # 首页概览
│   ├── analysis.html       # 消费分析
│   └── data_mgmt.html      # 数据管理
├── static/
│   ├── css/style.css       # 全局样式
│   └── js/
│       ├── dashboard.js    # 首页逻辑
│       ├── analysis.js     # 分析页逻辑
│       └── data_mgmt.js    # 数据管理逻辑
├── Dockerfile
├── deploy.sh               # Docker 部署脚本
├── build.sh                # 打包脚本
└── requirements.txt
```

## 页面说明

### 首页概览 `/`

- 当月 / 当年消费汇总（按卡分别统计）
- 当月 / 当年 Top 10 大额消费排行
- 各卡最近 15 笔交易

### 消费分析 `/analysis`

- 分类占比饼图
- 分类排行柱状图
- 月度消费趋势折线图
- 交易明细搜索（支持按分类、商户、日期筛选，分页浏览）

### 数据管理 `/data`

- 历史数据初始化（支持 7天 / 1月 / 6月 / 1年 / 3年 / 5年）
- 手动触发抓取 + 抓取进度展示
- 数据统计总览
- 抓取历史记录
- 未分类交易管理
- 商户分类批量管理

## 数据流

```
163 邮箱 IMAP
    ↓ 抓取
邮件解析器
    ├─ 日账单（正则提取）
    └─ 月账单（HTML 表格解析）
    ↓ 解析
去重检查（SHA-256 哈希）
    ↓
商户自动分类（规则匹配）
    ↓
SQLite 数据库
    ↓ API
前端页面（Chart.js 可视化）
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/dashboard` | 首页概览数据 |
| GET | `/api/analysis/category` | 分类汇总 |
| GET | `/api/analysis/monthly-trend` | 月度趋势 |
| GET | `/api/analysis/transactions` | 交易明细（分页） |
| POST | `/api/fetch` | 触发邮件抓取 |
| GET | `/api/fetch/<id>/status` | 抓取进度查询 |
| GET | `/api/fetch-logs` | 抓取历史 |
| POST | `/api/cron/daily-fetch` | 手动触发日常抓取 |
| GET | `/api/stats` | 数据统计 |
| GET | `/api/categories` | 分类列表 |
| GET | `/api/uncategorized` | 未分类交易 |
| PUT | `/api/transactions/<id>/category` | 更新单条分类 |
| GET | `/api/merchants` | 商户列表 |
| PUT | `/api/merchants/category` | 批量更新商户分类 |

## License

MIT
