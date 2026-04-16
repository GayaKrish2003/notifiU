import express from 'express';
import { getFAQCategories, createFAQCategory, updateFAQCategory, deleteFAQCategory, getFAQs, getFAQsGroupedByCategory, getFAQById, createFAQ, updateFAQ, deleteFAQ } from '../controllers/faqsController.js';

const router = express.Router();

router.get("/faqs/categories", getFAQCategories);
router.post("/faqs/categories", createFAQCategory);
router.put("/faqs/categories/:id", updateFAQCategory);
router.delete("/faqs/categories/:id", deleteFAQCategory);

router.get("/faqs", getFAQs);
router.get("/faqs/grouped", getFAQsGroupedByCategory);
router.get("/faqs/:id", getFAQById);
router.post("/faqs", createFAQ);
router.put("/faqs/:id", updateFAQ);
router.delete("/faqs/:id", deleteFAQ);

export default router;