const db = require('../config/db');
// Book Appointment
exports.bookAppointment = (req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time } = req.body;
    const sql = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, 'scheduled')";
    db.query(sql, [patient_id, doctor_id, appointment_date, appointment_time], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Appointment booked successfully!' });
    });
};

// View Appointments
exports.viewAppointments = (req, res) => {
    const { patient_id } = req.params;
    const sql = "SELECT * FROM appointments WHERE patient_id = ?";
    db.query(sql, [patient_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};

// Complete Appointment
exports.completeAppointment = (req, res) => {
    const { appointment_id } = req.params;
    const sql = "UPDATE appointments SET status = 'completed' WHERE id = ?";
    db.query(sql, [appointment_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Appointment completed successfully!' });
    });
};

// Cancel Appointment
exports.cancelAppointment = (req, res) => {
    const { appointment_id } = req.params;
    const sql = "UPDATE appointments SET status = 'canceled' WHERE id = ?";
    db.query(sql, [appointment_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Appointment canceled successfully!' });
    });
};

