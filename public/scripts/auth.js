// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // sign up the user
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    console.log(cred.user);
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
  }).catch(err => {
    console.log(err)
  });
});

const contentDiv = document.querySelector('#timeline');

const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    console.log('user is logged out')
  })
})

const loginForm = document.querySelector('#login-form');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // login the user
  auth.signInWithEmailAndPassword(email, password).then(cred => {
    console.log(cred.user)
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  }).catch(err => {
    console.log(err)
  });
});

auth.onAuthStateChanged(user => {
  toggleLoggedInOutLinks(user)

  if (user) {
    console.log(`AuthStateChanged: ${user.email}`)
    user.getIdTokenResult().then(token => {
      console.log(token.claims)
    })
    contentDiv.style.display = "block"
    show('anniv')
  } else {
    contentDiv.style.display = "none"
  }
})