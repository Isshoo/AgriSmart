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
    kontak: '',
    document: null
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
        const response = await kelompokTaniService.create(formData);
      
        await kelompokTaniService.uploadDocument(response.data.id, formData.document);
      }
      setShowModal(false);
      resetForm();
      fetchData(currentPage);
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData(prev => ({ ...prev, document: null }));
      return;
    }

    // Validasi ukuran file (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Ukuran file terlalu besar. Maksimal 5MB');
      e.target.value = '';
      return;
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Tipe file tidak didukung. Gunakan JPG, PNG, GIF, WEBP, atau PDF');
      e.target.value = '';
      return;
    }

    try {
      setFormData(prev => ({ ...prev, document: file }));
    } catch (error) {
      alert(error.message || 'Gagal mengupload file');
      e.target.value = '';
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama,
      ketua: item.ketua,
      kecamatanId: item.kecamatanId,
      alamat: item.alamat || '',
      kontak: item.kontak || '',
      document: item.document || null
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
      kontak: '',
      document: null
    });
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  // open document from localhost:3000/uploads/
      const handleOpenDocument = (document) => {
        window.open(`http://localhost:3001/uploads/${document}`, '_blank');
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
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Dokumen</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Kelompok</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ketua</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jumlah Anggota</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kecamatan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Luas Lahan (Ha)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kelompokTani.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data
                    </td>
                  </tr>
                ) : (
                  kelompokTani.map((item, index) => (
                    <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.document ? (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600" title={item.document} onClick={() => handleOpenDocument(item.document)}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-400" title="Tidak ada dokumen">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{item.nama}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{item.ketua}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {item.jumlahAnggota || item._count?.petani || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.kecamatan?.nama}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.luasLahanTotal?.toFixed(2) || '0.00'} Ha</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          item.verificationStatus === 'DITERIMA' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : item.verificationStatus === 'DITOLAK'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}>
                          {item.verificationStatus === 'DITERIMA' 
                            ? 'Terverifikasi'
                            : item.verificationStatus === 'DITOLAK'
                            ? 'Ditolak'
                            : 'Menunggu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleDetail(item.id)}
                            className="text-green-600 hover:text-green-900 font-medium transition-colors"
                          >
                            Detail
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900 font-medium transition-colors"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dokumen SK (PDF/Image)</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {formData.document && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-emerald-700">File terpilih: {formData.document.name}</p>
                      </div>
                    </div>
                  )}
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

