const bcrypt = require('bcrypt')

module.exports = [
  {
    username: 'admin',
    password: bcrypt.hashSync('pass', 10)
  },
  {
    username: 'sam123',
    password: bcrypt.hashSync('pass', 10)
  },
  {
    username: 'joebloggs',
    password: bcrypt.hashSync('pass', 10)
  }
]