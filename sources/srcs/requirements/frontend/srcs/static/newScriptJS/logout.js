
async function logout()
{
   await makeRequest('GET', URLs.USERNAME.LOGOUT);
}

function applyAnimationLogoutButton(isHovered) 
{
   if (isHovered) 
   {
      ELEMENTs.logoutButton().style.animation = 'openDoor 0.5s ease-in-out forwards';
      setTimeout(() => {
         ELEMENTs.logoutButton().style.animationPlayState = 'paused';
      }, 490);
   } 
   else 
   {
      // ici faire animation inverse
      console.log('animation inverse');
      ELEMENTs.logoutButton().style.animation = 'none';
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