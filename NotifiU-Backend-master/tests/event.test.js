const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const Event = require('../src/models/Event');

// Improved Mocking: Make the Event mock act like a constructor that returns its data
jest.mock('../src/models/Event', () => {
    const mongoose = require('mongoose'); // Move this inside to avoid hoisting error
    return jest.fn().mockImplementation((data) => {
        const id = data._id || new mongoose.Types.ObjectId().toString();
        return {
            ...data,
            _id: id,
            save: jest.fn().mockResolvedValue({
                ...data,
                _id: id
            }),
            // Express calls toJSON/toObject during res.json()
            toJSON: () => ({
                ...data,
                _id: id
            }),
            toObject: () => ({
                ...data,
                _id: id
            })
        };
    });
});

describe('Event Management Integration Tests', () => {
    let mockEvent;

    beforeEach(() => {
        jest.clearAllMocks();
        mockEvent = {
            title: 'Tech Workshop',
            description: 'Learn MERN stack',
            date: '2026-05-20',
            time: '10:00',
            location: 'Hall A',
            organizingClub: 'IT Club',
            category: 'Workshop',
            seatLimit: 50,
            status: 'Upcoming',
            rsvpList: [],
            attendanceList: [],
            startTime: new Date('2026-05-20T10:00:00'),
            endTime: new Date('2026-05-20T12:00:00')
        };
    });

    // TC-NU-EV-001 to 003: Create Event
    describe('POST /api/events', () => {
        it('TC-NU-EV-001: Should create a new event with valid data', async () => {
            const res = await request(app)
                .post('/api/events')
                .send(mockEvent);

            expect(res.status).toBe(201);
            expect(res.body.title).toBe(mockEvent.title);
        });

        it('TC-NU-EV-002: Should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/events')
                .send({ title: 'Incomplete Event' });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required fields');
        });

        it('TC-NU-EV-003: Should verify correct club association', async () => {
            const res = await request(app)
                .post('/api/events')
                .send(mockEvent);
            
            expect(res.body.organizingClub).toBe('IT Club');
        });
    });

    // TC-NU-EV-004 to 005: Fetch Events
    describe('GET /api/events', () => {
        it('TC-NU-EV-004: Should fetch all events with filtering', async () => {
            Event.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue([mockEvent])
            });

            const res = await request(app).get('/api/events?category=Workshop');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('TC-NU-EV-005: Should fetch a single event by ID', async () => {
            Event.findById = jest.fn().mockResolvedValue(mockEvent);

            const res = await request(app).get('/api/events/' + new mongoose.Types.ObjectId());
            expect(res.status).toBe(200);
            expect(res.body.title).toBe(mockEvent.title);
        });
    });

    // TC-NU-EV-006 to 007: Update and Delete
    describe('Update and Delete Event', () => {
        it('TC-NU-EV-006: Should update an event with valid data', async () => {
            Event.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockEvent, title: 'Updated Title' });

            const res = await request(app)
                .put('/api/events/' + new mongoose.Types.ObjectId())
                .send({ title: 'Updated Title' });

            expect(res.status).toBe(200);
            expect(res.body.title).toBe('Updated Title');
        });

        it('TC-NU-EV-007: Should delete an event (Authorized)', async () => {
            Event.findByIdAndDelete = jest.fn().mockResolvedValue(mockEvent);

            const res = await request(app).delete('/api/events/' + new mongoose.Types.ObjectId());
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('deleted');
        });
    });

    // TC-NU-EV-008 to 009: RSVP
    describe('POST /api/events/:id/rsvp', () => {
        it('TC-NU-EV-008: Should allow a student to RSVP', async () => {
            Event.findById = jest.fn().mockResolvedValue({
                ...mockEvent,
                rsvpList: [],
                save: jest.fn().mockResolvedValue(true)
            });

            const res = await request(app)
                .post('/api/events/' + new mongoose.Types.ObjectId() + '/rsvp')
                .send({ studentId: 'ST123', contactNumber: '0771234567', name: 'John' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('RSVP Successful');
        });

        it('TC-NU-EV-009: Should prevent duplicate RSVP', async () => {
            Event.findById = jest.fn().mockResolvedValue({
                ...mockEvent,
                rsvpList: [{ studentId: 'ST123' }]
            });

            const res = await request(app)
                .post('/api/events/' + new mongoose.Types.ObjectId() + '/rsvp')
                .send({ studentId: 'ST123', contactNumber: '0771234567' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Student already registered for this event');
        });
    });

    // TC-NU-EV-010 to 013: Attendance
    describe('POST /api/events/:id/attendance', () => {
        it('TC-NU-EV-010: Should mark attendance within the valid window', async () => {
            const now = new Date();
            Event.findById = jest.fn().mockResolvedValue({
                ...mockEvent,
                startTime: new Date(now.getTime() - 5 * 60000), // started 5 mins ago
                endTime: new Date(now.getTime() + 2 * 60 * 60000),
                rsvpList: [{ studentId: 'ST123' }],
                attendanceList: [],
                save: jest.fn().mockResolvedValue(true)
            });

            const res = await request(app)
                .post('/api/events/' + new mongoose.Types.ObjectId() + '/attendance')
                .send({ studentId: 'ST123' });

            expect(res.status).toBe(200);
        });

        it('TC-NU-EV-011: Should reject attendance if student not RSVPd', async () => {
            Event.findById = jest.fn().mockResolvedValue({
                ...mockEvent,
                rsvpList: []
            });

            const res = await request(app)
                .post('/api/events/' + new mongoose.Types.ObjectId() + '/attendance')
                .send({ studentId: 'ST999' });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('Only users who RSVP\'d');
        });

        it('TC-NU-EV-012: Should reject attendance outside time window', async () => {
            const wayFuture = new Date('2030-01-01');
            Event.findById = jest.fn().mockResolvedValue({
                ...mockEvent,
                startTime: wayFuture,
                endTime: new Date(wayFuture.getTime() + 2 * 60 * 60000),
                rsvpList: [{ studentId: 'ST123' }]
            });

            const res = await request(app)
                .post('/api/events/' + new mongoose.Types.ObjectId() + '/attendance')
                .send({ studentId: 'ST123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Attendance tracking is not active right now');
        });

        it('TC-NU-EV-013: Should prevent duplicate attendance', async () => {
            const now = new Date();
            Event.findById = jest.fn().mockResolvedValue({
                ...mockEvent,
                startTime: now,
                endTime: new Date(now.getTime() + 2 * 60 * 60000),
                rsvpList: [{ studentId: 'ST123' }],
                attendanceList: [{ studentId: 'ST123' }],
                save: jest.fn().mockResolvedValue(true)
            });

            const res = await request(app)
                .post('/api/events/' + new mongoose.Types.ObjectId() + '/attendance')
                .send({ studentId: 'ST123' });

            expect(res.status).toBe(200);
        });
    });

    // TC-NU-EV-014: Notifications
    describe('GET /api/events/user/notifications', () => {
        it('TC-NU-EV-014: Should generate reminders (5-15 mins before) and attendance prompts', async () => {
            const comingSoon = new Date(Date.now() + 10 * 60000); // 10 mins from now
            Event.find = jest.fn().mockResolvedValue([{
                ...mockEvent,
                startTime: comingSoon,
                rsvpList: [{ studentId: 'ST123' }]
            }]);

            const res = await request(app).get('/api/events/user/notifications?studentId=ST123');
            expect(res.status).toBe(200);
            expect(res.body[0].type).toBe('reminder');
        });
    });

    // TC-NU-EV-015: Invalid ID
    describe('Invalid ID Validation', () => {
        it('TC-NU-EV-015: Should return 400 for invalid Mongoose ObjectId', async () => {
            const res = await request(app).get('/api/events/invalid-id-123');
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid Event ID format');
        });
    });
});
