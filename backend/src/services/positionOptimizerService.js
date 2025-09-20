const openRouterService = require('./openRouterService');
const PressureMapping = require('../models/PressureMapping');
const User = require('../models/User');

class PositionOptimizerService {
  constructor() {
    this.optimizationHistory = new Map();
    this.activeOptimizations = new Map();
  }

  /**
   * Analyze current pressure data and generate AI-powered position recommendations
   */
  async optimizePosition(userId, sessionId, pressureData, options = {}) {
    try {
      // Get user profile for personalized recommendations
      const userProfile = await this.getUserProfile(userId);
      
      // Get current sleep metrics
      const sleepMetrics = await this.getSleepMetrics(sessionId);
      
      // Get AI recommendations
      const aiRecommendations = await openRouterService.analyzeOptimalPosition(
        pressureData, 
        userProfile, 
        sleepMetrics
      );

      // Create pressure mapping record
      const pressureMapping = await this.createPressureMapping(
        userId, 
        sessionId, 
        pressureData, 
        aiRecommendations
      );

      // Execute position adjustments if requested
      if (options.autoAdjust) {
        await this.executePositionAdjustments(pressureMapping);
      }

      // Store optimization result
      this.optimizationHistory.set(userId, {
        timestamp: new Date(),
        recommendations: aiRecommendations,
        pressureMappingId: pressureMapping._id
      });

      return {
        success: true,
        pressureMappingId: pressureMapping._id,
        recommendations: aiRecommendations,
        adjustmentPlan: this.createAdjustmentPlan(aiRecommendations),
        metadata: {
          analysisSource: aiRecommendations.source,
          comfortScore: aiRecommendations.overallAssessment?.comfortScore,
          urgency: aiRecommendations.overallAssessment?.urgency
        }
      };

    } catch (error) {
      console.error('Position optimization error:', error);
      return {
        success: false,
        error: error.message,
        fallbackRecommendations: await this.getFallbackOptimization(pressureData)
      };
    }
  }

  /**
   * Execute position adjustments based on AI recommendations
   */
  async executePositionAdjustments(pressureMapping, options = {}) {
    const { adjustmentSequence } = pressureMapping.aiRecommendations;
    
    if (!adjustmentSequence || adjustmentSequence.length === 0) {
      return { success: false, message: 'No adjustments recommended' };
    }

    const results = [];
    
    // Sort by priority and delay
    const sortedAdjustments = adjustmentSequence.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
    });

    for (const adjustment of sortedAdjustments) {
      try {
        // Add delay if specified
        if (adjustment.delaySeconds > 0) {
          await this.delay(adjustment.delaySeconds * 1000);
        }

        // Execute the physical adjustment
        const adjustmentResult = await this.executePhysicalAdjustment(
          pressureMapping.userId,
          adjustment.bodyPart,
          adjustment.targetAngle,
          pressureMapping.currentPosition[adjustment.bodyPart] || 0
        );

        // Record the adjustment
        pressureMapping.addAdjustment(
          adjustment.bodyPart,
          pressureMapping.currentPosition[adjustment.bodyPart] || 0,
          adjustment.targetAngle,
          `AI optimization: ${adjustment.priority} priority`,
          'ai_recommendation'
        );

        results.push({
          bodyPart: adjustment.bodyPart,
          success: adjustmentResult.success,
          fromAngle: pressureMapping.currentPosition[adjustment.bodyPart] || 0,
          toAngle: adjustment.targetAngle,
          message: adjustmentResult.message
        });

      } catch (adjustmentError) {
        console.error(`Adjustment failed for ${adjustment.bodyPart}:`, adjustmentError);
        results.push({
          bodyPart: adjustment.bodyPart,
          success: false,
          error: adjustmentError.message
        });
      }
    }

    // Save the updated pressure mapping
    await pressureMapping.save();

    return {
      success: true,
      adjustments: results,
      totalAdjustments: results.length,
      successfulAdjustments: results.filter(r => r.success).length
    };
  }

  /**
   * Execute physical adjustment of a body part (interfaces with hardware)
   */
  async executePhysicalAdjustment(userId, bodyPart, targetAngle, currentAngle) {
    // This would interface with your actual hardware control system
    // For now, we'll simulate the adjustment
    
    console.log(`Adjusting ${bodyPart} from ${currentAngle}° to ${targetAngle}° for user ${userId}`);
    
    // Simulate adjustment time
    await this.delay(Math.abs(targetAngle - currentAngle) * 100); // 100ms per degree
    
    // In a real implementation, this would:
    // 1. Send commands to hardware controllers
    // 2. Monitor position feedback
    // 3. Handle error conditions
    // 4. Validate the adjustment was successful
    
    return {
      success: true,
      message: `Successfully adjusted ${bodyPart} to ${targetAngle}°`,
      actualAngle: targetAngle, // In reality, this might differ slightly
      adjustmentTime: Math.abs(targetAngle - currentAngle) * 100
    };
  }

  /**
   * Get user profile for personalized recommendations
   */
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return {};

      return {
        age: user.profile?.age,
        weight: user.profile?.weight,
        height: user.profile?.height,
        sleepIssues: user.profile?.sleepIssues || [],
        preferredPosition: user.preferences?.sleepPosition,
        medicalConditions: user.profile?.medicalConditions || []
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {};
    }
  }

  /**
   * Get current sleep metrics for context
   */
  async getSleepMetrics(sessionId) {
    try {
      // This would integrate with your existing sleep tracking system
      // For now, return mock data
      return {
        movementCount: Math.floor(Math.random() * 20),
        restlessnessLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        heartRate: 60 + Math.floor(Math.random() * 30),
        sleepStage: ['light', 'deep', 'rem'][Math.floor(Math.random() * 3)]
      };
    } catch (error) {
      console.error('Error fetching sleep metrics:', error);
      return {};
    }
  }

  /**
   * Create pressure mapping record
   */
  async createPressureMapping(userId, sessionId, pressureData, aiRecommendations) {
    const pressureMapping = new PressureMapping({
      userId,
      sessionId,
      pressureZones: pressureData,
      currentPosition: pressureData.currentPosition || { head: 0, torso: 0, legs: 0, feet: 0 },
      aiRecommendations,
      analysis: {}
    });

    // Calculate analysis metrics
    pressureMapping.calculateTotalPressure();
    pressureMapping.calculateSymmetryScore();
    pressureMapping.calculateComfortIndex();

    await pressureMapping.save();
    return pressureMapping;
  }

  /**
   * Create adjustment plan for frontend display
   */
  createAdjustmentPlan(aiRecommendations) {
    const { recommendations, adjustmentSequence } = aiRecommendations;
    
    return {
      totalAdjustments: adjustmentSequence ? adjustmentSequence.length : 0,
      estimatedDuration: this.calculateAdjustmentDuration(adjustmentSequence),
      adjustments: adjustmentSequence?.map(adj => ({
        bodyPart: adj.bodyPart,
        description: `Adjust ${adj.bodyPart} to ${adj.targetAngle}°`,
        reasoning: recommendations[adj.bodyPart]?.reasoning,
        priority: adj.priority,
        delay: adj.delaySeconds
      })) || [],
      summary: this.generateAdjustmentSummary(recommendations)
    };
  }

  /**
   * Calculate total time needed for adjustments
   */
  calculateAdjustmentDuration(adjustmentSequence) {
    if (!adjustmentSequence) return 0;
    
    return adjustmentSequence.reduce((total, adj) => {
      return total + (adj.delaySeconds || 0) + 3; // 3 seconds per adjustment
    }, 0);
  }

  /**
   * Generate human-readable adjustment summary
   */
  generateAdjustmentSummary(recommendations) {
    const adjustments = [];
    
    Object.entries(recommendations).forEach(([bodyPart, rec]) => {
      if (rec.targetAngle > 0) {
        adjustments.push(`${bodyPart} elevation to ${rec.targetAngle}°`);
      }
    });

    if (adjustments.length === 0) {
      return 'No position adjustments needed - current position is optimal';
    }

    return `Recommended adjustments: ${adjustments.join(', ')}`;
  }

  /**
   * Get fallback optimization when AI service fails
   */
  async getFallbackOptimization(pressureData) {
    return openRouterService.getFallbackRecommendation(pressureData);
  }

  /**
   * Analyze pressure patterns for insights
   */
  analyzePressurePatterns(pressureData) {
    const zones = pressureData;
    const patterns = {
      highPressureZones: [],
      asymmetry: [],
      recommendations: []
    };

    // Identify high pressure zones
    Object.entries(zones).forEach(([zone, data]) => {
      if (data?.pressure > 20) {
        patterns.highPressureZones.push(zone);
      }
    });

    // Check for asymmetry
    Object.entries(zones).forEach(([zone, data]) => {
      if (data?.distribution?.left && data?.distribution?.right) {
        const asymmetry = Math.abs(data.distribution.left - data.distribution.right);
        if (asymmetry > 20) {
          patterns.asymmetry.push({
            zone,
            asymmetryLevel: asymmetry,
            side: data.distribution.left > data.distribution.right ? 'left-heavy' : 'right-heavy'
          });
        }
      }
    });

    // Generate basic recommendations
    if (patterns.highPressureZones.length > 0) {
      patterns.recommendations.push('Consider position adjustment to relieve pressure points');
    }
    
    if (patterns.asymmetry.length > 0) {
      patterns.recommendations.push('Asymmetric pressure detected - adjustment may improve comfort');
    }

    return patterns;
  }

  /**
   * Get optimization history for a user
   */
  getOptimizationHistory(userId, limit = 10) {
    return PressureMapping.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('sessionId')
      .exec();
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate synthetic pressure data for testing
   */
  generateTestScenario(scenarioName = 'normal') {
    return openRouterService.generateSyntheticPressureData(scenarioName);
  }

  /**
   * Validate pressure data
   */
  validatePressureData(pressureData) {
    const requiredZones = ['head', 'neck', 'upperTorso', 'lowerTorso', 'hips', 'thighs', 'knees', 'calves', 'feet'];
    const errors = [];

    requiredZones.forEach(zone => {
      if (!pressureData[zone]) {
        errors.push(`Missing pressure data for ${zone}`);
      } else if (typeof pressureData[zone].pressure !== 'number') {
        errors.push(`Invalid pressure value for ${zone}`);
      }
    });

    if (!pressureData.currentPosition) {
      errors.push('Missing current position data');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = new PositionOptimizerService();
