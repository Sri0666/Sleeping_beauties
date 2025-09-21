# Sleeping Beauties LLM API

This directory contains the Python FastAPI server that provides LLM-powered sleep data generation and servo prediction using Falcon-7B.

## 🚀 Quick Setup

### Prerequisites
- Python 3.8+ (3.10+ recommended)
- CUDA-capable GPU with 16GB+ VRAM (for Falcon-7B)
- 32GB+ system RAM recommended

### Installation

1. **Create Python virtual environment:**
   ```bash
   cd python-api
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the LLM API server:**
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## 📊 API Endpoints

### Health Check
```http
GET http://localhost:8000/health
```

### Generate Sleep Data
```http
POST http://localhost:8000/generate
Content-Type: application/json

{
  "count": 5
}
```

### Predict Servo Actions
```http
POST http://localhost:8000/predict
Content-Type: application/json

{
  "pressure": {
    "head": 26, "neck": 28, "upper_torso": 54,
    "lower_torso": 55, "hips": 50, "thighs": 36, "knees": 32
  },
  "spO2": 91.0,
  "examples": []
}
```

## ⚡ Performance Notes

- **Model Loading**: Takes 30-60 seconds on first startup
- **Memory Usage**: ~14GB GPU VRAM for Falcon-7B
- **Generation Speed**: 2-3 seconds per request
- **Fallback**: Automatically uses rule-based generation if LLM fails

## 🔧 Configuration

### Environment Variables
```bash
# Optional: Use different model
export MODEL_NAME="microsoft/DialoGPT-medium"  # Smaller alternative

# Optional: API port
export API_PORT=8000
```

### GPU Memory Optimization
If you have limited GPU memory, modify `main.py`:

```python
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME, 
    device_map="auto",
    torch_dtype=torch.float16,     # Half precision
    load_in_8bit=True,             # 8-bit quantization
    trust_remote_code=True
)
```

## 🚨 Troubleshooting

### Common Issues

**CUDA Out of Memory:**
- Reduce batch size or use smaller model
- Enable 8-bit quantization: `load_in_8bit=True`
- Try CPU-only mode: `device_map="cpu"`

**Model Download Fails:**
- Check internet connection
- Ensure sufficient disk space (~15GB)
- Try manual download: `huggingface-cli download tiiuae/falcon-7b-instruct`

**Slow Generation:**
- Ensure CUDA is properly installed: `torch.cuda.is_available()`
- Check GPU utilization: `nvidia-smi`
- Consider using smaller model like GPT-2

### CPU-Only Mode
If no GPU available, force CPU mode:
```python
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME, 
    device_map="cpu",
    torch_dtype=torch.float32
)
```

## 📈 Monitoring

The API provides detailed logging:
```bash
# View logs
tail -f logs/api.log

# Check model status
curl http://localhost:8000/health
```

## 🔄 Integration

Once running, the Node.js backend automatically detects and uses the LLM API. The system gracefully falls back to rule-based generation if the Python API is unavailable.