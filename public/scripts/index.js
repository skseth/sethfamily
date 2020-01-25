const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')

const toggleLoggedInOutLinks = (user) => {
  const loggedInStyle = user ? "block" : "none"
  const loggedOutStyle = user ? "none" : "block"
  loggedInLinks.forEach(item => item.style.display=loggedInStyle)
  loggedOutLinks.forEach(item => item.style.display=loggedOutStyle)
}

// setup materialize components
document.addEventListener('DOMContentLoaded', function() {

  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);

});

