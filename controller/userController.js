const User = require('../model/user');

async function signup(req, res) {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(200).send('Signup successful');
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).send('Internal Server Error');
  }
}

async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await authenticate(username, password);

    if (user) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
}

async function getAllUsers(req, res) {
  try {
    const allUsers = await User.find({}, 'username');
    const userNames = allUsers.map((user) => user.username);
    res.json(userNames);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).send('Internal Server Error');
  }
}

function authenticate(username, password) {
  return User.findOne({ username, password });
}

module.exports = {
  signup,
  login,
  getAllUsers,
};
