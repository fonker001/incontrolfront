export function logout() {
  // Clear localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('admin_email');
  localStorage.removeItem('admin_info');
  localStorage.removeItem('cart');
  
  // Clear session storage
  sessionStorage.clear();
  
  // Redirect to login
  window.location.href = '/login';
}

{/*
  
  The logout function clears all authentication and session data from
   localStorage and sessionStorage,
  then redirects the user to the login page.
*/}