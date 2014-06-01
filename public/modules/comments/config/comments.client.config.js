'use strict';

// Configuring the Comments module
angular.module('comments').run(['Menus',
    function(Menus) {
        // Set top bar menu items
        Menus.addMenuItem('topbar', 'Comments', 'comments');
        Menus.addMenuItem('topbar', 'New Comment', 'comments/create');
    }
]);