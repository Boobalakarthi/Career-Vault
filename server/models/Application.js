import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Applied', 'Interview', 'Review', 'Accepted', 'Rejected', 'Closed'], default: 'Applied' },
    appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Application = mongoose.model('Application', applicationSchema);
