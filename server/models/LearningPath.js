const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['Elementary/Primary Level', 'Middle School Level', 'High School Level', 'Undergraduate/Tertiary Level', 'Postgraduate Level', 'Professional/Continuing Education']
  },
  pace: {
    type: String,
    required: true,
    enum: ['self-paced', 'intensive', 'casual']
  },
  goals: [{
    type: String,
    required: true
  }],
  resources: [{
    type: {
      type: String,
      required: true,
      enum: ['video', 'article', 'course']
    },
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  progress: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LearningPath', learningPathSchema);