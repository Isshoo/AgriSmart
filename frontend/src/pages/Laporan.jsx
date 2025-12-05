import { useEffect, useState, useMemo } from 'react';
import { laporanService } from '../services/laporanService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ClientPagination from '../components/ClientPagination';

const Laporan = () => {
  const [laporanType, setLaporanType] = useState('petani');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLaporan();
  }, [laporanType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [laporanType]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      let response;
      if (laporanType === 'petani') {
        response = await laporanService.getLaporanPetani();
      } else if (laporanType === 'kelompok-tani') {
        response = await laporanService.getLaporanKelompokTani();
      } else if (laporanType === 'komoditas') {
        response = await laporanService.getLaporanKomoditas();
      }
      setData(response || []);
    } catch (error) {
      console.error('Error fetching laporan:', error);
      alert('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  // Client-side pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleExportExcel = async () => {
    try {
      // Export menggunakan semua data, bukan paginated
      const blob = await laporanService.exportExcel(laporanType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `laporan_${laporanType}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Gagal mengekspor ke Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      // Export menggunakan semua data, bukan paginated
      const response = await laporanService.exportPDF(laporanType);
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text(`Laporan ${laporanType === 'petani' ? 'Petani' : laporanType === 'kelompok-tani' ? 'Kelompok Tani' : 'Komoditas'}`, 14, 15);
      
      if (laporanType === 'petani') {
        const tableData = response.data.map(item => [
          item.nama,
          item.nik,
          item.kecamatan?.nama || '-',
          item.luasLahan,
          item.jenisTanaman
        ]);
        doc.autoTable({
          head: [['Nama', 'NIK', 'Kecamatan', 'Luas Lahan (Ha)', 'Komoditas']],
          body: tableData,
          startY: 20
        });
      } else if (laporanType === 'kelompok-tani') {
        const tableData = response.data.map(item => [
          item.nama,
          item.ketua,
          item.jumlahAnggota,
          item.kecamatan?.nama || '-',
          item.luasLahanTotal?.toFixed(2) || '0'
        ]);
        doc.autoTable({
          head: [['Nama Kelompok', 'Ketua', 'Jumlah Anggota', 'Kecamatan', 'Luas Lahan (Ha)']],
          body: tableData,
          startY: 20
        });
      } else if (laporanType === 'komoditas') {
        const tableData = response.data.map(item => [
          item.jenis,
          item.luasTanam,
          item.estimasiPanen || '-',
          item.jenisPupuk || '-',
          item.pestisida || '-'
        ]);
        doc.autoTable({
          head: [['Jenis', 'Luas Tanam (Ha)', 'Estimasi Panen (Ton)', 'Pupuk', 'Pestisida']],
          body: tableData,
          startY: 20
        });
      }
      
      doc.save(`laporan_${laporanType}.pdf`);
    } catch (error) {
      alert('Gagal mengekspor ke PDF');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Laporan</h1>
            <p className="text-gray-600">Ringkasan dan ekspor data petani, kelompok tani, dan komoditas</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportExcel}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Laporan</label>
        <select
          value={laporanType}
          onChange={(e) => setLaporanType(e.target.value)}
          className="block w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
        >
          <option value="petani">Laporan Petani</option>
          <option value="kelompok-tani">Laporan Kelompok Tani</option>
          <option value="komoditas">Laporan Komoditas</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {laporanType === 'petani' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">NIK</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kecamatan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Luas Lahan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Komoditas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 font-medium">Tidak ada data</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item, index) => (
                        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{item.nama}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{item.nik}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.kecamatan?.nama}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.luasLahan} Ha</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {item.jenisTanaman}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {laporanType === 'kelompok-tani' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Kelompok</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ketua</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jumlah Anggota</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kecamatan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Luas Lahan</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 font-medium">Tidak ada data</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item, index) => (
                        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">{item.nama}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{item.ketua}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {item.jumlahAnggota}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.kecamatan?.nama}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.luasLahanTotal?.toFixed(2)} Ha</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {laporanType === 'komoditas' && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jenis</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Luas Tanam</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estimasi Panen</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pupuk</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pestisida</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-gray-500 font-medium">Tidak ada data</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item, index) => (
                        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              {item.jenis}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{item.luasTanam} Ha</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{item.estimasiPanen || '-'} {item.estimasiPanen ? 'Ton' : ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{item.jenisPupuk || '-'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{item.pestisida || '-'}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            {data.length > 0 && (
              <ClientPagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={data.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Laporan;
