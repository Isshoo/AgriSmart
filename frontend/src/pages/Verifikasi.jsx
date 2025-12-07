import { useEffect, useState } from 'react';
import { verifikasiService } from '../services/verifikasiService';
import { kecamatanService } from '../services/kecamatanService';
import { kelompokTaniService } from '../services/kelompokTaniService';
import Pagination from '../components/Pagination';

const Verifikasi = () => {
  const [kelompokTani, setKelompokTani] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [verifyAction, setVerifyAction] = useState(null); // 'DITERIMA' or 'DITOLAK'
  const [catatan, setCatatan] = useState('');
  const [search, setSearch] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchKecamatan();
    fetchStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchData(1);
  }, [search, filterKecamatan]);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (filterKecamatan) params.kecamatan = filterKecamatan;

      const response = await verifikasiService.getPending(params);
      setKelompokTani(response.data || []);
      setPagination(response.pagination || null);
    } catch (error) {
      console.error('Error fetching pending kelompok tani:', error);
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

  const fetchStats = async () => {
    try {
      const data = await verifikasiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDetail = async (id) => {
    try {
      const data = await kelompokTaniService.getById(id);
      setSelectedItem(data);
      setShowDetailModal(true);
    } catch (error) {
      alert('Gagal memuat detail kelompok tani');
    }
  };

  const handleVerify = (item, action) => {
    setSelectedItem(item);
    setVerifyAction(action);
    setCatatan('');
    setShowVerifyModal(true);
  };

  const submitVerify = async () => {
    try {
      await verifikasiService.verify(selectedItem.id, verifyAction, catatan);
      setShowVerifyModal(false);
      setSelectedItem(null);
      setCatatan('');
      fetchData(currentPage);
      fetchStats();
      alert(`Data berhasil ${verifyAction === 'DITERIMA' ? 'diverifikasi' : 'ditolak'}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memverifikasi data');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      DITERIMA: 'bg-green-100 text-green-800 border-green-200',
      DITOLAK: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Menunggu Verifikasi',
      DITERIMA: 'Terverifikasi',
      DITOLAK: 'Ditolak'
    };
    return labels[status] || status;
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verifikasi Data</h1>
            <p className="text-gray-600">Verifikasi dan validasi data kelompok tani yang masuk</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Menunggu Verifikasi</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.PENDING || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Terverifikasi</p>
                <p className="text-3xl font-bold text-green-600">{stats.DITERIMA || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Ditolak</p>
                <p className="text-3xl font-bold text-red-600">{stats.DITOLAK || 0}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama atau ketua..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <select
            value={filterKecamatan}
            onChange={(e) => setFilterKecamatan(e.target.value)}
            className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Kelompok</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ketua</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jumlah Anggota</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kecamatan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Luas Lahan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {kelompokTani.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-500 font-medium">Tidak ada data yang menunggu verifikasi</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    kelompokTani.map((item, index) => (
                      <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(item.verificationStatus)}`}>
                            {getStatusLabel(item.verificationStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDetail(item.id)}
                              className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => handleVerify(item, 'DITERIMA')}
                              className="text-green-600 hover:text-green-900 font-medium transition-colors"
                            >
                              Setuju
                            </button>
                            <button
                              onClick={() => handleVerify(item, 'DITOLAK')}
                              className="text-red-600 hover:text-red-900 font-medium transition-colors"
                            >
                              Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {pagination && (
              <Pagination pagination={pagination} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Detail Kelompok Tani: {selectedItem.nama}</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedItem(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Ketua</p>
                  <p className="font-medium">{selectedItem.ketua}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kecamatan</p>
                  <p className="font-medium">{selectedItem.kecamatan?.nama}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jumlah Anggota</p>
                  <p className="font-medium">{selectedItem.jumlahAnggota}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Luas Lahan Total</p>
                  <p className="font-medium">{selectedItem.luasLahanTotal?.toFixed(2)} Ha</p>
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
                      {selectedItem.petani?.length > 0 ? (
                        selectedItem.petani.map((p) => (
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
                  {selectedItem.komoditas?.length > 0 ? (
                    selectedItem.komoditas.map((k) => (
                      <span
                        key={k.id}
                        className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium"
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
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className={`px-6 py-4 rounded-t-2xl ${verifyAction === 'DITERIMA' ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {verifyAction === 'DITERIMA' ? 'Verifikasi Data' : 'Tolak Data'}
                </h3>
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedItem(null);
                    setCatatan('');
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                {verifyAction === 'DITERIMA'
                  ? `Apakah Anda yakin ingin memverifikasi data kelompok tani "${selectedItem.nama}"?`
                  : `Apakah Anda yakin ingin menolak data kelompok tani "${selectedItem.nama}"?`}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan {verifyAction === 'DITOLAK' && '(Wajib jika menolak)'}
                </label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  rows="3"
                  placeholder={verifyAction === 'DITOLAK' ? 'Alasan penolakan...' : 'Catatan (opsional)...'}
                  required={verifyAction === 'DITOLAK'}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowVerifyModal(false);
                    setSelectedItem(null);
                    setCatatan('');
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={submitVerify}
                  className={`px-6 py-2.5 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                    verifyAction === 'DITERIMA'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                      : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
                  }`}
                >
                  {verifyAction === 'DITERIMA' ? 'Verifikasi' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verifikasi;

