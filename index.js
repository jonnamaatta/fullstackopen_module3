const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('body', function (req) {
  return JSON.stringify(req.body) || 'null'
})

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('dist'))


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).send({ error: 'Person not found' })
      }
      response.json(person)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(result => response.json(result))
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then(result => {
      response.send(`<p>Phonebook has info for ${result.length} people</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing',
    })
  }

  Person.findOne({ name: body.name })
    .then(existingEntry => {
      if (existingEntry) {
        return response.status(409).json({
          error: 'name must be unique',
        })
      }

      const person = new Person({
        name: body.name,
        number: body.number,
      })

      return person.save().then(savedPerson => {
        response.json(savedPerson)
      })
    })
    .catch(error => next(error)) // Pass any errors to the error handler
})


app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'name or number is missing' })
  }

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    const errorMessages = Object.values(error.errors).map(e => e.message)
    const defaultErrorMessage = error.message
    return response.status(400).json({
      error: defaultErrorMessage,
      messages: errorMessages
    })
  }

  return response.status(500).json({ error: error.message || 'An unexpected error occurred' })
}

app.use((request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
