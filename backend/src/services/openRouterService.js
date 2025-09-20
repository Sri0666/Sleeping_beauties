const axios = require('axios');

class OpenRouterService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.model = 'microsoft/wizardlm-2-8x22b'; // Good model for complex analysis
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Sleeping Beauties Sleep Optimizer',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Analyze pressure sensor data to determine optimal body position
   * @param {Object} pressureData - Current pressure sensor readings
   * @param {Object} userProfile - User's sleep preferences and physical data
   * @param {Object} sleepMetrics - Current sleep quality metrics
   * @returns {Object} Optimal position recommendations
   */
  async analyzeOptimalPosition(pressureData, userProfile = {}, sleepMetrics = {}) {
    try {
      const prompt = this.buildPositionAnalysisPrompt(pressureData, userProfile, sleepMetrics);
      
      const response = await this.client.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a sleep expert and ergonomic specialist AI. Analyze pressure sensor data from a smart mattress to recommend optimal body positioning for sleep quality. Always respond with valid JSON format containing specific elevation angles for different body segments.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const aiResponse = response.data.choices[0].message.content;
      return this.parsePositionRecommendations(aiResponse);
      
    } catch (error) {
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      return this.getFallbackRecommendation(pressureData);
    }
  }

  /**
   * Build a comprehensive prompt for position analysis
   */
  buildPositionAnalysisPrompt(pressureData, userProfile, sleepMetrics) {
    return `
Analyze this sleep position data and recommend optimal body positioning:

PRESSURE SENSOR DATA:
- Head area pressure: ${pressureData.head?.pressure || 0} kPa (distribution: ${JSON.stringify(pressureData.head?.distribution || {})})
- Neck area pressure: ${pressureData.neck?.pressure || 0} kPa
- Upper torso pressure: ${pressureData.upperTorso?.pressure || 0} kPa
- Lower torso pressure: ${pressureData.lowerTorso?.pressure || 0} kPa
- Hip area pressure: ${pressureData.hips?.pressure || 0} kPa
- Thigh pressure: ${pressureData.thighs?.pressure || 0} kPa
- Knee area pressure: ${pressureData.knees?.pressure || 0} kPa
- Calf pressure: ${pressureData.calves?.pressure || 0} kPa
- Feet pressure: ${pressureData.feet?.pressure || 0} kPa

CURRENT POSITION:
- Head elevation: ${pressureData.currentPosition?.head || 0}°
- Torso elevation: ${pressureData.currentPosition?.torso || 0}°
- Legs elevation: ${pressureData.currentPosition?.legs || 0}°
- Feet elevation: ${pressureData.currentPosition?.feet || 0}°

USER PROFILE:
- Age: ${userProfile.age || 'unknown'}
- Weight: ${userProfile.weight || 'unknown'} kg
- Height: ${userProfile.height || 'unknown'} cm
- Sleep issues: ${JSON.stringify(userProfile.sleepIssues || [])}
- Preferred position: ${userProfile.preferredPosition || 'unknown'}

CURRENT METRICS:
- Movement count: ${sleepMetrics.movementCount || 0}
- Restlessness level: ${sleepMetrics.restlessnessLevel || 'normal'}
- Heart rate: ${sleepMetrics.heartRate || 'unknown'} BPM
- Sleep stage: ${sleepMetrics.sleepStage || 'unknown'}

Please analyze this data and provide recommendations in the following JSON format:
{
  "recommendations": {
    "head": {
      "targetAngle": number (0-45 degrees),
      "reasoning": "explanation for this adjustment"
    },
    "torso": {
      "targetAngle": number (0-30 degrees),
      "reasoning": "explanation for this adjustment"  
    },
    "legs": {
      "targetAngle": number (0-20 degrees),
      "reasoning": "explanation for this adjustment"
    },
    "feet": {
      "targetAngle": number (0-15 degrees),
      "reasoning": "explanation for this adjustment"
    }
  },
  "overallAssessment": {
    "pressureIssues": ["list of identified pressure problems"],
    "comfortScore": number (1-10),
    "sleepQualityImpact": "description of how current position affects sleep",
    "urgency": "low/medium/high - how quickly adjustment is needed"
  },
  "adjustmentSequence": [
    {
      "bodyPart": "head/torso/legs/feet",
      "targetAngle": number,
      "delaySeconds": number,
      "priority": "high/medium/low"
    }
  ],
  "additionalTips": ["general sleep position advice"]
}

Focus on pressure distribution, spinal alignment, circulation, and comfort optimization.
    `;
  }

  /**
   * Parse AI response and validate the position recommendations
   */
  parsePositionRecommendations(aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Validate and sanitize the response
      const recommendations = {
        recommendations: {
          head: {
            targetAngle: Math.max(0, Math.min(45, parsed.recommendations?.head?.targetAngle || 0)),
            reasoning: parsed.recommendations?.head?.reasoning || 'Standard position'
          },
          torso: {
            targetAngle: Math.max(0, Math.min(30, parsed.recommendations?.torso?.targetAngle || 0)),
            reasoning: parsed.recommendations?.torso?.reasoning || 'Standard position'
          },
          legs: {
            targetAngle: Math.max(0, Math.min(20, parsed.recommendations?.legs?.targetAngle || 0)),
            reasoning: parsed.recommendations?.legs?.reasoning || 'Standard position'
          },
          feet: {
            targetAngle: Math.max(0, Math.min(15, parsed.recommendations?.feet?.targetAngle || 0)),
            reasoning: parsed.recommendations?.feet?.reasoning || 'Standard position'
          }
        },
        overallAssessment: {
          pressureIssues: parsed.overallAssessment?.pressureIssues || [],
          comfortScore: Math.max(1, Math.min(10, parsed.overallAssessment?.comfortScore || 5)),
          sleepQualityImpact: parsed.overallAssessment?.sleepQualityImpact || 'No significant impact detected',
          urgency: ['low', 'medium', 'high'].includes(parsed.overallAssessment?.urgency) 
            ? parsed.overallAssessment.urgency : 'low'
        },
        adjustmentSequence: parsed.adjustmentSequence || [],
        additionalTips: parsed.additionalTips || [],
        timestamp: new Date().toISOString(),
        source: 'ai_analysis'
      };

      return recommendations;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackRecommendation();
    }
  }

  /**
   * Provide fallback recommendations when AI service is unavailable
   */
  getFallbackRecommendation(pressureData = {}) {
    // Basic algorithmic recommendations based on pressure patterns
    const head = this.calculateBasicHeadRecommendation(pressureData);
    const torso = this.calculateBasicTorsoRecommendation(pressureData);
    const legs = this.calculateBasicLegsRecommendation(pressureData);
    const feet = this.calculateBasicFeetRecommendation(pressureData);

    return {
      recommendations: {
        head: { targetAngle: head, reasoning: 'Basic comfort optimization' },
        torso: { targetAngle: torso, reasoning: 'Pressure distribution adjustment' },
        legs: { targetAngle: legs, reasoning: 'Circulation improvement' },
        feet: { targetAngle: feet, reasoning: 'Standard elevation' }
      },
      overallAssessment: {
        pressureIssues: ['Using fallback analysis - connect AI service for detailed assessment'],
        comfortScore: 6,
        sleepQualityImpact: 'Basic position optimization applied',
        urgency: 'low'
      },
      adjustmentSequence: [
        { bodyPart: 'head', targetAngle: head, delaySeconds: 0, priority: 'medium' },
        { bodyPart: 'torso', targetAngle: torso, delaySeconds: 5, priority: 'medium' },
        { bodyPart: 'legs', targetAngle: legs, delaySeconds: 10, priority: 'low' },
        { bodyPart: 'feet', targetAngle: feet, delaySeconds: 15, priority: 'low' }
      ],
      additionalTips: [
        'Ensure proper spinal alignment',
        'Maintain comfortable sleeping temperature',
        'Consider pillow adjustment for neck support'
      ],
      timestamp: new Date().toISOString(),
      source: 'fallback_algorithm'
    };
  }

  // Basic calculation methods for fallback
  calculateBasicHeadRecommendation(pressureData) {
    const headPressure = pressureData.head?.pressure || 0;
    if (headPressure > 15) return 10; // Slight elevation for high pressure
    if (headPressure < 5) return 5;   // Minor support for low pressure
    return 7; // Standard elevation
  }

  calculateBasicTorsoRecommendation(pressureData) {
    const upperTorso = pressureData.upperTorso?.pressure || 0;
    const lowerTorso = pressureData.lowerTorso?.pressure || 0;
    const avgPressure = (upperTorso + lowerTorso) / 2;
    
    if (avgPressure > 20) return 8; // Moderate elevation for pressure relief
    if (avgPressure < 8) return 3;  // Minimal elevation
    return 5; // Standard position
  }

  calculateBasicLegsRecommendation(pressureData) {
    const hipPressure = pressureData.hips?.pressure || 0;
    const thighPressure = pressureData.thighs?.pressure || 0;
    
    if (hipPressure > 18 || thighPressure > 15) return 12; // Elevation for circulation
    return 8; // Standard leg elevation
  }

  calculateBasicFeetRecommendation(pressureData) {
    return 6; // Standard foot elevation for circulation
  }

  /**
   * Generate synthetic pressure data for testing
   */
  generateSyntheticPressureData(scenario = 'normal') {
    const scenarios = {
      normal: {
        head: { pressure: 8.5, distribution: { left: 45, right: 55 } },
        neck: { pressure: 6.2 },
        upperTorso: { pressure: 12.3 },
        lowerTorso: { pressure: 15.7 },
        hips: { pressure: 18.9 },
        thighs: { pressure: 11.4 },
        knees: { pressure: 7.8 },
        calves: { pressure: 9.1 },
        feet: { pressure: 5.6 },
        currentPosition: { head: 5, torso: 2, legs: 8, feet: 6 }
      },
      side_sleeper_pressure: {
        head: { pressure: 12.1, distribution: { left: 75, right: 25 } },
        neck: { pressure: 8.7 },
        upperTorso: { pressure: 19.5 },
        lowerTorso: { pressure: 22.3 },
        hips: { pressure: 25.8 },
        thighs: { pressure: 18.2 },
        knees: { pressure: 14.6 },
        calves: { pressure: 8.9 },
        feet: { pressure: 6.1 },
        currentPosition: { head: 3, torso: 0, legs: 5, feet: 4 }
      },
      back_sleeper_snoring: {
        head: { pressure: 14.2, distribution: { left: 50, right: 50 } },
        neck: { pressure: 11.8 },
        upperTorso: { pressure: 16.4 },
        lowerTorso: { pressure: 18.9 },
        hips: { pressure: 21.2 },
        thighs: { pressure: 13.7 },
        knees: { pressure: 9.3 },
        calves: { pressure: 7.4 },
        feet: { pressure: 5.8 },
        currentPosition: { head: 0, torso: 0, legs: 0, feet: 0 }
      },
      restless_sleeper: {
        head: { pressure: 7.3, distribution: { left: 60, right: 40 } },
        neck: { pressure: 9.1 },
        upperTorso: { pressure: 14.8 },
        lowerTorso: { pressure: 17.6 },
        hips: { pressure: 20.4 },
        thighs: { pressure: 16.8 },
        knees: { pressure: 12.1 },
        calves: { pressure: 10.5 },
        feet: { pressure: 8.2 },
        currentPosition: { head: 8, torso: 5, legs: 12, feet: 8 }
      }
    };

    return scenarios[scenario] || scenarios.normal;
  }
}

module.exports = new OpenRouterService();
