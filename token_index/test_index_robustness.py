import unittest
from community_index import (Metrics, community_index, smoothed_index, aggregate_metrics,
                             RawUser, RawMerchant, RawTransaction, MAX_COUNTED_TX_PER_BUYER_MERCHANT)


def people(n, active=0, retained=0, prefix="p"):
    return [RawUser(f"{prefix}{i}", f"{prefix}{i}", True, active_30d=i < active,
                    active_previous_30d=i < retained) for i in range(n)]


class RobustnessTests(unittest.TestCase):
    def test_huge_values_stay_capped(self):
        big = 10**12
        self.assertEqual(community_index(Metrics(big, big, big, big, big)), 200.0)

    def test_zero_active_users_has_zero_retention(self):
        self.assertEqual(community_index(Metrics(1000, 0, 0, 20, 500)), 50.0)

    def test_index_is_monotonic_in_each_verified_factor(self):
        # More active users at the same retention rate never lowers the index.
        # (More active users with the SAME retained count lowers R/A: by design.)
        base = Metrics(500, 200, 80, 10, 200)
        reference = community_index(base)
        for grown in (Metrics(600, 200, 80, 10, 200), Metrics(500, 250, 100, 10, 200),
                      Metrics(500, 200, 120, 10, 200), Metrics(500, 200, 80, 15, 200),
                      Metrics(500, 200, 80, 10, 400)):
            self.assertGreaterEqual(community_index(grown), reference)

    def test_smoothing_is_capped_in_both_directions(self):
        self.assertEqual(smoothed_index(200, 100), 110.0)
        self.assertEqual(smoothed_index(0, 100), 90.0)
        self.assertEqual(smoothed_index(104, 100), 101.0)

    def test_rounding_is_stable(self):
        value = community_index(Metrics(333, 111, 37, 7, 99))
        self.assertEqual(value, round(value, 2))
        self.assertEqual(community_index(Metrics(333, 111, 37, 7, 99)), value)

    def test_invalid_smoothing_inputs_rejected(self):
        for args in ((float("nan"), 100), (250, 100), (100, -1), (100, 100, 0), (100, 100, 0.5, 0)):
            with self.assertRaises(ValueError):
                smoothed_index(*args)


class FraudScenarioTests(unittest.TestCase):
    def setUp(self):
        self.users = people(300, active=120, retained=60)
        self.merchants = [RawMerchant(f"m{i}", f"owner{i}", True, True) for i in range(10)]
        self.txs = [RawTransaction(f"t{i}", f"p{i % 120}", f"m{i % 10}", "finalised") for i in range(240)]
        self.honest = aggregate_metrics(self.users, self.merchants, self.txs)

    def test_honest_data_is_counted(self):
        self.assertEqual(self.honest, Metrics(300, 120, 60, 10, 240))

    def test_duplicate_accounts_of_one_person_do_not_count(self):
        clones = [RawUser(f"clone{i}", "p0", True, active_30d=True) for i in range(500)]
        self.assertEqual(aggregate_metrics(self.users + clones, self.merchants, self.txs), self.honest)

    def test_bots_and_unverified_accounts_do_not_count(self):
        noise = [RawUser(f"b{i}", f"b{i}", True, is_bot=True, active_30d=True) for i in range(500)]
        noise += [RawUser(f"u{i}", f"u{i}", False, active_30d=True) for i in range(500)]
        self.assertEqual(aggregate_metrics(self.users + noise, self.merchants, self.txs), self.honest)

    def test_non_independent_or_unverified_merchants_do_not_count(self):
        shells = [RawMerchant(f"s{i}", "owner0", True, False) for i in range(50)]
        shells += [RawMerchant(f"x{i}", f"x{i}", False, True) for i in range(50)]
        shell_txs = [RawTransaction(f"st{i}", "p1", f"s{i % 50}", "finalised") for i in range(200)]
        result = aggregate_metrics(self.users, self.merchants + shells, self.txs + shell_txs)
        self.assertEqual(result, self.honest)

    def test_self_dealing_and_refunds_do_not_count(self):
        owners = [RawUser("owner-person", "owner0", True, active_30d=True)]
        self_deals = [RawTransaction(f"sd{i}", "owner0", "m0", "finalised") for i in range(100)]
        refunds = [RawTransaction(f"r{i}", "p2", "m1", status) for i, status in
                   enumerate(["refunded", "cancelled", "pending"] * 30)]
        result = aggregate_metrics(self.users + owners, self.merchants, self.txs + self_deals + refunds)
        self.assertEqual(result.verified_transactions_30d, self.honest.verified_transactions_30d)

    def test_replayed_transaction_ids_count_once(self):
        result = aggregate_metrics(self.users, self.merchants, self.txs + self.txs)
        self.assertEqual(result, self.honest)

    def test_wash_trading_between_one_pair_is_capped(self):
        wash = [RawTransaction(f"w{i}", "p299", "m9", "finalised") for i in range(1000)]
        result = aggregate_metrics(self.users, self.merchants, self.txs + wash)
        self.assertEqual(result.verified_transactions_30d, 240 + MAX_COUNTED_TX_PER_BUYER_MERCHANT)

    def test_fraud_cannot_raise_the_index(self):
        clones = [RawUser(f"c{i}", "p5", True, active_30d=True, active_previous_30d=True) for i in range(5000)]
        bots = [RawUser(f"bot{i}", f"bot{i}", True, is_bot=True, active_30d=True) for i in range(5000)]
        wash = [RawTransaction(f"w{i}", "p7", "m3", "finalised") for i in range(5000)]
        polluted = aggregate_metrics(self.users + clones + bots, self.merchants, self.txs + wash)
        self.assertLessEqual(community_index(polluted) - community_index(self.honest), 0.5)


if __name__ == "__main__":
    unittest.main()
