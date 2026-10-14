
var app = angular.module("studentApp", []);

// FACTORY: Validate student details
app.factory("studentFactory", function () {
    return {
        validate: function (student) {
            return student &&
                student.name &&
                /^[a-zA-Z ]+$/.test(student.name.trim()) &&
                student.regno &&
                student.email &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email) &&
                student.phone &&
                /^[0-9]{10}$/.test(student.phone) &&
                student.department &&
                student.year &&
                student.gender;
        }
    };
});

// SERVICE: Store and manage student details
app.service("studentService", function () {
    var students = [];

    this.getStudents = function () {
        return students;
    };

    this.exists = function (regno) {
        return students.some(function (s) {
            return s.regno.toLowerCase() === regno.toLowerCase();
        });
    };

    this.addStudent = function (student) {
        students.push(angular.copy(student));
    };
});

// CONTROLLER: Handle registration
app.controller("studentController",
    function ($scope, studentFactory, studentService) {

        $scope.student = {};
        $scope.registeredStudent = null;
        $scope.students = studentService.getStudents();
        $scope.message = "";

        $scope.register = function () {
            if (!studentFactory.validate($scope.student)) {
                $scope.message = "Please enter valid details.";
                return;
            }

            var regno = $scope.student.regno.trim();

            if (studentService.exists(regno)) {
                $scope.message =
                    "Register number already exists!";
                return;
            }

            $scope.student.name = $scope.student.name.trim();
            $scope.student.regno = regno;
            $scope.student.email = $scope.student.email.trim();

            studentService.addStudent($scope.student);

            $scope.registeredStudent =
                angular.copy($scope.student);

            $scope.student = {};
            $scope.message = "Student registered successfully!";

            $scope.studentForm.$setPristine();
            $scope.studentForm.$setUntouched();
        };
    });
