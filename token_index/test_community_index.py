"""Run: python -m unittest discover -s token_index -v"""
import unittest
from community_index import Metrics, Baseline, community_index, smoothed_index, scenario


class CommunityIndexTests(unittest.TestCase):
    def test_reference_scenario_is_100(self):
        self.assertEqual(community_index(Metrics(1000, 300, 150, 20, 500)), 100.0)

    def test_empty_community(self):
        self.assertEqual(community_index(Metrics(0, 0, 0, 0, 0)), 0.0)

    def test_cannot_fake_more_active_than_verified(self):
        with self.assertRaises(ValueError):
            community_index(Metrics(10, 11, 0, 0, 0))

    def test_cannot_fake_more_retained_than_active(self):
        with self.assertRaises(ValueError):
            community_index(Metrics(10, 5, 6, 0, 0))

    def test_negative_and_bool_counts_rejected(self):
        for value in (-1, True, 1.5):
            with self.assertRaises(ValueError):
                community_index(Metrics(value, 0, 0, 0, 0))

    def test_saturation_prevents_unbounded_growth(self):
        self.assertLessEqual(community_index(Metrics(10**9, 10**9, 10**9, 10**9, 10**9)), 200)

    def test_signup_growth_alone_does_not_mean_200(self):
        score = community_index(Metrics(10**7, 0, 0, 0, 0))
        self.assertLessEqual(score, 50)

    def test_smoothing_caps_one_period_change(self):
        self.assertEqual(smoothed_index(200, 100), 110)
        self.assertEqual(smoothed_index(0, 100), 90)

    def test_smoothing_first_period(self):
        self.assertEqual(smoothed_index(91.237, None), 91.24)

    def test_invalid_baseline_rejected(self):
        with self.assertRaises(ValueError):
            community_index(Metrics(1, 0, 0, 0, 0), Baseline(0, 1, 1, 1))

    def test_scenario_not_currency(self):
        result = scenario(Metrics(1000, 300, 150, 20, 500))
        self.assertIn("not token price", result["label"])
        self.assertEqual(result["raw_index"], 100)


if __name__ == "__main__":
    unittest.main()
