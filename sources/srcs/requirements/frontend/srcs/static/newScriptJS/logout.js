
async function logout()
{
   await makeRequest('GET', URLs.USERNAME.LOGOUT);
}