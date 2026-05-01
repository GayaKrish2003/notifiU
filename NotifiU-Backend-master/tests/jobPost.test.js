

// ── Mock the models BEFORE importing the controller ──────────────────────────
// This tells Jest: whenever the controller tries to require
// '../models/jobPost', give it our fake version instead

jest.mock('../src/models/jobPost');
jest.mock('../src/models/User');

const JobPost = require('../src/models/jobPost');
const User = require('../src/models/User');
const {
    createJobPost,
    getMyJobPosts,
    approveJobPost,
    rejectJobPost,
    deleteJobPost,
} = require('../src/controllers/jobPostController');

// ── Helper: make a fake req and res object ─────────────────────────────────
// Your controllers expect (req, res) — we fake both here
function mockReqRes(body = {}, params = {}, user = {}) {
    const req = {
        body,
        params,
        user,
        query: {},
    };
    const res = {
        status: jest.fn().mockReturnThis(), // allows chaining: res.status(201).json(...)
        json: jest.fn(),
    };
    return { req, res };
}

// ── Reset all mocks before each test ──────────────────────────────────────
beforeEach(() => {
    jest.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════
//  createJobPost
// ═══════════════════════════════════════════════════════════════

describe('createJobPost', () => {

    it('should create a job post and return 201', async () => {
        // Arrange — set up fake input data
        const { req, res } = mockReqRes(
            {
                title: 'Frontend Intern',
                description: 'React developer role',
                companyName: 'TechCorp',
                jobType: 'internship',
                location: 'Colombo',
                skills: ['React', 'Node.js'],
                salaryRange: 'LKR 50,000',
                applicationLink: 'https://techcorp.com/apply',
                deadline: '2026-12-31',
            },
            {},
            { _id: 'provider123' } // fake logged-in user
        );

        // Arrange — fake what JobPost.create() returns
        const fakePost = { _id: 'post123', title: 'Frontend Intern', status: 'pending' };
        JobPost.create = jest.fn().mockResolvedValue(fakePost);

        // Act — call the controller function
        await createJobPost(req, res);

        // Assert — check what the controller responded with
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                data: fakePost,
            })
        );
    });

    it('should return 500 if database throws an error', async () => {
        const { req, res } = mockReqRes(
            { title: 'Test Job', applicationLink: 'https://test.com', deadline: '2026-12-31' },
            {},
            { _id: 'provider123' }
        );

        // Make the database throw an error
        JobPost.create = jest.fn().mockRejectedValue(new Error('Database error'));

        await createJobPost(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

});

// ═══════════════════════════════════════════════════════════════
//  getMyJobPosts
// ═══════════════════════════════════════════════════════════════

describe('getMyJobPosts', () => {

    it('should return the logged-in provider posts with 200', async () => {
        const { req, res } = mockReqRes({}, {}, { _id: 'provider123' });

        const fakePosts = [
            { _id: 'post1', title: 'Job A', status: 'pending' },
            { _id: 'post2', title: 'Job B', status: 'approved' },
        ];

        // JobPost.find() returns a query object with .sort() on it
        // so we need to mock the chain: find().sort()
        JobPost.find = jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakePosts),
        });

        await getMyJobPosts(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                count: 2,
                data: fakePosts,
            })
        );
    });

});

// ═══════════════════════════════════════════════════════════════
//  approveJobPost
// ═══════════════════════════════════════════════════════════════

describe('approveJobPost', () => {

    it('should approve a job post and return 200', async () => {
        const { req, res } = mockReqRes({}, { id: 'post123' });

        const fakeUpdatedPost = { _id: 'post123', status: 'approved' };
        JobPost.findByIdAndUpdate = jest.fn().mockResolvedValue(fakeUpdatedPost);

        await approveJobPost(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    it('should return 404 if job post not found', async () => {
        const { req, res } = mockReqRes({}, { id: 'nonexistent' });

        // Return null to simulate post not found
        JobPost.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

        await approveJobPost(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

});

// ═══════════════════════════════════════════════════════════════
//  rejectJobPost
// ═══════════════════════════════════════════════════════════════

describe('rejectJobPost', () => {

    it('should reject a post with a reason and return 200', async () => {
        const { req, res } = mockReqRes(
            { rejectionReason: 'Missing contact info' },
            { id: 'post123' }
        );

        const fakePost = { _id: 'post123', status: 'rejected', rejectionReason: 'Missing contact info' };
        JobPost.findByIdAndUpdate = jest.fn().mockResolvedValue(fakePost);

        await rejectJobPost(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: true })
        );
    });

    it('should return 400 if no rejection reason is provided', async () => {
        // No rejectionReason in body
        const { req, res } = mockReqRes({}, { id: 'post123' });

        await rejectJobPost(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

});

// ═══════════════════════════════════════════════════════════════
//  deleteJobPost
// ═══════════════════════════════════════════════════════════════

describe('deleteJobPost', () => {

    it('should delete the post if the provider owns it', async () => {
        const { req, res } = mockReqRes(
            {},
            { id: 'post123' },
            { _id: 'provider123' }
        );

        const fakePost = {
            _id: 'post123',
            postedBy: 'provider123', // matches req.user._id
            deleteOne: jest.fn().mockResolvedValue({}),
        };
        JobPost.findById = jest.fn().mockResolvedValue(fakePost);

        await deleteJobPost(req, res);

        expect(fakePost.deleteOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 403 if provider does not own the post', async () => {
        const { req, res } = mockReqRes(
            {},
            { id: 'post123' },
            { _id: 'differentProvider' } // different from postedBy
        );

        const fakePost = {
            _id: 'post123',
            postedBy: 'provider123', // does NOT match req.user._id
            deleteOne: jest.fn(),
        };
        JobPost.findById = jest.fn().mockResolvedValue(fakePost);

        await deleteJobPost(req, res);

        expect(fakePost.deleteOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if post does not exist', async () => {
        const { req, res } = mockReqRes({}, { id: 'nonexistent' }, { _id: 'provider123' });

        JobPost.findById = jest.fn().mockResolvedValue(null);

        await deleteJobPost(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

});