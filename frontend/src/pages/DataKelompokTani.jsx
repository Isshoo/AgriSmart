import { useEffect, useState } from 'react';
import { kelompokTaniService } from '../services/kelompokTaniService';
import { kecamatanService } from '../services/kecamatanService';
import useAuthStore from '../store/authStore';
import { hasAccess } from '../utils/roleRedirect';
import Pagination from '../components/Pagination';

const DataKelompokTani = () => {
  const [kelompokTani, setKelompokTani] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    nama: '',
    ketua: '',
    kecamatanId: '',
    alamat: '',
    kontak: ''
  });
  const { user } = useAuthStore();

  const canEdit = hasAccess(user?.role, ['PENYULUH', 'ADMIN']);
  const canDelete = hasAccess(user?.role, ['ADMIN']);

  useEffect(() => {
    fetchKecamatan();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterKecamatan]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, search, filterKecamatan]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filterKecamatan) params.kecamatan = filterKecamatan;

      const response = await kelompokTaniService.getAll(params);
      setKelompokTani(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Error fetching kelompok tani:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKecamatan = async () => {
    try {
      const data = await kecamatanService.getAll();
      setKecamatan(data);
    } catch (error) {
      console.error('Error fetching kecamatan:', error);
    }
  };

  const handleDetail = async (id) => {
    try {
      const data = await kelompokTaniService.getById(id);
      setSelectedDetail(data);
      setShowDetailModal(true);
    } catch (error) {
      alert('Gagal memuat detail kelompok tani');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await kelompokTaniService.update(editingId, formData);
      } else {
        await kelompokTaniService.create(formData);
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
      nama: item.nama,
      ketua: item.ketua,
      kecamatanId: item.kecamatanId,
      alamat: item.alamat || '',
      kontak: item.kontak || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      await kelompokTaniService.delete(id);
      fetchData(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nama: '',
      ketua: '',
      kecamatanId: '',
      alamat: '',
      kontak: ''
    });
  };

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Data Kelompok Tani</h1>
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
            placeholder="Cari nama atau ketua..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <select
            value={filterKecamatan}
            onChange={(e) => setFilterKecamatan(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Semua Kecamatan</option>
            {kecamatan.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Kelompok</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ketua</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Anggota</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kecamatan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luas Lahan (Ha)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kelompokTani.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  kelompokTani.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.ketua}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.jumlahAnggota || item._count?.petani || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.kecamatan?.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.luasLahanTotal?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDetail(item.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Detail
                        </button>
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

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? 'Edit Kelompok Tani' : 'Tambah Kelompok Tani'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Kelompok</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ketua</label>
                  <input
                    type="text"
                    required
                    value={formData.ketua}
                    onChange={(e) => setFormData({ ...formData, ketua: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kecamatan</label>
                  <select
                    required
                    value={formData.kecamatanId}
                    onChange={(e) => setFormData({ ...formData, kecamatanId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Pilih Kecamatan</option>
                    {kecamatan.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alamat</label>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kontak</label>
                  <input
                    type="text"
                    value={formData.kontak}
                    onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
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

      {/* Detail Modal */}
      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Detail Kelompok Tani: {selectedDetail.nama}</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDetail(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Ketua</p>
                <p className="font-medium">{selectedDetail.ketua}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kecamatan</p>
                <p className="font-medium">{selectedDetail.kecamatan?.nama}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jumlah Anggota</p>
                <p className="font-medium">{selectedDetail.jumlahAnggota}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Luas Lahan Total</p>
                <p className="font-medium">{selectedDetail.luasLahanTotal?.toFixed(2)} Ha</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Anggota Kelompok</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nama</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Luas Lahan</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Komoditas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedDetail.petani?.length > 0 ? (
                      selectedDetail.petani.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2 text-sm">{p.nama}</td>
                          <td className="px-4 py-2 text-sm">{p.luasLahan} Ha</td>
                          <td className="px-4 py-2 text-sm">{p.jenisTanaman}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-center text-gray-500">
                          Belum ada anggota
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Komoditas</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDetail.komoditas?.length > 0 ? (
                  selectedDetail.komoditas.map((k) => (
                    <span
                      key={k.id}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {k.jenis}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">Belum ada komoditas</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataKelompokTani;

