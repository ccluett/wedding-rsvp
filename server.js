require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname)); // Serve static files from the main directory

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define the RSVP schema
const rsvpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  attending: { type: Boolean, required: true },
  guests: { type: Number, required: true, min: 0 },
});

const RSVP = mongoose.model('RSVP', rsvpSchema);

// Serve the rsvp.html for the '/rsvp' route
app.get('/rsvp', (req, res) => {
  res.sendFile(path.join(__dirname, 'rsvp.html'));
});

// Serve the info.html for the '/info' route
app.get('/info', (req, res) => {
  res.sendFile(path.join(__dirname, 'info.html'));
});


// Access code validation
const validCodes = ['pip', 'Pip', 'PIP']; // 

app.post('/api/check-code', (req, res) => {
    const enteredCode = req.body.code;
    if (validCodes.includes(enteredCode)) {
        res.sendStatus(200); // OK
    } else {
        res.sendStatus(401); // Unauthorized
    }
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
