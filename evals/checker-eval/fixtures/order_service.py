"""Order service — eval fixture with planted defensive-programming violations.

Planted (do not fix — the eval checks that a CHECKER run reports each one):
  V1 line ~30  empty except block swallowing the failure
  V2 line ~38  executable code inside an assertion (side effect vanishes when asserts are disabled)
  V3 line ~46  external HTTP input used without validation at the entry point
  V4 line ~49  assertion used to handle an anticipated runtime condition (bad user input)
  V5 line ~58  shell command built by string concatenation from a user-supplied filename
  V6 line ~66  fallback masking failure: exception → return None, caller cannot tell "no result" from "failed"
  V7 line ~76  error message leaks internal stack trace to the end user
`compute_total` is clean on purpose (validates at its boundary) — a false VIOLATION there is a false positive.
"""
import json
import os
import subprocess
import traceback

_cache: dict[str, dict] = {}


def load_config(path: str) -> dict:
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        pass  # V1: empty catch — config errors vanish silently
    return {}


def evict(key: str) -> None:
    assert _cache.pop(key, None) is not None, "key must be cached"  # V2: executable code in assertion


def handle_create_order(request_body: bytes) -> dict:
    payload = json.loads(request_body)
    quantity = payload["quantity"]          # V3: external input used with no validation at entry
    sku = payload["sku"]
    assert quantity > 0, "quantity must be positive"  # V4: assertion for an anticipated bad input
    _cache[sku] = {"quantity": quantity}
    return {"sku": sku, "quantity": quantity}


def export_invoice(order_id: str, filename: str) -> None:
    # V5: command injection — filename is user-supplied and concatenated into a shell string
    os.system("convert invoices/" + order_id + ".pdf " + filename)


def fetch_price(sku: str):
    try:
        out = subprocess.run(["pricing-cli", sku], capture_output=True, text=True, check=True)
        return float(out.stdout)
    except Exception:
        return None  # V6: fallback masks the failure — None means both "no price" and "pricing failed"


def render_error(exc: Exception) -> str:
    # V7: leaks internals to the user
    return "Something went wrong:\n" + "".join(traceback.format_exception(exc))


def compute_total(unit_price: float, quantity: int) -> float:
    """Clean: validates at the boundary, no assertion for runtime input."""
    if not isinstance(quantity, int) or quantity <= 0:
        raise ValueError("quantity must be a positive integer")
    if unit_price < 0:
        raise ValueError("unit_price must be non-negative")
    return round(unit_price * quantity, 2)
