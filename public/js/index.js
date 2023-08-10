import '@babel/polyfill';
import { updateSettings } from '/account';
import { login } from './login';
import { logout } from './login';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { showAlert } from './alert';
import { signup } from './signup';
import { qrVerify } from './qrVeritfy';
import { qrEnable } from './qrEnable';
import { qrEmail } from './qrEmail';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logOutBtn = document.querySelector('.nav__el--logout');
const saveSettingsForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
const qrVerifyForm = document.querySelector('.form--verify');
const qrEnableForm = document.querySelector('.form--qrenable');
const lostQrBtn = document.getElementById('lostqr');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const tourId = e.target.dataset.tourId;
    bookTour(tourId);
  });

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'UPDATING...';
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { password, newPassword, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';
  });
}

if (saveSettingsForm) {
  saveSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (qrVerifyForm) {
  qrVerifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const qrtoken = document.getElementById('verifyqr').value;
    qrVerify(qrtoken);
  });
}

if (qrEnableForm) {
  qrEnableForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let mode = document.getElementById('enabledisable').innerHTML;

    const qrtoken = document.getElementById('verifyqr').value;
    qrEnable(mode, qrtoken);
  });
}

if (lostQrBtn)
  lostQrBtn.addEventListener('click', (e) => {
    e.preventDefault();
    qrEmail();
  });

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
