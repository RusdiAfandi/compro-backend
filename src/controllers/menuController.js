// @desc    Get Main Menu and Profile
// @route   GET /api/menu
// @access  Private
const getMainMenu = async (req, res) => {
    try {
        // FR02: Menu returns profile + menu list
        const student = req.student;

        const menuList = [
            { id: 'home', label: 'Home', endpoint: '/api/menu' },
            { id: 'interest', label: 'Integrasi Minat & Karir', endpoint: '/api/interests' },
            { id: 'simulation', label: 'Simulasi IPK', endpoint: '/api/simulation/calculate' },
        ];

        res.status(200).json({
            success: true,
            message: "Menu utama berhasil dimuat.",
            data: {
                profile: {
                    nama: student.nama,
                    nim: student.nim,
                    email_sso: student.email_sso,
                    jurusan: student.jurusan,
                    fakultas: student.fakultas,
                    angkatan: student.angkatan,
                    semester: "5", // Placeholder, logic needed if dynamic
                    ipk: student.ipk,
                    sks_completed: student.sks_total,
                    tak: student.tak,
                    ikk: student.ikk,
                    sks_tingkat: student.sks_tingkat,
                    ip_tingkat: student.ip_tingkat
                },
                menus: menuList
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: true,
            message: error.message 
        });
    }
};

module.exports = { getMainMenu };
