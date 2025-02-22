const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    default: 'Untitled Document'
  },
  content: {
    type: String,
    required: false,
    default: ''
  }
});

module.exports = mongoose.model('Document', documentSchema);
