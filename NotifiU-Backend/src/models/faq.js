import mongoose from "mongoose";

const faqCategorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
});

const faqSchema = new mongoose.Schema(
    {
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FAQCategory',
            required: [true, 'Category is required'],
        },
        question: {
            type: String,
            required: [true, 'Question is required'],
            trim: true,
        },
        answer: {
            type: String,
            required: [true, 'Answer is required'],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);
// Fast fetch of all FAQs in a given category
faqSchema.index({ category_id: 1 });

// Full-text index to support the ?search= query param
faqSchema.index({ question: 'text', answer: 'text' });

const FAQCategory = mongoose.model('FAQCategory', faqCategorySchema);
const FAQ = mongoose.model('FAQ', faqSchema);

export default { FAQ, FAQCategory };