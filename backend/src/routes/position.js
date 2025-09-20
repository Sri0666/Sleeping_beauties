const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const positionOptimizerService = require('../services/positionOptimizerService');
const PressureMapping = require('../models/PressureMapping');
const SleepSession = require('../models/SleepSession');

// Middleware for validating user session
const validateSession = async (req, res, next) => {
  try {
    const { userId, sessionId } = req.params;
    
    if (!userId || !sessionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing userId or sessionId' 
      });
    }

    // Validate session exists and belongs to user
    const session = await SleepSession.findOne({ 
      _id: sessionId, 
      userId: userId 
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Sleep session not found' 
      });
    }

    req.session = session;
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Session validation failed' 
    });
  }
};

/**
 * POST /api/position/:userId/:sessionId/analyze
 * Analyze current pressure data and get AI recommendations
 */
router.post('/:userId/:sessionId/analyze', validateSession, async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const { pressureData, options = {} } = req.body;

    // Validate pressure data
    const validation = positionOptimizerService.validatePressureData(pressureData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pressure data',
        details: validation.errors
      });
    }

    // Get AI analysis
    const result = await positionOptimizerService.optimizePosition(
      userId, 
      sessionId, 
      pressureData, 
      options
    );

    res.json(result);

  } catch (error) {
    console.error('Position analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      details: error.message
    });
  }
});

/**
 * POST /api/position/:userId/:sessionId/adjust
 * Execute position adjustments
 */
router.post('/:userId/:sessionId/adjust', validateSession, async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const { adjustments, source = 'manual' } = req.body;

    if (!adjustments || !Array.isArray(adjustments)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid adjustments data'
      });
    }

    const results = [];

    // Process each adjustment
    for (const adjustment of adjustments) {
      const { bodyPart, targetAngle, currentAngle, reason } = adjustment;

      // Validate adjustment
      if (!['head', 'torso', 'legs', 'feet'].includes(bodyPart)) {
        results.push({
          bodyPart,
          success: false,
          error: 'Invalid body part'
        });
        continue;
      }

      // Execute the adjustment
      try {
        const adjustmentResult = await positionOptimizerService.executePhysicalAdjustment(
          userId,
          bodyPart,
          targetAngle,
          currentAngle || 0
        );

        results.push({
          bodyPart,
          success: adjustmentResult.success,
          fromAngle: currentAngle || 0,
          toAngle: targetAngle,
          message: adjustmentResult.message,
          adjustmentTime: adjustmentResult.adjustmentTime
        });

        // Emit real-time update via WebSocket
        if (req.app.get('io')) {
          req.app.get('io').to(`user_${userId}`).emit('position_adjustment', {
            bodyPart,
            targetAngle,
            source,
            timestamp: new Date()
          });
        }

      } catch (adjustmentError) {
        results.push({
          bodyPart,
          success: false,
          error: adjustmentError.message
        });
      }
    }

    res.json({
      success: true,
      adjustments: results,
      totalAdjustments: results.length,
      successfulAdjustments: results.filter(r => r.success).length
    });

  } catch (error) {
    console.error('Position adjustment error:', error);
    res.status(500).json({
      success: false,
      error: 'Adjustment failed',
      details: error.message
    });
  }
});

/**
 * GET /api/position/:userId/:sessionId/current
 * Get current position data
 */
router.get('/:userId/:sessionId/current', validateSession, async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    // Get latest pressure mapping for this session
    const latestMapping = await PressureMapping.findOne({
      userId,
      sessionId
    }).sort({ timestamp: -1 });

    if (!latestMapping) {
      return res.json({
        success: true,
        currentPosition: { head: 0, torso: 0, legs: 0, feet: 0 },
        hasData: false
      });
    }

    res.json({
      success: true,
      currentPosition: latestMapping.currentPosition,
      analysis: latestMapping.analysis,
      aiRecommendations: latestMapping.aiRecommendations,
      lastUpdate: latestMapping.timestamp,
      hasData: true
    });

  } catch (error) {
    console.error('Error fetching current position:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current position'
    });
  }
});

/**
 * POST /api/position/:userId/:sessionId/manual-adjust
 * Manual position adjustment
 */
router.post('/:userId/:sessionId/manual-adjust', validateSession, async (req, res) => {
  try {
    const { userId, sessionId } = req.params;
    const { bodyPart, targetAngle, reason = 'Manual adjustment' } = req.body;

    // Validate input
    if (!['head', 'torso', 'legs', 'feet'].includes(bodyPart)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid body part'
      });
    }

    const constraints = {
      head: { min: 0, max: 45 },
      torso: { min: 0, max: 30 },
      legs: { min: 0, max: 20 },
      feet: { min: 0, max: 15 }
    };

    const constraint = constraints[bodyPart];
    if (targetAngle < constraint.min || targetAngle > constraint.max) {
      return res.status(400).json({
        success: false,
        error: `Target angle must be between ${constraint.min}° and ${constraint.max}°`
      });
    }

    // Get current position
    const latestMapping = await PressureMapping.findOne({
      userId,
      sessionId
    }).sort({ timestamp: -1 });

    const currentAngle = latestMapping?.currentPosition?.[bodyPart] || 0;

    // Execute adjustment
    const result = await positionOptimizerService.executePhysicalAdjustment(
      userId,
      bodyPart,
      targetAngle,
      currentAngle
    );

    // Create or update pressure mapping record
    if (latestMapping) {
      latestMapping.addAdjustment(bodyPart, currentAngle, targetAngle, reason, 'manual_adjustment');
      await latestMapping.save();
    }

    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${userId}`).emit('position_adjustment', {
        bodyPart,
        targetAngle,
        fromAngle: currentAngle,
        source: 'manual',
        reason,
        timestamp: new Date()
      });
    }

    res.json({
      success: result.success,
      bodyPart,
      fromAngle: currentAngle,
      toAngle: targetAngle,
      message: result.message,
      adjustmentTime: result.adjustmentTime
    });

  } catch (error) {
    console.error('Manual adjustment error:', error);
    res.status(500).json({
      success: false,
      error: 'Manual adjustment failed',
      details: error.message
    });
  }
});

/**
 * GET /api/position/:userId/history
 * Get position adjustment history
 */
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, sessionId } = req.query;

    const query = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const history = await PressureMapping.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('sessionId', 'startTime endTime')
      .select('timestamp currentPosition aiRecommendations adjustmentHistory analysis');

    const formattedHistory = history.map(record => ({
      id: record._id,
      timestamp: record.timestamp,
      session: record.sessionId,
      position: record.currentPosition,
      adjustments: record.adjustmentHistory,
      comfortScore: record.analysis?.comfortIndex,
      totalPressure: record.analysis?.totalPressure,
      aiSource: record.aiRecommendations?.source
    }));

    res.json({
      success: true,
      history: formattedHistory,
      total: formattedHistory.length
    });

  } catch (error) {
    console.error('Error fetching position history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch position history'
    });
  }
});

/**
 * POST /api/position/test-scenario
 * Generate test scenario data
 */
router.post('/test-scenario', async (req, res) => {
  try {
    const { scenario = 'normal' } = req.body;
    
    const testData = positionOptimizerService.generateTestScenario(scenario);
    
    res.json({
      success: true,
      scenario,
      pressureData: testData,
      description: getScenarioDescription(scenario)
    });

  } catch (error) {
    console.error('Error generating test scenario:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate test scenario'
    });
  }
});

/**
 * POST /api/position/:userId/:sessionId/emergency-stop
 * Emergency stop all position adjustments
 */
router.post('/:userId/:sessionId/emergency-stop', validateSession, async (req, res) => {
  try {
    const { userId, sessionId } = req.params;

    // In a real implementation, this would immediately halt all motors/actuators
    console.log(`Emergency stop requested for user ${userId}, session ${sessionId}`);

    // Emit emergency stop signal
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${userId}`).emit('emergency_stop', {
        timestamp: new Date(),
        sessionId
      });
    }

    res.json({
      success: true,
      message: 'Emergency stop executed',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Emergency stop error:', error);
    res.status(500).json({
      success: false,
      error: 'Emergency stop failed'
    });
  }
});

/**
 * GET /api/position/:userId/stats
 * Get position adjustment statistics
 */
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const stats = await PressureMapping.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          timestamp: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $addToSet: '$sessionId' },
          avgComfortScore: { $avg: '$analysis.comfortIndex' },
          avgTotalPressure: { $avg: '$analysis.totalPressure' },
          avgSymmetryScore: { $avg: '$analysis.symmetryScore' },
          totalAdjustments: { $sum: { $size: '$adjustmentHistory' } },
          highUrgencyCount: {
            $sum: {
              $cond: [
                { $eq: ['$aiRecommendations.overallAssessment.urgency', 'high'] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {};

    res.json({
      success: true,
      stats: {
        totalSessions: result.totalSessions?.length || 0,
        avgComfortScore: result.avgComfortScore || 0,
        avgTotalPressure: result.avgTotalPressure || 0,
        avgSymmetryScore: result.avgSymmetryScore || 0,
        totalAdjustments: result.totalAdjustments || 0,
        highUrgencyCount: result.highUrgencyCount || 0,
        periodDays: days
      }
    });

  } catch (error) {
    console.error('Error fetching position stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch position statistics'
    });
  }
});

// Helper function to get scenario descriptions
function getScenarioDescription(scenario) {
  const descriptions = {
    normal: 'Balanced pressure distribution with normal sleep position',
    side_sleeper_pressure: 'High pressure on one side, typical of side sleeping',
    back_sleeper_snoring: 'Back sleeping position with potential airway issues',
    restless_sleeper: 'Uneven pressure distribution from frequent movement'
  };
  return descriptions[scenario] || 'Unknown scenario';
}

module.exports = router;
