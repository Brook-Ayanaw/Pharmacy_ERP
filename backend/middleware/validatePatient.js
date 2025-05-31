const Patient = require('../models/Patient');

const validatePatient = async (req, res, next) => {
    try {
        const { patientId } = req.body;

        // If no patientId is provided, move to next middleware (it might be a walk-in customer)
        if (!patientId) return next();

        // Check if patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        next(); // Proceed to the next step
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = validatePatient;
