'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

function updateUserClaimByEmail(email) {
    return admin.auth().getUserByEmail(email)
        .then(function(userRecord) {
            return updateUserClaim(userRecord.uid, email)
        }).catch(err => {
            if (err.code == "auth/user-not-found") {
                console.log(`user ${email} has not yet signed up. Not creating claims.`)
            }
        })
}

function updateUserClaim(uid, email) {
    let authorizedRef = db.collection('authorizedUsers').doc(email);

    let claims = {
        isGuest: false,
        isFamily: false,
        isSiteAdmin: false,
        isFamilyAdmin: false
    }


    return authorizedRef.get().then(authuser => {
        if (authuser.exists) {
            console.log(`Updating user claims for ${email}: User exists.`)
            let au = authuser.data()

            if (au.isFamily) {
                claims.isFamily = true;
            } else {
                claims.isGuest = true;
            }

            if (au.isSiteAdmin) {
                claims.isSiteAdmin = true;
            }
        } else {
            console.log(`Updating user claims for ${email}: User does not exist.`)
        }

        return admin.auth().setCustomUserClaims(uid,claims).then(() => {
            console.log(`Updating user claims for ${email}: isGuest: ${claims.isGuest}, isFamily: ${claims.isFamily}, isSiteAdmin: ${claims.isSiteAdmin}`)
        })
    }).catch(err => {
        console.log(`Updating user claims for ${email}: error ${err}`)
    })
}

exports.onUserCreate = functions.auth.user().onCreate((user) => {    
    if (user.email) {
        updateUserClaim(user.uid, user.email)
    }
});


exports.addOrUpdateAuthorizedUser = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'user is not authenticated')
    }

    if (!context.auth.token.isSiteAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'user is not a site admin')
    }

    const authuser = data;

    if (!authuser.email) {
        throw new functions.https.HttpsError('invalid-argument', 'user email must be provided')
    }

    console.log(`ready to add authorized user ${authuser.email}`)

    const {isFamily = false, isSiteAdmin = false, isFamilyAdmin = false} = authuser;

    let authorizedRef = db.collection('authorizedUsers').doc(authuser.email);

    return authorizedRef.set({
        isFamily: isFamily, 
        isFamilyAdmin: isFamilyAdmin,
        isSiteAdmin: isSiteAdmin
    })
    .then(() => updateUserClaimByEmail(authuser.email))
    .catch(err => {
        throw new functions.https.HttpsError('internal', `unexpected error adding authorized user ${err.message}`)
    });

})