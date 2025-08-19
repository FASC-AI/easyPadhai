import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';

class GoogleSignInHelper {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    // Use the Web client ID from the current Firebase project (interpreted as serverClientId on Android)
    clientId: '118683520531-geo4fv6ss8u2rhpm5e54k6vbfqb6vfsd.apps.googleusercontent.com',
  );

  Future<User?> signInWithGoogle() async {
    try {
      print('Debug: Starting Google Sign-In process...');
      
      final GoogleSignInAccount? googleSignInAccount =
          await _googleSignIn.signIn();
      
      if (googleSignInAccount == null) {
        print('Debug: User cancelled Google Sign-In');
        return null;
      }
      
      print('Debug: Google Sign-In account obtained: ${googleSignInAccount.email}');
      
      final GoogleSignInAuthentication googleSignInAuthentication =
          await googleSignInAccount.authentication;

      print('Debug: Authentication tokens obtained');

      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleSignInAuthentication.accessToken,
        idToken: googleSignInAuthentication.idToken,
      );

      print('Debug: Credential created, signing in with Firebase...');

      final UserCredential authResult =
          await _firebaseAuth.signInWithCredential(credential);
      final User? user = authResult.user;

      print('Debug: Firebase sign-in successful: ${user?.email}');
      return user;
    } catch (e) {
      if (kDebugMode) {
        print('Google Sign-In Error: $e');
        print('Error type: ${e.runtimeType}');
      }
      return null;
    }
  }

  Future<void> signOutGoogle() async {
    await _googleSignIn.signOut();
  }
}
