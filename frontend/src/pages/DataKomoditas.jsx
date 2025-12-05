import { useEffect, useState } from 'react';
import { komoditasService } from '../services/komoditasService';
import { kelompokTaniService } from '../services/kelompokTaniService';
import useAuthStore from '../store/authStore';
import { hasAccess } from '../utils/roleRedirect';
import Pagination from '../components/Pagination';

const DataKomoditas = () => {
  const [komoditas, setKomoditas] = useState([]);
  const [kelompokTani, setKelompokTani] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    jenis: '',
    luasTanam: '',
    estimasiPanen: '',
    jenisPupuk: '',
    pestisida: '',
    kelompokTaniId: ''
  });
  const { user } = useAuthStore();

  const canEdit = hasAccess(user?.role, ['PENYULUH', 'ADMIN']);
  const canDelete = hasAccess(user?.role, ['ADMIN']);

  useEffect(() => {
    fetchKelompokTani();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJenis]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, search, filterJenis]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filterJenis) params.jenis = filterJenis;

      const response = await komoditasService.getAll(params);
      setKomoditas(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Error fetching komoditas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKelompokTani = async () => {
    try {
      const response = await kelompokTaniService.getAll({ limit: 1000 });
      setKelompokTani(response.data || []);
    } catch (error) {
      console.error('Error fetching kelompok tani:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await komoditasService.update(editingId, formData);
      } else {
        await komoditasService.create(formData);
      }
      setShowModal(false);
      resetForm();
      fetchData(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      jenis: item.jenis,
      luasTanam: item.luasTanam,
      estimasiPanen: item.estimasiPanen || '',
      jenisPupuk: item.jenisPupuk || '',
      pestisida: item.pestisida || '',
      kelompokTaniId: item.kelompokTaniId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      await komoditasService.delete(id);
      fetchData(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      jenis: '',
      luasTanam: '',
      estimasiPanen: '',
      jenisPupuk: '',
      pestisida: '',
      kelompokTaniId: ''
    });
  };

  // Get unique jenis for filter
  const uniqueJenis = [...new Set(komoditas.map(k => k.jenis))];

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Data Komoditas</h1>
        {canEdit && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Tambah Data
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Cari komoditas, pupuk, atau pestisida..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Semua Jenis</option>
            {uniqueJenis.map((jenis) => (
              <option key={jenis} value={jenis}>
                {jenis}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Komoditas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luas Tanam (Ha)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estimasi Panen (Ton)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Pupuk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pestisida</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelompok Tani</th>
                  {(canEdit || canDelete) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {komoditas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  komoditas.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.jenis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.luasTanam}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.estimasiPanen || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.jenisPupuk || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.pestisida || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.kelompokTani?.nama || '-'}
                      </td>
                      {(canEdit || canDelete) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Hapus
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {pagination && (
          <Pagination pagination={pagination} onPageChange={setCurrentPage} />
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? 'Edit Komoditas' : 'Tambah Komoditas'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis Komoditas</label>
                  <input
                    type="text"
                    required
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Contoh: Padi, Jagung, Cabai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Luas Tanam (Ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.luasTanam}
                    onChange={(e) => setFormData({ ...formData, luasTanam: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimasi Panen (Ton)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimasiPanen}
                    onChange={(e) => setFormData({ ...formData, estimasiPanen: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jenis Pupuk</label>
                  <input
                    type="text"
                    value={formData.jenisPupuk}
                    onChange={(e) => setFormData({ ...formData, jenisPupuk: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Contoh: Urea, NPK"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pestisida</label>
                  <input
                    type="text"
                    value={formData.pestisida}
                    onChange={(e) => setFormData({ ...formData, pestisida: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Jenis pestisida yang digunakan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kelompok Tani (Opsional)</label>
                  <select
                    value={formData.kelompokTaniId}
                    onChange={(e) => setFormData({ ...formData, kelompokTaniId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Tidak ada</option>
                    {kelompokTani.map((kt) => (
                      <option key={kt.id} value={kt.id}>
                        {kt.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKomoditas;

