import '@babel/polyfill';
import axios from 'axios';
import { showAlert } from './alert';

export const qrEnable = async (mode, qrtoken) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/qrEnable',
      data: {
        mode,
        qrtoken,
      },
    });
    console.log(res.data.message);
    if (res.data.message === 'disabled') {
      showAlert('success', 'Two Factor Auth Disabled!');
      window.setTimeout(() => {
        location.reload();
      }, 0);
    } else if (res.data.message === 'activated') {
      showAlert('success', 'Two Factor Auth Activated!');
      window.setTimeout(() => {
        location.reload();
      }, 0);
    } else if (res.data.status === 'success') {
      showAlert('success', 'Two Factor Auth Enabled!');
      window.setTimeout(() => {
        location.reload();
      }, 0);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
