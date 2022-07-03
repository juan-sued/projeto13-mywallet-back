import userSchema from '../schemas/userSchema.js';

// valida o login
async function validateUser(request, response, next) {
  const userRegister = request.body;
  const validate = userSchema.validate(userRegister, { abortEarly: false });
  const { error } = validate;

  if (error) {
    const errors = error.details.map(error => error.message);
    response.status(422).send(errors);
    return;
  }
  next();
}

export default validateUser;
