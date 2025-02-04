async function closeWebSocket() {
   console.log('WebSocket déconnecté', ONE_SOCKET);
   if (ONE_SOCKET) {
      ONE_SOCKET.close();
     console.log('WebSocket déconnecté');
   }
 }



async function logout_views()
{
   try {
      const user = await makeRequest('GET', URLs.USERMANAGEMENT.GETUSER);
      const response = await makeRequest('POST', URLs.USERMANAGEMENT.LOGOUT, user);
      if (response.status === 'success') {
         await closeWebSocket();
         window.sessionStorage.clear();
         clear_jwt();
         await replace_location(URLs.VIEWS.LOGIN_VIEW);
      } else {
         console.error('Échec de la déconnexion:', response.message);
      }
   } catch (error) {
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

ELEMENTs.logoutDoor().addEventListener('mouseenter', function() 
{
   applyAnimationLogoutButton(true);
});

ELEMENTs.logoutDoor().addEventListener('mouseleave', function() 
{
   applyAnimationLogoutButton(false); 
});