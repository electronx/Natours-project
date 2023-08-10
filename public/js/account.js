import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatePassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if ((res.data.status = 'success')) {
      showAlert('success', `${type.toUpperCase()} Updated Successfully!`);
      window.setTimeout(() => {
        location.reload(true);
      }, 0);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

// export const updatePassword = async (
//   password,
//   newPassword,
//   passwordConfirm
// ) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://127.0.0.1:3000/api/v1/users/updatePassword',
//       data: {
//         password,
//         newPassword,
//         passwordConfirm,
//       },
//     });
//     if ((res.data.status = 'success')) {
//       showAlert('success', 'Password Updated Successfully!');
//       window.setTimeout(() => {
//         location.reload(true);
//       }, 0);
//     }
//   } catch (err) {
//     if (err.response.data.message)
//       showAlert('error', err.response.data.message);
//     showAlert('error', err.response.data.message);
//   }
// };
