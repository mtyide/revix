$("#save-reservations-btn").on("click", function () {
    this.disabled = true;
    $("#cancel-reservations-btn").attr('disabled', 'disabled');
    $("#save-reservations-btn").html('Saving...');
    var isValid = isReservationFormValid();
    if (isValid === false) {
        $("#modal-task-failed").modal();
        $("#save-reservations-btn").removeAttr('disabled');
        $("#save-reservations-btn").html('Save');
        return;
    }
    var from = $("#from").val();
    var to = $("#to").val();
    var hall = parseInt($("#halls").val());
    var lecturer = parseInt($("#lecturers").val());
    var data = { From: from, To: to, LectureHallNumber: hall, LecturerId: lecturer };

    $.post("api/reservations", data, function (res) {
        console.log(res);
        if (res === 'Ok') {
            $("#modal-task").modal();
            $("#save-reservations-btn").removeAttr('disabled');
            $("#save-reservations-btn").html('Save');
            $("#from").val(null);
            $("#to").val(null);
            $("#from").focus();
            fetchReservations();
            /* YM UI Effects - Uncomment line below to fade out or hide new reservation div */
            //$('#div-new-reservation').fadeOut();
        } else {
            displayValidationErrors(res);
        }
    }, "json").fail(function () {
        $("#from").focus();
        $("#task-errors").html(null);
        $("#modal-task-failed").modal();
        $("#save-reservations-btn").removeAttr('disabled');
        $("#save-reservations-btn").html('Save');
    });
});

$(document).ready(function () {
    fetchReservations();
});

function fetchReservations() {
    $("#reservations-items-header").html('Fetching reservations, one moment...');
    $.get("api/reservations", function (res) {
        $("#reservations-items-header").html(null);
        var content = '';
        var count = res.length;
        $.each(res, function (key, item) {
            var id = item.Id;
            var from = item.From;
            var to = item.To;
            var lecturer = item.Lecturer;
            var hall = item.LectureHallNumber;
            var subject = item.Subject;
            content += '<tr>';
            content += '    <td>'
            content += '        ' + hall;
            content += '    </td>';
            content += '    <td>'
            content += '        ' + lecturer;
            content += '    </td>';
            content += '    <td>'
            content += '        ' + subject;
            content += '    </td>';
            content += '    <td>'
            content += '        ' + from;
            content += '    </td>';
            content += '    <td>'
            content += '        ' + to;
            content += '    </td>';
            content += '    <td>'
            content += '        <a style="cursor: pointer; color: steelblue; text-decoration: underline; font-weight: bold;" onclick="deleteReservationEntry(' + id + ');">Delete</a></span>';
            content += '    </td>';
            content += '</tr>';
        });
        $("#reservations-items-body").html(content);
        if (count !== 0) {
            $("#reservations-items").DataTable({ 'paging': true, 'lengthChange': false, 'searching': false, 'ordering': false, 'info': false, 'autoWidth': true, 'destroy': true, 'retrieve': true });
            $("#reservations").removeAttr('disabled');
            $("#save-reservations-btn").removeAttr('disabled');
        }
        $("#reservations-items-header").html(null);
        loadLectureHalls();
        loadLecturers();
    }, "json").fail(function () {
        $("#reservations-items-header").html(null);
        $("#task-errors").html(null);
        $("#modal-task-failed").modal();
    });
}

function deleteReservationEntry(id) {
    $("#reservation-items-header").html('Deleting...');
    var uri = "api/reservations/" + id;
    $.ajax({
        type: "DELETE",
        url: uri,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        async: true,
        success: function (response) {
            $("#modal-task").modal();
            fetchReservations();
        },
        error: function () {
            $("#reservations-items-header").html(null);
            $("#task-errors").html(null);
            $("#modal-task-failed").modal();
        }
    });
}