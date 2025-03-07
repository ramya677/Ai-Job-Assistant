const API_BASE_URL = "http://localhost:8082";

// ✅ Fetch jobs and display them
async function fetchJobs() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/jobs`);
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const jobs = await response.json();

        const jobContainer = document.getElementById("job-list");
        jobContainer.innerHTML = ""; // Clear previous jobs

        jobs.forEach(job => {
            const jobCard = document.createElement("div");
            jobCard.className = "job-card";

            jobCard.innerHTML = `
                <h3>${job["Title"] || "No Title"}</h3>
                <p><strong>${job["Company"] || "Unknown Company"}</strong></p>
                <p>${job["Location"] || "Unknown Location"}</p>
            `;

            jobContainer.appendChild(jobCard);
        });

    } catch (error) {
        console.error("Error fetching jobs:", error);
        document.getElementById("job-list").innerText = "Error loading jobs.";
    }
}

// ✅ Filter Jobs
function filterJobs() {
    let searchQuery = document.getElementById("search").value.toLowerCase();
    let jobCards = document.getElementsByClassName("job-card");

    Array.from(jobCards).forEach(card => {
        let title = card.getElementsByTagName("h3")[0].innerText.toLowerCase();
        let company = card.getElementsByTagName("p")[0].innerText.toLowerCase();
        let location = card.getElementsByTagName("p")[1].innerText.toLowerCase();

        if (title.includes(searchQuery) || company.includes(searchQuery) || location.includes(searchQuery)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

//