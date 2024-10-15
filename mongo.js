const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://jonnamaatta:${password}@phonebook.wwwep.mongodb.net/?retryWrites=true&w=majority&appName=Phonebook`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
  id: generateId(),
  name: process.argv[3],
  number: process.argv[4]
})

function generateId() {
  return Math.floor(Math.random() * 10000000).toString()
}

person.save().then(result => {
  console.log(`added ${result.name} number ${result.number} to phonebook`)
  mongoose.connection.close()
})