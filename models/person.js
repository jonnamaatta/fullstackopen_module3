const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: '.env' })
mongoose.set('strictQuery', false)
const url = process.env.MONGODB_URI
console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: [3, 'Name must be at least 3 characters long'],
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Regular expression to validate the phone number format
        return /^(\d{2,3})-(\d{5,10})$/.test(v)
      },
      message: props => `${props.value} is not a valid phone number! It must be in the format XX-XXXXXXXXX or XXX-XXXXXXXXX.`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)