var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "Navigate to website url|User login",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "0053009c-00e4-0074-00ac-00e100be00a8.png",
        "timestamp": 1602555284484,
        "duration": 3597
    },
    {
        "description": "Click on as customer login|User login",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00a60098-006d-00e2-000d-00a7003c0070.png",
        "timestamp": 1602555288637,
        "duration": 3177
    },
    {
        "description": "Select customer name which user have to login|User login",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00d300fb-0069-00f2-00fe-0022008a0045.png",
        "timestamp": 1602555292316,
        "duration": 2153
    },
    {
        "description": "Click login button|User login",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00eb003f-0085-00d8-0024-00cf00da0095.png",
        "timestamp": 1602555295258,
        "duration": 253
    },
    {
        "description": "Verify user as customer login|User login",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00a300e8-005c-0071-0048-007800da0099.png",
        "timestamp": 1602555296400,
        "duration": 4107
    },
    {
        "description": "Navigate to url|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00e60049-001d-00cb-00a6-000e00d0000f.png",
        "timestamp": 1602555300936,
        "duration": 7007
    },
    {
        "description": "Enter user first name and last name|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "004400f2-002f-002d-00d8-00cd009b0017.png",
        "timestamp": 1602555308464,
        "duration": 451
    },
    {
        "description": "Enter user Address|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "007500dc-0022-006f-00eb-009d00380063.png",
        "timestamp": 1602555309443,
        "duration": 315
    },
    {
        "description": "Enter user Email Address|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "0004005d-0033-008b-0096-0025003c00d7.png",
        "timestamp": 1602555310246,
        "duration": 264
    },
    {
        "description": "Enter user Phone Number|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "001d0055-0081-00dc-004c-00b200020018.png",
        "timestamp": 1602555310943,
        "duration": 288
    },
    {
        "description": "Select user Gender|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001b0050-0072-000d-006b-001a00f40024.png",
        "timestamp": 1602555311722,
        "duration": 218
    },
    {
        "description": "Select user Hobbies|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "000600d8-001f-00de-00b8-0008008100ad.png",
        "timestamp": 1602555312358,
        "duration": 265
    },
    {
        "description": "Enter Random Language|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00bc0084-00cb-0023-002f-009400bd006e.png",
        "timestamp": 1602555313051,
        "duration": 486
    },
    {
        "description": "Select Skill detais|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "008e0028-0013-003c-00f1-004f009d008d.png",
        "timestamp": 1602555313993,
        "duration": 148
    },
    {
        "description": "Select Country details|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "000a0015-003f-004e-0060-009e006300c9.png",
        "timestamp": 1602555314559,
        "duration": 159
    },
    {
        "description": "Select Random Country details|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00ec0031-00f9-00ea-005f-0039006a00f8.png",
        "timestamp": 1602555315103,
        "duration": 340
    },
    {
        "description": "Select Random Date of Birth|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00f700b1-000f-0043-002e-004f0042003d.png",
        "timestamp": 1602555315885,
        "duration": 422
    },
    {
        "description": "Enter password|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00310035-004f-002c-004d-0041003b00ef.png",
        "timestamp": 1602555316747,
        "duration": 217
    },
    {
        "description": "Enter confirm password|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "007a002a-008d-0002-0062-006b007500d3.png",
        "timestamp": 1602555317357,
        "duration": 183
    },
    {
        "description": "Upload a photo|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "00ce0037-006a-00ab-00e5-009f000c00d8.png",
        "timestamp": 1602555317964,
        "duration": 117
    },
    {
        "description": "Click on Submit Button|Registration of user in  Automation Demo Site",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": "Passed",
        "browserLogs": [],
        "screenShotFile": "0000004d-00fd-00ce-00f9-00d9003b00c1.png",
        "timestamp": 1602555318507,
        "duration": 184
    },
    {
        "description": "Verify http://demo.automationtesting.in/WebTable.html page|Registration of user in  Automation Demo Site",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 18592,
        "browser": {
            "name": "chrome",
            "version": "86.0.4240.75"
        },
        "message": [
            "Expected 'http://demo.automationtesting.in/Register.html' to be 'http://demo.automationtesting.in/WebTable.html'."
        ],
        "trace": [
            "Error: Failed expectation\n    at Object.verifyNewUrl (C:\\WebDevelopment\\demoprotractor\\com.org.pages\\Registration.js:120:26)\n    at UserContext.<anonymous> (C:\\WebDevelopment\\demoprotractor\\com.org.testscript\\Registration.js:84:20)\n    at C:\\WebDevelopment\\demoprotractor\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (C:\\WebDevelopment\\demoprotractor\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (C:\\WebDevelopment\\demoprotractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (C:\\WebDevelopment\\demoprotractor\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (C:\\WebDevelopment\\demoprotractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (C:\\WebDevelopment\\demoprotractor\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at C:\\WebDevelopment\\demoprotractor\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25"
        ],
        "browserLogs": [],
        "screenShotFile": "00460013-0031-00a6-00d1-000c005400f5.png",
        "timestamp": 1602555319482,
        "duration": 6073
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
