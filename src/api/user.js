import { checkSchema, validationResult } from 'express-validator/check'
import { Op } from 'sequelize'

export function createUser(app, models, checkAuth, checkAdmin) {
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
        },
        role: {
            isString: true,
            errorMessage: 'Invalid Role'
        }
    }), (req, res) => {
        const { name, email, role } = req.body

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array())
        } else {
            models.User.findOne({
                where: {
                    [Op.or]: [
                        {name},
                        {email}
                    ]
                }
            }).then((user) => {
                if(!user) {
                    models.User.findOrCreate({
                        where: {
                            name,
                            email,
                            role,
                        },
                        defaults: {
                            joined: new Date()
                        }
                    }).then(([user, created]) => {
                        if (created) {
                            return res.status(201).send('Created User')
                        } else {
                            return res.status(409).send('User already exists')
                        }
                    })
                } else {
                    return res.status(409).send('User already exists')
                }
            })
        }
      })
}

export function deleteUser(app, models, checkAuth, checkAdmin) {
    app.delete('/api/user', checkAuth, checkAdmin, checkSchema({
        email: {
           isEmail: true,
           errorMessage: 'Invalid Email' 
        }
    }), (req, res) => {
        const { email } = req.query

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array())
        } else {
            models.User.findOne({
                where: {
                    email
                }
            }).then((user) => {
                if(user) {
                    models.User.destroy({
                        where: {
                            email
                        }
                    }).then((rowDeleted) => {
                        if (rowDeleted >= 1) {
                            return res.status(200).send('Deleted User')
                        } else {
                            return res.status(409).send('User could not be deleted')
                        }
                    })
                } else {
                    return res.status(404).send('User does not exists')
                }
            })
        }
      })
}