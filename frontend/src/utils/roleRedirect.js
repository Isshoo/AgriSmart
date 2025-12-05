export const getRoleRedirect = (role) => {
  switch (role) {
    case 'ADMIN':
    case 'PENYULUH':
    case 'KEPALA_BIDANG':
    case 'KEPALA_DINAS':
      return '/dashboard';
    default:
      return '/login';
  }
};

export const hasAccess = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

