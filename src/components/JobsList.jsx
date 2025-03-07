import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './JobsList.css'; // Import the CSS file

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [filterTerm, setFilterTerm] = useState('');
    const [filterColumn, setFilterColumn] = useState('all');
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/demo_search.csv');
            const reader = response.body.getReader();
            const result = await reader.read();
            const decoder = new TextDecoder('utf-8');
            const csvData = decoder.decode(result.value);

            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setJobs(results.data);
                    setFilteredJobs(results.data);
                    setColumns(results.meta.fields); // Extract column names
                },
            });
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Apply filter whenever jobs, filterTerm, or filterColumn changes
        let filtered = [...jobs]; // Start with a copy of all jobs

        if (filterTerm) {
            filtered = jobs.filter(job => {
                if (filterColumn === 'all') {
                    return Object.values(job).some(value =>
                        String(value).toLowerCase().includes(filterTerm.toLowerCase())
                    );
                } else {
                    const columnValue = job[filterColumn];
                    return columnValue && String(columnValue).toLowerCase().includes(filterTerm.toLowerCase());
                }
            });
        }

        setFilteredJobs(filtered);
    }, [jobs, filterTerm, filterColumn]);

    const handleFilterChange = (event) => {
        setFilterTerm(event.target.value);
    };

    const handleColumnChange = (event) => {
        setFilterColumn(event.target.value);
    };

    return (
        <div className="job-list-container">
            <div className="filter-options">
                <input
                    type="text"
                    placeholder="Filter jobs..."
                    value={filterTerm}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <select
                    value={filterColumn}
                    onChange={handleColumnChange}
                    className="filter-select"
                >
                    <option value="all">All Columns</option>
                    {columns.map(column => (
                        <option key={column} value={column}>{column}</option>
                    ))}
                </select>
            </div>
            <ul className="job-list">
                {filteredJobs.map((job, index) => (
                    <li key={index} className="job-item">
                        {Object.entries(job).map(([key, value]) => (
                            <p key={key}>
                                <strong>{key}:</strong> {value}
                            </p>
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default JobList;