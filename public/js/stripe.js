import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51L9nX9Fh7gKayaj5Bp2mtZ7WP42M3PtMm2FvGTXKxycv9VrM6E63kgwYNmcRD9AfyFGyedko1ps9bwAhN69fJdy4007kAlau86'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from endpoint
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/checkout-session/${tourId}`,
    });

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
