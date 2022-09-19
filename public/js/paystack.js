import axios from 'axios';

export const bookTour = async (tourId) => {
  // 1. Get checkout session from API
  const {
    data: { session },
  } = await axios(
    `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
  );

  location.href = session;
};

// 2. Create checkout form + change credit card
