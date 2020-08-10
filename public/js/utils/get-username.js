/**
 * Get username of logged in person.
 */
async function getUsername() {
  const user = {
    name: mainTableBlock.dataset.username || (await isLoggedIn()).name,
  };

  return user.name;
}

export default getUsername;
