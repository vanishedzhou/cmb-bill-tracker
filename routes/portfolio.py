"""Portfolio Breakdown API routes.

Provides CRUD endpoints for investment portfolio holdings.
"""
from flask import Blueprint, jsonify, request
from models.database import get_db

bp = Blueprint("portfolio", __name__)


@bp.route("/api/portfolio", methods=["GET"])
def list_holdings():
    """Return all portfolio holdings grouped by category."""
    db = get_db()
    try:
        rows = db.execute(
            """SELECT id, category, sub_category, item_name,
                      shares, current_price, exchange_rate, cost_price,
                      profit_loss, market_value, position_pct, category_pct,
                      updated_at
               FROM portfolio_holdings
               ORDER BY category, sub_category, id"""
        ).fetchall()

        holdings = []
        for r in rows:
            holdings.append({
                "id": r["id"],
                "category": r["category"],
                "sub_category": r["sub_category"],
                "item_name": r["item_name"],
                "shares": r["shares"],
                "current_price": r["current_price"],
                "exchange_rate": r["exchange_rate"],
                "cost_price": r["cost_price"],
                "profit_loss": r["profit_loss"],
                "market_value": r["market_value"],
                "position_pct": r["position_pct"],
                "category_pct": r["category_pct"],
                "updated_at": r["updated_at"],
            })

        # Compute category totals
        cat_totals = {}
        total_value = sum(h["market_value"] or 0 for h in holdings)
        for h in holdings:
            cat = h["category"]
            if cat not in cat_totals:
                cat_totals[cat] = 0
            cat_totals[cat] += h["market_value"] or 0

        return jsonify({
            "holdings": holdings,
            "category_totals": cat_totals,
            "total_value": total_value,
        })
    finally:
        db.close()


@bp.route("/api/portfolio", methods=["POST"])
def add_holding():
    """Add a new portfolio holding."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required = ["category", "item_name"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400

    db = get_db()
    try:
        db.execute(
            """INSERT INTO portfolio_holdings
               (category, sub_category, item_name, shares, current_price,
                exchange_rate, cost_price, profit_loss, market_value,
                position_pct, category_pct)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data.get("category", ""),
                data.get("sub_category", ""),
                data.get("item_name", ""),
                data.get("shares"),
                data.get("current_price"),
                data.get("exchange_rate"),
                data.get("cost_price"),
                data.get("profit_loss"),
                data.get("market_value"),
                data.get("position_pct"),
                data.get("category_pct"),
            ),
        )
        db.commit()
        return jsonify({"success": True, "id": db.execute("SELECT last_insert_rowid()").fetchone()[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@bp.route("/api/portfolio/<int:holding_id>", methods=["PUT"])
def update_holding(holding_id):
    """Update an existing portfolio holding."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    db = get_db()
    try:
        # Build dynamic update
        allowed_fields = [
            "category", "sub_category", "item_name", "shares",
            "current_price", "exchange_rate", "cost_price",
            "profit_loss", "market_value", "position_pct", "category_pct",
        ]
        updates = []
        values = []
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = ?")
                values.append(data[field])

        if not updates:
            return jsonify({"error": "No fields to update"}), 400

        updates.append("updated_at = datetime('now', 'localtime')")
        values.append(holding_id)

        db.execute(
            f"UPDATE portfolio_holdings SET {', '.join(updates)} WHERE id = ?",
            values,
        )
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@bp.route("/api/portfolio/<int:holding_id>", methods=["DELETE"])
def delete_holding(holding_id):
    """Delete a portfolio holding."""
    db = get_db()
    try:
        db.execute("DELETE FROM portfolio_holdings WHERE id = ?", (holding_id,))
        db.commit()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()


@bp.route("/api/portfolio/batch", methods=["POST"])
def batch_save():
    """Batch save: delete all existing and re-insert from provided list."""
    data = request.get_json()
    if not data or "holdings" not in data:
        return jsonify({"error": "No holdings provided"}), 400

    db = get_db()
    try:
        db.execute("DELETE FROM portfolio_holdings")
        for h in data["holdings"]:
            db.execute(
                """INSERT INTO portfolio_holdings
                   (category, sub_category, item_name, shares, current_price,
                    exchange_rate, cost_price, profit_loss, market_value,
                    position_pct, category_pct)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    h.get("category", ""),
                    h.get("sub_category", ""),
                    h.get("item_name", ""),
                    h.get("shares"),
                    h.get("current_price"),
                    h.get("exchange_rate"),
                    h.get("cost_price"),
                    h.get("profit_loss"),
                    h.get("market_value"),
                    h.get("position_pct"),
                    h.get("category_pct"),
                ),
            )
        db.commit()
        return jsonify({"success": True, "count": len(data["holdings"])})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()
