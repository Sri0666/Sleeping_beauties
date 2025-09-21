import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import transformers
import json
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import uvicorn
import logging
import warnings
from contextlib import asynccontextmanager

# Suppress warnings
warnings.filterwarnings("ignore", message=".*on_event is deprecated.*")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for model
tokenizer = None
model = None
text_pipeline = None
# Use Falcon-7B-Instruct with proper configuration as per documentation
MODEL_CANDIDATES = [
    "tiiuae/falcon-7b-instruct",  # Primary choice from documentation
    "gpt2",  # Simple fallback
]
CURRENT_MODEL = None
body_zones = ["head", "neck", "upper_torso", "lower_torso", "hips", "thighs", "knees"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Sleeping Beauties LLM API...")
    success = load_model()
    if success:
        logger.info(f"LLM API ready with model: {CURRENT_MODEL}")
    else:
        logger.warning("API started but LLM not available - will use fallback methods")
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Sleeping Beauties LLM API",
    description="AI-powered sleep data generation and servo prediction",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model
tokenizer = None
model = None
text_pipeline = None
# Use Falcon-7B-Instruct with proper configuration as per documentation
MODEL_CANDIDATES = [
    "tiiuae/falcon-7b-instruct",  # Primary choice from documentation
    "gpt2",  # Simple fallback
]
CURRENT_MODEL = None
body_zones = ["head", "neck", "upper_torso", "lower_torso", "hips", "thighs", "knees"]

# Pydantic models
class PressureData(BaseModel):
    head: float
    neck: float
    upper_torso: float
    lower_torso: float
    hips: float
    thighs: float
    knees: float

class SleepData(BaseModel):
    pressure: PressureData
    spO2: float

class GenerateRequest(BaseModel):
    count: int = 1

class GenerateResponse(BaseModel):
    success: bool
    source: str
    data: List[SleepData]

class PredictRequest(BaseModel):
    pressure: PressureData
    spO2: float
    examples: Optional[List[SleepData]] = []

class ServoAction(BaseModel):
    left_servo: int
    right_servo: int
    reasoning: str

class PredictResponse(BaseModel):
    success: bool
    source: str
    servo_action: ServoAction

class HealthResponse(BaseModel):
    ok: bool
    model_loaded: bool
    model_name: str

def load_model():
    """Load the best available LLM model using proper imports and error handling"""
    global tokenizer, model, text_pipeline, CURRENT_MODEL
    
    for model_name in MODEL_CANDIDATES:
        try:
            logger.info(f"Attempting to load model: {model_name}")
            
            if "falcon" in model_name.lower():
                # Load Falcon-7B-Instruct with official configuration
                logger.info("Loading Falcon-7B-Instruct with official configuration...")
                
                # First try to load tokenizer
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                if tokenizer.pad_token is None:
                    tokenizer.pad_token = tokenizer.eos_token
                
                # Load model with proper settings for Falcon
                model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
                    device_map="auto" if torch.cuda.is_available() else "cpu"
                )
                
                # Create pipeline using transformers.pipeline function
                try:
                    text_pipeline = transformers.pipeline(
                        "text-generation",
                        model=model,
                        tokenizer=tokenizer,
                        dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
                        device_map="auto" if torch.cuda.is_available() else "cpu",
                    )
                    logger.info("Pipeline created successfully")
                except Exception as pipeline_error:
                    logger.warning(f"Pipeline creation failed, using direct model: {pipeline_error}")
                    text_pipeline = None  # Will use direct model calls instead
                
            else:
                # Fallback models (GPT-2, etc.)
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                if tokenizer.pad_token is None:
                    tokenizer.pad_token = tokenizer.eos_token
                    
                model = AutoModelForCausalLM.from_pretrained(
                    model_name,
                    device_map="auto" if torch.cuda.is_available() else "cpu",
                    dtype=torch.float16 if torch.cuda.is_available() else torch.float32
                )
                
                # Create simple pipeline for fallback
                try:
                    text_pipeline = transformers.pipeline(
                        "text-generation",
                        model=model,
                        tokenizer=tokenizer,
                    )
                except Exception:
                    text_pipeline = None  # Use direct model calls
            
            CURRENT_MODEL = model_name
            logger.info(f"Successfully loaded model: {model_name}")
            logger.info(f"Pipeline available: {text_pipeline is not None}")
            return True
            
        except Exception as e:
            logger.warning(f"Failed to load model {model_name}: {str(e)}")
            tokenizer = None
            model = None
            text_pipeline = None
            continue
    
    logger.error("Failed to load any model - using fallback methods only")
    return False

def generate_synthetic_example():
    """Generate a synthetic sleep data example using LLM or direct model calls"""
    global model, tokenizer, text_pipeline

    if model is not None and tokenizer is not None:
        try:
            prompt = f"""Generate a synthetic example of a person lying on a bed. Include integer pressures for each body zone:
{body_zones}
- Head/neck lower pressure (20-35)
- Torso/hips higher pressure (40-60)
- Legs medium pressure (30-50)
- Generate a realistic SpO₂ (90-100) depending on pressure distribution
Output strictly in JSON like:
{{"pressure": {{"head":0,"neck":0,"upper_torso":0,"lower_torso":0,"hips":0,"thighs":0,"knees":0}}, "spO2": 0.0}}"""

            # Try pipeline first if available
            if text_pipeline is not None:
                try:
                    sequences = text_pipeline(
                        prompt,
                        max_length=400,
                        do_sample=True,
                        top_k=10,
                        num_return_sequences=1,
                        eos_token_id=tokenizer.eos_token_id,
                        temperature=0.7
                    )
                    if sequences and len(sequences) > 0:
                        generated_text = sequences[0]['generated_text']
                        response_part = generated_text[len(prompt):].strip()
                    else:
                        raise Exception("Pipeline returned empty result")
                except Exception as pipeline_error:
                    logger.warning(f"Pipeline failed, using direct model: {pipeline_error}")
                    # Fall through to direct model usage
                    response_part = None
            
            # Use direct model if pipeline failed or unavailable
            if text_pipeline is None or response_part is None:
                inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
                
                with torch.no_grad():
                    outputs = model.generate(
                        **inputs,
                        max_new_tokens=180,
                        temperature=0.7,
                        do_sample=True,
                        pad_token_id=tokenizer.eos_token_id
                    )
                
                generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
                response_part = generated_text[len(prompt):].strip()
            
            # Extract JSON from the model output
            if response_part:
                try:
                    json_start = response_part.find("{")
                    if json_start >= 0:
                        json_end = response_part.rfind("}") + 1
                        data = json.loads(response_part[json_start:json_end])

                        # Validate & clamp
                        if "pressure" in data and "spO2" in data and all(z in data["pressure"] for z in body_zones):
                            p = data["pressure"]
                            # Clamp per-zone
                            for z in body_zones:
                                if z in ["head", "neck"]:
                                    p[z] = int(max(20, min(35, float(p[z]))))
                                elif z in ["upper_torso", "lower_torso", "hips"]:
                                    p[z] = int(max(40, min(60, float(p[z]))))
                                else:
                                    p[z] = int(max(30, min(50, float(p[z]))))
                            data["spO2"] = float(max(90, min(100, float(data["spO2"]))))
                            return data
                except Exception as json_error:
                    logger.warning(f"JSON parsing failed: {json_error}")

        except Exception as e:
            logger.warning(f"LLM generation failed: {e}")

    # Fallback to rule-based generation
    return generate_fallback_example()

def generate_fallback_example():
    """Generate realistic sleep data using rule-based approach"""
    # Base pressures (realistic ranges)
    base_pressure = {
        "head": random.uniform(20, 35),
        "neck": random.uniform(22, 35),
        "upper_torso": random.uniform(42, 58),
        "lower_torso": random.uniform(44, 64),
        "hips": random.uniform(46, 64),
        "thighs": random.uniform(30, 45),
        "knees": random.uniform(30, 52)
    }
    
    # SpO2 influenced by core pressure
    core_avg = (base_pressure["upper_torso"] + base_pressure["lower_torso"] + base_pressure["hips"]) / 3
    base_spo2 = 98 - (core_avg - 45) * 0.2
    
    # Random variation and potential sleep events
    if random.random() < 0.1:  # 10% chance of disturbance
        base_spo2 -= random.uniform(3, 8)
    
    spo2 = max(88, min(99, base_spo2 + random.uniform(-1, 1)))
    
    return {
        "pressure": base_pressure,
        "spO2": round(spo2, 1)
    }

def llm_predict_servo(pressure: dict, spO2: float, examples: list = None):
    """Predict servo actions using LLM pipeline with few-shot learning and strict JSON output"""
    global model, tokenizer, text_pipeline

    if text_pipeline is None:
        return None

    try:
        # Build few-shot prompt using user's format and simple rule to label examples
        prompt = "You are a smart sleep assistant controlling a bed with 2 servo zones.\n"
        prompt += "Here are examples of body pressures, SpO₂, and corresponding servo actions (JSON lines):\n"

        if examples:
            for ex in examples[:5]:
                ex_pressure = ex.get("pressure", {})
                ex_sp = float(ex.get("spO2", 95))
                core = (float(ex_pressure.get("upper_torso", 50)) + float(ex_pressure.get("lower_torso", 50)) + float(ex_pressure.get("hips", 50))) / 3.0
                if ex_sp < 93 and core > 50:
                    servo_action = {"left_servo": 1, "right_servo": -1}
                else:
                    servo_action = {"left_servo": 0, "right_servo": 0}
                labeled = {"pressure": ex_pressure, "spO2": ex_sp, "servo_action": servo_action}
                prompt += json.dumps(labeled) + "\n"

        prompt += "\nNow, given the current readings (JSON):\n"
        prompt += json.dumps({"pressure": pressure, "spO2": spO2}) + "\n"
        prompt += "Suggest the servo movements in JSON only: {\"left_servo\": VALUE, \"right_servo\": VALUE, \"reasoning\": \"...\"}.\n"

        # Use pipeline with Falcon-recommended settings
        sequences = text_pipeline(
            prompt,
            max_length=len(prompt) + 150,
            do_sample=True,
            top_k=10,
            num_return_sequences=1,
            eos_token_id=tokenizer.eos_token_id if tokenizer else None,
            temperature=0.3
        )

        if sequences and len(sequences) > 0:
            generated_text = sequences[0]['generated_text']
            response_part = generated_text[len(prompt):].strip()

            # Extract JSON
            try:
                json_start = response_part.find("{")
                if json_start >= 0:
                    json_end = response_part.rfind("}") + 1
                    result = json.loads(response_part[json_start:json_end])
                    if all(k in result for k in ("left_servo", "right_servo")):
                        # Ensure types are ints and reasoning exists
                        ls = int(result.get("left_servo", 0))
                        rs = int(result.get("right_servo", 0))
                        reason = result.get("reasoning", "LLM-based decision")
                        return {"left_servo": ls, "right_servo": rs, "reasoning": reason}
            except Exception:
                pass

    except Exception as e:
        logger.warning(f"LLM servo prediction failed: {e}")

    return None

def fallback_predict_servo(pressure: dict, spO2: float):
    """Fallback rule-based servo prediction"""
    core_avg = (pressure["upper_torso"] + pressure["lower_torso"] + pressure["hips"]) / 3
    if spO2 < 93 and core_avg > 50:
        return {
            "left_servo": 1,
            "right_servo": -1,
            "reasoning": "Low SpO2 and high core pressure → tilt left/up (rule-based fallback)"
        }
    return {
        "left_servo": 0,
        "right_servo": 0,
        "reasoning": "Within acceptable range → no change (rule-based fallback)"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        ok=True,
        model_loaded=text_pipeline is not None,
        model_name=CURRENT_MODEL or "None"
    )

@app.post("/generate")
async def generate_data(request: GenerateRequest):
    """Generate synthetic sleep data"""
    try:
        count = max(1, min(request.count, 100))  # Limit to 1-100
        dataset = []
        
        for _ in range(count):
            data = generate_synthetic_example()
            sleep_data = SleepData(
                pressure=PressureData(**data["pressure"]),
                spO2=data["spO2"]
            )
            dataset.append(sleep_data)
        
        source = "llm" if (text_pipeline is not None) else "fallback"
        
        return GenerateResponse(
            success=True,
            source=source,
            data=dataset
        )
        
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict_servo(request: PredictRequest):
    """Predict servo actions based on sleep data"""
    try:
        pressure_dict = request.pressure.dict()
        
        # Try LLM prediction first
        llm_result = llm_predict_servo(
            pressure_dict, 
            request.spO2, 
            [ex.dict() for ex in request.examples] if request.examples else None
        )
        
        if llm_result:
            source = "llm"
            servo_action = ServoAction(**llm_result)
        else:
            source = "fallback"
            fallback_result = fallback_predict_servo(pressure_dict, request.spO2)
            servo_action = ServoAction(**fallback_result)
        
        return PredictResponse(
            success=True,
            source=source,
            servo_action=servo_action
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)