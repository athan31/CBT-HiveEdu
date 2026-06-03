// requireAdmin — ADMIN or TUTOR can access admin panel
const requireAdmin = (req, res, next) => {
  if (!req.user || !['ADMIN', 'TUTOR'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Akses ditolak. Hak akses Admin/Tutor diperlukan.' });
  }
  next();
};

// requireAdminOnly — strictly ADMIN only (CRUD users, create tutor accounts)
const requireAdminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Akses ditolak. Hak akses Admin diperlukan.' });
  }
  next();
};

module.exports = { requireAdmin, requireAdminOnly };
