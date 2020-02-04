namespace Reservations.Services
{
    using System;
    using System.Collections.Generic;
    using System.Linq;

    using AutoMapper;
    using Db;
    using Models;

    /// <summary>
    /// Implementation of business logic methods concerning reservations
    /// </summary>
    public class ReservationsService : IReservationsService
    {
        private readonly GetAllReservationsQuery _queryAll;
        private readonly GetReservationByIdQuery _queryById;
        private readonly AddReservationQuery _queryAdd;
        private readonly DeleteReservationQuery _queryDelete;

        private readonly GetAllLecturersQuery _queryAllLecturers;
        private readonly GetAllLectureHallsQuery _queryAllLectureHalls;

        public ReservationsService(GetAllReservationsQuery queryAll, GetReservationByIdQuery queryById, AddReservationQuery queryAdd, DeleteReservationQuery queryDelete, GetAllLecturersQuery queryAllLecturers, GetAllLectureHallsQuery queryAllLectureHalls)
        {
            _queryAll = queryAll;
            _queryById = queryById;
            _queryAdd = queryAdd;
            _queryDelete = queryDelete;
            _queryAllLecturers = queryAllLecturers;
            _queryAllLectureHalls = queryAllLectureHalls;
        }

        /// <summary>
        /// Lists all reservations that exist in db
        /// </summary>
        public IEnumerable<ReservationItem> All()
        {
            return Mapper.Map<IEnumerable<ReservationItem>>(_queryAll.Execute().ToList());
        }

        /// <summary>
        /// Gets single reservation by its id
        /// </summary>
        public ReservationItem GetById(int id)
        {
            return Mapper.Map<ReservationItem>(_queryById.Execute(id));
        }

        /// <summary>
        /// Checks whether given reservation can be added.
        /// Performs logical and business validation.
        /// </summary>
        public ValidationResult ValidateNewReservation(NewReservationItem newReservation)
        {
            if (newReservation == null)
            {
                throw new ArgumentNullException("newReservation");
            }

            var result = ValidationResult.Default;

            if (!(newReservation.From.Day.Equals(newReservation.To.Day))) { result |= ValidationResult.MoreThanOneDay; }
            if (newReservation.To.Subtract(newReservation.From).Days > 0) { result |= ValidationResult.ToBeforeFrom; }
            if (newReservation.From.Day.Equals(newReservation.To.Day))
            {
                var fromWorkingHours = Convert.ToInt16(newReservation.From.ToString("HH"));
                if (fromWorkingHours < 8 || fromWorkingHours > 17) { result |= ValidationResult.OutsideWorkingHours; }
                var toWorkingHours = Convert.ToInt16(newReservation.To.ToString("HH"));
                if (toWorkingHours < 9 || toWorkingHours > 18) { result |= ValidationResult.OutsideWorkingHours; }
                if (newReservation.To.Subtract(newReservation.From).Hours > 3) { result |= ValidationResult.TooLong; }
            }

            var conflict = _queryAll.Execute().Where(x => x.From.Day.Equals(newReservation.From.Day)
                                                               && x.To.Day.Equals(newReservation.To.Day)
                                                               && (x.From.TimeOfDay.Hours.Equals(newReservation.From.TimeOfDay.Hours) && x.To.TimeOfDay.Hours <= newReservation.To.TimeOfDay.Hours)
                                                               && x.Lecturer.Id.Equals(newReservation.LecturerId)
                                                               && x.Hall.Number.Equals(newReservation.LectureHallNumber)).Count().Equals(0) ? false : true;
            if (conflict) { result |= ValidationResult.Conflicting; }

            var lectureHallExist = _queryAllLectureHalls.Execute().Single(h => h.Number.Equals(newReservation.LectureHallNumber)) == null ? false : true;
            if (!lectureHallExist) { result |= ValidationResult.HallDoesNotExist; }
            var lecturerExist = _queryAllLecturers.Execute().Single(l => l.Id.Equals(newReservation.LecturerId)) == null ? false : true;
            if (!lecturerExist) { result |= ValidationResult.LecturerDoesNotExist; }

            if (result.ToString().Equals("Default")) { result = ValidationResult.Ok; }

            return result;
        }

        /// <summary>
        /// Tries to add given reservation to db, after validating it
        /// </summary>
        public ValidationResult Add(NewReservationItem newReservation)
        {
            if (newReservation == null)
            {
                throw new ArgumentNullException("newReservation");
            }

            var result = ValidateNewReservation(newReservation);
            if ((result & ValidationResult.Ok) == ValidationResult.Ok)
            {
                var reservation = new Reservation
                {
                    From = newReservation.From,
                    To = newReservation.To,
                    Lecturer = _queryAllLecturers.Execute().Single(p => p.Id == newReservation.LecturerId),
                    Hall = _queryAllLectureHalls.Execute().Single(p => p.Number == newReservation.LectureHallNumber),
                };

                _queryAdd.Execute(reservation);
            }

            return result;
        }

        /// <summary>
        /// Deletes (if exists) reservation from db (by its id)
        /// </summary>
        public void Delete(int id)
        {
            _queryDelete.Execute(id);
        }

        /// <summary>
        /// Returns all reservations (listed chronologically) on a given day concerning given hall. 
        /// If a given lecture hall does not exist, throws exception
        /// </summary>
        public IEnumerable<ReservationItem> GetByDay(DateTime day, int hallNumber)
        {
            if (!_queryAllLectureHalls.Execute().Any(p => p.Number == hallNumber))
            {
                throw new ArgumentException("Given hall does not exist");
            }

            var reservations =
                _queryAll.Execute().Where(p => p.Hall.Number == hallNumber).Where(p => p.From.Date == day.Date).OrderBy(p => p.From.Hour);

            return Mapper.Map<IEnumerable<ReservationItem>>(reservations.ToList());
        }

        /// <summary>
        /// Returns statistics (list of pairs [HallNumber, NumberOfFreeHours]) on a given day.
        /// Maximum number of free hours is 10 (working hours are 8-18), minimum 0 of course.
        /// Given day must be from the future (not in the past or today).
        /// </summary>
        public IEnumerable<HallFreeHoursStatisticsItem> GetHallsFreeHoursByDay(DateTime day)
        {
            if (day.Date <= DateTime.Today.Date)
            {
                throw new ArgumentException("Input argument must be a future day");
            }

            var result = new List<HallFreeHoursStatisticsItem>();

            var occupiedHallsStatistics =
                _queryAll.Execute().Where(p => p.From.Date == day.Date).GroupBy(p => p.Hall.Number).Select(p => new HallFreeHoursStatisticsItem
                {
                    HallNumber = p.Key,
                    FreeHoursNumber = p.Sum(r => r.To.Hour - r.From.Hour)
                });

            result.AddRange(_queryAllLectureHalls.Execute().Select(p => new HallFreeHoursStatisticsItem
            {
                HallNumber = p.Number,
                FreeHoursNumber = 10 - (occupiedHallsStatistics.Any(r => r.HallNumber == p.Number) ? occupiedHallsStatistics.Single(r => r.HallNumber == p.Number).FreeHoursNumber : 0)
            }));

            return result;
        }
    }
}