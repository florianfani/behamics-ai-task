# AI Text Similarity Application

This application compares the semantic similarity between text passages using state-of-the-art language models. The application features a React frontend, Node.js backend, and Python-based AI service with GPU acceleration support.

## If you wanna run without docker

- create a .env file in the root of the "backend" folder
- set the MONGODB_URI variable to mongodb+srv://florian:similarityPassword@textsimilarity.ydego.mongodb.net/?retryWrites=true&w=majority&appName=TextSimilarity
- set the PORT variable to 5000
- in the backend/routes/compare.js set the URL to http://localhost:8000/compute-embeddings

## Features

- Compare text similarity using multiple AI models:
  - Sentence Transformers (all-MiniLM-L6-v2)
  - BERT Small (4-layer, uncased)
- Real-time similarity scoring
- Historical comparison tracking
- GPU acceleration support
- Modern UI
- MongoDB integration for storing comparison history

## Architecture

The application consists of three main components:

1. **Frontend** (React + TypeScript)

   - Modern UI built with React
   - Tailwind CSS for styling
   - Real-time updates using React Query

2. **Backend** (Node.js + Express)

   - RESTful API
   - MongoDB integration
   - Request handling and data persistence

3. **AI Service** (Python + FastAPI)
   - GPU-accelerated inference
   - Multiple model support
   - Optimized for performance

## Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher
- MongoDB
- Docker and Docker Compose (for containerized setup)
- NVIDIA GPU + CUDA drivers (optional, for GPU acceleration)

## Installation

### Local Setup

1. **Frontend**

```bash
cd frontend/ai-text-similarity-app
npm install
npm run dev
```

2. **Backend**

```bash
cd backend
npm install
node server.js
```

3. **AI Service**

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

4. **MongoDB**
   Make sure MongoDB is running locally on port 27017

### Docker Setup

1. Install Docker and Docker Compose
2. For GPU support, install NVIDIA Container Toolkit
3. Run the entire stack:

```bash
docker-compose up --build
```

The services will be available at:

- Frontend: http://localhost
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

## Environment Variables

### Backend

- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/similarity-app`)
- `PORT`: Server port (default: 5000)

### AI Service

- No environment variables required, but GPU support is automatically detected

## API Endpoints

### Backend API

- `POST /api/compare`

  - Compare two texts
  - Body: `{ text1: string, text2: string, model: string }`

- `GET /api/compare`
  - Get comparison history
  - Query params: `page` (default: 1), `limit` (default: 3)

### AI Service API

- `POST /compute-embeddings`
  - Compute similarity between texts
  - Body: `{ text1: string, text2: string, model: string }`

## Development

### Directory Structure

```
.
├── frontend/
│   └── ai-text-similarity-app/
│       ├── src/
│       ├── public/
│       └── Dockerfile
├── backend/
│   ├── routes/
│   ├── server.js
│   └── Dockerfile
├── ai-service/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
└── docker-compose.yml
```

### Adding New Models

To add a new model to the AI service:

1. Add the model to the `models` dictionary in `ai-service/main.py`
2. Update the frontend model selection dropdown
3. Add appropriate error handling and validation

## Performance Considerations

- The AI service automatically utilizes GPU if available
- For production deployment, consider:
  - Implementing caching for frequently compared texts
  - Adding rate limiting
  - Setting up monitoring and logging
  - Implementing proper security measures

## Troubleshooting

### Common Issues

1. **GPU Not Detected**

   - Ensure NVIDIA drivers are installed
   - Check CUDA toolkit installation
   - Verify Docker GPU runtime configuration

2. **MongoDB Connection Issues**

   - Verify MongoDB is running
   - Check connection string
   - Ensure network connectivity

3. **Docker Issues**
   - Ensure Docker Desktop is running
   - Check Docker logs for specific errors
   - Verify port availability
