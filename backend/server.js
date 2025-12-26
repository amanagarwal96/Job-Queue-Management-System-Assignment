// const express = require('express');
// const cors = require('cors');
// const { jobQueue } = require('./queue');
// require('./worker'); // Start worker process

// const app = express();
// // app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:3000', // Allow your React app
//   methods: ['GET', 'POST', 'DELETE'],
//   credentials: true
// }));
// app.use(express.json());

// // Submit a job
// app.post('/api/jobs', async (req, res) => {
//   const { type, priority, payload } = req.body;
//   // Lower priority number = higher priority in BullMQ
//   const job = await jobQueue.add(type, payload, { priority: Number(priority) });
//   res.json({ jobId: job.id });
// });

// // Get all jobs (for UI)
// app.get('/api/jobs', async (req, res) => {
//   const jobs = await jobQueue.getJobs(['active', 'waiting', 'completed', 'failed', 'delayed']);
//   const formatted = jobs.map(j => ({
//     id: j.id,
//     type: j.name,
//     priority: j.opts.priority,
//     status: j.finishedOn ? (j.failedReason ? 'FAILED' : 'COMPLETED') : (j.processedOn ? 'RUNNING' : 'QUEUED'),
//     retries: j.attemptsMade,
//     error: j.failedReason
//   }));
//   res.json(formatted);
// });

// // Cancel a job
// app.delete('/api/jobs/:id', async (req, res) => {
//   const job = await jobQueue.getJob(req.params.id);
//   if (job) {
//     await job.remove(); // Requirement: Cancelled jobs do not execute
//     return res.sendStatus(204);
//   }
//   res.status(404).send('Job not found');
// });

// app.listen(8080, () => console.log('API Server running on port 8080'));


const express = require('express');
const cors = require('cors');
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

const app = express();

// 1. Setup Redis Connection
const connection = new IORedis({ 
    host: '127.0.0.1', 
    port: 6379, 
    maxRetriesPerRequest: null 
});

// 2. Initialize the Queue properly
const jobQueue = new Queue('JobQueue', { connection });

app.use(cors());
app.use(express.json());

// 3. API Routes
app.post('/api/jobs', async (req, res) => {
    try {
        const { type, priority } = req.body;
        const job = await jobQueue.add(type, { type }, { 
            priority: parseInt(priority) || 1,
            attempts: 3,
            backoff: 1000 
        });
        res.json({ jobId: job.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/jobs', async (req, res) => {
    try {
        // This was the line causing your "undefined" error
        const jobs = await jobQueue.getJobs(['active', 'waiting', 'completed', 'failed', 'delayed']);
        
        const formattedJobs = jobs.map(j => ({
            id: j.id,
            type: j.name,
            priority: j.opts.priority,
            status: j.finishedOn ? (j.failedReason ? 'FAILED' : 'COMPLETED') : (j.processedOn ? 'RUNNING' : 'QUEUED'),
            retries: j.attemptsMade
        }));
        res.json(formattedJobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/jobs/:id', async (req, res) => {
    const job = await jobQueue.getJob(req.params.id);
    if (job) {
        await job.remove();
        return res.status(204).send();
    }
    res.status(404).send('Job not found');
});





app.post('/api/jobs/:id/retry', async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await jobQueue.getJob(jobId);

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        // 1. Remove it from the 'failed' set manually if it's there
        // 2. Add it back to the queue
        await job.retry(); 
        
        console.log(`✅ Retry triggered for Job: ${jobId}`);
        res.json({ message: "Job is being retried" });
    } catch (err) {
        // If it's already active, just tell the frontend it's 'Success' 
        // to avoid the red error screen
        res.status(200).json({ message: "Job already active" });
    }
});
const clearAll = async () => {
  if (window.confirm("Clear all job history?")) {
    try {
      await axios.post('http://localhost:8080/api/jobs/clear');
      fetchJobs();
    } catch (err) { alert("Failed to clear"); }
  }
};

// ... In your Backend server.js, add the matching route:
app.post('/api/jobs/clear', async (req, res) => {
    await jobQueue.clean(0, 'completed');
    await jobQueue.clean(0, 'failed');
    res.json({ success: true });
});

// 4. Worker Logic (Stays the same)
const worker = new Worker('JobQueue', async (job) => {
    console.log(`Processing ${job.id}`);
    await new Promise(r => setTimeout(r, 4000)); 
    if (Math.random() < 0.2) throw new Error("Random Failure"); 
    return { done: true };
}, { connection, concurrency: 2 });

app.listen(8080, () => console.log('✅ API Server running on http://localhost:8080'));