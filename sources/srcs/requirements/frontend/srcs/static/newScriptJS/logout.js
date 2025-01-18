
async function logout_views()
{
	const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
	await makeRequest('POST', URLs.USERMANAGEMENT.LOGOUT, user);
	window.sessionStorage.clear();
	clear_jwt();
	await replace_location(URLs.VIEWS.LOGIN_VIEW);
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
      // ici faire animation inverse
      console.log('animation inverse');
      ELEMENTs.logoutButton().style.animation = 'closeDoor 0.1s ease-in-out forwards';
      setTimeout(() => {
         ELEMENTs.logoutButton().style.animation = 'none';
      }, 90);
   }
}

 // Mouse enter event (hover starts)
ELEMENTs.logoutDoor().addEventListener('mouseenter', function() 
{
   const isHovered = true;
   applyAnimationLogoutButton(isHovered);
});

 // Mouse leave event (hover ends)
ELEMENTs.logoutDoor().addEventListener('mouseleave', function() 
{
   const isHovered = false;
   applyAnimationLogoutButton(isHovered); 
});