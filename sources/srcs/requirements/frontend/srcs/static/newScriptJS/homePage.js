function profileDisplay() 
{
    window.history.pushState({}, "", URLs.VIEWS.PROFILE);
    handleLocation();
    displayFriend();
    displayWaitingListFriend();
}


function refreshHomePage()
{
    window.history.pushState({}, "", URLs.VIEWS.HOME);
    handleLocation();
}


async function addFriend()
{
    
    const usernameAddFriend = document.getElementById("usernameAddFriend");
    const usernameAddValue = usernameAddFriend.value;
    
    console.log('add friend: ', usernameAddValue);
    if (usernameAddValue === '') {
        alert('Please enter a username');
        return ;
    }
    const response = await makeRequest('POST', URLs.USERMANAGEMENT.ADDFRIEND, {username: usernameAddValue})
    console.log(" ALORS RESPONSE ???", response);
}