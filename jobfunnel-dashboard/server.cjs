const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const PORT = 8082;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// ✅ Load Gemini AI
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(API_KEY);

// ✅ Load Jobs from CSV
let jobs = [];
const loadJobs = () => {
    return new Promise((resolve, reject) => {
        let jobData = [];
        fs.createReadStream('public/demo_search.csv')
            .pipe(csv())
            .on('data', (row) => {
                jobData.push({
                    title: row.title || "N/A",
                    company: row.company || "N/A",
                    location: row.location || "N/A",
                    date: row.date || "N/A",
                    description: row.blurb || "No description available",
                    tags: row.tags || "N/A",
                    apply_link: row.link || "#"
                });
            })
            .on('end', () => {
                jobs = jobData;
                console.log(`✅ Loaded ${jobs.length} job(s) successfully.`);
                resolve();
            })
            .on('error', (error) => {
                console.error("❌ Error loading CSV:", error);
                reject(error);
            });
    });
};

// ✅ API to Get Jobs
app.get('/api/jobs', async (req, res) => {
    if (jobs.length === 0) {
        await loadJobs(); // Ensure jobs are loaded before responding
    }
    res.json(jobs);
});

// ✅ API to Ask Gemini AI
app.post('/api/ai', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "❌ Message is required for AI processing." });
        }

        // Load Gemini AI Model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Correct model name
        const chat = model.startChat();

        const result = await chat.sendMessage(message);
        const responseText = result.response.text(); // Extract AI response correctly

        res.json({ message: responseText });

    } catch (error) {
        console.error('❌ AI Request Failed:', error.message);
        res.status(500).json({ message: '❌ AI is not responding. Check API key, model, and internet connection.' });
    }
});

// ✅ Serve `index.html`
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ✅ Start Server
app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    await loadJobs(); // Load jobs at server startup
});
