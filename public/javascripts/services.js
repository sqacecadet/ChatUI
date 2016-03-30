'use strict';

/** chatModel service, provides chat rooms (could as well be loaded from server) */
angular.module('sseChat.services', []).service('chatModel', function () {
    var getRooms = function () {
        return [ {name: 'Room 1', value: 'room1'}];
    };
    return { getRooms: getRooms };
});