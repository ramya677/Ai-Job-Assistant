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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Load Jobs from CSV
let jobs = [];
fs.createReadStream('public/demo_search.csv')
  .pipe(csv())
  .on('data', (row) => {
    jobs.push({
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
    console.log('✅ Job data loaded successfully.');
  });

// ✅ API to Get Jobs
app.get('/api/jobs', (req, res) => {
    res.json(jobs);
});

// ✅ API to Ask Gemini AI
app.post('/api/ai', async (req, res) => {
    try {
        const { message } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(message);
        const response = result.response.text();
        
        res.json({ message: response });
    } catch (error) {
        console.error('❌ Error with Gemini AI:', error);
        res.status(500).json({ message: 'AI is not responding.' });
    }
});

// ✅ Serve `index.html`
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
