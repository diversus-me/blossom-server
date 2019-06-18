import { checkSchema, validationResult } from 'express-validator/check'
import { Op } from 'sequelize'

export function createUser (app, models, checkAuth, checkAdmin) {
  app.post('/api/user', checkAuth, checkAdmin, checkSchema({
    name: {
      isString: {
        errorMessage: 'Name is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Name is empty'
      }
    },
    email: {
      isEmail: true,
      errorMessage: 'Invalid Email'
    }
  }), async (req, res) => {
    try {
      const { name, email } = req.body

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array())
      }

      const userFound = await models.User.findOne({
        where: {
          [Op.or]: [
            { name },
            { email }
          ]
        }
      })

      if (userFound) {
        return res.status(409).send('User already exists')
      }

      const [user, created] = await models.User.findOrCreate({
        where: {
          name,
          email,
          role: 'user'
        },
        defaults: {
          joined: new Date()
        }
      })
      if (!created) {
        return res.status(409).send('User already exists')
      }
      return res.status(201).send('Created User')
    } catch (error) {
      return res.status(500).send('')
    }
  })
}

export function deleteUser (app, models, checkAuth, checkAdmin) {
  app.delete('/api/user', checkAuth, checkAdmin, checkSchema({
    email: {
      isEmail: true,
      errorMessage: 'Invalid Email'
    }
  }), async (req, res) => {
    try {
      const { email } = req.body

      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array())
      }

      const user = await models.User.findOne({
        where: {
          email
        }
      })

      if (!user) {
        return res.status(404).send('User does not exists')
      }

      if (user.get('role') === 'admin') {
        return res.status(403).send('You can not delete admins')
      }

      const rowDeleted = await models.User.destroy({
        where: {
          email
        }
      })

      if (rowDeleted <= 0) {
        return res.status(409).send('User could not be deleted')
      }
      return res.status(200).send('Deleted User')
    } catch (error) {
      console.log(error)
      return res.status(500).send('')
    }
  })
}

export function getUsers (app, models, checkAuth, checkAdmin) {
  app.get('/api/users', checkAuth, checkAdmin, async (req, res) => {
    try {
      const users = await models.User.findAll({
        attributes: [ 'id', 'name', 'email', 'role' ]
      })

      if (!users) {
        return res.status(500).send('Users not found')
      }

      return res.status(200).send(users)
    } catch (error) {
      return res.status(500).send('')
    }
  })
}
