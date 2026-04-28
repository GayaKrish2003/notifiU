const request  = require('supertest');
const mongoose = require('mongoose');
const app      = require('../src/server');


jest.mock('../src/middlewares/authMiddleware', () => ({
    protect: (req, _res, next) => {
        req.user = {
            _id: new (require('mongoose').Types.ObjectId)(),
            id:  new (require('mongoose').Types.ObjectId)().toString(),
            role: 'superadmin',
            accountStatus: 'active',
        };
        next();
    },
    authorize: () => (_req, _res, next) => next(),
}));


jest.mock('../src/middlewares/roleMiddleware', () =>
    (..._roles) => (_req, _res, next) => next()
);


jest.mock('../src/middlewares/uploadAnnouncementMiddleware', () => ({
    array: () => (req, _res, next) => { req.files = []; next(); },
}));


jest.mock('../src/utils/r2Storage', () => ({
    uploadBufferToR2:  jest.fn().mockResolvedValue('https://cdn.example.com/file.pdf'),
    deleteObjectFromR2: jest.fn().mockResolvedValue(true),
}));


jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            startChat: jest.fn().mockReturnValue({
                sendMessage: jest.fn().mockResolvedValue({
                    response: {
                        text: jest.fn().mockReturnValue(
                            'You can raise a support ticket from the Help & Support section in the portal.'
                        ),
                    },
                }),
            }),
        }),
    })),
}));


jest.mock('../src/models/announcement', () => {
    const mongoose = require('mongoose');

    const MockAnnouncement = jest.fn().mockImplementation((data) => {
        const id = new mongoose.Types.ObjectId();
        return {
            ...data,
            _id: id,
            attachments: [],
            save: jest.fn().mockResolvedValue({ ...data, _id: id, attachments: [] }),
            deleteOne: jest.fn().mockResolvedValue(true),
            toJSON:   () => ({ ...data, _id: id, attachments: [] }),
            toObject: () => ({ ...data, _id: id, attachments: [] }),
        };
    });

    MockAnnouncement.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
    });
    MockAnnouncement.findById          = jest.fn().mockResolvedValue(null);
    MockAnnouncement.findByIdAndUpdate = jest.fn().mockResolvedValue(null);
    MockAnnouncement.findByIdAndDelete = jest.fn().mockResolvedValue(null);

    return MockAnnouncement;
});


jest.mock('../src/models/Notification', () => {
    const mongoose = require('mongoose');
    const Mock     = jest.fn();

    Mock.create = jest.fn().mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
    Mock.find   = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort:     jest.fn().mockReturnThis(),
        limit:    jest.fn().mockResolvedValue([]),
    });
    Mock.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    Mock.updateMany       = jest.fn().mockResolvedValue({ modifiedCount: 0 });

    return Mock;
});


jest.mock('../src/models/supportTicket', () => {
    const mongoose = require('mongoose');

    const MockSupportTicket = jest.fn().mockImplementation((data) => {
        const id = new mongoose.Types.ObjectId();
        return {
            ...data,
            _id: id,
            status: data.status || 'open',
            save: jest.fn().mockResolvedValue({ ...data, _id: id, status: data.status || 'open' }),
        };
    });

    MockSupportTicket.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
    });
    MockSupportTicket.findById          = jest.fn().mockResolvedValue(null);
    MockSupportTicket.findByIdAndDelete = jest.fn().mockResolvedValue(null);

    const MockTicketResponse = jest.fn().mockImplementation((data) => {
        const id = new mongoose.Types.ObjectId();
        return {
            ...data,
            _id: id,
            save: jest.fn().mockResolvedValue({ ...data, _id: id }),
        };
    });

    MockTicketResponse.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
    });
    MockTicketResponse.findById          = jest.fn().mockResolvedValue(null);
    MockTicketResponse.deleteMany        = jest.fn().mockResolvedValue(true);
    MockTicketResponse.findByIdAndDelete = jest.fn().mockResolvedValue(null);

    return { SupportTicket: MockSupportTicket, TicketResponse: MockTicketResponse };
});


describe('Announcement CRUD Tests', () => {
    let Announcement;

    beforeAll(() => {
        Announcement = require('../src/models/announcement');
    });

    beforeEach(() => jest.clearAllMocks());

    
    it('TC-NU-AN-001: Should create an announcement and return 201 with the saved document', async () => {
        const payload = {
            title:        'Mid-Semester Exam Schedule Released',
            content:      'Please check the portal for your timetable.',
            priority:     'high',
            status:       'published',
            publish_date: new Date().toISOString(),
        };

        const res = await request(app)
            .post('/api/announcements')
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('title', payload.title);
        expect(res.body).toHaveProperty('priority', payload.priority);
    });

    
    it('TC-NU-AN-002: Should fetch all announcements and return 200 with an array', async () => {
        const mockList = [
            { _id: new mongoose.Types.ObjectId(), title: 'Fee Deadline', status: 'published', priority: 'urgent' },
            { _id: new mongoose.Types.ObjectId(), title: 'Library Hours', status: 'published', priority: 'low'    },
        ];

        Announcement.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockList),
        });

        const res = await request(app).get('/api/announcements');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('title', 'Fee Deadline');
    });

   
    it('TC-NU-AN-003: Should update an announcement and return 200 with updated fields', async () => {
        const existingId = new mongoose.Types.ObjectId();
        const updated    = {
            _id:      existingId,
            title:    'Exam Schedule – Revised',
            content:  'New exam dates are now available.',
            priority: 'urgent',
            status:   'published',
        };

        Announcement.findByIdAndUpdate = jest.fn().mockResolvedValue(updated);

        const res = await request(app)
            .put(`/api/announcements/${existingId}`)
            .send({ title: 'Exam Schedule – Revised', priority: 'urgent' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('title',    'Exam Schedule – Revised');
        expect(res.body).toHaveProperty('priority', 'urgent');
    });

    
    it('TC-NU-AN-004: Should delete an announcement and return 200 with a success message', async () => {
        const existingId   = new mongoose.Types.ObjectId();
        const mockDocument = {
            _id:         existingId,
            title:       'Deleted Announcement',
            attachments: [],
            deleteOne:   jest.fn().mockResolvedValue(true),
        };

        Announcement.findById = jest.fn().mockResolvedValue(mockDocument);

        const res = await request(app).delete(`/api/announcements/${existingId}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Announcement deleted successfully');
    });
});


describe('Support Ticket Tests', () => {
    let SupportTicket;

    beforeAll(() => {
        ({ SupportTicket } = require('../src/models/supportTicket'));
    });

    beforeEach(() => jest.clearAllMocks());

    
    it('TC-NU-TK-001: Should create a support ticket and return 201 with status open', async () => {
        const payload = {
            subject:     'Cannot access Module CS301',
            description: 'The module does not appear in my enrolled courses list.',
            category:    'Technical',
        };

        const res = await request(app)
            .post('/api/tickets')
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('subject',  payload.subject);
        expect(res.body).toHaveProperty('status',   'open');
        expect(res.body).toHaveProperty('category', payload.category);
    });

   
    it('TC-NU-TK-002: Should return 400 when adding a response to a closed ticket', async () => {
        const closedId = new mongoose.Types.ObjectId();
        SupportTicket.findById = jest.fn().mockResolvedValue({
            _id:     closedId,
            status:  'closed',
            user_id: new mongoose.Types.ObjectId(),
        });

        const res = await request(app)
            .post(`/api/tickets/${closedId}/responses`)
            .send({ response_message: 'Tried updating but ticket is closed.' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Cannot respond to a closed ticket');
    });
});


describe('Announcement Notification Tests', () => {
    let Notification;

    beforeAll(() => {
        Notification = require('../src/models/Notification');
    });

    beforeEach(() => jest.clearAllMocks());

  
    it('TC-NU-NT-001: Should return 200 with a role-filtered notification list and correct isRead flag', async () => {
        const userId = new mongoose.Types.ObjectId();
        const mockNotifications = [
            {
                _id:            new mongoose.Types.ObjectId(),
                type:           'announcement',
                title:          'Fee Payment Deadline',
                message:        'Pay your semester fees before 30th April.',
                createdAt:      new Date(),
                readBy:         [],          // not yet read
                announcementId: null,
            },
        ];

        Notification.find = jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            sort:     jest.fn().mockReturnThis(),
            limit:    jest.fn().mockResolvedValue(mockNotifications),
        });

        const res = await request(app).get('/api/notifications');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('title',  'Fee Payment Deadline');
        expect(res.body[0]).toHaveProperty('isRead', false);
    });

    
    it('TC-NU-NT-002: Should mark all notifications as read and return 200 with success true', async () => {
        Notification.updateMany = jest.fn().mockResolvedValue({ modifiedCount: 3 });

        const res = await request(app).patch('/api/notifications/read-all');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(Notification.updateMany).toHaveBeenCalledTimes(1);
    });
});


describe('FAQ ChatBot Tests', () => {
    beforeEach(() => jest.clearAllMocks());

  
    it('TC-NU-FAQ-001: Should return 200 with a non-empty AI message for a valid university question', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({
                messages: [
                    { role: 'user', content: 'How do I raise a support ticket?' },
                ],
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
        expect(typeof res.body.message).toBe('string');
        expect(res.body.message.length).toBeGreaterThan(0);
    });


    it('TC-NU-FAQ-002: Should return 400 when the messages array is empty', async () => {
        const res = await request(app)
            .post('/api/chat')
            .send({ messages: [] });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'Messages array is required');
    });
});