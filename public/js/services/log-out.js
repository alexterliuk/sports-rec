pickElem('logOut').addEventListener('click', async event => {
  event.preventDefault();

  const response = await fetch('http:/log-out', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 200) {
    $emit(response, logInPanel, 'log-out');
    mainTableBlock.dataset.username = '';
  }
});
