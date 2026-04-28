const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.post('/', eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/user/notifications', eventController.getNotifications);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/:id/rsvp', eventController.rsvpEvent);
router.post('/:id/attendance', eventController.markAttendance);

module.exports = router;
