"""BC ONE community health index. NOT a token price, oracle or trading signal.

Inputs must be independently verified and aggregated server-side. No wallet
balance, account signup alone, or unverified transaction counts are accepted.
"""
from dataclasses import dataclass
from math import log1p, sqrt, isfinite


@dataclass(frozen=True)
class Metrics:
    verified_users: int
    active_users_30d: int
    retained_users_30d: int
    verified_merchants: int
    verified_transactions_30d: int


@dataclass(frozen=True)
class Baseline:
    verified_users: int = 1000
    active_users_30d: int = 300
    verified_merchants: int = 20
    verified_transactions_30d: int = 500


def _count(value: int, name: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError(f"{name} must be a non-negative integer")
    return value


def validate(metrics: Metrics) -> None:
    for name in metrics.__dataclass_fields__:
        _count(getattr(metrics, name), name)
    if metrics.active_users_30d > metrics.verified_users:
        raise ValueError("active users cannot exceed verified users")
    if metrics.retained_users_30d > metrics.active_users_30d:
        raise ValueError("retained users cannot exceed active users")


def _saturation(value: int, baseline: int) -> float:
    # Diminishing returns; saturates at 2x baseline for each volume factor.
    return min(2.0, log1p(value) / log1p(baseline))


def community_index(metrics: Metrics, baseline: Baseline = Baseline()) -> float:
    """Return an explanatory 0..200 index; 100 is NOT 1 EUR or a token quote.

    Weighted components: 25% verified reach, 30% monthly activity,
    20% retention quality, 15% merchant adoption, 10% verified usage.
    All volume components use diminishing returns and hard caps.
    """
    validate(metrics)
    for name in baseline.__dataclass_fields__:
        if _count(getattr(baseline, name), name) == 0:
            raise ValueError("baseline counts must be positive")
    retention = (metrics.retained_users_30d / metrics.active_users_30d
                 if metrics.active_users_30d else 0.0)
    # 50% retained among active users corresponds to quality factor 1.
    quality = min(2.0, retention / 0.5)
    factors = (
        _saturation(metrics.verified_users, baseline.verified_users),
        _saturation(metrics.active_users_30d, baseline.active_users_30d),
        quality,
        _saturation(metrics.verified_merchants, baseline.verified_merchants),
        _saturation(metrics.verified_transactions_30d, baseline.verified_transactions_30d),
    )
    score = 100 * sum(w * factor for w, factor in zip((.25, .30, .20, .15, .10), factors))
    if not isfinite(score):
        raise ValueError("non-finite index")
    return round(min(200.0, max(0.0, score)), 2)


def smoothed_index(current: float, previous: float | None, alpha: float = 0.25,
                   max_period_change: float = 10.0) -> float:
    """Smooth noisy snapshots; clamp changes to +/-10 index points per period.

    Run only for fixed, equally spaced periods (e.g. once a month).
    """
    if not isfinite(current) or current < 0 or current > 200:
        raise ValueError("current index outside 0..200")
    if previous is None:
        return round(current, 2)
    if not isfinite(previous) or previous < 0 or previous > 200:
        raise ValueError("previous index outside 0..200")
    if not 0 < alpha <= 1 or not isfinite(alpha):
        raise ValueError("alpha must be in (0, 1]")
    if max_period_change <= 0 or not isfinite(max_period_change):
        raise ValueError("max_period_change must be positive")
    target = previous + alpha * (current - previous)
    return round(max(0.0, min(200.0, previous + max_period_change,
                               max(previous - max_period_change, target))), 2)


def scenario(metrics: Metrics, previous: float | None = None) -> dict:
    raw = community_index(metrics)
    return {
        "label": "BC ONE community health index (not token price)",
        "raw_index": raw,
        "published_index": smoothed_index(raw, previous),
        "units": "index points, not EUR/USD/BCONE",
        "verified_users": metrics.verified_users,
        "active_users_30d": metrics.active_users_30d,
        "retention_rate": round(metrics.retained_users_30d / metrics.active_users_30d, 4)
        if metrics.active_users_30d else 0.0,
    }


# ---------------------------------------------------------------------------
# Server-side aggregation: turn raw records into verified Metrics.
# Fraud and noise are removed BEFORE the formula runs, so duplicate accounts,
# bots, self-dealing, refunds and wash trading cannot inflate the index.
# ---------------------------------------------------------------------------

MAX_COUNTED_TX_PER_BUYER_MERCHANT = 5


@dataclass(frozen=True)
class RawUser:
    user_id: str
    identity_key: str          # verified identity (one real person), never shown publicly
    verified: bool
    is_bot: bool = False
    active_30d: bool = False
    active_previous_30d: bool = False


@dataclass(frozen=True)
class RawMerchant:
    merchant_id: str
    owner_identity_key: str
    verified: bool
    independent: bool


@dataclass(frozen=True)
class RawTransaction:
    tx_id: str
    buyer_identity_key: str
    merchant_id: str
    status: str                # only "finalised" counts; "refunded", "cancelled", "pending" do not


def aggregate_metrics(users, merchants, transactions) -> Metrics:
    """Build Metrics from raw records, counting only verified, independent, final activity."""
    people = {}
    for user in users:
        if not user.verified or user.is_bot or not user.identity_key:
            continue
        current = people.get(user.identity_key, (False, False))
        # Several accounts of one person count as one person.
        people[user.identity_key] = (current[0] or user.active_30d,
                                     current[1] or (user.active_30d and user.active_previous_30d))
    verified_users = len(people)
    active = sum(1 for is_active, _ in people.values() if is_active)
    retained = sum(1 for _, is_retained in people.values() if is_retained)

    valid_merchants = {}
    for merchant in merchants:
        if merchant.verified and merchant.independent and merchant.merchant_id:
            valid_merchants[merchant.merchant_id] = merchant.owner_identity_key

    seen_tx, per_pair = set(), {}
    counted = 0
    for tx in transactions:
        if tx.tx_id in seen_tx:
            continue
        seen_tx.add(tx.tx_id)
        owner = valid_merchants.get(tx.merchant_id)
        if tx.status != "finalised" or owner is None:
            continue
        if tx.buyer_identity_key not in people or tx.buyer_identity_key == owner:
            continue  # unverified buyer, or a merchant buying from itself
        pair = (tx.buyer_identity_key, tx.merchant_id)
        if per_pair.get(pair, 0) >= MAX_COUNTED_TX_PER_BUYER_MERCHANT:
            continue  # wash trading: repeated purchases between the same pair stop counting
        per_pair[pair] = per_pair.get(pair, 0) + 1
        counted += 1

    return Metrics(verified_users, active, retained, len(valid_merchants), counted)
