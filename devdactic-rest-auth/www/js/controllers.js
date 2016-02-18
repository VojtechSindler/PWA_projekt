angular.module('starter')
        .controller('LoginCtrl', ['$scope', 'AuthService', '$ionicPopup', '$state', function ($scope, AuthService, $ionicPopup, $state) {
                $scope.user = {
                    name: '',
                    password: ''
                };

                $scope.login = function () {

                    var user = $scope.user;
                    AuthService.login(user).then(function (msg) {
                        $state.go('inside');
                    }, function (errMsg) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Login failed!',
                            template: errMsg
                        });
                    });
                };
            }])

        .controller('RegisterCtrl', function ($scope, AuthService, $ionicPopup, $state) {
            $scope.user = {
                name: '',
                password: ''
            };

            $scope.signup = function () {
                AuthService.register($scope.user).then(function (msg) {
                    $state.go('outside.login');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Register success!',
                        template: msg
                    });
                }, function (errMsg) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Register failed!',
                        template: errMsg
                    });
                });
            };
        })

        .controller('InsideCtrl', function ($scope, AuthService, API_ENDPOINT, $http, $state) {
            $scope.isUserLogged = AuthService.isAuthenticated();
            $scope.getInfo = function () {
                $http.get(API_ENDPOINT.url + '/memberinfo').then(function (result) {
                    $scope.memberinfo = result.data.msg;
                    $scope.user = result.data.user;
                });
                $scope.threads = $http.get(API_ENDPOINT.url + '/threads').then(function (result) {
                    $scope.threads = result.data;
                    console.log($scope.threads);
                });
            };
            $scope.click = function (thread_id) {
                $state.go('thread', {thread_id: thread_id});
            };
            $scope.save = function (title, text, userId) {
                $scope.Data = {
                    _owner: userId,
                    title: title,
                    url: title,
                    text: text
                };
                $http.post(API_ENDPOINT.url + '/saveThread', $scope.Data).then(function (result) {
                });
                title = '';
                text = '';
                $scope.getInfo();
            };

            $scope.logout = function () {
                AuthService.logout();
                $state.go('outside.login');
            };
        })

        .controller('ThreadCrl', function ($scope, AuthService, API_ENDPOINT, $http, $state, $stateParams) {
            var thread_id = $stateParams;
            console.log(thread_id);
            $scope.isUserLogged = AuthService.isAuthenticated();
            $scope._thread = thread_id;
            $scope.logout = function () {
                AuthService.logout();
                $state.go('outside.login');
            };
            $scope.Back = function () {
                $scope.isUserLogged = AuthService.isAuthenticated();
                $state.go('inside');
            };

            $scope.getInfo = function () {
                $http.get(API_ENDPOINT.url + '/memberinfo').then(function (result) {
                    $scope.memberinfo = result.data.msg;
                    $scope.user = result.data.user;

                    $http.post('/api/thread', thread_id).success(function (result) {
                        if (!result.success) {
                            $scope.message = result.message;
                            $scope.success = result.success;
                        } else {
                            $scope.success = result.success;
                            $scope.thread = result.thread;
                            $scope.posts = result.posts;
                        }
                    });
                });
            };
            $scope.savePost = function (text) {
                $scope.post = ({
                    text: text,
                    thread_id: thread_id
                });
                if ($scope.post.text !== "") {
                    $http.post(API_ENDPOINT.url + '/savePost', $scope.post).success(function (data) {
                        if (data.success) {
                           
                        } else {
                            console.log('not succes');
                        }
                    });
                    text = '';
                    $state.go('thread', {thread_id: thread_id.thread_id});
                    $scope.getInfo();
                }
                ;

            };
        })

        .controller('AppCtrl', function ($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
            $scope.$on(AUTH_EVENTS.notAuthenticated, function (event) {
                AuthService.logout();
                $state.go('outside.login');
                var alertPopup = $ionicPopup.alert({
                    title: 'Session Lost!',
                    template: 'Sorry, You have to login again.'
                });
            });
        });