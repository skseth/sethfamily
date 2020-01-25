// signup
const authUserForm = document.querySelector('#authuser-form');
authUserForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = authUserForm['authuser-email'].value;
  const isFamily = authUserForm['authuser-isfamily'].checked
  const isSiteAdmin = authUserForm['authuser-issiteadmin'].checked
  const isGuest = !isFamily;

  const authuser = {
    email: email,
    isFamily: isFamily,
    isGuest: isGuest,
    isSiteAdmin: isSiteAdmin,
    isFamilyAdmin: false
  }

  console.log(authuser)

  const addAuthUser = functions.httpsCallable('addOrUpdateAuthorizedUser')

  addAuthUser(authuser).then(() => {
    console.log(`success adding user ${authuser.email}`);
    const modal = document.querySelector('#modal-authuser');
    M.Modal.getInstance(modal).close();
    authUserForm.reset();  
  }).catch(err => {
    console.log(`error adding user ${authuser.email}: ${err}`);  
  });

});
