function resetReservationForm() {
    $("#from").val(null);
    $("#to").val(null);
    $("#from").focus();
}

function isReservationFormValid() {
    var from = document.getElementById("from");
    if (from) {
        var check = from.checkValidity();
        if (check === false) {
            return false;
        }
    }
    var to = document.getElementById("to");
    if (to) {
        var check = to.checkValidity();
        if (check === false) {
            return false;
        }
    }
    return true;
}

function loadLectureHalls() {
    var halls = $("#halls");
    halls.html(null);
    $.get("api/lecturehalls", function (res) {
        var count = res.length;
        $.each(res, function (key, item) {
            var description = item.Number + ' | Capacity: ' + item.Capacity;
            if (key === 0) {
                halls.append("<option selected value='" + item.Number + "'>" + description + "</option>");
            } else {
                halls.append("<option value='" + item.Number + "'>" + description + "</option>");
            }
        });
        if (count !== 0) {
            halls.removeAttr('disabled');
        }
    }, "json").fail(function () {
        $("#task-errors").html(null);
        $("#modal-task-failed").modal();
    });
}

function loadLecturers() {
    var lecturers = $("#lecturers");
    lecturers.html(null);
    $.get("api/lecturers", function (res) {
        var count = res.length;
        $.each(res, function (key, item) {
            var name = item.Title + ' ' + item.Name + ' ' + item.Surname + ' | ' + item.Subject;
            if (key === 0) {
                lecturers.append("<option selected value='" + item.Id + "'>" + name + "</option>");
            } else {
                lecturers.append("<option value='" + item.Id + "'>" + name + "</option>");
            }
        });
        if (count !== 0) {
            lecturers.removeAttr('disabled');
        }
    }, "json").fail(function () {
        $("#task-errors").html(null);
        $("#modal-task-failed").modal();
    });
}

function fetchLectureHalls() {
    $("#div-lecture-halls").fadeIn();
    $("#lecture-halls-items-header").html('Fetching lecture halls, one moment...');
    $.get("api/lecturehalls", function (res) {
        $("#lecture-halls-items-header").html(null);
        var content = '';
        var count = res.length;
        $.each(res, function (key, item) {
            var number = item.Number;
            var capacity = item.Capacity;
            content += '<tr>';
            content += '    <td>'
            content += '        ' + number;
            content += '    </td>';
            content += '    <td>'
            content += '        ' + capacity;
            content += '    </td>';
            content += '    <td>'
            content += '    </td>';
            content += '</tr>';
        });
        if (count !== 0) {
            $("#lecture-halls-items-body").html(content);
            $("#lecture-halls-items").DataTable({ 'paging': true, 'lengthChange': false, 'searching': false, 'ordering': false, 'info': false, 'autoWidth': true, 'destroy': true, 'retrieve': true });
        }
    }, "json").fail(function () {
        $("#lecture-halls-items-header").html(null);
        $("#task-errors").html(null);
        $("#modal-task-failed").modal();
    });
}

function fetchLecturers() {
    $("#div-lecturers").fadeIn();
    $("#lecturers-items-header").html('Fetching lecturers, one moment...');
    $.get("api/lecturers", function (res) {
        $("#lecturers-items-header").html(null);
        var content = '';
        var count = res.length;
        $.each(res, function (key, item) {
            var title = item.Title;
            var name = item.Name;
            var surname = item.Surname;
            var subject = item.Subject;
            content += '<tr>';
            content += '    <td>'
            content += '        ' + title;
            content += '    </td>';
            content += '    <td>'
            content += '        ' + name;
            content += '    </td>';
            content += '    <td>'
            content += '        ' + surname;
            content += '    </td>';
            content += '    <td>'
            content += '        ' + subject;
            content += '    </td>';
            content += '    <td>'
            content += '    </td>';
            content += '</tr>';
        });
        if (count !== 0) {
            $("#lecturers-items-body").html(content);
            $("#lecturers-items").DataTable({ 'paging': true, 'lengthChange': false, 'searching': false, 'ordering': false, 'info': false, 'autoWidth': true, 'destroy': true, 'retrieve': true });
        }
    }, "json").fail(function () {
        $("#lecturers-items-header").html(null);
        $("#task-errors").html(null);
        $("#modal-task-failed").modal();
    });
}

function displayValidationErrors(arrayOfErrors) {
    var errors = arrayOfErrors.split(',');
    var length = errors.length;
    var content = '<hr />';
    content += '<label>Possible Errors:</label>';
    content += '<ul>';
    if (length === 1) {
        switch (arrayOfErrors) {
            case 'MoreThanOneDay': content += '<li>More Than One Day</li>'; break;
            case 'ToBeforeFrom': content += '<li>To Before From</li>'; break;
            case 'OutsideWorkingHours': content += '<li>Outside Working Hours</li>'; break;
            case 'TooLong': content += '<li>Too Long</li>'; break;
            case 'Conflicting': content += '<li>Conflicting</li>'; break;
            case 'LecturerDoesNotExist': content += '<li>Lecturer Does Not Exist</li>'; break;
            case 'HallDoesNotExist': content += '<li>Hall Does Not Exist</li>'; break;
            default:
        }
    } else {
        $.each(errors, function (key, item) {
            switch (item.trim()) {
                case 'MoreThanOneDay': content += '<li>More Than One Day</li>'; break;
                case 'ToBeforeFrom': content += '<li>To Before From</li>'; break;
                case 'OutsideWorkingHours': content += '<li>Outside Working Hours</li>'; break;
                case 'TooLong': content += '<li>Too Long</li>'; break;
                case 'Conflicting': content += '<li>Conflicting</li>'; break;
                case 'LecturerDoesNotExist': content += '<li>Lecturer Does Not Exist</li>'; break;
                case 'HallDoesNotExist': content += '<li>Hall Does Not Exist</li>'; break;
                default:
            }
        });
    }
    content += '</ul>';
    $("#task-errors").html(content);
    $("#task-errors").fadeIn();
    $("#modal-task-failed").modal();
    $("#save-reservations-btn").removeAttr('disabled');
    $("#save-reservations-btn").html('Save');
}