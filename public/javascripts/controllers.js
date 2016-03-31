'use strict';

/** Controllers */
angular.module('sseChat.controllers', ['sseChat.services']).controller('ChatCtrl', function ($scope, $http, chatModel, auth, store, $location) {

        $scope.rooms = chatModel.getRooms();
        $scope.msgs = [];
        $scope.inputText = "";
        /**$scope.user = "Anderson " + Math.floor((Math.random() * 100) + 1);*/
        $scope.user = [0];
        $scope.currentRoom = $scope.rooms[0];
        $scope.userList = $scope.user[0];

        $scope.login = function () {
            auth.signin({}, function (profile, token) {
                // Success callback
                store.set('profile', profile);
                store.set('token', token);
                $location.path('/');
                $scope.user = profile.name;
                $scope.userList = [profile.name];

            }, function () {
                // Error callback
            });
        };

        $scope.logout = function () {
            auth.signout();
            store.remove('profile');
            store.remove('token');
        };

        /** change current room, restart EventSource connection */
        $scope.setCurrentRoom = function (room) {
            $scope.currentRoom = room;
            $scope.chatFeed.close();
            $scope.msgs = [];
            $scope.listen();
        };

        /** posting chat text to server */
        $scope.submitMsg = function () {
            $http.post("/chat", {
                text: $scope.inputText,
                user: $scope.user,
                time: (new Date()).toUTCString(), room: $scope.currentRoom.value
            });

            $scope.inputText = "";
        };

    $scope.submitUser = function () {
        $http.post("/chat", {
            username: $scope.user,
            time: (new Date()).toUTCString(), room: $scope.currentRoom.value
        });
    };

        /** handle incoming messages: add to messages array */
        $scope.addMsg = function (msg) {
            $scope.$apply(function () {
                $scope.msgs.push(JSON.parse(msg.data));
            });
        };

    /** adiciona o usuario no array*/
    $scope.addUser = function (user) {
        $scope.$apply(function () {
            $scope.userList.push(JSON.parse(user.name));
        });
    };

       /* start listening on messages from selected room */
        $scope.listen = function () {
            $scope.chatFeed = new EventSource("/chatFeed/" + $scope.currentRoom.value);
            $scope.chatFeed.addEventListener("message", $scope.addMsg, false);
            $scope.chatFeed.addEventListener("user", $scope.addUser, false);
        };

    function UserInfoCtrl($scope, auth) {
        $scope.auth = auth;
    }
});