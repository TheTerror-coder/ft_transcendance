
async function logout_views()
{
	try {
		const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
		const response = await makeRequest('POST', URLs.USERMANAGEMENT.LOGOUT, user);
		if (response.status === 'success') {
			window.sessionStorage.clear();
			window.localStorage.removeItem('jwt_access_token');
			window.localStorage.removeItem('jwt_refresh_token');
			await replace_location(URLs.VIEWS.LOGIN_VIEW);
		} else
			console.error('Échec de la déconnexion:', response.message);
	} 
	catch (error) {
		console.error('Erreur lors de la déconnexion:', error);
	}
}

function applyAnimationLogoutButton(isHovered) 
{
   if (isHovered) 
   {
      ELEMENTs.logoutButton().style.animation = 'openDoor 0.2s ease-in-out forwards';
      setTimeout(() => {
         ELEMENTs.logoutButton().style.animationPlayState = 'paused';
      }, 195);
   } 
   else 
   {
      ELEMENTs.logoutButton().style.animation = 'closeDoor 0.1s ease-in-out forwards';
      setTimeout(() => {
         ELEMENTs.logoutButton().style.animation = 'none';
      }, 90);
   }
}

 // Mouse enter event (hover starts)
ELEMENTs.logoutDoor().addEventListener('mouseenter', function() 
{
   applyAnimationLogoutButton(true);
});

 // Mouse leave event (hover ends)
ELEMENTs.logoutDoor().addEventListener('mouseleave', function() 
{
   applyAnimationLogoutButton(false); 
});