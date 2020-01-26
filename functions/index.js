'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

async function updateUserClaimByEmail(email) {
    try {
        const userRecord = await admin.auth().getUserByEmail(email)
        updateUserClaim(userRecord.uid, email)
    } catch(err) {
        if (err.code == "auth/user-not-found") {
            // if user does not exist, then we return with no error
            console.log(`user ${email} has not yet signed up. Not creating claims.`)
        } else {
            console.log(`unexpected error in updating claims for user ${email}`)
            throw err
        }
    }
}

async function updateUserClaim(uid, email) {
    // default claims if user is not in authorizedUsers
    let claims = {
        isGuest: false,
        isFamily: false,
        isSiteAdmin: false,
        isFamilyAdmin: false
    }

    // get user details from authorizedUsers if it exists
    let authUserRef = await db.collection('authorizedUsers').doc(email).get()

    // User is authorized, so at least guest privileges should be granted
    if (authUserRef.exists) {
        let authUser = authuser.data()

        if (au.isFamily) {
            claims.isFamily = true;
        } else {
            claims.isGuest = true;
        }

        if (au.isSiteAdmin) {
            claims.isSiteAdmin = true;
        }

    } 

    await admin.auth().setCustomUserClaims(uid,claims)
    console.log(`Updating user claims for ${email}: isGuest: ${claims.isGuest}, isFamily: ${claims.isFamily}, isSiteAdmin: ${claims.isSiteAdmin}`)
}

exports.onUserCreate = functions.auth.user().onCreate(async (user) => {    
    if (user.email) {
        await updateUserClaim(user.uid, user.email)
    }
});

exports.addOrUpdateAuthorizedUser = functions.https.onCall(async (data, context) => {
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

    try {
        const authorizedRef = db.collection('authorizedUsers').doc(authuser.email);

        await authorizedRef.set({
            isFamily: isFamily, 
            isFamilyAdmin: isFamilyAdmin,
            isSiteAdmin: isSiteAdmin
        })

        await updateUserClaimByEmail(authuser.email)
    } catch(err) {
        throw new functions.https.HttpsError('internal', `Unexpected error adding authorized user ${err.message}`)
    }
})