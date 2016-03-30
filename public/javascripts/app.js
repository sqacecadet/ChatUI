'use strict';

/** app level module which depends on services and controllers
angular.module('sseChat', ['sseChat.services', 'sseChat.controllers']);*/


// app.js
angular.module('sseChat', ['sseChat.services', 'sseChat.controllers', 'auth0', 'angular-storage', 'angular-jwt'])
    .config(function (authProvider) {
        authProvider.init({
            domain: 'sqacecadetchat.auth0.com',
            clientID: 'cQfqsTrCJnOMvSNY1xRxKAnUxomuX4Mi'
        });
    })

    .run(function($rootScope, auth, store, jwtHelper, $location) {
            // This events gets triggered on refresh or URL change
            $rootScope.$on('$locationChangeStart', function() {
                var token = store.get('token');
                if (token) {
                    if (!jwtHelper.isTokenExpired(token)) {
                        if (!auth.isAuthenticated) {
                            auth.authenticate(store.get('profile'), token);
                        }
                    } else {
                        // Either show the login page or use the refresh token to get a new idToken
                        $location.path('/');
                    }
                }
            });
       });


