import * as firebase from "firebase/app";
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut, UserCredential } from "firebase/auth";
import configData from '../config.json';

firebase.initializeApp({
    apiKey : configData.FIREBASE.apiKey,
    authDomain : configData.FIREBASE.authDomain,
    projectId : configData.FIREBASE.projectID,
    storageBucket : configData.FIREBASE.storageBucket,
    messagingSenderId : configData.FIREBASE.messageSenderId,
    appId : configData.FIREBASE.appId,
    measurementId : configData.FIREBASE.measurementId
  })

export const authent = getAuth();


const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle: () => Promise<UserCredential> = async () => {
    const res: UserCredential = await signInWithPopup(authent, googleProvider);
    return res;
}

export const signOutGoogle = async() => {
    signOut(authent).then (() => {

    }).catch((error) => {

    })
}