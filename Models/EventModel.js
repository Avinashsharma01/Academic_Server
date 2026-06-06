import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const eventSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: ['Workshop', 'Conference', 'Webinar', 'Seminar', 'Meetup', 'Other'],
        default: 'Other',
    },
    date: {
        type: Date,
        required: [true, 'Event date is required'],
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
    },
    location: {
        city: {
            type: String,
            required: [true, 'City is required'],
        },
        state: String,
        country: String,
        address: String,
        zipCode: String,
    },
    description: {
        type: String,
        required: [true, 'Event description is required'],
    },
    image: {
        type: String, // URL to event image
    },
    organizer: {
        name: String,
        contactEmail: String,
        contactPhone: String,
    },
    registrationUrl: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

eventSchema.virtual('isPast').get(function () {
    return new Date(this.date) < new Date();
});

eventSchema.virtual('isUpcoming').get(function () {
    return new Date(this.date) >= new Date();
});

eventSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Event = model('Event', eventSchema);

export default Event;
