const express = require('express');
const router = express.Router();
const { requireUser } = require('./middleware/auth');
const UserService = require('../services/user');
const Subscription = require('../models/Subscription');
const logger = require('../utils/log');

// Pricing plan configuration
const PRICING_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    credits: 5,
    features: [
      '5 course generations per month',
      'Basic learning paths',
      'YouTube video curation',
      'Article recommendations',
    ],
  },
  basic: {
    name: 'Basic',
    price: 10,
    credits: 50,
    features: [
      '50 course generations per month',
      'Advanced learning paths',
      'YouTube video curation',
      'Article recommendations',
      'Project-based learning focus',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 25,
    credits: 200,
    features: [
      '200 course generations per month',
      'All Basic features',
      'Advanced AI course generation',
      'Custom learning pace adjustment',
      'Priority support',
      'Progress analytics',
    ],
  },
  premium: {
    name: 'Premium',
    price: 50,
    credits: 1000,
    features: [
      '1000 course generations per month',
      'All Pro features',
      'Unlimited learning paths',
      'Personal learning coach (coming soon)',
      'API access (coming soon)',
      'Priority AI processing',
      '24/7 premium support',
    ],
  },
};

// Get all available pricing plans
router.get('/plans', async (req, res) => {
  try {
    res.json({
      success: true,
      plans: Object.keys(PRICING_PLANS).map(key => ({
        id: key,
        ...PRICING_PLANS[key],
      })),
    });
  } catch (error) {
    logger.error('Error fetching pricing plans:', error);
    res.status(500).json({
      error: 'Failed to fetch pricing plans',
    });
  }
});

// Get current user's subscription details
router.get('/current', requireUser, async (req, res) => {
  try {
    const user = await UserService.get(req.user._id);
    const currentPlan = PRICING_PLANS[user.subscriptionPlan] || PRICING_PLANS.free;

    res.json({
      success: true,
      subscription: {
        plan: user.subscriptionPlan,
        status: user.subscriptionStatus,
        credits: user.credits,
        creditsUsed: user.creditsUsed,
        planDetails: currentPlan,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
      },
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({
      error: 'Failed to fetch subscription details',
    });
  }
});

// Get subscription history
router.get('/history', requireUser, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: subscriptions.length,
      subscriptions,
    });
  } catch (error) {
    logger.error('Error fetching subscription history:', error);
    res.status(500).json({
      error: 'Failed to fetch subscription history',
    });
  }
});

// Create or upgrade subscription
// Note: This is a simplified version. In production, integrate with Stripe or similar payment processor
router.post('/subscribe', requireUser, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PRICING_PLANS[plan]) {
      return res.status(400).json({
        error: 'Invalid plan selected',
      });
    }

    const user = await UserService.get(req.user._id);
    const planDetails = PRICING_PLANS[plan];

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    // Update user subscription
    await UserService.update(req.user._id, {
      subscriptionPlan: plan,
      subscriptionStatus: 'active',
      credits: planDetails.credits,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate,
    });

    // Create subscription record
    const subscription = new Subscription({
      userId: req.user._id,
      plan,
      status: 'active',
      startDate,
      endDate,
      amount: planDetails.price,
      currency: 'USD',
      autoRenew: true,
    });

    await subscription.save();

    res.json({
      success: true,
      message: `Successfully subscribed to ${planDetails.name} plan`,
      subscription: {
        plan,
        credits: planDetails.credits,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({
      error: 'Failed to create subscription',
    });
  }
});

// Cancel subscription
router.post('/cancel', requireUser, async (req, res) => {
  try {
    const user = await UserService.get(req.user._id);

    if (user.subscriptionPlan === 'free') {
      return res.status(400).json({
        error: 'Cannot cancel free plan',
      });
    }

    // Update user to free plan (subscription will remain active until end date)
    await UserService.update(req.user._id, {
      subscriptionStatus: 'cancelled',
    });

    // Update latest subscription record
    await Subscription.findOneAndUpdate(
      { userId: req.user._id, status: 'active' },
      { status: 'cancelled', autoRenew: false },
      { sort: { createdAt: -1 } }
    );

    res.json({
      success: true,
      message: 'Subscription cancelled. You will retain access until the end of your billing period.',
      endDate: user.subscriptionEndDate,
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
    });
  }
});

// Get usage statistics
router.get('/usage', requireUser, async (req, res) => {
  try {
    const user = await UserService.get(req.user._id);
    const planDetails = PRICING_PLANS[user.subscriptionPlan] || PRICING_PLANS.free;

    const usagePercentage = (user.creditsUsed / planDetails.credits) * 100;

    res.json({
      success: true,
      usage: {
        creditsTotal: planDetails.credits,
        creditsUsed: user.creditsUsed,
        creditsRemaining: user.credits,
        usagePercentage: Math.round(usagePercentage),
        plan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    logger.error('Error fetching usage:', error);
    res.status(500).json({
      error: 'Failed to fetch usage statistics',
    });
  }
});

// Admin endpoint to reset monthly credits (would be called by a cron job)
router.post('/admin/reset-credits', async (req, res) => {
  // In production, this should be protected with admin authentication
  // and ideally called by a scheduled job rather than HTTP endpoint
  try {
    const users = await UserService.list();
    let resetCount = 0;

    for (const user of users) {
      if (user.subscriptionStatus === 'active') {
        await user.resetMonthlyCredits();
        resetCount++;
      }
    }

    res.json({
      success: true,
      message: `Reset credits for ${resetCount} active users`,
    });
  } catch (error) {
    logger.error('Error resetting credits:', error);
    res.status(500).json({
      error: 'Failed to reset credits',
    });
  }
});

module.exports = router;
