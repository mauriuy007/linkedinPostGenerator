export const login = async (req, res) => {
  const { username, password } = req.body;

  res.json({
    message: 'Login endpoint working',
    username,
  });
};

export const register = async (req, res) => {
  const { username, password } = req.body;

  res.json({
    message: 'Register endpoint working',
    username,
  });
};
