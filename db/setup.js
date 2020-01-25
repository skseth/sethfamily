const admin = require('firebase-admin');
const functions = require('firebase-functions')

var serviceAccount = require("../family-aca65-c10581c09e5f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

class LoginProfile {
  constructor(shortName, email, displayName) {
    this.shortName = shortName
    this.email = email
    this.displayName = displayName
    this.isSiteAdmin = false
  }

  setSiteAdmin(isSiteAdmin) {
    this.isSiteAdmin = isSiteAdmin
  }
}

function listAllUsers(nextPageToken) {
  // List batch of users, 1000 at a time.
  admin.auth().listUsers(1000, nextPageToken)
    .then(function(listUsersResult) {
      listUsersResult.users.forEach(function(userRecord) {
        console.log('user', userRecord.toJSON());
      });
      if (listUsersResult.pageToken) {
        // List next batch of users.
        listAllUsers(listUsersResult.pageToken);
      }
    })
    .catch(function(error) {
      console.log('Error listing users:', error);
    });
}
// Start listing users from the beginning, 1000 at a time.

function listSpecificUser(email) {
  // List batch of users, 1000 at a time.
  admin.auth().getUserByEmail(email)
  .then(function(userRecord) {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully fetched user data:', userRecord.toJSON());
  })
  .catch(function(error) {
   console.log('Error fetching user data:', error);
  });
}

function makeUserSiteAdminDirect(email) {
  admin.auth().getUserByEmail(email)
  .then(u => {
    console.log(u.toJSON())
    admin.auth().setCustomUserClaims(u.uid, {siteAdmin: true})
    .then(p => u)
  })
  .then(u => admin.auth().getUserByEmail(u.uid))
  .then(ur => console.log(ur.toJSON()))
  .catch(function(error) {
   console.log('Error fetching user data:', error);
  });
}

function makeUserSiteAdmin(email) {
  console.log(functions)
  const addSiteAdminRole = functions.httpsCallable('addSiteAdminRole');

  addSiteAdminRole({email: email}).then(result => {
    console.log(result)
  })

}

listSpecificUser('ishliseth@gmail.com')
//listSpecificUser('sethvikas@gmail.com')
//listSpecificUser('samirkseth@gmail.com')
//listSpecificUser('ishliseth@gmail.com')