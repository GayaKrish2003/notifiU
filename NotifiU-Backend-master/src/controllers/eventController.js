const Event = require('../models/Event');
const mongoose = require('mongoose');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const eventData = req.body;
        // Parse date and time to proper Date objects for cron-job use
        if (eventData.date && eventData.time) {
            let properDateStr = eventData.date;
            if (properDateStr.includes('T')) properDateStr = properDateStr.split('T')[0]; // Handle if it's already ISO string
            const dateTimeString = `${properDateStr}T${eventData.time}:00`;
            eventData.startTime = new Date(dateTimeString);
            eventData.endTime = new Date(eventData.startTime.getTime() + 2 * 60 * 60000); // 2 hours duration default
        }

        const event = new Event(eventData);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all events with optional filtering
exports.getEvents = async (req, res) => {
    try {
        const { category, organizingClub, role, status } = req.query;
        const query = {};
        if (category) query.category = category;
        if (organizingClub) query.organizingClub = organizingClub;

        // RBAC filtering simulation
        if (status) {
            query.status = status;
        } else if (role === 'student' || role === 'Student') {
            query.status = 'Upcoming'; // students mostly see upcoming by default
        }

        const events = await Event.find(query).sort({ date: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Event ID format' });
        }
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    try {
        const eventData = req.body;
        if (eventData.date && eventData.time) {
            let properDateStr = eventData.date;
            if (properDateStr.includes('T')) properDateStr = properDateStr.split('T')[0];
            const dateTimeString = `${properDateStr}T${eventData.time}:00`;
            eventData.startTime = new Date(dateTimeString);
            eventData.endTime = new Date(eventData.startTime.getTime() + 2 * 60 * 60000);
        }

        const event = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// RSVP for an event
exports.rsvpEvent = async (req, res) => {
    try {
        const { name, studentId, contactNumber } = req.body;

        if (!studentId || !contactNumber) {
            return res.status(400).json({ message: 'Student ID and Contact Number are required' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if student already RSVP'd
        const alreadyRsvped = event.rsvpList.some(rsvp => rsvp.studentId === studentId);
        if (alreadyRsvped) {
            return res.status(400).json({ message: 'Student already registered for this event' });
        }

        // Check seat limit (0 = unlimited)
        if (event.seatLimit > 0 && event.rsvpList.length >= event.seatLimit) {
            return res.status(400).json({ message: `Sorry, this event is fully booked! (${event.seatLimit} seats maximum)` });
        }

        event.rsvpList.push({ name, studentId, contactNumber, rsvpTime: new Date() });
        await event.save();
        res.status(200).json({ message: 'RSVP Successful', event });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get Notifications specifically for Student
exports.getNotifications = async (req, res) => {
    try {
        const { studentId } = req.query;
        if (!studentId) {
            return res.status(200).json([]);
        }

        const now = new Date();
        const notifications = [];

        // Find upcoming events they RSVP'd to
        const upcomingEvents = await Event.find({
            status: 'Upcoming',
            'rsvpList.studentId': studentId
        });

        upcomingEvents.forEach(event => {
            if (event.startTime) {
                const timeDiff = event.startTime.getTime() - now.getTime();
                const diffMins = Math.floor(timeDiff / 60000);

                if (diffMins > 5 && diffMins <= 15) {
                    notifications.push({
                        eventId: event._id,
                        title: event.title,
                        message: `Event "${event.title}" is starting in ${diffMins} minutes!`,
                        type: 'reminder'
                    });
                } else if (diffMins >= -15 && diffMins <= 5) {
                    const hasAttended = event.attendanceList.some(att => String(att.studentId) === String(studentId));
                    let displayMsg = diffMins > 0 
                        ? `Event "${event.title}" starts in ${diffMins} mins. Are you participating?`
                        : `Event "${event.title}" has started. Did you participate?`;
                    notifications.push({
                        eventId: event._id,
                        title: event.title,
                        message: displayMsg,
                        type: 'attendance',
                        hasAttended
                    });
                }
            }
        });

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark Attendance
exports.markAttendance = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Event ID format' });
        }

        const { studentId } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Check if student RSVP'd
        const hasRsvped = event.rsvpList.some(r => String(r.studentId) === String(studentId));
        if (!hasRsvped) {
            return res.status(400).json({ message: "Only users who RSVP'd can mark attendance" });
        }

        // Enforce Time Window
        if (event.startTime && event.endTime) {
            const now = new Date();
            const windowStart = new Date(event.startTime.getTime() - 15 * 60000); // 15 mins before
            // Can mark attendance anytime during the event, up to 15 mins after it effectively started or ended depending on requirements.
            // Requirement specified: "not active right now"
            if (now < windowStart || now > event.endTime) {
                return res.status(400).json({ message: 'Attendance tracking is not active right now' });
            }
        }

        const alreadyAttended = event.attendanceList.some(a => String(a.studentId) === String(studentId));
        if (!alreadyAttended) {
            event.attendanceList.push({ studentId });
            await event.save();
        }
        res.status(200).json({ message: 'Attendance marked successfully', event });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
