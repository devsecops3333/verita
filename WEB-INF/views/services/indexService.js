
mainApp.service('indexService', function() {
    var dropdownOneValue = '';
    var dropdownTwoValue = '';
    var dropdownThreeValue = '';

    var setDropDownOne = function (value) {
        dropdownOneValue = value;
    };
    var getDropDownOne = function () {
        return dropdownOneValue;
    };

    var setDropDownTwo = function (value) {
        dropdownTwoValue = value;
    };
    var getDropDownTwo = function () {
        return dropdownTwoValue;
    };

    var setDropDownThree = function (value) {
        dropdownThreeValue = value;
    };
    var getDropDownThree = function () {
        return dropdownThreeValue;
    };

    return {
        setDropDownOne: setDropDownOne,
        getDropDownOne: getDropDownOne,
        setDropDownTwo: setDropDownTwo,
        getDropDownTwo: getDropDownTwo,
        setDropDownThree: setDropDownThree,
        getDropDownThree: getDropDownThree
    };

});
