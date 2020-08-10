/**
 * Check whether current session is under logged in user.
 */
async function isLoggedIn() {
  const response = await fetch('/is-logged-in', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 200) {
    return response.json();
  }

  return { name: false };
}

export default isLoggedIn;
