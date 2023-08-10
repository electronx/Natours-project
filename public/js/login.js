/* eslint-disable*/
import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    console.log(res);
    if (res.status === 205) {
      showAlert('success', 'Login Successful, Welcome!');
      window.setTimeout(() => {
        location.assign('/');
      }, 0);
    }

    if (res.data.status === 'success') {
      showAlert('success', 'Please Enter the QR code');
      window.setTimeout(() => {
        location.assign('/qrcode');
      }, 0);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) location.assign('/');
  } catch (err) {
    showAlert('error', 'Error logging out! Try again');
  }
};
