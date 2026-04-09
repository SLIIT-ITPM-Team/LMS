const mongoose = require('mongoose');

const moduleSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
        },
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            required: true,
        },
        academicYear: {
            type: String,
            enum: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
            required: true,
        },
        academicSemester: {
            type: String,
            enum: ['1st Semester', '2nd Semester'],
            required: true,
        },
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;
