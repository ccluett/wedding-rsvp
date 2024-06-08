const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/weddingRSVP')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define the RSVP schema
const rsvpSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    attending: { type: Boolean, required: true },
    guests: { type: Number, required: true, min: 1 },
});

const RSVP = mongoose.model('RSVP', rsvpSchema);

// Serve the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle RSVP form submissions (with logging)
app.post('/api/rsvp', (req, res) => {
    console.log('Received RSVP data:', req.body); 

    const rsvp = new RSVP(req.body);
    rsvp.save()
        .then(() => {
            console.log('RSVP saved successfully!'); 
            res.status(200).send('RSVP received!');
        })
        .catch(err => {
            console.error('Error saving RSVP:', err); 
            if (err.name === 'ValidationError') {
                return res.status(400).send(err.message); 
            }
            res.status(500).send('Error submitting RSVP'); 
        });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
