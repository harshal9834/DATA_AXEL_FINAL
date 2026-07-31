# AI Research Operating System - Quick Start Guide

## 🚀 Start the System

### Terminal 1: Backend
```bash
cd backend
npm run dev
```
**Expected output**: `Backend server listening at http://localhost:3001`

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
**Expected output**: `VITE v8.1.5  ready in 2541 ms` + `Local:   http://localhost:3002/`

---

## 🔐 Login & Navigate

1. Open **http://localhost:3002** in your browser
2. Click **Login** (Firebase authentication)
3. Once logged in, click the user menu → **DeepSearch**
4. You should see the research interface

---

## 📋 Test the Pipeline

### Option A: Manual Entry
1. Enter **Project Name**: `Hospital Management System`
2. Enter **Problem Statement**: 
   ```
   Build a comprehensive hospital management system that handles patient records, 
   appointments, billing, and medical history with AI-powered insights
   ```
3. Click **"Start Research Analysis"**

### Option B: Example Project
1. Scroll down to "Example Projects"
2. Click any example (e.g., "Hospital Management System")
3. Click **"Start Research Analysis"**

---

## ⏳ Watch Progress

The progress bar will update as each stage completes:
- 8% - Understanding Problem
- 16% - Research Summary
- 24% - Finding Papers
- 32% - Finding GitHub Repos
- 40% - Finding Datasets
- 50% - Architecture Diagram
- 58% - ER Diagram
- 66% - Flow Diagram
- 75% - Documentation
- 83% - SRS
- 92% - API & Database Design
- 100% - Complete

**Total time**: 3-4 minutes

---

## 📊 View Results

Once complete, switch to **Workspace** tab and view each tab:

| Tab | Contains |
|-----|----------|
| **Research** | Project overview and analysis |
| **Papers** | Recommended research papers |
| **GitHub** | Recommended repositories |
| **Datasets** | Recommended datasets |
| **Architecture** | System architecture diagram |
| **ER Diagram** | Database schema diagram |
| **Flow Diagram** | Workflow diagram |
| **Docs** | Full technical documentation |
| **SRS** | Software Requirements Specification |
| **API & DB** | API endpoints and database design |

---

## 🔄 Real-time Updates

Watch the **current stage** text update in real-time:
- "Finding GitHub Repositories..."
- "Generating Architecture Diagram..."
- "Writing Documentation..."

The progress bar increments every time a stage completes.

---

## 📁 Workspace History

Go back to **New Research** tab to start another project.

Previously created workspaces persist in the database and can be accessed again later.

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr ":3001"

# Kill process if needed
taskkill /PID <PID> /F
```

### Frontend won't start
```bash
# Check if port 3002 is in use
netstat -ano | findstr ":3002"

# Kill process if needed
taskkill /PID <PID> /F
```

### Gemini API errors
- Check `.env` has `GEMINI_API_KEY`
- Verify the key is valid
- Check API quota in Google Cloud Console

### Database errors
- Run `npx prisma db push` in backend folder
- Or reset: `npx prisma migrate reset`

### Still having issues?
1. Check backend logs (Terminal 1)
2. Check browser console (F12)
3. Check database: `npx prisma studio`

---

## 💡 Example Inputs

Copy-paste these for quick testing:

### Hospital System
```
Project: Hospital Management System
Problem: Build a comprehensive hospital management system that handles patient records, 
appointments, billing, and medical history with AI-powered insights for doctors
```

### E-commerce Platform
```
Project: AI-Powered E-commerce Platform
Problem: Build an intelligent e-commerce platform with product recommendations, 
inventory management, and customer behavior analysis
```

### Food Delivery
```
Project: AI Food Delivery Service
Problem: Create a food delivery platform with AI-optimized routing, 
demand prediction, and restaurant recommendation engine
```

### College ERP
```
Project: College ERP System
Problem: Build an enterprise resource planning system for colleges 
that manages students, courses, attendance, grades, and fees
```

---

## 🎯 Next Steps

After testing:

1. **Verify all tabs populate**: Check each tab has content
2. **Check database**: `npx prisma studio` → see created workspace
3. **Test error handling**: Try invalid/empty inputs
4. **Monitor performance**: Note total time taken
5. **Provide feedback**: What could be improved?

---

## ✅ Success Criteria

Pipeline is working correctly when:
- ✅ Progress bar reaches 100%
- ✅ All 10 tabs show content
- ✅ Mermaid diagrams render
- ✅ Markdown text displays
- ✅ No console errors
- ✅ Workspace saves to database

---

**Ready? Start the backend and frontend, then head to http://localhost:3002/app/deepsearch!**
