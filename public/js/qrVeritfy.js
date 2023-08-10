import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

export const qrVerify = async (qrtoken) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/verify',
      data: {
        qrtoken,
      },
    });

    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 0);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
