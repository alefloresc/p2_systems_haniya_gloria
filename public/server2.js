// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-connection-string';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// Mongoose Schemas
const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  color: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  notes: String,
  date: { type: String, required: true }
});

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  transport: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  position: {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 300 }
  },
  activities: [activitySchema]
});

const tripSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cities: [citySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Trip = mongoose.model('Trip', tripSchema);

// ==================== ROUTES ====================

// Get all trips
app.get('/api/trips', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ updatedAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single trip by ID
app.get('/api/trips/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new trip
app.post('/api/trips', async (req, res) => {
  try {
    const newTrip = new Trip(req.body);
    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update trip
app.put('/api/trips/:id', async (req, res) => {
  try {
    req.body.updatedAt = new Date();
    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json(updatedTrip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete trip
app.delete('/api/trips/:id', async (req, res) => {
  try {
    const deletedTrip = await Trip.findByIdAndDelete(req.params.id);
    if (!deletedTrip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    res.json({ message: 'Trip deleted successfully', trip: deletedTrip });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add city to trip
app.post('/api/trips/:id/cities', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    trip.cities.push(req.body);
    trip.updatedAt = new Date();
    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update city in trip
app.put('/api/trips/:tripId/cities/:cityId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    const city = trip.cities.id(req.params.cityId);
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    Object.assign(city, req.body);
    trip.updatedAt = new Date();
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete city from trip
app.delete('/api/trips/:tripId/cities/:cityId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    trip.cities.id(req.params.cityId).remove();
    trip.updatedAt = new Date();
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add activity to city
app.post('/api/trips/:tripId/cities/:cityId/activities', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    const city = trip.cities.id(req.params.cityId);
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    city.activities.push(req.body);
    trip.updatedAt = new Date();
    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update activity
app.put('/api/trips/:tripId/cities/:cityId/activities/:activityId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    const city = trip.cities.id(req.params.cityId);
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    const activity = city.activities.id(req.params.activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    Object.assign(activity, req.body);
    trip.updatedAt = new Date();
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete activity
app.delete('/api/trips/:tripId/cities/:cityId/activities/:activityId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    const city = trip.cities.id(req.params.cityId);
    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }
    city.activities.id(req.params.activityId).remove();
    trip.updatedAt = new Date();
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/app', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});