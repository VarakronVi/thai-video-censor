# 🎬 Thai Video Censor — AI-Powered Thai Profanity Detection

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Whisper](https://img.shields.io/badge/Whisper-ASR-412991?style=for-the-badge&logo=openai&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)

**Automated Thai profanity detection and audio censorship system for video content**

*CPE Exploration Project — KMUTT Computer Engineering · Project Group I04*

---

</div>

## 📌 Overview

**Thai Video Censor** is a full-stack web application that automatically detects profanity in Thai-language videos and censors only the audio at detected timestamps — without affecting the rest of the video. Users can upload, review, edit, and download censored videos through a clean web interface.

> Manual profanity detection is time-consuming, expensive, and error-prone. This system automates the entire pipeline using AI — from speech recognition to selective audio censorship.

---

## 🎯 Objectives

- Automatically detect profanity in Thai-language videos using AI
- Censor audio **only** during detected time periods without affecting other parts
- Allow users to review, edit timestamps, and download the censored output

---

## 🏗️ System Architecture

```
User / Browser
      │
      ▼ Upload Video
┌─────────────────┐          ┌──────────────────┐
│  Frontend       │◄────────►│  Backend         │
│  (Next.js)      │          │  (FastAPI)       │
└─────────────────┘          └────────┬─────────┘
                                      │
                          ┌───────────┼───────────┐
                          ▼           ▼           ▼
                      MongoDB    Local        Python
                      (jobs)     Storage      Worker
                                 (files)         │
                                           ┌─────┴──────┐
                                           │ AI Process │
                                           │ (AI/FFmpeg)│
                                           └─────┬──────┘
                                                 │
                                    ┌────────────▼────────────┐
                                    │   Hybrid Detection       │
                                    │                          │
                                    │  Exact → Dictionary      │
                                    │  Typo  → Fuzzy Match     │
                                    │  Context → GPT-4o        │
                                    └────────────┬────────────┘
                                                 │
                                         Generate Beep 🔇
                                                 │
                                         Censored Video Output
```

---

## ⚙️ Detection Pipeline

| Stage | Tool | Description |
|---|---|---|
| **1. Pre-processing** | Audio Normalization | Normalize audio levels for consistent ASR input |
| **2. AI Recognition** | OpenAI Whisper | Speech-to-text transcription with timestamps |
| **3. Hybrid Detection** | Dictionary + Fuzzy + GPT-4o | Three-layer profanity checking |
| **4. Enforcement** | FFmpeg + Pydub | Replace detected segments with beep sound |

### Three-Layer Detection
- **Exact Match** — Direct lookup against Thai profanity dictionary
- **Fuzzy Match** — Catches typos and phonetic variations using fuzzy matching
- **Context Analysis** — GPT-4o for context-aware edge cases

---

## 🛠️ Tech Stack

**Frontend**
- Next.js + TypeScript
- Tailwind CSS
- Deployed on Vercel

**Backend**
- FastAPI (Python)
- MongoDB Atlas — job queue & status tracking
- FFmpeg + Pydub — audio processing
- OpenAI Whisper — Thai speech recognition
- GPT-4o — context analysis

---

## 📁 Project Structure

```
thai-video-censor/
├── frontend/           # Next.js web application
│   ├── app/
│   ├── components/
│   └── ...
├── backend/            # FastAPI server + Python worker
│   ├── main.py
│   ├── worker.py       # Background AI processing
│   ├── detector.py     # Hybrid profanity detection
│   └── requirements.txt
└── package-lock.json
```

---

## ✨ Key Results

- ✅ Automated detection of profanity in Thai-language videos
- ✅ Accurate timestamp-based audio censorship
- ✅ Original video quality preserved — only profane segments censored
- ✅ User review & editing interface for manual adjustments
- ✅ Reduced manual moderation workload significantly

---

## 🚀 Getting Started

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

> Requires: MongoDB Atlas connection string + OpenAI API key in `.env`

---

## 👥 Team — Project Group I04

| Name | Student ID |
|---|---|
| **Varakron Vimolgarnjana** | 68070503452 |
| Sirapobe Parinyarat | 68070503483 |
| Wilasinee Sornwilai | 68070503454 |
| Supakrit Kositwiwat | 68070503491 |

*TA: Alom, Martin, Posh*

---

<div align="center">
<sub>Built with 🤖 AI + ❤️ | KMUTT Computer Engineering · CPE Exploration Project · 2025</sub>
</div>
