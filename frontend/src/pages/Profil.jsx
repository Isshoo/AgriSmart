import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { authService } from '../services/authService';

const Profil = () => {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    passwordLama: '',
    passwordBaru: '',
    passwordBaruConfirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
      updateUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordData.passwordBaru !== passwordData.passwordBaruConfirm) {
      setError('Password baru dan konfirmasi password tidak sama');
      return;
    }

    if (passwordData.passwordBaru.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(passwordData.passwordLama, passwordData.passwordBaru);
      alert('Password berhasil diubah');
      setShowPasswordModal(false);
      setPasswordData({
        passwordLama: '',
        passwordBaru: '',
        passwordBaruConfirm: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Administrator',
      PENYULUH: 'Penyuluh',
      KEPALA_BIDANG: 'Kepala Bidang',
      KEPALA_DINAS: 'Kepala Dinas'
    };
    return labels[role] || role;
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profil Pengguna</h1>

      {profile && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Nama</label>
              <p className="mt-1 text-lg font-semibold text-gray-900">{profile.nama}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Username</label>
              <p className="mt-1 text-lg text-gray-900">{profile.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Jabatan</label>
              <p className="mt-1 text-lg text-gray-900">{getRoleLabel(profile.role)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Tanggal Bergabung</label>
              <p className="mt-1 text-gray-900">
                {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Ubah Password
            </button>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Ubah Password</h3>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password Lama</label>
                  <input
                    type="password"
                    required
                    value={passwordData.passwordLama}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, passwordLama: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                  <input
                    type="password"
                    required
                    value={passwordData.passwordBaru}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, passwordBaru: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    required
                    value={passwordData.passwordBaruConfirm}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, passwordBaruConfirm: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      passwordLama: '',
                      passwordBaru: '',
                      passwordBaruConfirm: ''
                    });
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profil;

