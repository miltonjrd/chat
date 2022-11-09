const jwt = require('jsonwebtoken');

export = async (token: string) => {

  if (!token) return false;

  const user = jwt.verify(token, process.env.JWT_SECRET as string, (err:any, user:any) => user);

  return user;
};