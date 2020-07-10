/**
 *
 */
async function getUsername() {
  const user = {
    name: mainTableBlock.dataset.username || (await isLoggedIn()).name,
  };

  return user.name;
}
