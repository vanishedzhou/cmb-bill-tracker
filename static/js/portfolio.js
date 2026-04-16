/**
 * Portfolio Breakdown - interactive editable table with CRUD.
 */
const Portfolio = (() => {
    const P = window.__PREFIX__ || "";
    let holdings = [];
    let pieChart = null;
    let leverage = parseFloat(localStorage.getItem("portfolio_leverage")) || 35.6;

    // ── Default data from screenshot ──
    const DEFAULT_HOLDINGS = [
        { category: "纳指", sub_category: "场外纳指", item_name: "南方基金", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 8.35, position_pct: 5.04, category_pct: null },
        { category: "纳指", sub_category: "场外纳指", item_name: "广发基金", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 4.1, position_pct: 2.47, category_pct: null },
        { category: "纳指", sub_category: "场内纳指", item_name: "159941广发", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 10.55, position_pct: 6.36, category_pct: null },
        { category: "纳指", sub_category: "美股纳指", item_name: "qqqm", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 1.4, position_pct: 0.84, category_pct: null },
        { category: "标普", sub_category: "场外标普", item_name: "博时基金", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 1.85, position_pct: 1.12, category_pct: null },
        { category: "标普", sub_category: "场内标普", item_name: "513650南方", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 19.03, position_pct: 11.48, category_pct: null },
        { category: "标普", sub_category: "美股标普", item_name: "voo", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 0.84, position_pct: 0.51, category_pct: null },
        { category: "日经", sub_category: "场内日经", item_name: "日经225", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 5.38, position_pct: 3.24, category_pct: null },
        { category: "活钱", sub_category: "货币基金", item_name: "银华日利", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 27.07, position_pct: 16.32, category_pct: null },
        { category: "活钱", sub_category: "", item_name: "南方现金宝", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 6.16, position_pct: 3.71, category_pct: null },
        { category: "活钱", sub_category: "", item_name: "朝朝宝", shares: null, current_price: null, exchange_rate: null, cost_price: null, profit_loss: null, market_value: 5.5, position_pct: 3.32, category_pct: null },
        { category: "个股", sub_category: "美股", item_name: "JPM", shares: 10, current_price: 290.9, exchange_rate: 6.888, cost_price: 303.16, profit_loss: -844.47, market_value: 2.00, position_pct: 1.21, category_pct: null },
        { category: "个股", sub_category: "美股", item_name: "BRK.B", shares: 16, current_price: 495.7, exchange_rate: 6.888, cost_price: 488.12, profit_loss: 835.377, market_value: 5.46, position_pct: 3.29, category_pct: null },
        { category: "个股", sub_category: "美股", item_name: "GOOG", shares: 29, current_price: 308.1, exchange_rate: 6.888, cost_price: 309.2, profit_loss: -219.73, market_value: 6.15, position_pct: 3.71, category_pct: null },
        { category: "个股", sub_category: "美股", item_name: "MSFT", shares: 4, current_price: 406.2, exchange_rate: 6.888, cost_price: 384.64, profit_loss: 594.021, market_value: 1.12, position_pct: 0.67, category_pct: null },
        { category: "个股", sub_category: "港股", item_name: "Tencent", shares: 494, current_price: 553, exchange_rate: 0.88, cost_price: 300, profit_loss: 109984, market_value: 24.04, position_pct: 14.50, category_pct: null },
        { category: "个股", sub_category: "港股", item_name: "美团", shares: 700, current_price: 79.1, exchange_rate: 0.88, cost_price: 97.4, profit_loss: -11273, market_value: 4.87, position_pct: 2.94, category_pct: null },
        { category: "个股", sub_category: "港股", item_name: "中国移动", shares: 400, current_price: 78.8, exchange_rate: 0.88, cost_price: 83.3, profit_loss: -1584, market_value: 2.77, position_pct: 1.67, category_pct: null },
        { category: "个股", sub_category: "A股", item_name: "紫金矿业", shares: 5200, current_price: 37.1, exchange_rate: 1, cost_price: 30.7, profit_loss: 33280, market_value: 19.29, position_pct: 11.63, category_pct: null },
        { category: "个股", sub_category: "A股", item_name: "五粮液", shares: 500, current_price: 102.1, exchange_rate: 1, cost_price: 109.1, profit_loss: -3500, market_value: 5.11, position_pct: 3.08, category_pct: null },
        { category: "个股", sub_category: "A股", item_name: "中国移动", shares: 500, current_price: 95.4, exchange_rate: 1, cost_price: 94.1, profit_loss: 650, market_value: 4.77, position_pct: 2.88, category_pct: null },
    ];

    // Category colors for pie chart
    const CAT_COLORS = {
        "纳指": "#4a90d9",
        "标普": "#67b8f7",
        "日经": "#f39c12",
        "活钱": "#27ae60",
        "个股": "#e74c3c",
    };
    const FALLBACK_COLORS = ["#9b59b6", "#1abc9c", "#e67e22", "#34495e", "#2ecc71", "#3498db"];

    function init() {
        loadData();
    }

    function loadData() {
        fetch(`${P}/api/portfolio`)
            .then(r => r.json())
            .then(data => {
                if (data.holdings && data.holdings.length > 0) {
                    holdings = data.holdings;
                } else {
                    // First time: load defaults
                    holdings = DEFAULT_HOLDINGS.map((h, i) => ({ ...h, id: -(i + 1) }));
                }
                recalcComputed();
                recalcCategoryPct();
                render();
                renderSummary();
                renderPieChart();
            })
            .catch(() => {
                holdings = DEFAULT_HOLDINGS.map((h, i) => ({ ...h, id: -(i + 1) }));
                recalcComputed();
                recalcCategoryPct();
                render();
                renderSummary();
                renderPieChart();
            });
    }

    /**
     * Auto-compute profit_loss and market_value for rows that have
     * shares, current_price, and exchange_rate filled in.
     * Formula: market_value = shares * current_price * exchange_rate / 10000 (unit: 万)
     *          profit_loss  = shares * (current_price - cost_price) * exchange_rate
     */
    function recalcComputed() {
        holdings.forEach(h => {
            const canCalcMV = h.shares != null && h.current_price != null && h.exchange_rate != null;
            if (canCalcMV) {
                h.market_value = Math.round(h.shares * h.current_price * h.exchange_rate / 10000 * 100) / 100;
            }
            const canCalcPL = canCalcMV && h.cost_price != null;
            if (canCalcPL) {
                h.profit_loss = Math.round(h.shares * (h.current_price - h.cost_price) * h.exchange_rate * 100) / 100;
            }
        });
        // Auto-compute position_pct from market_value
        const total = holdings.reduce((s, h) => s + (h.market_value || 0), 0);
        holdings.forEach(h => {
            h.position_pct = total > 0 ? Math.round((h.market_value || 0) / total * 10000) / 100 : 0;
        });
    }

    function recalcCategoryPct() {
        const catTotals = {};
        holdings.forEach(h => {
            const cat = h.category || "其他";
            catTotals[cat] = (catTotals[cat] || 0) + (h.market_value || 0);
        });
        const total = Object.values(catTotals).reduce((a, b) => a + b, 0);
        holdings.forEach(h => {
            const cat = h.category || "其他";
            h.category_pct = total > 0 ? Math.round(catTotals[cat] / total * 100) : 0;
        });
    }

    function render() {
        const tbody = document.getElementById("portfolioBody");
        if (!holdings.length) {
            tbody.innerHTML = '<tr><td colspan="12" class="loading-text">暂无持仓数据，点击「添加行」开始录入</td></tr>';
            return;
        }

        // Group by category for row-span display
        let html = "";
        let prevCat = null;
        let catSpans = {};

        // Pre-calculate category spans
        holdings.forEach(h => {
            const cat = h.category || "";
            catSpans[cat] = (catSpans[cat] || 0) + 1;
        });

        let catRendered = {};
        holdings.forEach((h, idx) => {
            const cat = h.category || "";
            const isNewCat = cat !== prevCat;
            prevCat = cat;

            html += `<tr data-idx="${idx}" class="${isNewCat && idx > 0 ? 'cat-border' : ''}">`;

            // Category cell with rowspan
            if (isNewCat && !catRendered[cat]) {
                const span = catSpans[cat];
                html += `<td class="col-cat cell-cat" rowspan="${span}">
                    <input type="text" value="${esc(cat)}" data-field="category" class="cell-input cell-input-cat" />
                </td>`;
                catRendered[cat] = true;
            }

            html += `<td><input type="text" value="${esc(h.sub_category || '')}" data-field="sub_category" class="cell-input" /></td>`;
            html += `<td><input type="text" value="${esc(h.item_name || '')}" data-field="item_name" class="cell-input cell-input-name" /></td>`;
            html += numCell(h.shares, "shares");
            html += numCell(h.current_price, "current_price");
            html += numCell(h.exchange_rate, "exchange_rate");
            html += numCell(h.cost_price, "cost_price");

            // profit_loss & market_value: auto-computed when shares/price/rate are present
            const canCalc = h.shares != null && h.current_price != null && h.exchange_rate != null;
            html += plCell(h.profit_loss, "profit_loss", canCalc && h.cost_price != null);
            html += numCell(h.market_value, "market_value", canCalc);
            // position_pct: auto-computed from market_value / total
            const posPct = h.position_pct != null ? h.position_pct + '%' : '';
            html += `<td class="col-num cell-computed">${posPct}</td>`;

            // Category pct (read-only, computed)
            if (isNewCat) {
                const span = catSpans[cat];
                html += `<td class="col-num cell-catpct" rowspan="${span}">${h.category_pct != null ? h.category_pct + '%' : ''}</td>`;
            }

            html += `<td class="col-actions">
                <button class="btn-icon btn-del" title="删除" onclick="Portfolio.deleteRow(${idx})">🗑️</button>
            </td>`;
            html += `</tr>`;
        });

        tbody.innerHTML = html;

        // Attach change listeners
        tbody.querySelectorAll(".cell-input, .cell-input-num").forEach(input => {
            input.addEventListener("change", onCellChange);
        });
    }

    function numCell(val, field, readonly) {
        const display = val != null && val !== "" ? val : "";
        if (readonly) {
            return `<td class="col-num cell-computed">${display}</td>`;
        }
        return `<td class="col-num"><input type="text" value="${display}" data-field="${field}" class="cell-input cell-input-num" /></td>`;
    }

    function plCell(val, field, readonly) {
        const display = val != null && val !== "" ? val : "";
        const cls = val != null ? (val >= 0 ? "pl-pos" : "pl-neg") : "";
        if (readonly) {
            return `<td class="col-num cell-computed ${cls}">${display}</td>`;
        }
        return `<td class="col-num ${cls}"><input type="text" value="${display}" data-field="${field}" class="cell-input cell-input-num" /></td>`;
    }

    function pctCell(val, field) {
        const display = val != null && val !== "" ? val : "";
        return `<td class="col-num"><input type="text" value="${display}" data-field="${field}" class="cell-input cell-input-num" />%</td>`;
    }

    function esc(s) {
        if (s == null) return "";
        return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    }

    function onCellChange(e) {
        const input = e.target;
        const tr = input.closest("tr");
        const idx = parseInt(tr.dataset.idx);
        const field = input.dataset.field;
        let val = input.value.trim();

        // For numeric fields, parse as number
        const numFields = ["shares", "current_price", "exchange_rate", "cost_price", "profit_loss", "market_value", "category_pct"];
        if (numFields.includes(field)) {
            val = val === "" ? null : parseFloat(val);
            if (val !== null && isNaN(val)) val = null;
        }

        if (field === "category") {
            // Update all rows in this category group
            const oldCat = holdings[idx].category;
            holdings.forEach(h => {
                if (h.category === oldCat) h.category = val;
            });
        } else {
            holdings[idx][field] = val;
        }

        // Recalc computed fields when input fields change
        const triggerFields = ["shares", "current_price", "exchange_rate", "cost_price", "market_value"];
        if (triggerFields.includes(field)) {
            recalcComputed();
            recalcCategoryPct();
            render();
            renderSummary();
            renderPieChart();
        }
    }

    function addRow() {
        holdings.push({
            id: null,
            category: "",
            sub_category: "",
            item_name: "",
            shares: null,
            current_price: null,
            exchange_rate: null,
            cost_price: null,
            profit_loss: null,
            market_value: null,
            position_pct: null,
            category_pct: null,
        });
        recalcCategoryPct();
        render();
    }

    function deleteRow(idx) {
        if (!confirm(`确定删除「${holdings[idx].item_name || '此行'}」？`)) return;
        holdings.splice(idx, 1);
        recalcCategoryPct();
        render();
        renderSummary();
        renderPieChart();
    }

    function saveAll() {
        // Collect current values from DOM inputs
        syncFromDOM();

        fetch(`${P}/api/portfolio/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ holdings }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    showToast(`✅ 已保存 ${data.count} 条持仓记录`);
                    loadData(); // Reload to get IDs
                } else {
                    showToast(`❌ 保存失败: ${data.error}`, true);
                }
            })
            .catch(e => showToast(`❌ 网络错误: ${e}`, true));
    }

    function syncFromDOM() {
        const tbody = document.getElementById("portfolioBody");
        const rows = tbody.querySelectorAll("tr[data-idx]");
        const numFields = ["shares", "current_price", "exchange_rate", "cost_price", "profit_loss", "market_value"];

        rows.forEach(tr => {
            const idx = parseInt(tr.dataset.idx);
            tr.querySelectorAll("input[data-field]").forEach(input => {
                const field = input.dataset.field;
                let val = input.value.trim();
                if (numFields.includes(field)) {
                    val = val === "" ? null : parseFloat(val);
                    if (val !== null && isNaN(val)) val = null;
                }
                holdings[idx][field] = val;
            });
        });
    }

    function setLeverage(val) {
        leverage = val;
        localStorage.setItem("portfolio_leverage", val);
        renderSummary();
    }

    function onLeverageClick() {
        const display = document.getElementById("leverageDisplay");
        const currentVal = leverage;
        display.innerHTML = `<input type="number" id="leverageInput" value="${currentVal}" step="0.1"
            style="width:70px;font-size:13px;font-weight:700;border:1px solid #4a90d9;border-radius:4px;padding:2px 6px;text-align:right;outline:none;">
            <span style="font-weight:700;color:#333"> 万</span>`;
        const input = document.getElementById("leverageInput");
        input.focus();
        input.select();
        const commit = () => {
            const v = parseFloat(input.value);
            if (!isNaN(v) && v >= 0) setLeverage(v);
            else renderSummary();
        };
        input.addEventListener("blur", commit);
        input.addEventListener("keydown", e => {
            if (e.key === "Enter") { e.preventDefault(); input.blur(); }
            if (e.key === "Escape") { e.preventDefault(); renderSummary(); }
        });
    }

    function renderSummary() {
        const container = document.getElementById("portfolioSummary");
        const total = holdings.reduce((s, h) => s + (h.market_value || 0), 0);
        const net = total - leverage;
        const catTotals = {};
        holdings.forEach(h => {
            const cat = h.category || "其他";
            catTotals[cat] = (catTotals[cat] || 0) + (h.market_value || 0);
        });

        let html = `<div class="summary-stat total-stat" style="background:#e8f0fe;">
            <span class="stat-label">总市值</span>
            <span class="stat-value">${total.toFixed(2)} 万</span>
        </div>`;

        html += `<div class="summary-stat" style="background:#fff3e0;cursor:pointer;" onclick="Portfolio.onLeverageClick()" title="点击编辑杠杆金额">
            <span class="stat-label" style="color:#e65100;">杠杆</span>
            <span class="stat-value" id="leverageDisplay" style="color:#e65100;">−${leverage.toFixed(1)} 万</span>
            <span style="font-size:11px;color:#bf6900;">✏️</span>
        </div>`;

        html += `<div class="summary-stat total-stat" style="background:${net >= 0 ? '#e8f5e9' : '#fce4ec'};">
            <span class="stat-label" style="color:${net >= 0 ? '#2e7d32' : '#c62828'};">净市值</span>
            <span class="stat-value" style="color:${net >= 0 ? '#2e7d32' : '#c62828'};">${net.toFixed(2)} 万</span>
        </div>`;

        Object.entries(catTotals).forEach(([cat, val]) => {
            const pct = total > 0 ? (val / total * 100).toFixed(1) : 0;
            const color = CAT_COLORS[cat] || "#666";
            html += `<div class="summary-stat">
                <span class="stat-dot" style="background:${color}"></span>
                <span class="stat-label">${cat}</span>
                <span class="stat-value">${val.toFixed(2)} 万</span>
                <span class="stat-pct">${pct}%</span>
            </div>`;
        });

        container.innerHTML = html;
    }

    function renderPieChart() {
        const catTotals = {};
        holdings.forEach(h => {
            const cat = h.category || "其他";
            catTotals[cat] = (catTotals[cat] || 0) + (h.market_value || 0);
        });

        const labels = Object.keys(catTotals);
        const values = Object.values(catTotals);
        const colors = labels.map((l, i) => CAT_COLORS[l] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]);

        const ctx = document.getElementById("categoryPieChart");
        if (!ctx) return;

        if (pieChart) pieChart.destroy();
        pieChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: "#fff",
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "right", labels: { font: { size: 13 }, padding: 16 } },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = total > 0 ? (ctx.raw / total * 100).toFixed(1) : 0;
                                return ` ${ctx.label}: ${ctx.raw.toFixed(2)}万 (${pct}%)`;
                            },
                        },
                    },
                },
            },
        });

        // Render breakdown list
        const breakdown = document.getElementById("categoryBreakdown");
        if (!breakdown) return;
        const total = values.reduce((a, b) => a + b, 0);
        let bhtml = "";
        labels.forEach((label, i) => {
            const val = values[i];
            const pct = total > 0 ? (val / total * 100).toFixed(1) : 0;
            const barW = total > 0 ? (val / total * 100) : 0;
            bhtml += `<div class="breakdown-item">
                <div class="breakdown-header">
                    <span class="breakdown-dot" style="background:${colors[i]}"></span>
                    <span class="breakdown-label">${label}</span>
                    <span class="breakdown-value">${val.toFixed(2)}万</span>
                    <span class="breakdown-pct">${pct}%</span>
                </div>
                <div class="breakdown-bar-bg"><div class="breakdown-bar" style="width:${barW}%;background:${colors[i]}"></div></div>
            </div>`;
        });
        breakdown.innerHTML = bhtml;
    }

    function showToast(msg, isError) {
        let toast = document.getElementById("portfolioToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "portfolioToast";
            toast.className = "portfolio-toast";
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.className = "portfolio-toast " + (isError ? "toast-error" : "toast-success") + " show";
        setTimeout(() => toast.classList.remove("show"), 2500);
    }

    // Auto-init on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    return { addRow, deleteRow, saveAll, onLeverageClick };
})();
