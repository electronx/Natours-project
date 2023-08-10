import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
     showAlert(
            'success',
            'You registed succesfully! Please check your email to activate your account',
            10
          );
      window.setTimeout(() => {
        location.assign('/');
      }, 5000);
    }
  } catch (err) {
    showAlert('fail', err.response.data.message);
  }
};
