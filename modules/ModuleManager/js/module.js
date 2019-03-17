registerController("ModuleManagerController", ['$api', '$scope', '$timeout', '$interval', '$templateCache', function($api, $scope, $timeout, $interval, $templateCache){
    $scope.availableModules = [];
    $scope.installedModules = [];
    $scope.installedModule = "";
    $scope.removedModule = "";
    $scope.gotAvailableModules = false;
    $scope.connectionError = false;
    $scope.selectedModule = false;
    $scope.downloading = false;
    $scope.installing = false;
    $scope.linking = true;
    $scope.device = undefined;

    $scope.getDevice = (function() {
        $api.request({
            module: "Configuration",
            action: "getDevice"
        }, function(response) {
            $scope.device = response.device;
        });
    });
    $scope.getDevice();

    $scope.getAvailableModules = (function() {
        $scope.loading = true;
        $api.request({
            module: "ModuleManager",
            action: "getAvailableModules"
        }, function(response) {
            $scope.loading = false;
            if (response.error === undefined) {
                $scope.availableModules = response.availableModules;
                $scope.compareModuleLists();
                $scope.gotAvailableModules = true;
                $scope.connectionError = false;
            } else {
                $scope.connectionError = response.error;
            }
        });
    });

    $scope.getInstalledModules = (function() {
        $api.request({
            module: "ModuleManager",
            action: "getInstalledModules"
        }, function(response) {
            $scope.installedModules = response.installedModules;
            if ($scope.gotAvailableModules) {
                $scope.compareModuleLists();
            }
        });
    });

    $scope.compareModuleLists = (function() {
        angular.forEach($scope.availableModules, function(module, moduleName){
            if ($scope.installedModules[moduleName] === undefined){
                module['installable'] = true;
            } else if ($scope.availableModules[moduleName].version <= $scope.installedModules[moduleName].version) {
                module['installed'] = true;
            }
        });
    });

    $scope.downloadModule = (function(dest) {
        $api.request({
            module: 'ModuleManager',
            action: 'downloadModule',
            moduleName: $scope.selectedModule.module,
            destination: dest
        }, function(response) {
            if (response.error === undefined) {
                $scope.downloading = true;
                var ival = $interval(function() {
                    $api.request({
                        module: 'ModuleManager',
                        action: 'downloadStatus',
                        moduleName: $scope.selectedModule.module,
                        destination: dest,
                        checksum: $scope.availableModules[$scope.selectedModule.module]['checksum']
                    }, function(response) {
                        if (response.success === true) {
                            $interval.cancel(ival);
                            $scope.installModule(dest);
                        }
                    });
                }, 2000);
            }
        });
    });

    $scope.installModule = (function(dest) {
        if ($scope.installing) {
            return;
        }
        $scope.downloading = false;
        $scope.installing = true;


        $api.request({
            module: 'ModuleManager',
            action: 'installModule',
            moduleName: $scope.selectedModule.module,
            destination: dest
        }, function() {
            var ival = $interval(function() {
                $api.request({
                    module: 'ModuleManager',
                    action: 'installStatus'
                }, function(response) {
                    if (response.success === true) {
                        $interval.cancel(ival);
                        $templateCache.removeAll();
                        $scope.installedModule = true;
                        $scope.installing = false;
                        $scope.getInstalledModules();
                        $api.reloadNavbar();
                        if ($scope.selectedModule.module === 'ModuleManager') {
                            window.location.reload();
                        } else {
                            $scope.selectedModule = false;
                        }
                        $timeout(function(){
                            $scope.installedModule = false;
                        }, 2000);
                    }
                });
            }, 500);
        });
    });

    $scope.checkDestination = (function(moduleName, moduleSize) {
        $(window).scrollTop(0);

        if ($scope.installedModules[moduleName] !== undefined && $scope.installedModules[moduleName]['type'] === 'System') {
            $scope.selectedModule = {module: moduleName, internal: true, sd: false};
            return;
        }

        if ($scope.device === 'tetra') {
            $scope.selectedModule = {module: moduleName, internal: true, sd: false};
            $scope.downloadModule('internal');
            return;
        }

        $api.request({
            module: 'ModuleManager',
            action: 'checkDestination',
            name: moduleName,
            size: moduleSize
        }, function(response) {
            if (response.error === undefined) {
                $scope.selectedModule = response;
            }
        });
    });

    $scope.removeModule = (function(name) {
        $api.request({
            module: 'ModuleManager',
            action: 'removeModule',
            moduleName: name
        }, function(response) {
            if (response.success === true) {
                $scope.getInstalledModules();
                $scope.removedModule = true;
                $api.reloadNavbar();
                $timeout(function(){
                    $scope.removedModule = false;
                }, 2000);
            }
        });
    });

    $scope.restoreSDcardModules = (function() {
        $api.request({
            module: 'ModuleManager',
            action: 'restoreSDcardModules'
        }, function(response) {
            if (response.restored === true) {
                $scope.restoreSDcardModules();
            } else {
                $api.reloadNavbar();
                $scope.getInstalledModules();
                $scope.linking = false;
            }
        });
    });

    if ($scope.device === 'nano') {
        $scope.restoreSDcardModules();
    } else {
        $scope.linking = false;
    }
    $scope.getInstalledModules();
}]);
