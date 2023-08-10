import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

export const qrEmail = async () => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/qrEmail',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Email sent!');
      window.setTimeout(() => {
        location.reload();
      }, 0);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
