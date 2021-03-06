import * as Yup from 'yup';

export default {
  initialState: {
    email: '',
    username: '',
    password: '',
  },
  validSchema: Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    username: Yup.string()
      .min(2, 'Too Short!')
      .max(50, 'Too Long!')
      .required('Nickname is required'),
    password: Yup.string().min(6, 'Too Short!').required('Password is required'),
  }),
};
